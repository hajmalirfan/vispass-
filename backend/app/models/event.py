from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from app.database.core import Base


class Event(Base):
    """Table 2/5: events — created by hosts."""

    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(
        Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    title = Column(String, nullable=False, index=True)
    description = Column(Text, default="")
    event_date = Column(Date, nullable=True)
    location = Column(String, default="")
    capacity = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    host = relationship("User", back_populates="events")
    registrations = relationship(
        "EventRegistration", back_populates="event", cascade="all, delete-orphan"
    )
