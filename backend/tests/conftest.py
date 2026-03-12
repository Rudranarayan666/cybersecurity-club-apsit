"""pytest configuration, fixtures, and test helpers.

Uses a local PostgreSQL testing database.
Each test gets a freshly cleared session to avoid UNIQUE constraint issues.
"""
import pytest
import uuid
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# ── PostgreSQL Testing DB ──────────────────────────────────────────────────────────
TEST_DATABASE_URL = "postgresql://cybersec_admin:changeme_in_production@localhost:5432/cybersec_test"
test_engine = create_engine(
    TEST_DATABASE_URL,
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine
)


@pytest.fixture(scope="session", autouse=True)
def patch_database():
    """Replace the app's DB engine with PostgreSQL Test DB for the test session."""
    import app.database as db_module
    original_engine = db_module.engine
    original_session = db_module.SessionLocal

    db_module.engine = test_engine
    db_module.SessionLocal = TestingSessionLocal

    from app.models import Base
    Base.metadata.create_all(bind=test_engine)

    yield

    db_module.engine = original_engine
    db_module.SessionLocal = original_session
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def db(patch_database):
    """Per-test DB session — rolls back after each test."""
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()


@pytest.fixture()
def client(db):
    """TestClient with DB override."""
    from app.main import app
    from app.database import get_db

    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture()
def admin_user(db):
    from app.models import User
    from app.security import hash_password

    # Use unique username per test to avoid UNIQUE constraint across tests
    unique_name = f"admin_{uuid.uuid4().hex[:8]}"
    user = User(
        username=unique_name,
        password_hash=hash_password("TestPass@123"),
        is_active=True,
        mfa_enabled=False
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture()
def admin_token(admin_user):
    from app.security import create_access_token
    return create_access_token(data={"sub": admin_user.username})


@pytest.fixture()
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture()
def sample_event(db):
    from datetime import date, timedelta
    from app.models import Event, EventType

    event = Event(
        title=f"Test Workshop {uuid.uuid4().hex[:6]}",
        type=EventType.WORKSHOP,
        date=date.today() + timedelta(days=10),
        description="A test event",
        is_active=True
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
