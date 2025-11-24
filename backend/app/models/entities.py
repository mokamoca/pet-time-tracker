from datetime import datetime, date
from enum import Enum
from typing import Optional

from sqlmodel import SQLModel, Field, Relationship


class ActivityType(str, Enum):
    WALK = "walk"
    PLAY = "play"
    TREAT = "treat"
    CARE = "care"
    NOTE = "note"


class ActivityUnit(str, Enum):
    MIN = "min"
    COUNT = "count"
    NONE = "none"


class ActivitySource(str, Enum):
    MANUAL = "manual"
    QUICK = "quick"
    CHAT = "chat"
    AUTO_GPS = "auto_gps"
    AUTO_PHOTO = "auto_photo"


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    pets: list["Pet"] = Relationship(back_populates="owner")
    activities: list["Activity"] = Relationship(back_populates="user")
    streaks: list["StreakSnapshot"] = Relationship(back_populates="user")


class Pet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    name: str
    species: Optional[str] = None
    weight: Optional[float] = None
    birthdate: Optional[date] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    owner: Optional[User] = Relationship(back_populates="pets")
    activities: list["Activity"] = Relationship(back_populates="pet")


class Activity(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    pet_id: Optional[int] = Field(default=None, foreign_key="pet.id", index=True)
    type: ActivityType
    amount: float = 0
    unit: ActivityUnit = ActivityUnit.NONE
    started_at: datetime
    ended_at: Optional[datetime] = None
    note: Optional[str] = None
    source: ActivitySource = ActivitySource.MANUAL
    created_at: datetime = Field(default_factory=datetime.utcnow)

    user: Optional[User] = Relationship(back_populates="activities")
    pet: Optional[Pet] = Relationship(back_populates="activities")


class StreakSnapshot(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    date: date
    total_minutes: int = 0
    total_treats: int = 0
    met_goal: bool = False

    user: Optional[User] = Relationship(back_populates="streaks")
