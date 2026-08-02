import os
import secrets
import shutil
import uuid
from datetime import datetime
from io import BytesIO
from typing import Optional

import qrcode
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user, require_role
from app.config import ALLOWED_IMAGE_EXTENSIONS, UPLOAD_DIR
from app.database.core import get_db
from app.models.event import Event
from app.models.registration import EventRegistration
from app.models.user import User
from app.schemas.registration import RegistrationResponse, RegistrationWithEvent

router = APIRouter()


def _host_event_ids(user: User, db: Session) -> list[int]:
    return [e.id for e in db.query(Event).filter(Event.host_id == user.id).all()]


def _get_registration(reg_id: int, db: Session) -> EventRegistration:
    reg = db.query(EventRegistration).filter(EventRegistration.id == reg_id).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    return reg


def _build_qr_png(token: str) -> bytes:
    qr = qrcode.QRCode(version=4, box_size=10, border=2)
    qr.add_data(token)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buf = BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def _save_id_proof(upload: UploadFile) -> Optional[str]:
    """Save an uploaded ID proof to the uploads directory and return the stored filename."""
    ext = os.path.splitext(upload.filename or "")[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type '{ext or 'unknown'}'")
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    stored = f"id_{uuid.uuid4().hex}{ext}"
    destination = os.path.join(UPLOAD_DIR, stored)
    with open(destination, "wb") as out:
        shutil.copyfileobj(upload.file, out)
    return stored


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
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    resolved_email = visitor_email.strip() or (current_user.email if current_user.role == "Visitor" else "")
    existing = (
        db.query(EventRegistration)
        .filter(
            EventRegistration.event_id == event_id,
            EventRegistration.visitor_email == resolved_email,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="You have already registered for this event",
        )

    stored_proof = _save_id_proof(id_proof) if id_proof is not None else None
    reg = EventRegistration(
        event_id=event_id,
        visitor_id=current_user.id if current_user.role == "Visitor" else None,
        visitor_name=visitor_name.strip(),
        visitor_email=resolved_email,
        phone=phone,
        organization=organization,
        purpose=purpose,
        status="pending",
        id_proof=stored_proof,
    )
    db.add(reg)
    db.commit()
    db.refresh(reg)
    return reg


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
    if current_user.role == "Host":
        event_ids = _host_event_ids(current_user, db)
        query = db.query(EventRegistration).filter(EventRegistration.event_id.in_(event_ids))
    elif current_user.role == "Visitor":
        query = db.query(EventRegistration).filter(
            (EventRegistration.visitor_email == current_user.email)
            | (EventRegistration.visitor_id == current_user.id)
        )
    else:
        query = db.query(EventRegistration)

    if status_filter:
        query = query.filter(EventRegistration.status == status_filter)
    if event_id is not None:
        query = query.filter(EventRegistration.event_id == event_id)

    regs = query.order_by(EventRegistration.created_at.desc()).all()

    result: list[RegistrationWithEvent] = []
    for reg in regs:
        event = db.query(Event).filter(Event.id == reg.event_id).first()
        item = RegistrationWithEvent.model_validate(reg)
        item.event = event
        result.append(item)
    return result


@router.put("/registrations/{reg_id}/status", response_model=RegistrationResponse)
def decide_registration(
    reg_id: int,
    decision: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host")),
):
    """Accept or reject a visitor request. Query param: ?decision=accept|reject."""
    reg = _get_registration(reg_id, db)
    event = db.query(Event).filter(Event.id == reg.event_id).first()
    if not event or event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only review requests for your own events")

    if decision not in ("accept", "reject"):
        raise HTTPException(status_code=400, detail="Decision must be 'accept' or 'reject'")
    if reg.status != "pending":
        raise HTTPException(status_code=400, detail="This request has already been reviewed")

    if decision == "accept":
        reg.status = "accepted"
        if not reg.qr_code:
            reg.qr_code = f"VGP-{secrets.token_urlsafe(16)}"
    else:
        reg.status = "rejected"

    reg.decided_at = datetime.utcnow()
    db.commit()
    db.refresh(reg)
    return reg


@router.get("/registrations/{reg_id}/qr")
def get_registration_qr(
    reg_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Return the QR pass image (PNG) for an accepted registration."""
    reg = _get_registration(reg_id, db)
    if reg.status != "accepted" or not reg.qr_code:
        raise HTTPException(status_code=400, detail="QR pass is only available for accepted visitors")

    event = db.query(Event).filter(Event.id == reg.event_id).first()
    if current_user.role == "Checker":
        raise HTTPException(status_code=403, detail="Checkers cannot generate QR codes")
    if current_user.role == "Host" and event and event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="This pass belongs to another host's event")
    if (
        current_user.role == "Visitor"
        and reg.visitor_email != current_user.email
        and reg.visitor_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="You can only view your own gate pass")

    verify_url = f"http://127.0.0.1:8000/registrations/verify/{reg.qr_code}"
    png = _build_qr_png(verify_url)
    return StreamingResponse(
        BytesIO(png),
        media_type="image/png",
        headers={"Content-Disposition": f'inline; filename="gatepass-{reg.id}.png"'},
    )


@router.get("/registrations/verify/{qr_code}", response_model=RegistrationWithEvent)
def verify_pass(
    qr_code: str,
    db: Session = Depends(get_db),
):
    """Public verification of a gate pass QR code (used by gate checkers)."""
    reg = db.query(EventRegistration).filter(EventRegistration.qr_code == qr_code).first()
    if not reg:
        raise HTTPException(status_code=404, detail="Invalid or unknown gate pass")
    if reg.status != "accepted":
        raise HTTPException(status_code=400, detail="This gate pass has not been approved")

    event = db.query(Event).filter(Event.id == reg.event_id).first()
    item = RegistrationWithEvent.model_validate(reg)
    item.event = event
    return item


@router.put("/registrations/{reg_id}/checkin", response_model=RegistrationResponse)
def checkin(
    reg_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host", "Checker")),
):
    """Mark an accepted visitor as checked in."""
    reg = _get_registration(reg_id, db)
    if reg.status != "accepted":
        raise HTTPException(status_code=400, detail="Only accepted visitors can check in")

    if current_user.role == "Host":
        event = db.query(Event).filter(Event.id == reg.event_id).first()
        if not event or event.host_id != current_user.id:
            raise HTTPException(status_code=403, detail="This visitor belongs to another host's event")

    reg.checked_in = True
    reg.checked_in_at = datetime.utcnow()
    db.commit()
    db.refresh(reg)
    return reg


@router.put("/registrations/{reg_id}/checkout", response_model=RegistrationResponse)
def checkout(
    reg_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host", "Checker")),
):
    """Mark an accepted visitor as checked out."""
    reg = _get_registration(reg_id, db)
    if reg.status != "accepted":
        raise HTTPException(status_code=400, detail="Only accepted visitors can check out")

    if current_user.role == "Host":
        event = db.query(Event).filter(Event.id == reg.event_id).first()
        if not event or event.host_id != current_user.id:
            raise HTTPException(status_code=403, detail="This visitor belongs to another host's event")

    reg.checked_out = True
    reg.checked_out_at = datetime.utcnow()
    db.commit()
    db.refresh(reg)
    return reg
