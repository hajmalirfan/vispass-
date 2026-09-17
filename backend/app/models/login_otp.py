from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.database.core import Base


class LoginOTP(Base):
    """OTP codes for Admin passwordless login (4-digit, single use)."""

    __tablename__ = "login_otps"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True, nullable=False)
    otp_code = Column(String(4), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
