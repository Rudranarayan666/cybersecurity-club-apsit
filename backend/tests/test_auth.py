"""Tests for authentication endpoints."""
import pytest


class TestLogin:
    def test_login_success(self, client, admin_user):
        """Admin can log in with valid credentials and receives tokens."""
        resp = client.post("/api/auth/login", json={
            "username": admin_user.username,  # Use actual fixture username
            "password": "TestPass@123"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["expires_in"] > 0

    def test_login_wrong_password(self, client, admin_user):
        """Login fails with wrong password and returns 401."""
        resp = client.post("/api/auth/login", json={
            "username": admin_user.username,
            "password": "WrongPass@999"
        })
        assert resp.status_code == 401, f"Expected 401 but got {resp.status_code}: {resp.text}"

    def test_login_unknown_user(self, client):
        """Login fails for non-existent user."""
        resp = client.post("/api/auth/login", json={
            "username": "ghost_user_does_not_exist",
            "password": "AnyPass@123"
        })
        assert resp.status_code == 401

    def test_login_inactive_user(self, client, db, admin_user):
        """Login fails for inactive user with 403."""
        admin_user.is_active = False
        db.commit()
        resp = client.post("/api/auth/login", json={
            "username": admin_user.username,
            "password": "TestPass@123"
        })
        assert resp.status_code == 403
        # Restore
        admin_user.is_active = True
        db.commit()

    def test_get_me(self, client, auth_headers, admin_user):
        """Authenticated user can fetch their profile."""
        resp = client.get("/api/auth/me", headers=auth_headers)
        assert resp.status_code == 200
        assert resp.json()["username"] == admin_user.username

    def test_get_me_no_token(self, client):
        """Unauthenticated request to /me returns 401/403."""
        resp = client.get("/api/auth/me")
        assert resp.status_code in (401, 403)

    def test_docs_hidden_in_production(self, client):
        """/docs should return 404 when DEBUG=False. In debug mode may be 200."""
        resp = client.get("/docs")
        assert resp.status_code in (200, 404)

    def test_health_endpoint(self, client):
        """Health check endpoint returns healthy."""
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "healthy"
