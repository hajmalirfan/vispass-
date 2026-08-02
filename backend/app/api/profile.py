from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.database.core import get_db
from app.models.profile import VisitorProfile
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpdate

router = APIRouter()


@router.get("/profile", response_model=ProfileResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the profile of the logged-in user."""
    profile = db.query(VisitorProfile).filter(VisitorProfile.user_id == current_user.id).first()
    return ProfileResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        full_name=profile.full_name if profile else "",
        phone=profile.phone if profile else "",
        organization=profile.organization if profile else "",
    )


@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update the profile of the logged-in user."""
    profile = db.query(VisitorProfile).filter(VisitorProfile.user_id == current_user.id).first()
    if not profile:
        profile = VisitorProfile(user_id=current_user.id)
        db.add(profile)

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return ProfileResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role,
        full_name=profile.full_name,
        phone=profile.phone,
        organization=profile.organization,
    )
