from datetime import datetime

from sqlalchemy.orm import Session, joinedload

from app.models.event import Event
from app.models.gate_pass import GatePass
from app.models.registration import EventRegistration
from app.models.user import User
from app.schemas.registration import RegistrationWithEvent


def _start_of_day() -> datetime:
    return datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)


def _with_event(db: Session, reg: EventRegistration) -> RegistrationWithEvent:
    from app.services.registration_service import _attach_pass

    event = db.query(Event).filter(Event.id == reg.event_id).first()
    _attach_pass(reg)
    item = RegistrationWithEvent.model_validate(reg)
    item.event = event
    return item


def todays_entries(db: Session, current_user: User) -> list[RegistrationWithEvent]:
    """List visitors who checked in today (verified entries from gate_passes)."""
    start_of_day = _start_of_day()

    regs = (
        db.query(EventRegistration)
        .join(GatePass, GatePass.registration_id == EventRegistration.id)
        .options(joinedload(EventRegistration.gate_pass))
        .filter(
            GatePass.checked_in == True,  # noqa: E712
            GatePass.checked_in_at >= start_of_day,
        )
        .order_by(GatePass.checked_in_at.desc())
        .all()
    )

    return [_with_event(db, reg) for reg in regs]


def today_summary(db: Session, current_user: User) -> dict:
    """Small summary counts used by the checker dashboard header."""
    start_of_day = _start_of_day()

    passes = (
        db.query(GatePass)
        .filter(
            GatePass.checked_in == True,  # noqa: E712
            GatePass.checked_in_at >= start_of_day,
        )
        .all()
    )

    return {
        "total_entries": len(passes),
        "checked_in": len([p for p in passes if p.checked_in and not p.checked_out]),
        "checked_out": len([p for p in passes if p.checked_out]),
    }
