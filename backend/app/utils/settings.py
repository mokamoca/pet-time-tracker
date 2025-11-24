from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    secret_key: str = "dev-key"
    database_url: str = "sqlite:///./pet_tracker.db"
    access_token_expire_minutes: int = 15
    refresh_token_expire_minutes: int = 60 * 24 * 7
    frontend_origin: str = "http://localhost:5173"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
