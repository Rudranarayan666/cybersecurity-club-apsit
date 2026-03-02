"""Tests for event CRUD endpoints."""
import pytest
from datetime import date, timedelta


class TestEvents:
    def test_list_events_public(self, client, sample_event):
        """Public endpoint returns only active events."""
        resp = client.get("/api/events")
        assert resp.status_code == 200
        events = resp.json()
        # All returned events must be active
        assert all(e["is_active"] for e in events)

    def test_list_events_includes_sample(self, client, sample_event):
        """Sample active event appears in public listing."""
        resp = client.get("/api/events")
        titles = [e["title"] for e in resp.json()]
        # sample_event title has a UUID suffix now — just check any event present
        assert len(titles) >= 1
        assert any("Test Workshop" in t for t in titles)

    def test_get_event_by_id(self, client, sample_event):
        """GET /api/events/{id} returns correct event."""
        resp = client.get(f"/api/events/{sample_event.id}")
        assert resp.status_code == 200
        assert "Test Workshop" in resp.json()["title"]

    def test_get_nonexistent_event(self, client):
        """GET with unknown UUID returns 404."""
        resp = client.get("/api/events/00000000-0000-0000-0000-000000000000")
        assert resp.status_code == 404

    def test_create_event_requires_auth(self, client):
        """POST /api/events returns 401/403 without auth."""
        resp = client.post("/api/events", json={
            "title": "Unauthorized Event",
            "type": "Workshop",
            "date": str(date.today() + timedelta(days=5)),
            "description": "Should fail"
        })
        assert resp.status_code in (401, 403)

    def test_create_event_success(self, client, auth_headers):
        """Admin can create an event."""
        resp = client.post("/api/events", headers=auth_headers, json={
            "title": "New Security Workshop",
            "type": "Workshop",
            "date": str(date.today() + timedelta(days=20)),
            "description": "Test event creation"
        })
        assert resp.status_code == 201
        assert resp.json()["title"] == "New Security Workshop"

    def test_create_event_missing_fields(self, client, auth_headers):
        """Creating event with missing required fields returns 422."""
        resp = client.post("/api/events", headers=auth_headers, json={
            "title": "Bad Event"
            # Missing type and date
        })
        assert resp.status_code == 422

    def test_update_event(self, client, auth_headers, sample_event):
        """Admin can update an event."""
        resp = client.put(f"/api/events/{sample_event.id}", headers=auth_headers, json={
            "title": "Updated Workshop Title"
        })
        assert resp.status_code == 200
        assert resp.json()["title"] == "Updated Workshop Title"

    def test_update_event_missing_fields(self, client, auth_headers):
        """PUT with non-existent event returns 404."""
        resp = client.put(f"/api/events/00000000-0000-0000-0000-000000000000",
                          headers=auth_headers, json={"title": "Ghost"})
        assert resp.status_code == 404

    def test_delete_event(self, client, auth_headers, db):
        """Admin can soft-delete an event (is_active→False)."""
        from app.models import Event, EventType
        event = Event(
            title="To Delete",
            type=EventType.SEMINAR,
            date=date.today() + timedelta(days=1),
            is_active=True
        )
        db.add(event)
        db.commit()
        db.refresh(event)

        resp = client.delete(f"/api/events/{event.id}", headers=auth_headers)
        # Accept both 200 (body returned) and 204 (no content)
        assert resp.status_code in (200, 204)

        db.expire(event)
        db.refresh(event)
        assert event.is_active is False

    def test_delete_event_requires_auth(self, client, sample_event):
        """DELETE /api/events/{id} returns 401/403 without auth."""
        resp = client.delete(f"/api/events/{sample_event.id}")
        assert resp.status_code in (401, 403)
