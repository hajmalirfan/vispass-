from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_role
from app.database.core import get_db
from app.models.event import Event
from app.models.registration import EventRegistration
from app.models.user import User
from app.schemas.event import EventCreate, EventResponse, EventUpdate

router = APIRouter()


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host")),
):
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


@router.get("", response_model=list[EventResponse])
def list_events(
    mine: Optional[bool] = None,
    host_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List events. Filter with ?mine=true or ?host_id=<id>."""
    query = db.query(Event)
    if mine:
        query = query.filter(Event.host_id == current_user.id)
    elif host_id is not None:
        query = query.filter(Event.host_id == host_id)
    return query.order_by(Event.created_at.desc()).all()


@router.get("/mine", response_model=list[EventResponse])
def my_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host")),
):
    """List events created by the current host."""
    return (
        db.query(Event)
        .filter(Event.host_id == current_user.id)
        .order_by(Event.created_at.desc())
        .all()
    )


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host")),
):
    """Edit an event (host owner only)."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only edit your own events")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host")),
):
    """Delete an event (host owner only)."""
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own events")

    db.query(EventRegistration).filter(EventRegistration.event_id == event_id).delete()
    db.delete(event)
    db.commit()
