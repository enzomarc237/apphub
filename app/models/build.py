from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime
import enum


class BuildStatus(str, enum.Enum):
    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class BuildJob(Base):
    __tablename__ = "build_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    
    # Source code
    source_type = Column(String, nullable=False)  # github, gitlab, upload
    repository_url = Column(String, nullable=True)
    branch = Column(String, default="main")
    upload_path = Column(String, nullable=True)
    
    # Build configuration
    agent_id = Column(Integer, ForeignKey("ai_agents.id"), nullable=False)
    build_command = Column(String, nullable=True)
    environment_vars = Column(Text, nullable=True)  # JSON string
    
    # Status and tracking
    status = Column(SQLEnum(BuildStatus), default=BuildStatus.PENDING)
    status_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    agent = relationship("AIAgent", back_populates="build_jobs")
    artifacts = relationship("Artifact", back_populates="build_job", cascade="all, delete-orphan")
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "source_type": self.source_type,
            "repository_url": self.repository_url,
            "branch": self.branch,
            "agent_id": self.agent_id,
            "agent_name": self.agent.name if self.agent else None,
            "status": self.status.value,
            "status_message": self.status_message,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
