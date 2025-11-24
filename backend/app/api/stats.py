from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session

from app.api.auth import get_current_user
from app.models.entities import User
from app.schemas.stats import DailyStats, WeeklyReportResponse
from app.services.stats import daily_stats, weekly_stats
from app.utils.db import get_session


router = APIRouter()


def _parse_date(value: str) -> date:
    try:
        return datetime.strptime(value, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format")


@router.get("/daily", response_model=DailyStats)
def daily(
    date: str = Query(..., alias="date"),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    target_date = _parse_date(date)
    return daily_stats(session, current_user.id, target_date)


@router.get("/weekly", response_model=WeeklyReportResponse)
def weekly(
    start: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    start_date = _parse_date(start)
    return weekly_stats(session, current_user.id, start_date)
