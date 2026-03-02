"""Prometheus metrics endpoint for monitoring."""
import time
import logging
from fastapi import APIRouter, Response
from app.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Monitoring"])

# Simple in-memory counters (no external dependency)
_metrics = {
    "http_requests_total": 0,
    "login_success_total": 0,
    "login_failed_total": 0,
    "registration_created_total": 0,
    "hackathon_team_created_total": 0,
    "rate_limited_total": 0,
    "ip_blocked_total": 0,
    "start_time": time.time()
}


def increment(metric: str, amount: int = 1) -> None:
    """Thread-safe counter increment."""
    _metrics[metric] = _metrics.get(metric, 0) + amount


def _format_prometheus(metrics: dict) -> str:
    """Format metrics dict as Prometheus text exposition format."""
    lines = []
    uptime = time.time() - metrics.get("start_time", time.time())
    
    for key, value in metrics.items():
        if key == "start_time":
            continue
        lines.append(f"# HELP {key} Counter for {key.replace('_', ' ')}")
        lines.append(f"# TYPE {key} counter")
        lines.append(f"{key} {value}")
    
    lines.append(f"# HELP app_uptime_seconds Application uptime in seconds")
    lines.append(f"# TYPE app_uptime_seconds gauge")
    lines.append(f"app_uptime_seconds {uptime:.2f}")
    
    return "\n".join(lines) + "\n"


@router.get("/metrics", include_in_schema=False)
async def prometheus_metrics():
    """Prometheus metrics endpoint.
    
    Returns metrics in Prometheus text format.
    Note: In production, this should be protected or only accessible from internal network.
    """
    content = _format_prometheus(_metrics)
    return Response(content=content, media_type="text/plain; version=0.0.4")
