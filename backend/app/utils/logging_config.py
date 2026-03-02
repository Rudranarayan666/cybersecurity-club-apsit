"""Structured JSON logging setup for production."""
import logging
import json
from datetime import datetime, timezone


class JSONFormatter(logging.Formatter):
    """Format log records as newline-delimited JSON for SIEM ingestion."""
    
    def format(self, record: logging.LogRecord) -> str:
        log_obj = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
        
        # If message is already JSON (from audit.py), parse and embed
        try:
            payload = json.loads(record.getMessage())
            log_obj.update(payload)
            log_obj["message"] = payload.get("action", "audit_event")
        except (json.JSONDecodeError, TypeError):
            pass
        
        return json.dumps(log_obj, default=str)


def setup_logging(level: str = "INFO", fmt: str = "json") -> None:
    """Configure application-wide logging.
    
    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR)
        fmt: "json" for structured output, "text" for human-readable
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))
    
    handler = logging.StreamHandler()
    
    if fmt == "json":
        handler.setFormatter(JSONFormatter())
    else:
        handler.setFormatter(logging.Formatter(
            "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        ))
    
    # Remove existing handlers
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
    
    # Set noisy library loggers to WARNING
    for noisy in ["uvicorn.access", "sqlalchemy.engine", "sqlalchemy.pool"]:
        logging.getLogger(noisy).setLevel(logging.WARNING)
