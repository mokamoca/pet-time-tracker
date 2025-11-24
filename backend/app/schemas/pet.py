from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class PetCreate(BaseModel):
    name: str
    species: Optional[str] = None
    weight: Optional[float] = None
    birthdate: Optional[date] = None


class PetRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str
    species: Optional[str]
    weight: Optional[float]
    birthdate: Optional[date]
    created_at: datetime
