"""Database seeding script to create initial admin user and sample data."""
import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models import User, Event, Resource, EventType, ResourceLevel
from app.security import hash_password
from datetime import date, timedelta

# Create tables (safe: only creates tables that don't exist yet)
Base.metadata.create_all(bind=engine)


def seed_database():
    """Seed the database with initial data."""
    db: Session = SessionLocal()
    
    try:
        from app.config import settings
        # =============================================
        # 1. Create admin user
        # =============================================
        admin_username = settings.admin_username
        admin_password = settings.admin_password
        
        existing_admin = db.query(User).filter(User.username == admin_username).first()
        if not existing_admin:
            admin = User(
                username=admin_username,
                password_hash=hash_password(admin_password),
                is_active=True
            )
            db.add(admin)
            db.commit()
            print(f"✓ Created admin user: {admin_username}")
        else:
            print(f"✓ Admin user already exists: {admin_username}")
        
        # =============================================
        # 2. Create sample events
        # =============================================
        sample_events = [
            {
                "title": "Web Security Workshop",
                "type": EventType.WORKSHOP,
                "date": date.today() + timedelta(days=30),
                "description": "Introduction to OWASP Top 10 vulnerabilities and secure coding practices.",
                "is_active": True
            },
            {
                "title": "Malware Analysis Bootcamp",
                "type": EventType.BOOTCAMP,
                "date": date.today() + timedelta(days=45),
                "description": "Hands-on training on analyzing malicious binaries safely in a controlled environment.",
                "is_active": True
            },
            {
                "title": "Introduction to Cryptography",
                "type": EventType.LECTURE,
                "date": date.today() - timedelta(days=10),
                "description": "Understanding Public Key Infrastructure (PKI) and encryption fundamentals.",
                "is_active": False  # Past event
            },
            {
                "title": "CyberDefense CTF 2026",
                "type": EventType.HACKATHON,
                "date": date.today() + timedelta(days=60),
                "description": "Join 50+ teams in a 48-hour endurance test of your hacking skills. Challenges include Web Exploitation, Cryptography, Reverse Engineering, and Forensics.",
                "is_active": True
            }
        ]
        
        for event_data in sample_events:
            existing_event = db.query(Event).filter(Event.title == event_data["title"]).first()
            if not existing_event:
                event = Event(**event_data)
                db.add(event)
                print(f"✓ Created event: {event_data['title']}")
            else:
                print(f"✓ Event already exists: {event_data['title']}")
        
        db.commit()
        
        # =============================================
        # 3. Summary
        # =============================================
        total_users = db.query(User).count()
        total_events = db.query(Event).count()
        active_events = db.query(Event).filter(Event.is_active == True).count()
        
        print(f"\n{'='*50}")
        print(f"  Database Seeding Complete")
        print(f"{'='*50}")
        print(f"  Users:         {total_users}")
        print(f"  Events:        {total_events} ({active_events} active)")
        print(f"{'='*50}")
        print(f"\n  Admin credentials:")
        print(f"    Username: {admin_username}")
        print(f"    Password: {admin_password}")
        print(f"\n  ⚠️  Change the admin password after first login!")
        print(f"{'='*50}")
        
    except Exception as e:
        db.rollback()
        print(f"✗ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
