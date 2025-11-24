from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, validator, ConfigDict
from app.models.entities import ActivityType, ActivityUnit, ActivitySource


class ActivityCreate(BaseModel):
    pet_id: Optional[int] = None
    type: ActivityType
    amount: float = Field(ge=0)
    unit: ActivityUnit = ActivityUnit.NONE
    started_at: datetime
    ended_at: Optional[datetime] = None
    note: Optional[str] = None
    source: ActivitySource = ActivitySource.MANUAL

    @validator("unit")
    def validate_unit(cls, v, values):
        activity_type = values.get("type")
        if activity_type in {ActivityType.WALK, ActivityType.PLAY} and v != ActivityUnit.MIN:
            raise ValueError("walk/play must use 'min'")
        if activity_type == ActivityType.TREAT and v != ActivityUnit.COUNT:
            raise ValueError("treat must use 'count'")
        if activity_type in {ActivityType.CARE, ActivityType.NOTE} and v not in {
            ActivityUnit.NONE,
            ActivityUnit.COUNT,
        }:
            raise ValueError("care/note must use 'none' or 'count'")
        return v


class ActivityRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    pet_id: Optional[int]
    type: ActivityType
    amount: float
    unit: ActivityUnit
    started_at: datetime
    ended_at: Optional[datetime]
    note: Optional[str]
    source: ActivitySource
    created_at: datetime
