"""Admin-only operations: OTP login + full application control."""

import random
import secrets
from datetime import datetime, timedelta

from fastapi import HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.config import ADMIN_EMAIL, OTP_EXPIRE_MINUTES
from app.core.security import create_access_token, get_password_hash
from app.models.event import Event
from app.models.gate_pass import GatePass
from app.models.login_otp import LoginOTP
from app.models.registration import EventRegistration
from app.models.user import User
from app.schemas.user import TokenResponse, UserResponse
from app.services.email_service import send_login_otp_email

MAX_ATTEMPTS = 5


def _generate_otp() -> str:
    return f"{random.randint(1000, 9999)}"


def _ensure_admin_user(db: Session) -> User:
    """Auto-provision the Admin account on first OTP request."""
    admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
    if not admin:
        admin = User(
            email=ADMIN_EMAIL,
            role="Admin",
            # Unusable password — Admin can only sign in via email OTP.
            hashed_password=get_password_hash(secrets.token_urlsafe(32)),
        )
        db.add(admin)
        db.commit()
        db.refresh(admin)
    elif admin.role != "Admin":
        # The designated admin email always wins — upgrade it even if it was
        # previously registered under another role.
        admin.role = "Admin"
        db.commit()
        db.refresh(admin)
    return admin


def request_login_otp(db: Session, email: str) -> dict:
    email = email.lower().strip()
    if email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="OTP login is reserved for the admin email.",
        )

    _ensure_admin_user(db)

    db.query(LoginOTP).filter(
        LoginOTP.email == email,
        LoginOTP.is_used.is_(False),
    ).update({"is_used": True})
    db.commit()

    otp = _generate_otp()
    db.add(
        LoginOTP(
            email=email,
            otp_code=otp,
            expires_at=datetime.utcnow() + timedelta(minutes=OTP_EXPIRE_MINUTES),
            is_used=False,
            attempts=0,
        )
    )
    db.commit()

    try:
        send_login_otp_email(to_email=email, otp_code=otp)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Could not send login OTP email: {exc}",
        )
    return {"message": "A 4-digit login OTP has been sent to the admin email."}


def verify_login_otp(db: Session, email: str, otp: str) -> TokenResponse:
    email = email.lower().strip()
    if email != ADMIN_EMAIL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="OTP login is reserved for the admin email.",
        )

    admin = _ensure_admin_user(db)

    record = (
        db.query(LoginOTP)
        .filter(LoginOTP.email == email, LoginOTP.is_used.is_(False))
        .order_by(LoginOTP.created_at.desc())
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

    record.is_used = True
    db.commit()

    access_token = create_access_token(
        data={"sub": admin.email, "role": admin.role, "user_id": admin.id},
        expires_delta=timedelta(minutes=60),
    )
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(id=admin.id, email=admin.email, role=admin.role),
    )


def list_users(db: Session) -> list[User]:
    return db.query(User).order_by(User.id).all()


def delete_user(db: Session, user_id: int, current_admin: User) -> dict:
    if user_id == current_admin.id:
        raise HTTPException(status_code=400, detail="You cannot remove your own admin account.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    db.delete(user)
    db.commit()
    return {"message": f"User {user.email} removed."}


def admin_stats(db: Session) -> dict:
    users_by_role = dict(
        db.query(User.role, func.count(User.id)).group_by(User.role).all()
    )
    regs_by_status = dict(
        db.query(EventRegistration.status, func.count(EventRegistration.id))
        .group_by(EventRegistration.status)
        .all()
    )
    return {
        "total_users": db.query(func.count(User.id)).scalar(),
        "users_by_role": users_by_role,
        "total_events": db.query(func.count(Event.id)).scalar(),
        "registrations_by_status": regs_by_status,
        "total_gate_passes": db.query(func.count(GatePass.id)).scalar(),
        "checked_in": db.query(func.count(GatePass.id))
        .filter(GatePass.checked_in.is_(True))
        .scalar(),
    }
