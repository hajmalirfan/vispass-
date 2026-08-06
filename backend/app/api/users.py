from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.core import get_db
from app.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse
from app.services import user_service

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
