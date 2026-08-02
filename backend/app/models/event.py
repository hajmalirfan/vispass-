from datetime import datetime, date

from sqlalchemy import Column, Integer, String, Date, DateTime, Text, ForeignKey
from app.database.core import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    host_id = Column(Integer, ForeignKey("users.id"), index=True)
    title = Column(String, index=True)
    description = Column(Text, default="")
    event_date = Column(Date, nullable=True)
    location = Column(String, default="")
    capacity = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
