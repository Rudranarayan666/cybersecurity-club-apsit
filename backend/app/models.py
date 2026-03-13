"""SQLAlchemy database models."""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Date, Text, Integer, ForeignKey, Enum as SQLEnum, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import enum
from app.database import Base


class EventType(str, enum.Enum):
    """Event type enumeration."""
    WORKSHOP = "Workshop"
    HACKATHON = "Hackathon"
    SEMINAR = "Seminar"
    BOOTCAMP = "Bootcamp"
    LECTURE = "Lecture"


class ResourceLevel(str, enum.Enum):
    """Resource level enumeration."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class User(Base):
    """Admin user model."""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # MFA (TOTP)
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    totp_secret = Column(String(64), nullable=True)  # Encrypted base32 secret
    
    def __repr__(self):
        return f"<User(username={self.username})>"


class Event(Base):
    """Event model."""
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    type = Column(SQLEnum(EventType), nullable=False)
    date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    registrations = relationship("Registration", back_populates="event", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Event(title={self.title}, type={self.type})>"


class Registration(Base):
    """Event registration model."""
    __tablename__ = "registrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    operative_name = Column(String(100), nullable=False)
    moodle_id = Column(String(20), nullable=False, index=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    event = relationship("Event", back_populates="registrations")
    
    # Unique constraint to prevent duplicate registrations
    __table_args__ = (
        UniqueConstraint('event_id', 'moodle_id', name='unique_event_moodle'),
    )
    
    def __repr__(self):
        return f"<Registration(moodle_id={self.moodle_id}, event_id={self.event_id})>"


class Resource(Base):
    """PDF resource model."""
    __tablename__ = "resources"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(200), nullable=False)
    level = Column(SQLEnum(ResourceLevel), nullable=False)
    file_url = Column(String(500), nullable=False, unique=True)
    file_size = Column(Integer, nullable=True)  # Size in bytes
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
    
    def __repr__(self):
        return f"<Resource(title={self.title}, level={self.level})>"


class HackathonTeam(Base):
    """Hackathon team registration model."""
    __tablename__ = "hackathon_teams"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_name = Column(String(200), nullable=False, index=True)
    team_name = Column(String(100), nullable=False, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    members = relationship("TeamMember", back_populates="team", cascade="all, delete-orphan")
    
    # Unique constraint for team name per event
    __table_args__ = (
        UniqueConstraint('event_name', 'team_name', name='unique_event_team_name'),
    )
    
    def __repr__(self):
        return f"<HackathonTeam(team_name={self.team_name}, event={self.event_name})>"


class TeamMember(Base):
    """Hackathon team member model."""
    __tablename__ = "team_members"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey("hackathon_teams.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, index=True)
    moodle_id = Column(String(20), nullable=False, index=True)
    roll_no = Column(String(20), nullable=False)
    division = Column(String(5), nullable=False)
    department = Column(String(100), nullable=False)
    year = Column(String(10), nullable=False)
    mobile = Column(String(15), nullable=False)
    is_leader = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    team = relationship("HackathonTeam", back_populates="members")
    
    def __repr__(self):
        return f"<TeamMember(name={self.name}, team_id={self.team_id})>"


class Feedback(Base):
    """CTF Feedback and Review Form."""
    __tablename__ = "feedback"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(100), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    year = Column(String(20), nullable=False)
    department = Column(String(100), nullable=False)
    moodle_id = Column(String(20), nullable=False)
    
    # Rating questions (1-5)
    overall_rating = Column(Integer, nullable=False)
    practical_concepts_rating = Column(Integer, nullable=False)
    
    # Multiple choice ratings as strings
    interesting_rating = Column(String(50), nullable=False)
    difficulty_rating = Column(String(50), nullable=False)
    enjoyed_category = Column(String(50), nullable=False)
    improved_skills = Column(String(20), nullable=False) # Yes/Somewhat/No
    encouraged_teamwork = Column(String(20), nullable=False) # Yes/Somewhat/No
    
    # Long text answers
    valuable_learning = Column(Text, nullable=False)
    challenges_faced = Column(Text, nullable=False)
    suggestions = Column(Text, nullable=False)
    liked_challenges = Column(Text, nullable=True) # Optional text
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<Feedback(email={self.email}, rating={self.overall_rating})>"


class AuditLog(Base):
    """Audit log for all admin and security-relevant actions."""
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    
    # Who did it (None for anonymous/public actions)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    username = Column(String(50), nullable=True)  # Denormalized for log durability
    ip_address = Column(String(45), nullable=True, index=True)  # IPv4 or IPv6
    user_agent = Column(String(500), nullable=True)
    
    # What happened
    action = Column(String(100), nullable=False, index=True)  # e.g. "LOGIN_SUCCESS", "CREATE_EVENT"
    resource_type = Column(String(50), nullable=True)          # e.g. "Event", "Resource"
    resource_id = Column(String(36), nullable=True)            # UUID as string
    
    # Outcome and details
    success = Column(Boolean, default=True, nullable=False)
    details = Column(Text, nullable=True)  # JSON string for extra context
    
    def __repr__(self):
        return f"<AuditLog(action={self.action}, user={self.username}, success={self.success})>"


class RefreshToken(Base):
    """Refresh token store for JWT rotation and server-side revocation."""
    __tablename__ = "refresh_tokens"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(String(64), nullable=False, unique=True, index=True)  # SHA-256 hash
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)
    revoked_at = Column(DateTime(timezone=True), nullable=True)
    ip_address = Column(String(45), nullable=True)
    
    # Relationship
    user = relationship("User", backref="refresh_tokens")
    
    def __repr__(self):
        return f"<RefreshToken(user_id={self.user_id}, revoked={self.revoked})>"
