"""Reset the database with clean demo data and known demo logins.

5-table Postgres layout:
  1. users
  2. events
  3. visitor_profiles
  4. event_registrations
  5. gate_passes (QR + entry log)

Usage:
    cd backend
    python seed.py
"""
import secrets
from datetime import date, datetime

from app.core.security import get_password_hash
from app.database.core import Base, SessionLocal, engine
from app.models.event import Event  # noqa: F401
from app.models.gate_pass import GatePass  # noqa: F401
from app.models.profile import VisitorProfile  # noqa: F401
from app.models.registration import EventRegistration  # noqa: F401
from app.models.user import User  # noqa: F401

DEMO_PASSWORD = "password123"

HOST_EMAIL = "host@vispass.com"
VISITOR_EMAIL = "visitor@vispass.com"
CHECKER_EMAIL = "checker@vispass.com"


def seed() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        host = User(email=HOST_EMAIL, role="Host", hashed_password=get_password_hash(DEMO_PASSWORD))
        visitor = User(email=VISITOR_EMAIL, role="Visitor", hashed_password=get_password_hash(DEMO_PASSWORD))
        checker = User(email=CHECKER_EMAIL, role="Checker", hashed_password=get_password_hash(DEMO_PASSWORD))
        db.add_all([host, visitor, checker])
        db.flush()

        db.add(
            VisitorProfile(
                user_id=visitor.id,
                full_name="Demo Visitor",
                phone="9876543210",
                organization="Acme Corporation",
            )
        )

        db.add_all(
            [
                Event(
                    host_id=host.id,
                    title="Tech Conference 2026",
                    description="Annual technology conference with keynotes and workshops.",
                    event_date=date(2026, 9, 15),
                    location="Hall A, Main Campus",
                    capacity=150,
                ),
                Event(
                    host_id=host.id,
                    title="Annual General Meeting",
                    description="Yearly meeting for all members.",
                    event_date=date(2026, 10, 20),
                    location="Board Room",
                    capacity=60,
                ),
            ]
        )
        db.flush()

        events = db.query(Event).order_by(Event.id).all()
        first_event = events[0]
        second_event = events[1]

        accepted = EventRegistration(
            event_id=first_event.id,
            visitor_id=visitor.id,
            visitor_name="Demo Visitor",
            visitor_email=VISITOR_EMAIL,
            phone="9876543210",
            organization="Acme Corporation",
            purpose="Attend keynote sessions",
            status="accepted",
            created_at=datetime.utcnow(),
            decided_at=datetime.utcnow(),
        )

        pending = EventRegistration(
            event_id=second_event.id,
            visitor_id=visitor.id,
            visitor_name="Demo Visitor",
            visitor_email=VISITOR_EMAIL,
            phone="9876543210",
            organization="Acme Corporation",
            purpose="Member representation",
            status="pending",
            created_at=datetime.utcnow(),
        )

        db.add_all([accepted, pending])
        db.flush()

        # Table 5/5: exactly one gate pass for the accepted registration.
        db.add(
            GatePass(
                registration_id=accepted.id,
                qr_code=f"VGP-{secrets.token_urlsafe(16)}",
                checked_in=False,
                checked_out=False,
            )
        )
        db.commit()
    finally:
        db.close()

    print("Database reset complete (5 tables).")
    print(f"Host:    {HOST_EMAIL} / {DEMO_PASSWORD}")
    print(f"Visitor: {VISITOR_EMAIL} / {DEMO_PASSWORD}")
    print(f"Checker: {CHECKER_EMAIL} / {DEMO_PASSWORD}")


if __name__ == "__main__":
    seed()
