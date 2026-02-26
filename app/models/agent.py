from sqlalchemy import Column, Integer, String, Text, Boolean
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


class AgentType(str, enum.Enum):
    GOOGLE_JULES = "google_jules"
    CURSOR_AGENT = "cursor_agent"
    CODEMAGIC = "codemagic"
    GITHUB_COPILOT = "github_copilot"
    AMP_REMOTE = "amp_remote"
    CUSTOM = "custom"


class AIAgent(Base):
    __tablename__ = "ai_agents"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    agent_type = Column(String, nullable=False)  # AgentType value
    
    # Configuration
    api_endpoint = Column(String, nullable=True)
    api_key_encrypted = Column(String, nullable=True)
    config = Column(Text, nullable=True)  # JSON string for additional config
    
    # Status
    is_active = Column(Boolean, default=True)
    is_configured = Column(Boolean, default=False)
    
    # Relationships
    build_jobs = relationship("BuildJob", back_populates="agent")
    
    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "agent_type": self.agent_type,
            "api_endpoint": self.api_endpoint,
            "is_active": self.is_active,
            "is_configured": self.is_configured,
        }
