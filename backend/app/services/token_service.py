"""JWT refresh token service with server-side revocation."""
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models import RefreshToken, User


REFRESH_TOKEN_EXPIRE_DAYS = 7


def _hash_token(raw_token: str) -> str:
    """SHA-256 hash a refresh token before storing."""
    return hashlib.sha256(raw_token.encode()).hexdigest()


def create_refresh_token(db: Session, user: User, ip_address: str = None) -> str:
    """Generate a new refresh token for a user and persist it.
    
    Returns the raw (unhashed) token to return to the client.
    """
    raw_token = secrets.token_urlsafe(64)
    token_hash = _hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    refresh = RefreshToken(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
        ip_address=ip_address
    )
    db.add(refresh)
    db.commit()
    return raw_token


def verify_refresh_token(db: Session, raw_token: str) -> RefreshToken | None:
    """Verify a refresh token. Returns the DB record if valid, None otherwise."""
    token_hash = _hash_token(raw_token)
    record = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked == False
    ).first()
    
    if not record:
        return None
    
    # Check expiry
    if record.expires_at < datetime.now(timezone.utc):
        revoke_refresh_token(db, raw_token)
        return None
    
    return record


def revoke_refresh_token(db: Session, raw_token: str) -> bool:
    """Revoke a specific refresh token. Returns True if found and revoked."""
    token_hash = _hash_token(raw_token)
    record = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash
    ).first()
    
    if record:
        record.revoked = True
        record.revoked_at = datetime.now(timezone.utc)
        db.commit()
        return True
    return False


def revoke_all_user_tokens(db: Session, user_id: str) -> int:
    """Revoke all refresh tokens for a user (logout-all-devices). Returns count revoked."""
    now = datetime.now(timezone.utc)
    count = db.query(RefreshToken).filter(
        RefreshToken.user_id == user_id,
        RefreshToken.revoked == False
    ).update({"revoked": True, "revoked_at": now})
    db.commit()
    return count


def cleanup_expired_tokens(db: Session) -> int:
    """Delete expired and revoked tokens older than 30 days. Returns count removed."""
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    count = db.query(RefreshToken).filter(
        RefreshToken.expires_at < cutoff
    ).delete()
    db.commit()
    return count
