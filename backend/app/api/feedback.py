from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
import logging

from app.database import get_db
from app.models import Feedback, AuditLog
from app.schemas import FeedbackCreate, FeedbackResponse
from app.dependencies import get_current_user
from app.utils.errors import create_error_response

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/feedback", tags=["Feedback"])


@router.post("", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def submit_feedback(feedback: FeedbackCreate, db: Session = Depends(get_db)):
    """Submit a new CTF feedback form."""
    try:
        new_feedback = Feedback(
            email=feedback.email,
            name=feedback.name,
            year=feedback.year,
            department=feedback.department,
            moodle_id=feedback.moodle_id,
            overall_rating=feedback.overall_rating,
            practical_concepts_rating=feedback.practical_concepts_rating,
            interesting_rating=feedback.interesting_rating,
            difficulty_rating=feedback.difficulty_rating,
            enjoyed_category=feedback.enjoyed_category,
            improved_skills=feedback.improved_skills,
            encouraged_teamwork=feedback.encouraged_teamwork,
            valuable_learning=feedback.valuable_learning,
            challenges_faced=feedback.challenges_faced,
            suggestions=feedback.suggestions,
            liked_challenges=feedback.liked_challenges
        )
        
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)
        
        # Log the submission
        audit_log = AuditLog(
            action="SUBMIT_FEEDBACK",
            resource_type="Feedback",
            resource_id=str(new_feedback.id),
            success=True,
            details=f"Feedback submitted by {feedback.email}"
        )
        db.add(audit_log)
        db.commit()
        
        logger.info(f"Feedback submitted successfully by {feedback.email}")
        return new_feedback
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error submitting feedback: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit feedback. Please try again later."
        )


@router.get("", response_model=List[FeedbackResponse], status_code=status.HTTP_200_OK)
def get_all_feedback(
    skip: int = 0, 
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all feedback responses (Admin only)."""
    try:
        feedback_list = db.query(Feedback).order_by(Feedback.created_at.desc()).offset(skip).limit(limit).all()
        return feedback_list
    except Exception as e:
        logger.error(f"Error retrieving feedback for admin {current_user.username}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve feedback list"
        )
