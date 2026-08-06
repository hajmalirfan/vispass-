from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_role
from app.database.core import get_db
from app.models.user import User
from app.schemas.event import EventCreate, EventResponse, EventUpdate
from app.services import event_service

router = APIRouter()


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    payload: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host")),
):
    """Create a new event (Host only)."""
    return event_service.create_event(db, current_user, payload)


@router.get("", response_model=list[EventResponse])
def list_events(
    mine: Optional[bool] = None,
    host_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List events. Filter with ?mine=true or ?host_id=<id>."""
    return event_service.list_events(db, current_user, mine, host_id)


@router.get("/mine", response_model=list[EventResponse])
def my_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host")),
):
    """List events created by the current host."""
    return event_service.my_events(db, current_user)


@router.get("/{event_id}", response_model=EventResponse)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return event_service.get_event(db, event_id)


@router.put("/{event_id}", response_model=EventResponse)
def update_event(
    event_id: int,
    payload: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host")),
):
    """Edit an event (host owner only)."""
    return event_service.update_event(db, current_user, event_id, payload)


@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host")),
):
    """Delete an event (host owner only)."""
    event_service.delete_event(db, current_user, event_id)
