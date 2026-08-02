from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class EventCreate(BaseModel):
    title: str
    description: str = ""
    event_date: Optional[date] = None
    location: str = ""
    capacity: int = 0


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    event_date: Optional[date] = None
    location: Optional[str] = None
    capacity: Optional[int] = None


class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    host_id: int
    title: str
    description: str
    event_date: Optional[date]
    location: str
    capacity: int
    created_at: datetime
