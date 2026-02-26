from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "AppHub"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Database
    DATABASE_URL: str = "sqlite:///./apphub.db"
    
    # Storage
    UPLOAD_DIR: str = "./uploads"
    ARTIFACTS_DIR: str = "./artifacts"
    
    # Redis (for Celery and WebSocket)
    REDIS_URL: str = "redis://localhost:6379/0"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # AI Agent API Keys (to be configured by user)
    GOOGLE_JULES_API_KEY: Optional[str] = None
    CURSOR_AGENT_API_KEY: Optional[str] = None
    CODEMAGIC_API_KEY: Optional[str] = None
    GITHUB_COPILOT_TOKEN: Optional[str] = None
    AMP_REMOTE_API_KEY: Optional[str] = None
    
    class Config:
        env_file = ".env"


settings = Settings()
