"""Database connection and session management."""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import settings

# PostgreSQL only engine options
engine_kwargs = {
    "pool_size": settings.db_pool_size,
    "max_overflow": settings.db_max_overflow,
    "pool_pre_ping": True,
    "pool_recycle": 1800,
    "pool_timeout": 30,
    "echo": settings.debug,
}

if settings.database_url.startswith("sqlite"):
    # SQLite-specific configuration
    engine_kwargs = {
        "connect_args": {"check_same_thread": False},
        "echo": settings.debug,
    }
elif settings.database_url.startswith("postgresql"):
    # Add SSL for Render/production if not already in the URL
    if "sslmode" not in settings.database_url:
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
