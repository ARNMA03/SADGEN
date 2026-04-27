from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    # Default to local if not provided, but allow override
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/efficio_db")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "efficio-super-secret-key-hci2-prototype-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    class Config:
        env_file = ".env"

settings = Settings()
