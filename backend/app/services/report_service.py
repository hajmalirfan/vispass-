import csv
from io import StringIO

from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.models.event import Event
from app.models.registration import EventRegistration
from app.models.user import User
from app.schemas.report import EventReport, ReportsSummary


def reports_summary(db: Session, current_user: User) -> ReportsSummary:
    """Aggregate report for all events owned by the current host."""
    event_ids = [e.id for e in db.query(Event).filter(Event.host_id == current_user.id).all()]
    events = db.query(Event).filter(Event.id.in_(event_ids)).order_by(Event.event_date.desc()).all() if event_ids else []

    totals = {"total": 0, "pending": 0, "accepted": 0, "rejected": 0, "checked_in": 0}
    per_event: list[EventReport] = []

    for event in events:
        regs = db.query(EventRegistration).filter(EventRegistration.event_id == event.id).all()
        counts = {"total": 0, "pending": 0, "accepted": 0, "rejected": 0, "checked_in": 0}
        for reg in regs:
            counts["total"] += 1
            if reg.status == "pending":
                counts["pending"] += 1
            elif reg.status == "accepted":
                counts["accepted"] += 1
                if reg.checked_in:
                    counts["checked_in"] += 1
            elif reg.status == "rejected":
                counts["rejected"] += 1

        for key in totals:
            totals[key] += counts[key]

        per_event.append(
            EventReport(
                event_id=event.id,
                title=event.title,
                total=counts["total"],
                pending=counts["pending"],
                accepted=counts["accepted"],
                rejected=counts["rejected"],
                checked_in=counts["checked_in"],
            )
        )

    return ReportsSummary(
        total_events=len(events),
        total_registrations=totals["total"],
        pending=totals["pending"],
        accepted=totals["accepted"],
        rejected=totals["rejected"],
        checked_in=totals["checked_in"],
        per_event=per_event,
    )


def reports_export(db: Session, current_user: User) -> StreamingResponse:
    """Download a CSV report of every registration for the host's events."""
    event_ids = [e.id for e in db.query(Event).filter(Event.host_id == current_user.id).all()]
    regs = (
        db.query(EventRegistration).filter(EventRegistration.event_id.in_(event_ids)).order_by(EventRegistration.created_at.desc()).all()
        if event_ids
        else []
    )

    event_titles = {e.id: e.title for e in db.query(Event).filter(Event.id.in_(event_ids)).all()}

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(
        [
            "Registration ID",
            "Event",
            "Visitor Name",
            "Email",
            "Phone",
            "Organization",
            "Purpose",
            "Status",
            "Checked In",
            "Checked Out",
            "Registered At",
        ]
    )
    for reg in regs:
        writer.writerow(
            [
                reg.id,
                event_titles.get(reg.event_id, ""),
                reg.visitor_name,
                reg.visitor_email,
                reg.phone,
                reg.organization,
                reg.purpose,
                reg.status,
                "Yes" if reg.checked_in else "No",
                "Yes" if reg.checked_out else "No",
                reg.created_at,
            ]
        )

    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=visitor-report.csv"},
    )
