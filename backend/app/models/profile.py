from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from app.database.core import Base


class VisitorProfile(Base):
    __tablename__ = "visitor_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    full_name = Column(String, default="")
    phone = Column(String, default="")
    organization = Column(String, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
