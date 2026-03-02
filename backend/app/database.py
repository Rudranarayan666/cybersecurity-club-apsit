"""Database connection and session management."""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# Build engine options
engine_kwargs = {
    "pool_size": settings.db_pool_size,
    "max_overflow": settings.db_max_overflow,
    "pool_pre_ping": True,       # Verify connections before using
    "pool_recycle": 1800,        # Recycle connections after 30 minutes
    "pool_timeout": 30,          # Wait up to 30s for a connection from pool
    "echo": settings.debug,
}

# Enable SSL for production PostgreSQL (when URL contains sslmode)
if "sslmode" in settings.database_url:
    engine_kwargs["connect_args"] = {"sslmode": "require"}

# Create database engine
engine = create_engine(settings.database_url, **engine_kwargs)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency for getting database session.
    
    Yields a database session and ensures it is properly closed,
    even if an exception occurs during request processing.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
