"""Hackathon team registration endpoints."""
import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from uuid import UUID
from app.database import get_db
from app.models import HackathonTeam, TeamMember, User
from app.schemas import HackathonTeamCreate, HackathonTeamResponse, HackathonTeamPublicResponse
from app.dependencies import get_current_user
from app.utils.errors import ConflictError, NotFoundError
from app.utils.validation import sanitize_string
from app.middleware.rate_limit import get_rate_limiter

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/hackathon-teams", tags=["Hackathon Teams"])
limiter = get_rate_limiter()


@router.post("", response_model=HackathonTeamResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
def create_hackathon_team(
    request: Request,
    team_data: HackathonTeamCreate,
    db: Session = Depends(get_db)
):
    """Register a hackathon team (Public).
    
    - **event_name**: Name of the hackathon event
    - **team_name**: Unique team name
    - **team_members**: List of exactly 4 team members (1 must be leader)
    
    Each team member must have:
    - name, email, moodle_id, roll_no, division, department, year, mobile
    - is_leader (exactly 1 member must be the leader)
    
    Prevents duplicate team names for the same event.
    Rate limited to 5 registrations per hour per IP.
    """
    # Sanitize inputs
    team_name = sanitize_string(team_data.team_name, max_length=100)
    event_name = sanitize_string(team_data.event_name, max_length=200)
    
    # Create team
    team = HackathonTeam(
        event_name=event_name,
        team_name=team_name
    )
    
    try:
        db.add(team)
        db.flush()  # Get team ID before adding members
        
        # Create team members
        for member_data in team_data.team_members:
            member = TeamMember(
                team_id=team.id,
                name=sanitize_string(member_data.name, max_length=100),
                email=member_data.email.lower(),
                moodle_id=member_data.moodle_id,
                roll_no=member_data.roll_no,
                division=member_data.division.upper(),
                department=member_data.department,
                year=member_data.year,
                mobile=member_data.mobile,
                is_leader=member_data.is_leader
            )
            db.add(member)
        
        db.commit()
        db.refresh(team)
        
    except IntegrityError:
        db.rollback()
        raise ConflictError(
            f"Team name '{team_name}' already exists for {event_name}"
        )
    except Exception as e:
        db.rollback()
        logger.exception("Failed to create hackathon team: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while creating the team."
        )
    
    return team


@router.get("", response_model=List[HackathonTeamResponse], status_code=status.HTTP_200_OK)
def get_hackathon_teams(
    event_name: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all hackathon teams (Admin only).
    
    - **event_name**: Optional filter by event name
    
    Requires admin authentication.
    """
    query = db.query(HackathonTeam)
    
    if event_name:
        query = query.filter(HackathonTeam.event_name == event_name)
    
    teams = query.order_by(HackathonTeam.created_at.desc()).all()
    return teams


@router.get("/{team_id}", response_model=HackathonTeamResponse, status_code=status.HTTP_200_OK)
def get_hackathon_team(
    team_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single hackathon team by ID (Admin only).
    
    - **team_id**: UUID of the team
    
    Requires admin authentication.
    """
    team = db.query(HackathonTeam).filter(HackathonTeam.id == team_id).first()
    
    if not team:
        raise NotFoundError("Hackathon Team", str(team_id))
    
    return team
