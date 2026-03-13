"""Second-factor TOTP check for admin login.

Login flow with MFA enabled:
1. POST /api/auth/login → returns {mfa_required: true, mfa_token: "<short-lived token>"}
2. POST /api/auth/mfa/verify → returns {access_token, refresh_token}
"""
import logging
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.database import get_db
from app.models import User
from app.security import create_access_token, verify_access_token
from app.services.mfa_service import verify_totp_code
from app.services.token_service import create_refresh_token
from app.utils.audit import log_audit, AuditAction, get_client_ip
from app.middleware.rate_limit import get_rate_limiter
from app.config import settings

logger = logging.getLogger(__name__)
limiter = get_rate_limiter()

# Extend the main MFA router
from app.api.mfa import router


class MFALoginVerifyRequest(BaseModel):
    mfa_token: str
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


@router.post("/verify", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
async def verify_mfa_login(
    request: Request,
    body: MFALoginVerifyRequest,
    db: Session = Depends(get_db)
):
    """Complete MFA login by verifying the 6-digit TOTP code.
    
    Provide the mfa_token from the /login response and the code from your authenticator.
    Returns full access + refresh tokens on success.
    """
    from app.schemas import Token
    
    # Verify the short-lived MFA token
    username = verify_access_token(body.mfa_token)
    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired MFA session. Please log in again."
        )
    
    user = db.query(User).filter(
        User.username == username, User.is_active == True
    ).first()
    if not user or not user.mfa_enabled:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid MFA session")
    
    if not verify_totp_code(user.totp_secret, body.code):
        log_audit(
            db=db, action="MFA_VERIFY_FAILED", request=request,
            user_id=str(user.id), username=user.username, success=False
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid TOTP code"
        )
    
    log_audit(
        db=db, action=AuditAction.LOGIN_SUCCESS, request=request,
        user_id=str(user.id), username=user.username, success=True,
        details={"mfa": True}
    )
    
    access_token = create_access_token(data={"sub": user.username})
    refresh_token = create_refresh_token(db=db, user=user, ip_address=get_client_ip(request))
    
    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",  # nosec B106
        expires_in=settings.jwt_expiration_seconds
    )
