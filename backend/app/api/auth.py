"""Admin authentication endpoints with JWT refresh and server-side revocation."""
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, Token, UserResponse
from app.security import verify_password, create_access_token
from app.utils.audit import log_audit, AuditAction, get_client_ip
from app.dependencies import get_current_user
from app.middleware.rate_limit import get_rate_limiter
from app.services.token_service import (
    create_refresh_token, verify_refresh_token,
    revoke_refresh_token, revoke_all_user_tokens
)
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])
limiter = get_rate_limiter()


@router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
@limiter.limit("5/15minutes")
async def login(
    request: Request,
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """Admin login. Returns access + refresh token.
    Rate limited to 5 attempts per 15 minutes per IP.
    """
    ip = get_client_ip(request)
    user = db.query(User).filter(User.username == login_data.username).first()

    if not user or not verify_password(login_data.password, user.password_hash):
        log_audit(
            db=db, action=AuditAction.LOGIN_FAILED, request=request,
            username=login_data.username, success=False,
            details={"reason": "Invalid credentials"}
        )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid username or password")

    if not user.is_active:
        log_audit(
            db=db, action=AuditAction.LOGIN_FAILED, request=request,
            user_id=str(user.id), username=user.username, success=False,
            details={"reason": "Account inactive"}
        )
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                            detail="User account is inactive")

    user.last_login = datetime.now(timezone.utc)
    db.commit()

    log_audit(
        db=db, action=AuditAction.LOGIN_SUCCESS, request=request,
        user_id=str(user.id), username=user.username, success=True
    )

    access_token = create_access_token(data={"sub": user.username})
    
    # Create refresh token (optional — gracefully skip if refresh_tokens table is unavailable)
    refresh_token_str = None
    try:
        refresh_token_str = create_refresh_token(db=db, user=user, ip_address=ip)
    except Exception as e:
        logger.warning(f"Could not create refresh token: {e}")

    return Token(
        access_token=access_token,
        refresh_token=refresh_token_str,
        token_type="bearer",  # nosec B106
        expires_in=settings.jwt_expiration_seconds
    )


@router.post("/token/refresh", response_model=Token, status_code=status.HTTP_200_OK)
@limiter.limit("10/15minutes")
async def refresh_token_endpoint(
    request: Request,
    x_refresh_token: str = Header(..., alias="X-Refresh-Token"),
    db: Session = Depends(get_db)
):
    """Exchange a valid refresh token for a new access token + rotated refresh token."""
    record = verify_refresh_token(db=db, raw_token=x_refresh_token)
    if not record:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid or expired refresh token")

    user = db.query(User).filter(
        User.id == record.user_id, User.is_active == True
    ).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="User not found or inactive")

    # Rotate: revoke old, issue new
    revoke_refresh_token(db=db, raw_token=x_refresh_token)
    new_refresh = create_refresh_token(db=db, user=user, ip_address=get_client_ip(request))
    new_access = create_access_token(data={"sub": user.username})

    log_audit(
        db=db, action=AuditAction.TOKEN_REFRESH, request=request,
        user_id=str(user.id), username=user.username, success=True
    )

    return Token(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",  # nosec B106
        expires_in=settings.jwt_expiration_seconds
    )


@router.post("/logout", status_code=status.HTTP_200_OK)
@limiter.limit("20/hour")
async def logout(
    request: Request,
    x_refresh_token: Optional[str] = Header(None, alias="X-Refresh-Token"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke the current refresh token (single-device logout)."""
    if x_refresh_token:
        revoke_refresh_token(db=db, raw_token=x_refresh_token)

    log_audit(
        db=db, action=AuditAction.LOGOUT, request=request,
        user_id=str(current_user.id), username=current_user.username, success=True
    )
    return {"message": "Logged out successfully"}


@router.post("/logout-all", status_code=status.HTTP_200_OK)
async def logout_all_devices(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Revoke ALL refresh tokens for this user (all-device logout)."""
    count = revoke_all_user_tokens(db=db, user_id=str(current_user.id))
    log_audit(
        db=db, action=AuditAction.TOKEN_REVOKED, request=request,
        user_id=str(current_user.id), username=current_user.username, success=True,
        details={"tokens_revoked": count}
    )
    return {"message": f"Logged out from {count} device(s)"}


@router.get("/me", response_model=UserResponse, status_code=status.HTTP_200_OK)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current authenticated user information."""
    return current_user
