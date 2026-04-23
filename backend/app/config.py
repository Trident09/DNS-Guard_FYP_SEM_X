from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://dnsabuse:changeme@postgres:5432/dnsabuse_db"
    REDIS_URL: str = "redis://redis:6379/0"
    QDRANT_URL: str = "http://qdrant:6333"
    AI_SERVICE_URL: str = "http://ai:8001"
    SECRET_KEY: str = "changeme"
    ENVIRONMENT: str = "development"

    class Config:
        env_file = ".env"


settings = Settings()
