from __future__ import annotations

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Iron Vipers API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    DATABASE_URL: str = "postgresql+psycopg://ironvipers:ironvipers_password@localhost:5432/iron_vipers_db"
    JWT_SECRET_KEY: str = "change_me_in_production_use_a_long_random_string"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    SUPABASE_BUCKET: str = "motorcycle-photos"
    CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
