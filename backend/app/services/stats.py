from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import List

from sqlmodel import Session, select

from app.models.entities import Activity, StreakSnapshot, ActivityType
from app.schemas.stats import DailyStats, WeeklyStatsItem, WeeklyReportResponse


def _date_bounds(target: date) -> tuple[datetime, datetime]:
    start = datetime.combine(target, datetime.min.time())
    end = start + timedelta(days=1)
    return start, end


def _aggregate_daily(session: Session, user_id: int, target: date) -> DailyStats:
    start, end = _date_bounds(target)
    query = select(Activity).where(
        Activity.user_id == user_id,
        Activity.started_at >= start,
        Activity.started_at < end,
    )
    records = session.exec(query).all()
    totals = defaultdict(float)
    for act in records:
        if act.type == ActivityType.WALK:
            totals["walk_min"] += act.amount
        elif act.type == ActivityType.PLAY:
            totals["play_min"] += act.amount
        elif act.type == ActivityType.TREAT:
            totals["treat_count"] += act.amount
        elif act.type == ActivityType.CARE:
            totals["care_count"] += act.amount or 1
    streak_info = _streak(session, user_id, target)
    return DailyStats(
        date=target,
        walk_min=totals["walk_min"],
        play_min=totals["play_min"],
        treat_count=totals["treat_count"],
        care_count=totals["care_count"],
        streak_info=streak_info,
    )


def _streak(session: Session, user_id: int, target: date) -> int:
    # counts consecutive days with any activity ending at target
    days = 0
    check_day = target
    while True:
        start, end = _date_bounds(check_day)
        has_activity = session.exec(
            select(Activity.id).where(
                Activity.user_id == user_id,
                Activity.started_at >= start,
                Activity.started_at < end,
            ).limit(1)
        ).first()
        if not has_activity:
            break
        days += 1
        check_day = check_day - timedelta(days=1)
    # persist streak snapshot for lightweight history (optional)
    snapshot = session.exec(
        select(StreakSnapshot).where(
            StreakSnapshot.user_id == user_id, StreakSnapshot.date == target
        )
    ).first()
    if not snapshot:
        snapshot = StreakSnapshot(
            user_id=user_id,
            date=target,
            total_minutes=0,
            total_treats=0,
            met_goal=days >= 3,
        )
        session.add(snapshot)
        session.commit()
    return days


def daily_stats(session: Session, user_id: int, target: date) -> DailyStats:
    return _aggregate_daily(session, user_id, target)


def weekly_stats(session: Session, user_id: int, start: date) -> WeeklyReportResponse:
    days: List[WeeklyStatsItem] = []
    for i in range(7):
        day_date = start + timedelta(days=i)
        day_stats = _aggregate_daily(session, user_id, day_date)
        days.append(WeeklyStatsItem(**day_stats.dict()))

    last_week_start = start - timedelta(days=7)
    last_week_totals = defaultdict(float)
    for i in range(7):
        prev_day = last_week_start + timedelta(days=i)
        prev = _aggregate_daily(session, user_id, prev_day)
        last_week_totals["walk_min"] += prev.walk_min + prev.play_min

    current_total = sum(d.walk_min + d.play_min for d in days)
    change = None
    if last_week_totals["walk_min"] > 0:
        change = (current_total - last_week_totals["walk_min"]) / last_week_totals[
            "walk_min"
        ]

    for d in days:
        d.change_vs_last_week = change

    return WeeklyReportResponse(start=start, end=start + timedelta(days=6), days=days)
