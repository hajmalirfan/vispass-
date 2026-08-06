from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database.core import get_db
from app.models.user import User
from app.schemas.registration import RegistrationWithEvent
from app.services import checker_service

router = APIRouter()


@router.get("/today", response_model=list[RegistrationWithEvent])
def todays_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Checker", "Host")),
):
    """List visitors who checked in today (verified entries)."""
    return checker_service.todays_entries(db, current_user)


@router.get("/summary", response_model=dict)
def today_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Checker", "Host")),
):
    """Small summary counts used by the checker dashboard header."""
    return checker_service.today_summary(db, current_user)
