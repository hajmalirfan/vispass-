from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.registration import EventRegistration
from app.models.user import User
from app.schemas.event import EventCreate, EventUpdate


def create_event(db: Session, current_user: User, payload: EventCreate) -> Event:
    """Create a new event (Host only)."""
    event = Event(
        host_id=current_user.id,
        title=payload.title.strip(),
        description=payload.description,
        event_date=payload.event_date,
        location=payload.location,
        capacity=max(0, payload.capacity),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def list_events(
    db: Session,
    current_user: User,
    mine: Optional[bool] = None,
    host_id: Optional[int] = None,
) -> list[Event]:
    """List events. Filter with ?mine=true or ?host_id=<id>."""
    query = db.query(Event)
    if mine:
        query = query.filter(Event.host_id == current_user.id)
    elif host_id is not None:
        query = query.filter(Event.host_id == host_id)
    return query.order_by(Event.created_at.desc()).all()


def my_events(db: Session, current_user: User) -> list[Event]:
    """List events created by the current host."""
    return (
        db.query(Event)
        .filter(Event.host_id == current_user.id)
        .order_by(Event.created_at.desc())
        .all()
    )


def get_event(db: Session, event_id: int) -> Event:
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


def update_event(
    db: Session,
    current_user: User,
    event_id: int,
    payload: EventUpdate,
) -> Event:
    """Edit an event (host owner only)."""
    event = get_event(db, event_id)
    if event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own events")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return event


def delete_event(db: Session, current_user: User, event_id: int) -> None:
    """Delete an event (host owner only).

    Registrations + gate passes cascade via FK ON DELETE CASCADE on
    Postgres; the ORM relationship cascade covers SQLite fallback too.
    """
    event = get_event(db, event_id)
    if event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own events")

    db.delete(event)
    db.commit()
