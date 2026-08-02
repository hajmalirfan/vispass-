from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import require_role
from app.database.core import get_db
from app.models.event import Event
from app.models.registration import EventRegistration
from app.models.user import User
from app.schemas.registration import RegistrationWithEvent

router = APIRouter()


@router.get("/today", response_model=list[RegistrationWithEvent])
def todays_entries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Checker", "Host")),
):
    """List visitors who checked in today (verified entries)."""
    start_of_day = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    regs = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.checked_in == True,  # noqa: E712
            EventRegistration.checked_in_at >= start_of_day,
        )
        .order_by(EventRegistration.checked_in_at.desc())
        .all()
    )

    result: list[RegistrationWithEvent] = []
    for reg in regs:
        event = db.query(Event).filter(Event.id == reg.event_id).first()
        item = RegistrationWithEvent.model_validate(reg)
        item.event = event
        result.append(item)
    return result


@router.get("/summary", response_model=dict)
def today_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Checker", "Host")),
):
    """Small summary counts used by the checker dashboard header."""
    start_of_day = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)

    today_regs = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.checked_in == True,  # noqa: E712
            EventRegistration.checked_in_at >= start_of_day,
        )
        .all()
    )

    return {
        "total_entries": len(today_regs),
        "checked_in": len([r for r in today_regs if r.checked_in and not r.checked_out]),
        "checked_out": len([r for r in today_regs if r.checked_out]),
    }
