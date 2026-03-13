"""Structured audit logging utilities."""
import json
import logging
from datetime import datetime, timezone
from typing import Optional
from fastapi import Request
from sqlalchemy.orm import Session
from app.models import AuditLog


logger = logging.getLogger(__name__)


# Define standard audit action constants
class AuditAction:
    # Authentication
    LOGIN_SUCCESS = "LOGIN_SUCCESS"
    LOGIN_FAILED = "LOGIN_FAILED"
    LOGOUT = "LOGOUT"
    TOKEN_REFRESH = "TOKEN_REFRESH"  # nosec B105
    TOKEN_REVOKED = "TOKEN_REVOKED"  # nosec B105
    
    # Events
    CREATE_EVENT = "CREATE_EVENT"
    UPDATE_EVENT = "UPDATE_EVENT"
    DELETE_EVENT = "DELETE_EVENT"
    
    # Registrations
    CREATE_REGISTRATION = "CREATE_REGISTRATION"
    EXPORT_REGISTRATIONS = "EXPORT_REGISTRATIONS"
    
    # Resources
    UPLOAD_RESOURCE = "UPLOAD_RESOURCE"
    UPDATE_RESOURCE = "UPDATE_RESOURCE"
    DELETE_RESOURCE = "DELETE_RESOURCE"
    DOWNLOAD_RESOURCE = "DOWNLOAD_RESOURCE"
    
    # Hackathon
    CREATE_TEAM = "CREATE_TEAM"
    
    # Security
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"
    UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS"


def get_client_ip(request: Request) -> str:
    """
    Extract real client IP securely.
    
    Relies on FastAPI/Starlette's request.client.host.
    For production behind a reverse proxy (like Nginx, AWS ALB, Render), 
    run uvicorn with the `--proxy-headers` and `--forwarded-allow-ips` flags
    so that the ASGI server securely resolves the actual IP.
    """
    if request.client and request.client.host:
        return request.client.host
    return "unknown"
def log_audit(
    db: Session,
    action: str,
    request: Optional[Request] = None,
    user_id: Optional[str] = None,
    username: Optional[str] = None,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    success: bool = True,
    details: Optional[dict] = None
) -> None:
    """Write an audit log entry to the database.
    
    Also mirrors to the Python logger for SIEM/log aggregation.
    """
    ip_address = get_client_ip(request) if request else None
    user_agent = request.headers.get("User-Agent", "") if request else None
    
    # Trim user_agent to column limit
    if user_agent and len(user_agent) > 500:
        user_agent = user_agent[:497] + "..."
    
    details_str = json.dumps(details) if details else None
    
    try:
        entry = AuditLog(
            user_id=user_id,
            username=username,
            ip_address=ip_address,
            user_agent=user_agent,
            action=action,
            resource_type=resource_type,
            resource_id=str(resource_id) if resource_id else None,
            success=success,
            details=details_str
        )
        db.add(entry)
        db.commit()
    except Exception as e:
        logger.error("Failed to write audit log: %s", e)
        db.rollback()
    
    # Mirror to Python logger (for external SIEM / log aggregation)
    log_payload = {
        "audit": True,
        "action": action,
        "user": username,
        "ip": ip_address,
        "resource_type": resource_type,
        "resource_id": str(resource_id) if resource_id else None,
        "success": success,
        "details": details,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    if success:
        logger.info(json.dumps(log_payload))
    else:
        logger.warning(json.dumps(log_payload))
