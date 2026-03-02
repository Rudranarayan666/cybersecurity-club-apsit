"""Password validation utilities for enforcing strong password policy."""
import re
from typing import Tuple
from app.config import settings


def validate_password_strength(password: str) -> Tuple[bool, str]:
    """Validate password meets strength requirements.
    
    Returns:
        Tuple of (is_valid, error_message)
    """
    if len(password) < settings.password_min_length:
        return False, f"Password must be at least {settings.password_min_length} characters long"
    
    if settings.password_require_uppercase and not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    
    if settings.password_require_number and not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    
    if settings.password_require_special and not re.search(r'[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\;\'\/~`]', password):
        return False, "Password must contain at least one special character"
    
    return True, ""


def is_common_password(password: str) -> bool:
    """Check if password is in a list of common weak passwords."""
    common = {
        "password", "password123", "admin123", "12345678", "qwerty123",
        "letmein1", "welcome1", "monkey123", "dragon123", "master123",
        "changeme", "changeme1", "admin@123", "Pass@123"
    }
    return password.lower() in common
