from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.core import Base


class EventRegistration(Base):
    """Table 4/5: event_registrations — visitor applications for events.

    QR codes and check-in/out live in the ``gate_passes`` table (Table 5/5).
    This keeps applications normalized: one row = one application.
    """

    __tablename__ = "event_registrations"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(
        Integer, ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True
    )
    visitor_id = Column(
        Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    visitor_name = Column(String, nullable=False)
    visitor_email = Column(String, nullable=False, default="", index=True)
    phone = Column(String, default="")
    organization = Column(String, default="")
    purpose = Column(String, default="")

    status = Column(String, default="pending", nullable=False, index=True)  # pending | accepted | rejected
    id_proof = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    decided_at = Column(DateTime, nullable=True)

    event = relationship("Event", back_populates="registrations")
    visitor = relationship("User", back_populates="registrations")
    # One application -> at most one gate pass (created on accept)
    gate_pass = relationship(
        "GatePass", back_populates="registration", uselist=False, cascade="all, delete-orphan"
    )
