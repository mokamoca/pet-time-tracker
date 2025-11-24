from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError
from sqlmodel import Session, select

from app.auth.security import (
    create_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.models.entities import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserRead
from app.utils.db import get_session
from app.utils.settings import settings


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")
router = APIRouter()


def authenticate_user(session: Session, email: str, password: str) -> User | None:
    user = session.exec(select(User).where(User.email == email)).first()
    if not user or not verify_password(password, user.password_hash):
        return None
    return user


def create_tokens(user_id: int) -> TokenResponse:
    access_token = create_token(
        {"sub": str(user_id), "type": "access"},
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
    )
    refresh_token = create_token(
        {"sub": str(user_id), "type": "refresh"},
        expires_delta=timedelta(minutes=settings.refresh_token_expire_minutes),
    )
    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


async def get_current_user(
    token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)
) -> User:
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    try:
        user_id = int(payload.get("sub"))
    except (TypeError, ValueError, JWTError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )
    return user


@router.post("/signup", response_model=UserRead)
def signup(payload: SignupRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=payload.email, password_hash=get_password_hash(payload.password))
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    session: Session = Depends(get_session),
):
    user = authenticate_user(session, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return create_tokens(user.id)


@router.post("/login/json", response_model=TokenResponse)
def login_json(payload: LoginRequest, session: Session = Depends(get_session)):
    user = authenticate_user(session, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return create_tokens(user.id)


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(token: str, session: Session = Depends(get_session)):
    payload = decode_token(token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = int(payload.get("sub"))
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return create_tokens(user.id)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user
