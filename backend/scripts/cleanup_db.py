"""Maintenance script to clean up expired/invalid data from the database."""
import os
import sys
from datetime import datetime, timezone, timedelta
from sqlalchemy import delete

# Add parent directory to path to allow importing app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import RefreshToken, AuditLog

def cleanup_expired_tokens():
    """Delete expired refresh tokens from the database."""
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        # Delete tokens that expired more than 24 hours ago
        stmt = delete(RefreshToken).where(RefreshToken.expires_at < now - timedelta(hours=24))
        result = db.execute(stmt)
        db.commit()
        print(f"Cleaned up {result.rowcount} expired refresh tokens.")
    except Exception as e:
        print(f"Error cleaning up tokens: {e}")
        db.rollback()
    finally:
        db.close()

def cleanup_old_audit_logs(days=90):
    """Delete audit logs older than N days."""
    db = SessionLocal()
    try:
        cutoff = datetime.now(timezone.utc) - timedelta(days=days)
        stmt = delete(AuditLog).where(AuditLog.timestamp < cutoff)
        result = db.execute(stmt)
        db.commit()
        print(f"Cleaned up {result.rowcount} audit logs older than {days} days.")
    except Exception as e:
        print(f"Error cleaning up audit logs: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("Starting database maintenance...")
    cleanup_expired_tokens()
    cleanup_old_audit_logs(days=180) # Keep 6 months of logs by default
    print("Maintenance complete.")
