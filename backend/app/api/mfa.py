"""MFA setup and verification endpoints for admin users."""
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from app.database import get_db
from app.models import User
from app.dependencies import get_current_user
from app.services.mfa_service import (
    generate_totp_secret, verify_totp_code, get_totp_uri, generate_qr_code_base64
)
from app.utils.audit import log_audit, AuditAction
from app.middleware.rate_limit import get_rate_limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth/mfa", tags=["MFA"])
limiter = get_rate_limiter()


class MFASetupResponse(BaseModel):
    secret: str
    qr_code_base64: str
    provisioning_uri: str


class MFAVerifyRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class MFADisableRequest(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


@router.post("/setup", response_model=MFASetupResponse)
async def setup_mfa(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a new TOTP secret and QR code for MFA setup.
    
    Call this to get a QR code to scan in Google Authenticator / Authy.
    Then call /api/auth/mfa/enable with the 6-digit code to confirm setup.
    """
    if current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already enabled. Disable it first before re-enrolling."
        )
    
    secret = generate_totp_secret()
    
    # Store secret temporarily (not yet activated until verified)
    current_user.totp_secret = secret
    db.commit()
    
    return MFASetupResponse(
        secret=secret,
        qr_code_base64=generate_qr_code_base64(secret, current_user.username),
        provisioning_uri=get_totp_uri(secret, current_user.username)
    )


@router.post("/enable", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
async def enable_mfa(
    request: Request,
    body: MFAVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Verify TOTP code and activate MFA on the account."""
    if not current_user.totp_secret:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No MFA setup in progress. Call /api/auth/mfa/setup first."
        )
    
    if not verify_totp_code(current_user.totp_secret, body.code):
        log_audit(
            db=db, action="MFA_ENABLE_FAILED", request=request,
            user_id=str(current_user.id), username=current_user.username, success=False
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid TOTP code. Try again with a fresh code from your authenticator."
        )
    
    current_user.mfa_enabled = True
    db.commit()
    
    log_audit(
        db=db, action="MFA_ENABLED", request=request,
        user_id=str(current_user.id), username=current_user.username, success=True
    )
    return {"message": "MFA enabled successfully"}


@router.post("/disable", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
async def disable_mfa(
    request: Request,
    body: MFADisableRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disable MFA after verifying the current TOTP code."""
    if not current_user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is not enabled on this account."
        )
    
    if not verify_totp_code(current_user.totp_secret, body.code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid TOTP code."
        )
    
    current_user.mfa_enabled = False
    current_user.totp_secret = None
    db.commit()
    
    log_audit(
        db=db, action="MFA_DISABLED", request=request,
        user_id=str(current_user.id), username=current_user.username, success=True
    )
    return {"message": "MFA disabled successfully"}
