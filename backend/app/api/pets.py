from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.api.auth import get_current_user
from app.models.entities import Pet, User
from app.schemas.pet import PetCreate, PetRead
from app.utils.db import get_session


router = APIRouter()


@router.post("", response_model=PetRead)
def create_pet(
    payload: PetCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    pet = Pet(user_id=current_user.id, **payload.dict())
    session.add(pet)
    session.commit()
    session.refresh(pet)
    return pet


@router.get("", response_model=list[PetRead])
def list_pets(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    pets = session.exec(select(Pet).where(Pet.user_id == current_user.id)).all()
    return pets
