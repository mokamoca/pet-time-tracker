from datetime import datetime
from io import BytesIO
from typing import Optional

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlmodel import Session

from app.api.auth import get_current_user
from app.models.entities import User
from app.services.report import build_weekly_report_image
from app.services.stats import weekly_stats
from app.utils.db import get_session


router = APIRouter()


@router.get("/weekly-report.png")
def weekly_report(
    start: Optional[str] = None,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if start:
        try:
            start_date = datetime.strptime(start, "%Y-%m-%d").date()
        except ValueError:
            start_date = datetime.utcnow().date()
    else:
        start_date = datetime.utcnow().date()
    report = weekly_stats(session, current_user.id, start_date)
    png_bytes = build_weekly_report_image(report)
    return StreamingResponse(BytesIO(png_bytes), media_type="image/png")
