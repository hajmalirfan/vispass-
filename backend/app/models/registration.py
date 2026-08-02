from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from app.database.core import Base


class EventRegistration(Base):
    __tablename__ = "event_registrations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), index=True)
    visitor_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    visitor_name = Column(String)
    visitor_email = Column(String)
    phone = Column(String, default="")
    organization = Column(String, default="")
    purpose = Column(String, default="")

    status = Column(String, default="pending")  # pending | accepted | rejected
    qr_code = Column(String, unique=True, nullable=True)
    id_proof = Column(String, nullable=True)

    checked_in = Column(Boolean, default=False)
    checked_in_at = Column(DateTime, nullable=True)
    checked_out = Column(Boolean, default=False)
    checked_out_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    decided_at = Column(DateTime, nullable=True)
