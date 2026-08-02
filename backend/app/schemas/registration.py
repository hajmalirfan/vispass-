from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.event import EventResponse


class RegistrationCreate(BaseModel):
    event_id: int
    visitor_name: str
    visitor_email: str = ""
    phone: str = ""
    organization: str = ""
    purpose: str = ""


class RegistrationStatusUpdate(BaseModel):
    status: str


class RegistrationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_id: int
    visitor_id: Optional[int]
    visitor_name: str
    visitor_email: str
    phone: str
    organization: str
    purpose: str
    status: str
    qr_code: Optional[str]
    id_proof: Optional[str]
    checked_in: bool
    checked_in_at: Optional[datetime]
    checked_out: bool
    checked_out_at: Optional[datetime]
    created_at: datetime
    decided_at: Optional[datetime]


class RegistrationWithEvent(RegistrationResponse):
    event: Optional[EventResponse] = None
