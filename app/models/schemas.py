from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class BuildStatus(str, Enum):
    PENDING = "pending"
    QUEUED = "queued"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AgentType(str, Enum):
    GOOGLE_JULES = "google_jules"
    CURSOR_AGENT = "cursor_agent"
    CODEMAGIC = "codemagic"
    GITHUB_COPILOT = "github_copilot"
    AMP_REMOTE = "amp_remote"
    CUSTOM = "custom"


# Build Schemas
class BuildJobBase(BaseModel):
    title: str
    description: Optional[str] = None
    source_type: str = Field(..., description="github, gitlab, or upload")
    repository_url: Optional[str] = None
    branch: str = "main"
    agent_id: int
    build_command: Optional[str] = None
    environment_vars: Optional[str] = None


class BuildJobCreate(BuildJobBase):
    pass


class BuildJobResponse(BuildJobBase):
    id: int
    status: BuildStatus
    status_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    agent_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class BuildJobList(BaseModel):
    items: List[BuildJobResponse]
    total: int


# Agent Schemas
class AIAgentBase(BaseModel):
    name: str
    description: Optional[str] = None
    agent_type: AgentType
    api_endpoint: Optional[str] = None
    is_active: bool = True


class AIAgentCreate(AIAgentBase):
    api_key: Optional[str] = None
    config: Optional[str] = None


class AIAgentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    api_endpoint: Optional[str] = None
    api_key: Optional[str] = None
    config: Optional[str] = None
    is_active: Optional[bool] = None


class AIAgentResponse(AIAgentBase):
    id: int
    is_configured: bool
    
    class Config:
        from_attributes = True


# Artifact Schemas
class ArtifactResponse(BaseModel):
    id: int
    build_job_id: int
    name: str
    filename: str
    file_size: int
    file_type: Optional[str] = None
    platform: Optional[str] = None
    architecture: Optional[str] = None
    version: Optional[str] = None
    created_at: datetime
    download_count: int
    
    class Config:
        from_attributes = True


# Settings Schemas
class SettingsBase(BaseModel):
    google_jules_api_key: Optional[str] = None
    cursor_agent_api_key: Optional[str] = None
    codemagic_api_key: Optional[str] = None
    github_copilot_token: Optional[str] = None
    amp_remote_api_key: Optional[str] = None
    default_agent_id: Optional[int] = None
    notification_email: Optional[str] = None
    webhook_url: Optional[str] = None


class SettingsUpdate(SettingsBase):
    pass


class SettingsResponse(BaseModel):
    id: int
    google_jules_configured: bool
    cursor_agent_configured: bool
    codemagic_configured: bool
    github_copilot_configured: bool
    amp_remote_configured: bool
    default_agent_id: Optional[int] = None
    notification_email: Optional[str] = None
    webhook_url: Optional[str] = None
    updated_at: datetime
    
    class Config:
        from_attributes = True


# Build Log Schema
class BuildLogResponse(BaseModel):
    build_id: int
    logs: List[str]
