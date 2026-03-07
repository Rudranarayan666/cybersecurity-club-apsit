"""CSRF token middleware and utilities for form-based endpoints."""
import hmac
import hashlib
import secrets
import time
from fastapi import Request, Response, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse
from app.config import settings

# Endpoints that require CSRF validation (state-changing, not bearer-auth protected)
CSRF_PROTECTED_PATHS = {
    "/api/registrations",
    "/api/hackathon-teams",
}

CSRF_HEADER = "X-CSRF-Token"
CSRF_COOKIE = "csrf_token"
SECRET_KEY_SUFFIX = "csrf"  # Appended to JWT secret for HMAC signing
TOKEN_EXPIRY = 3600  # 1 hour


def _sign(token: str, secret: str) -> str:
    """HMAC-sign a token."""
    return hmac.new(
        secret.encode(),
        token.encode(),
        hashlib.sha256
    ).hexdigest()


def generate_csrf_token(secret: str) -> str:
    """Generate a signed CSRF token: <random>.<timestamp>.<signature>"""
    random_part = secrets.token_urlsafe(32)
    timestamp = str(int(time.time()))
    payload = f"{random_part}.{timestamp}"
    signature = _sign(payload, secret + SECRET_KEY_SUFFIX)
    return f"{payload}.{signature}"


def validate_csrf_token(token: str, secret: str) -> bool:
    """Validate a CSRF token's signature and expiry."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return False
        random_part, timestamp_str, signature = parts
        payload = f"{random_part}.{timestamp_str}"
        
        # Verify signature
        expected_sig = _sign(payload, secret + SECRET_KEY_SUFFIX)
        if not hmac.compare_digest(signature, expected_sig):
            return False
        
        # Check expiry
        if int(time.time()) - int(timestamp_str) > TOKEN_EXPIRY:
            return False
        
        return True
    except Exception:
        return False


class CSRFMiddleware(BaseHTTPMiddleware):
    """Validate CSRF tokens on state-changing endpoints that aren't bearer-protected.
    
    Strategy: Double-Submit Cookie pattern.
    - Browser receives csrf_token cookie on first visit
    - Client includes same value in X-CSRF-Token header on POST/PUT/DELETE
    - Middleware validates header matches cookie and has valid signature
    """
    
    def __init__(self, app, secret: str):
        super().__init__(app)
        self.secret = secret
    
    async def dispatch(self, request: Request, call_next) -> Response:
        # Skip CSRF if disabled in environment
        if not getattr(settings, "csrf_enabled", True) or settings.debug:
            return await call_next(request)

        # Inject CSRF token cookie on GET requests
        if request.method == "GET":
            response = await call_next(request)
            if not request.cookies.get(CSRF_COOKIE):
                token = generate_csrf_token(self.secret)
                # Use SameSite=None for cross-domain support (Render -> Vercel)
                response.set_cookie(
                    CSRF_COOKIE, token,
                    httponly=False,
                    secure=True,
                    samesite="none",
                    max_age=TOKEN_EXPIRY
                )
            return response
        
        # Validate CSRF on state-changing requests to protected paths
        if request.method in ("POST", "PUT", "DELETE", "PATCH"):
            path = request.url.path
            if any(path.startswith(p) for p in CSRF_PROTECTED_PATHS):
                # Skip CSRF check if request uses Bearer token (authenticated admin)
                auth_header = request.headers.get("Authorization", "")
                if auth_header.startswith("Bearer "):
                    return await call_next(request)
                
                # Double-submit cookie check
                cookie_token = request.cookies.get(CSRF_COOKIE, "")
                header_token = request.headers.get(CSRF_HEADER, "")
                
                if not cookie_token or not header_token:
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"error": "CSRF token missing"}
                    )
                
                if cookie_token != header_token or not validate_csrf_token(header_token, self.secret):
                    return JSONResponse(
                        status_code=status.HTTP_403_FORBIDDEN,
                        content={"error": "Invalid CSRF token"}
                    )
        
        return await call_next(request)
