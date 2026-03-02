"""Tests for registration endpoints."""
import pytest
from datetime import date, timedelta


@pytest.fixture()
def active_event(db):
    from app.models import Event, EventType
    event = Event(
        title="Reg Test Event",
        type=EventType.WORKSHOP,
        date=date.today() + timedelta(days=5),
        is_active=True
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


class TestRegistrations:
    def test_register_for_event_success(self, client, active_event):
        """Public user can register for an active event."""
        resp = client.post("/api/registrations", json={
            "event_id": str(active_event.id),
            "operative_name": "John Doe",
            "moodle_id": "22CE001"
        })
        assert resp.status_code == 201
        data = resp.json()
        assert data["moodle_id"] == "22CE001"

    def test_duplicate_registration_rejected(self, client, active_event):
        """Registering the same moodle_id twice for same event returns 409."""
        payload = {
            "event_id": str(active_event.id),
            "operative_name": "Jane Doe",
            "moodle_id": "22CE002"
        }
        r1 = client.post("/api/registrations", json=payload)
        assert r1.status_code == 201
        r2 = client.post("/api/registrations", json=payload)
        assert r2.status_code == 409

    def test_register_xss_payload(self, client, active_event):
        """XSS payloads in operative_name are sanitized, not stored raw."""
        resp = client.post("/api/registrations", json={
            "event_id": str(active_event.id),
            "operative_name": "<script>alert('xss')</script>",
            "moodle_id": "22CE003"
        })
        assert resp.status_code in (201, 422)
        if resp.status_code == 201:
            assert "<script>" not in resp.json().get("operative_name", "")

    def test_list_registrations_requires_auth(self, client):
        """GET /api/registrations returns 401/403 without auth."""
        resp = client.get("/api/registrations")
        assert resp.status_code in (401, 403)

    def test_list_registrations_admin(self, client, auth_headers, active_event):
        """Admin can list registrations."""
        resp = client.get("/api/registrations", headers=auth_headers)
        assert resp.status_code == 200
        assert isinstance(resp.json(), list)

    def test_export_csv_requires_auth(self, client):
        """Export endpoint returns 401/403 without auth."""
        resp = client.get("/api/registrations/export/csv")
        assert resp.status_code in (401, 403)

    def test_export_csv_admin(self, client, auth_headers):
        """Admin can export registrations as CSV."""
        resp = client.get("/api/registrations/export/csv", headers=auth_headers)
        assert resp.status_code == 200
        assert "text/csv" in resp.headers.get("content-type", "")


class TestHackathonTeams:
    def test_hackathon_team_registration(self, client):
        """Public user can register a hackathon team with valid data."""
        payload = {
            "event_name": "CyberDefense CTF 2026",
            "team_name": "TestTeam",
            "team_members": [
                {
                    "name": f"Member {i}", "email": f"m{i}@apsit.edu.in",
                    "moodle_id": f"22CE00{i}", "roll_no": f"R00{i}",
                    "division": "A", "department": "Computer Engineering",
                    "year": "2nd", "mobile": f"900000000{i}",
                    "is_leader": i == 1
                }
                for i in range(1, 5)
            ]
        }
        resp = client.post("/api/hackathon-teams", json=payload)
        assert resp.status_code == 201

    def test_hackathon_team_invalid_email_domain(self, client):
        """Team registration rejects non-APSIT email domains."""
        payload = {
            "event_name": "CTF 2026",
            "team_name": "BadTeam",
            "team_members": [
                {
                    "name": f"M{i}", "email": f"m{i}@gmail.com",
                    "moodle_id": f"ID00{i}", "roll_no": f"R00{i}",
                    "division": "B", "department": "Information Technology",
                    "year": "3rd", "mobile": f"800000000{i}",
                    "is_leader": i == 1
                }
                for i in range(1, 5)
            ]
        }
        resp = client.post("/api/hackathon-teams", json=payload)
        assert resp.status_code == 422

    def test_hackathon_teams_list_requires_auth(self, client):
        """GET /api/hackathon-teams returns 401/403 without auth."""
        resp = client.get("/api/hackathon-teams")
        assert resp.status_code in (401, 403)

    def test_hackathon_teams_list_admin(self, client, auth_headers):
        """Admin can list hackathon teams."""
        resp = client.get("/api/hackathon-teams", headers=auth_headers)
        assert resp.status_code == 200


class TestSecurityHeaders:
    def test_security_headers_present(self, client):
        """All required security headers are present in responses."""
        resp = client.get("/health")
        headers = resp.headers
        assert "x-content-type-options" in headers
        assert "x-frame-options" in headers
        assert "strict-transport-security" in headers
        assert "content-security-policy" in headers
        assert "referrer-policy" in headers

    def test_x_frame_options_deny(self, client):
        """X-Frame-Options must be DENY."""
        resp = client.get("/health")
        assert resp.headers.get("x-frame-options") == "DENY"

    def test_content_type_nosniff(self, client):
        """X-Content-Type-Options must be nosniff."""
        resp = client.get("/health")
        assert resp.headers.get("x-content-type-options") == "nosniff"
