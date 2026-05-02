from pydantic_settings import BaseSettings
from pydantic import field_validator
import os

class Settings(BaseSettings):
    # This field will capture the environment variable 'DATABASE_URL'
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/sadgen_db"

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def wrap_pg8000(cls, v: str) -> str:
        # Automatically use pg8000 driver for compatibility (especially on Python 3.14+)
        if v.startswith("postgresql://"):
            return v.replace("postgresql://", "postgresql+pg8000://", 1)
        if v.startswith("postgres://"):
            return v.replace("postgres://", "postgresql+pg8000://", 1)
        return v

    SECRET_KEY: str = os.getenv("SECRET_KEY", "sadgen-super-secret-key-hci2-prototype-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    class Config:
        env_file = ".env"

settings = Settings()
