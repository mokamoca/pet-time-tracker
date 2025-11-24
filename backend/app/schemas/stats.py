from datetime import date
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class DailyStats(BaseModel):
    date: date
    walk_min: float = 0
    play_min: float = 0
    treat_count: float = 0
    care_count: float = 0
    streak_info: Optional[int] = None


class WeeklyStatsItem(DailyStats):
    change_vs_last_week: Optional[float] = None


class WeeklyReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    start: date
    end: date
    days: List[WeeklyStatsItem]
