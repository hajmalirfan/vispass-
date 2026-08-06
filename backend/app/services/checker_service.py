from datetime import datetime

from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.registration import EventRegistration
from app.models.user import User
from app.schemas.registration import RegistrationWithEvent


def _start_of_day() -> datetime:
    return datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)


def _with_event(db: Session, reg: EventRegistration) -> RegistrationWithEvent:
    event = db.query(Event).filter(Event.id == reg.event_id).first()
    item = RegistrationWithEvent.model_validate(reg)
    item.event = event
    return item


def todays_entries(db: Session, current_user: User) -> list[RegistrationWithEvent]:
    """List visitors who checked in today (verified entries)."""
    start_of_day = _start_of_day()

    regs = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.checked_in == True,  # noqa: E712
            EventRegistration.checked_in_at >= start_of_day,
        )
        .order_by(EventRegistration.checked_in_at.desc())
        .all()
    )

    return [_with_event(db, reg) for reg in regs]


def today_summary(db: Session, current_user: User) -> dict:
    """Small summary counts used by the checker dashboard header."""
    start_of_day = _start_of_day()

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
