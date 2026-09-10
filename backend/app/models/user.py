from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from app.database.core import Base


class User(Base):
    """Table 1/5: users — all accounts (Host, Visitor, Checker)."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False, index=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships (ORM only — no extra tables)
    events = relationship("Event", back_populates="host", cascade="all, delete-orphan")
    registrations = relationship("EventRegistration", back_populates="visitor")
    profile = relationship(
        "VisitorProfile", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
