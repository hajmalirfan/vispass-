from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.dependencies import require_role
from app.database.core import get_db
from app.models.user import User
from app.schemas.report import ReportsSummary
from app.services import report_service

router = APIRouter()


@router.get("/summary", response_model=ReportsSummary)
def reports_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host")),
):
    """Aggregate report for all events owned by the current host."""
    return report_service.reports_summary(db, current_user)


@router.get("/export")
def reports_export(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role("Host")),
):
    """Download a CSV report of every registration for the host's events."""
    return report_service.reports_export(db, current_user)
