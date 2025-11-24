from datetime import datetime, timezone, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.auth import get_current_user
from app.models.entities import Activity, Pet, User
from app.schemas.activity import ActivityCreate, ActivityRead
from app.utils.db import get_session


router = APIRouter()


@router.post("", response_model=ActivityRead)
def create_activity(
    payload: ActivityCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    # normalize to UTC to avoid naive/aware compare issues
    started_at = (
        payload.started_at
        if payload.started_at.tzinfo
        else payload.started_at.replace(tzinfo=timezone.utc)
    ).astimezone(timezone.utc)
    ended_at = (
        (payload.ended_at or payload.started_at)
        if (payload.ended_at or payload.started_at).tzinfo
        else (payload.ended_at or payload.started_at).replace(tzinfo=timezone.utc)
    ).astimezone(timezone.utc)

    now_utc = datetime.now(timezone.utc)
    # allow generous skew; if clearly in future, clamp to now
    if started_at > now_utc + timedelta(minutes=1):
        started_at = now_utc
    if ended_at > now_utc + timedelta(minutes=1):
        ended_at = now_utc
    if ended_at < started_at:
        ended_at = started_at

    if payload.pet_id:
        pet = session.get(Pet, payload.pet_id)
        if not pet or pet.user_id != current_user.id:
            raise HTTPException(status_code=404, detail="Pet not found")

    activity = Activity(
        user_id=current_user.id,
        started_at=started_at.replace(tzinfo=None),
        ended_at=ended_at.replace(tzinfo=None),
        **payload.dict(exclude={"started_at", "ended_at"}),
    )

    session.add(activity)
    session.commit()
    session.refresh(activity)
    return activity


@router.get("", response_model=list[ActivityRead])
def list_activities(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    items = session.exec(
        select(Activity).where(Activity.user_id == current_user.id).order_by(Activity.started_at.desc())
    ).all()
    return items
