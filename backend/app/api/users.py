from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.core import get_db
from app.schemas.user import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
    VerifyOTPRequest,
)
from app.services import password_reset_service, user_service

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user (Visitor or Host)."""
    return user_service.register_user(db, user)


@router.post("/login", response_model=TokenResponse)
def login_user(credentials: UserLogin, db: Session = Depends(get_db)):
    """Authenticate a user and return a JWT access token."""
    return user_service.login_user(db, credentials)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(email: str, db: Session = Depends(get_db)):
    """Get user info by email (for testing purposes)."""
    return user_service.get_user_by_email(db, email)


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request a 4-digit OTP via Mailtrap (works for Visitor, Host, Checker)."""
    return password_reset_service.request_password_reset(db, data)


@router.post("/verify-otp")
def verify_otp(data: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Verify the 4-digit OTP without resetting yet."""
    return password_reset_service.verify_otp(db, data)


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using the verified 4-digit OTP."""
    return password_reset_service.reset_password(db, data)
