from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_role
from app.database.core import get_db
from app.models.user import User
from app.schemas.user import (
    AdminLoginOTPRequest,
    AdminVerifyOTPRequest,
    TokenResponse,
    UserResponse,
)
from app.services import admin_service

router = APIRouter()

admin_only = require_role("Admin")


@router.post("/login-otp/request")
def request_login_otp(data: AdminLoginOTPRequest, db: Session = Depends(get_db)):
    """Send a 4-digit login OTP to the admin email (admin only)."""
    return admin_service.request_login_otp(db, data.email)


@router.post("/login-otp/verify", response_model=TokenResponse)
def verify_login_otp(data: AdminVerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify the admin login OTP and return a JWT access token."""
    return admin_service.verify_login_otp(db, data.email, data.otp)


@router.get("/users", response_model=list[UserResponse])
def list_all_users(
    db: Session = Depends(get_db),
    _admin: User = Depends(admin_only),
):
    """Full user list (admin only)."""
    return admin_service.list_users(db)


@router.delete("/users/{user_id}")
def remove_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(admin_only),
):
    """Remove any user account (admin only, full control)."""
    return admin_service.delete_user(db, user_id, admin)


@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    _admin: User = Depends(admin_only),
):
    """Application-wide stats (admin only)."""
    return admin_service.admin_stats(db)


@router.get("/me", response_model=UserResponse)
def admin_me(admin: User = Depends(get_current_user)):
    """Current admin profile (requires Admin role token)."""
    if admin.role != "Admin":
        from fastapi import HTTPException

        raise HTTPException(status_code=403, detail="Admin access only")
    return admin
