from sqlalchemy import Column, Integer, String, Text, DateTime
from app.db.database import Base
from datetime import datetime


class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # AI Agent API Keys (encrypted)
    google_jules_api_key = Column(String, nullable=True)
    cursor_agent_api_key = Column(String, nullable=True)
    codemagic_api_key = Column(String, nullable=True)
    github_copilot_token = Column(String, nullable=True)
    amp_remote_api_key = Column(String, nullable=True)
    
    # Additional agent configurations
    custom_agents_config = Column(Text, nullable=True)  # JSON string
    
    # User preferences
    default_agent_id = Column(Integer, nullable=True)
    notification_email = Column(String, nullable=True)
    webhook_url = Column(String, nullable=True)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "google_jules_configured": bool(self.google_jules_api_key),
            "cursor_agent_configured": bool(self.cursor_agent_api_key),
            "codemagic_configured": bool(self.codemagic_api_key),
            "github_copilot_configured": bool(self.github_copilot_token),
            "amp_remote_configured": bool(self.amp_remote_api_key),
            "default_agent_id": self.default_agent_id,
            "notification_email": self.notification_email,
            "webhook_url": self.webhook_url,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
