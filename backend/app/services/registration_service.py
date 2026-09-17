import os
import secrets
import shutil
import uuid
from datetime import datetime
from io import BytesIO
from typing import Optional

import qrcode
from fastapi import HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from app.core.config import ALLOWED_IMAGE_EXTENSIONS, UPLOAD_DIR
from app.models.event import Event
from app.models.gate_pass import GatePass
from app.models.registration import EventRegistration
from app.models.user import User
from app.schemas.registration import RegistrationWithEvent


def _host_event_ids(user: User, db: Session) -> list[int]:
    return [e.id for e in db.query(Event).filter(Event.host_id == user.id).all()]


def _get_registration(db: Session, reg_id: int) -> EventRegistration:
    reg = (
        db.query(EventRegistration)
        .options(joinedload(EventRegistration.gate_pass))
        .filter(EventRegistration.id == reg_id)
        .first()
    )
    if not reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    _attach_pass(reg)
    return reg


def _attach_pass(reg: EventRegistration) -> EventRegistration:
    """Expose gate-pass columns as flat attrs so the API shape is unchanged.

    Frontend expects reg.qr_code / reg.checked_in / ... directly on the
    registration object. Those now live in gate_passes (Table 5/5).
    """
    gp = reg.gate_pass
    reg.qr_code = gp.qr_code if gp else None  # type: ignore[attr-defined]
    reg.checked_in = bool(gp.checked_in) if gp else False  # type: ignore[attr-defined]
    reg.checked_in_at = gp.checked_in_at if gp else None  # type: ignore[attr-defined]
    reg.checked_out = bool(gp.checked_out) if gp else False  # type: ignore[attr-defined]
    reg.checked_out_at = gp.checked_out_at if gp else None  # type: ignore[attr-defined]
    return reg


def _with_event(db: Session, reg: EventRegistration) -> RegistrationWithEvent:
    event = db.query(Event).filter(Event.id == reg.event_id).first()
    _attach_pass(reg)
    item = RegistrationWithEvent.model_validate(reg)
    item.event = event
    return item


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


def register_for_event(
    db: Session,
    current_user: User,
    event_id: int,
    visitor_name: str,
    visitor_email: str = "",
    phone: str = "",
    organization: str = "",
    purpose: str = "",
    id_proof: Optional[UploadFile] = None,
) -> EventRegistration:
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
    return _attach_pass(reg)


def list_registrations(
    db: Session,
    current_user: User,
    status_filter: Optional[str] = None,
    event_id: Optional[int] = None,
) -> list[RegistrationWithEvent]:
    """List registrations.
    - Hosts see registrations for their own events (filter with ?status=pending|accepted|rejected).
    - Visitors see their own registrations.
    """
    query = db.query(EventRegistration).options(joinedload(EventRegistration.gate_pass))
    if current_user.role == "Host":
        event_ids = _host_event_ids(current_user, db)
        query = query.filter(EventRegistration.event_id.in_(event_ids))
    elif current_user.role == "Visitor":
        query = query.filter(
            (EventRegistration.visitor_email == current_user.email)
            | (EventRegistration.visitor_id == current_user.id)
        )

    if status_filter:
        query = query.filter(EventRegistration.status == status_filter)
    if event_id is not None:
        query = query.filter(EventRegistration.event_id == event_id)

    regs = query.order_by(EventRegistration.created_at.desc()).all()
    return [_with_event(db, reg) for reg in regs]


def decide_registration(
    db: Session,
    current_user: User,
    reg_id: int,
    decision: str,
) -> EventRegistration:
    """Accept or reject a visitor request. Query param: ?decision=accept|reject."""
    reg = _get_registration(db, reg_id)
    event = db.query(Event).filter(Event.id == reg.event_id).first()
    if not event or event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only review requests for your own events")

    if decision not in ("accept", "reject"):
        raise HTTPException(status_code=400, detail="Decision must be 'accept' or 'reject'")
    if reg.status != "pending":
        raise HTTPException(status_code=400, detail="This request has already been reviewed")

    if decision == "accept":
        reg.status = "accepted"
        # Table 5/5: issue exactly one gate pass per accepted registration.
        if not reg.gate_pass:
            gp = GatePass(
                registration_id=reg.id,
                qr_code=f"VGP-{secrets.token_urlsafe(16)}",
            )
            db.add(gp)
            db.flush()
            reg.gate_pass = gp
    else:
        reg.status = "rejected"

    reg.decided_at = datetime.utcnow()
    db.commit()
    db.refresh(reg)
    return _attach_pass(reg)


def get_registration_qr(db: Session, current_user: User, reg_id: int) -> StreamingResponse:
    """Return the QR pass image (PNG) for an accepted registration."""
    reg = _get_registration(db, reg_id)
    gp = reg.gate_pass
    if reg.status != "accepted" or not gp:
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

    verify_url = f"http://127.0.0.1:8000/api/registrations/verify/{gp.qr_code}"
    png = _build_qr_png(verify_url)
    return StreamingResponse(
        BytesIO(png),
        media_type="image/png",
        headers={"Content-Disposition": f'inline; filename="gatepass-{reg.id}.png"'},
    )


def verify_pass(db: Session, qr_code: str) -> RegistrationWithEvent:
    """Public verification of a gate pass QR code (used by gate checkers)."""
    gp = db.query(GatePass).filter(GatePass.qr_code == qr_code).first()
    if not gp:
        raise HTTPException(status_code=404, detail="Invalid or unknown gate pass")
    reg = (
        db.query(EventRegistration)
        .options(joinedload(EventRegistration.gate_pass))
        .filter(EventRegistration.id == gp.registration_id)
        .first()
    )
    if not reg:
        raise HTTPException(status_code=404, detail="Invalid or unknown gate pass")
    if reg.status != "accepted":
        raise HTTPException(status_code=400, detail="This gate pass has not been approved")

    return _with_event(db, reg)


def checkin(db: Session, current_user: User, reg_id: int) -> EventRegistration:
    """Mark an accepted visitor as checked in (updates gate_passes row)."""
    reg = _get_registration(db, reg_id)
    if reg.status != "accepted" or not reg.gate_pass:
        raise HTTPException(status_code=400, detail="Only accepted visitors can check in")

    if current_user.role == "Host":
        event = db.query(Event).filter(Event.id == reg.event_id).first()
        if not event or event.host_id != current_user.id:
            raise HTTPException(status_code=403, detail="This visitor belongs to another host's event")

    reg.gate_pass.checked_in = True
    reg.gate_pass.checked_in_at = datetime.utcnow()
    db.commit()
    db.refresh(reg)
    return _attach_pass(reg)


def checkout(db: Session, current_user: User, reg_id: int) -> EventRegistration:
    """Mark an accepted visitor as checked out (updates gate_passes row)."""
    reg = _get_registration(db, reg_id)
    if reg.status != "accepted" or not reg.gate_pass:
        raise HTTPException(status_code=400, detail="Only accepted visitors can check out")

    if current_user.role == "Host":
        event = db.query(Event).filter(Event.id == reg.event_id).first()
        if not event or event.host_id != current_user.id:
            raise HTTPException(status_code=403, detail="This visitor belongs to another host's event")

    reg.gate_pass.checked_out = True
    reg.gate_pass.checked_out_at = datetime.utcnow()
    db.commit()
    db.refresh(reg)
    return _attach_pass(reg)
