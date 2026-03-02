"""TOTP-based Multi-Factor Authentication service using pyotp."""
import pyotp
import qrcode
import io
import base64
from sqlalchemy.orm import Session
from app.models import User


TOTP_ISSUER = "CybersecClub-APSIT"


def generate_totp_secret() -> str:
    """Generate a new TOTP secret key for a user."""
    return pyotp.random_base32()


def get_totp(secret: str) -> pyotp.TOTP:
    """Get a TOTP object for the given secret."""
    return pyotp.TOTP(secret, issuer=TOTP_ISSUER)


def verify_totp_code(secret: str, code: str) -> bool:
    """Verify a TOTP code. Allows 1-step drift (30s window)."""
    totp = get_totp(secret)
    return totp.verify(code, valid_window=1)


def get_totp_uri(secret: str, username: str) -> str:
    """Get the OTP auth URI for QR code generation."""
    totp = get_totp(secret)
    return totp.provisioning_uri(name=username, issuer_name=TOTP_ISSUER)


def generate_qr_code_base64(secret: str, username: str) -> str:
    """Generate a QR code image as a base64 string for embedding in HTML."""
    uri = get_totp_uri(secret, username)
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode()
