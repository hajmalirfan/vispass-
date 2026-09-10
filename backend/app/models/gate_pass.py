from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database.core import Base


class GatePass(Base):
    """Table 5/5: gate_passes — QR gate pass + entry/exit log for an accepted registration.

    One row is created when a host accepts a registration. Check-in/out
    timestamps recorded by Host/Checker update this same row, so the full
    entry history for a pass lives in exactly one place.
    """

    __tablename__ = "gate_passes"

    id = Column(Integer, primary_key=True, index=True)
    registration_id = Column(
        Integer,
        ForeignKey("event_registrations.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    qr_code = Column(String, unique=True, nullable=False, index=True)

    issued_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    checked_in = Column(Boolean, default=False, nullable=False)
    checked_in_at = Column(DateTime, nullable=True)
    checked_out = Column(Boolean, default=False, nullable=False)
    checked_out_at = Column(DateTime, nullable=True)

    registration = relationship("EventRegistration", back_populates="gate_pass")
