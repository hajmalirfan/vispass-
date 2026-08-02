from typing import List, Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.event import EventResponse


class EventReport(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    event_id: int
    title: str
    total: int
    pending: int
    accepted: int
    rejected: int
    checked_in: int


class ReportsSummary(BaseModel):
    total_events: int
    total_registrations: int
    pending: int
    accepted: int
    rejected: int
    checked_in: int
    per_event: List[EventReport]
