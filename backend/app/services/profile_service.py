from sqlalchemy.orm import Session

from app.models.profile import VisitorProfile
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpdate


def get_profile(db: Session, current_user: User) -> ProfileResponse:
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


def update_profile(db: Session, current_user: User, payload: ProfileUpdate) -> ProfileResponse:
    """Update the profile of the logged-in user."""
    profile = db.query(VisitorProfile).filter(VisitorProfile.user_id == current_user.id).first()
    if not profile:
        profile = VisitorProfile(user_id=current_user.id)
        db.add(profile)

    for field, value in payload.model_dump(exclude_unset=True).items():
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
