from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user, require_role
from app.database.core import get_db
from app.models.user import User
from app.schemas.registration import RegistrationResponse, RegistrationWithEvent
from app.services import registration_service

router = APIRouter()


@router.post("/events/{event_id}/register", response_model=RegistrationResponse, status_code=status.HTTP_201_CREATED)
def register_for_event(
    event_id: int,
    visitor_name: str = Form(...),
    visitor_email: str = Form(""),
    phone: str = Form(""),
    organization: str = Form(""),
    purpose: str = Form(""),
    id_proof: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Register a visitor for an event (multipart form). Creates a pending request for the host to review."""
    return registration_service.register_for_event(
        db,
        current_user,
        event_id,
        visitor_name=visitor_name,
        visitor_email=visitor_email,
        phone=phone,
        organization=organization,
        purpose=purpose,
        id_proof=id_proof,
    )


@router.get("/registrations", response_model=list[RegistrationWithEvent])
def list_registrations(
    status_filter: Optional[str] = None,
    event_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List registrations.
    - Hosts see registrations for their own events (filter with ?status=pending|accepted|rejected).
    - Visitors see their own registrations.
    """
    return registration_service.list_registrations(db, current_user, status_filter, event_id)


@router.put("/registrations/{reg_id}/status", response_model=RegistrationResponse)
def decide_registration(
    reg_id: int,
    decision: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host")),
):
    """Accept or reject a visitor request. Query param: ?decision=accept|reject."""
    return registration_service.decide_registration(db, current_user, reg_id, decision)


@router.get("/registrations/{reg_id}/qr")
def get_registration_qr(
    reg_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the QR pass image (PNG) for an accepted registration."""
    return registration_service.get_registration_qr(db, current_user, reg_id)


@router.get("/registrations/verify/{qr_code}", response_model=RegistrationWithEvent)
def verify_pass(
    qr_code: str,
    db: Session = Depends(get_db),
):
    """Public verification of a gate pass QR code (used by gate checkers)."""
    return registration_service.verify_pass(db, qr_code)


@router.put("/registrations/{reg_id}/checkin", response_model=RegistrationResponse)
def checkin(
    reg_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host", "Checker")),
):
    """Mark an accepted visitor as checked in."""
    return registration_service.checkin(db, current_user, reg_id)


@router.put("/registrations/{reg_id}/checkout", response_model=RegistrationResponse)
def checkout(
    reg_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host", "Checker")),
):
    """Mark an accepted visitor as checked out."""
    return registration_service.checkout(db, current_user, reg_id)
