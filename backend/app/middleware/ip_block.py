"""IP-based login failure tracking and temporary blocking middleware."""
import time
import logging
from collections import defaultdict
from threading import Lock
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger(__name__)

# In-memory store: {ip: {"failures": int, "blocked_until": float}}
_store: dict = defaultdict(lambda: {"failures": 0, "blocked_until": 0.0})
_lock = Lock()

MAX_FAILURES = 10         # Block after 10 failures
BLOCK_DURATION = 900      # 15 minutes in seconds
FAILURE_WINDOW = 900      # Reset failure count after 15 min of no failures


class IPBlockMiddleware(BaseHTTPMiddleware):
    """Block IPs that repeatedly fail authentication."""
    
    async def dispatch(self, request: Request, call_next) -> Response:
        ip = self._get_ip(request)
        
        with _lock:
            entry = _store[ip]
            now = time.time()
            
            # Check if currently blocked
            if entry["blocked_until"] > now:
                remaining = int(entry["blocked_until"] - now)
                logger.warning(
                    '{"action":"IP_BLOCKED","ip":"%s","remaining_seconds":%d}', ip, remaining
                )
                return Response(
                    content='{"error":"Too many failed attempts. Try again later."}',
                    status_code=429,
                    media_type="application/json",
                    headers={"Retry-After": str(remaining)}
                )
        
        response = await call_next(request)
        
        # Track failed auth attempts on login endpoint
        if request.url.path == "/api/auth/login" and response.status_code == 401:
            with _lock:
                entry = _store[ip]
                entry["failures"] += 1
                if entry["failures"] >= MAX_FAILURES:
                    entry["blocked_until"] = time.time() + BLOCK_DURATION
                    entry["failures"] = 0
                    logger.warning(
                        '{"action":"IP_AUTO_BLOCKED","ip":"%s","duration_seconds":%d}',
                        ip, BLOCK_DURATION
                    )
        elif request.url.path == "/api/auth/login" and response.status_code == 200:
            # Reset on successful login
            with _lock:
                _store[ip] = {"failures": 0, "blocked_until": 0.0}
        
        return response
    
    @staticmethod
    def _get_ip(request: Request) -> str:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        cf_ip = request.headers.get("CF-Connecting-IP")
        if cf_ip:
            return cf_ip
        return request.client.host if request.client else "unknown"
