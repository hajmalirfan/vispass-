"""Forgot-password flow with 4-digit OTP — shared by Visitor, Host and Checker."""

import random
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import OTP_EXPIRE_MINUTES
from app.core.security import get_password_hash
from app.models.password_reset import PasswordResetOTP
from app.models.user import User
from app.schemas.user import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyOTPRequest,
)
from app.services.email_service import send_otp_email

MAX_ATTEMPTS = 5


def _generate_otp() -> str:
    return f"{random.randint(1000, 9999)}"


def request_password_reset(db: Session, data: ForgotPasswordRequest) -> dict:
    email = data.email.lower().strip()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        # Generic message — do not reveal whether the email exists.
        # Still return 200 so attackers cannot enumerate accounts.
        return {"message": "If this email is registered, a 4-digit OTP has been sent."}

    # Invalidate older unused OTPs for this email
    db.query(PasswordResetOTP).filter(
        PasswordResetOTP.email == email,
        PasswordResetOTP.is_used.is_(False),
    ).update({"is_used": True})
    db.commit()

    otp = _generate_otp()
    record = PasswordResetOTP(
        email=email,
        otp_code=otp,
        expires_at=datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES),
        is_used=False,
        attempts=0,
    )
    db.add(record)
    db.commit()

    try:
        send_otp_email(to_email=email, otp_code=otp, role=user.role)
    except Exception as exc:  # Mailtrap failure should not leak the OTP
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not send OTP email: {exc}",
        )

    return {"message": "If this email is registered, a 4-digit OTP has been sent."}


def _get_valid_otp(db: Session, email: str, otp: str) -> PasswordResetOTP:
    record = (
        db.query(PasswordResetOTP)
        .filter(
            PasswordResetOTP.email == email,
            PasswordResetOTP.is_used.is_(False),
        )
        .order_by(PasswordResetOTP.created_at.desc())
        .first()
    )
    if not record:
        raise HTTPException(status_code=400, detail="No active OTP found. Request a new one.")

    if datetime.utcnow() > record.expires_at:
        record.is_used = True
        db.commit()
        raise HTTPException(status_code=400, detail="OTP expired. Request a new one.")

    if record.attempts >= MAX_ATTEMPTS:
        record.is_used = True
        db.commit()
        raise HTTPException(status_code=400, detail="Too many wrong attempts. Request a new OTP.")

    if record.otp_code != otp.strip():
        record.attempts += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid OTP.")

    return record


def verify_otp(db: Session, data: VerifyOTPRequest) -> dict:
    _get_valid_otp(db, data.email.lower().strip(), data.otp)
    return {"message": "OTP verified. You can now reset your password."}


def reset_password(db: Session, data: ResetPasswordRequest) -> dict:
    if len(data.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters.")

    email = data.email.lower().strip()
    record = _get_valid_otp(db, email, data.otp)

    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.hashed_password = get_password_hash(data.new_password)
    record.is_used = True
    db.commit()
    return {"message": "Password reset successful. Please login with your new password."}
