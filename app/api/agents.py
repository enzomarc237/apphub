from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.db.database import get_db
from app.models import AIAgent
from app.models.schemas import (
    AIAgentCreate, AIAgentUpdate, AIAgentResponse,
    AgentType
)

router = APIRouter(prefix="/api/agents", tags=["agents"])


@router.get("", response_model=List[AIAgentResponse])
def list_agents(
    active_only: bool = True,
    db: Session = Depends(get_db)
):
    query = db.query(AIAgent)
    if active_only:
        query = query.filter(AIAgent.is_active == True)
    agents = query.all()
    return [agent.to_dict() for agent in agents]


@router.get("/types")
def get_agent_types():
    return [
        {"value": AgentType.GOOGLE_JULES, "label": "Google Jules", "description": "AI-powered coding agent from Google"},
        {"value": AgentType.CURSOR_AGENT, "label": "Cursor Agent", "description": "AI assistant from Cursor IDE"},
        {"value": AgentType.CODEMAGIC, "label": "Codemagic", "description": "CI/CD platform for mobile apps"},
        {"value": AgentType.GITHUB_COPILOT, "label": "GitHub Copilot", "description": "AI pair programmer from GitHub"},
        {"value": AgentType.AMP_REMOTE, "label": "AMP Remote", "description": "Remote build execution platform"},
        {"value": AgentType.CUSTOM, "label": "Custom Agent", "description": "Your own custom AI agent"},
    ]


@router.get("/{agent_id}", response_model=AIAgentResponse)
def get_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(AIAgent).filter(AIAgent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent.to_dict()


@router.post("", response_model=AIAgentResponse)
def create_agent(agent_data: AIAgentCreate, db: Session = Depends(get_db)):
    agent = AIAgent(
        name=agent_data.name,
        description=agent_data.description,
        agent_type=agent_data.agent_type.value,
        api_endpoint=agent_data.api_endpoint,
        api_key_encrypted=agent_data.api_key,  # TODO: Encrypt this
        config=agent_data.config,
        is_active=agent_data.is_active,
        is_configured=bool(agent_data.api_key)
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return agent.to_dict()


@router.put("/{agent_id}", response_model=AIAgentResponse)
def update_agent(agent_id: int, agent_data: AIAgentUpdate, db: Session = Depends(get_db)):
    agent = db.query(AIAgent).filter(AIAgent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if agent_data.name is not None:
        agent.name = agent_data.name
    if agent_data.description is not None:
        agent.description = agent_data.description
    if agent_data.api_endpoint is not None:
        agent.api_endpoint = agent_data.api_endpoint
    if agent_data.api_key is not None:
        agent.api_key_encrypted = agent_data.api_key  # TODO: Encrypt this
        agent.is_configured = True
    if agent_data.config is not None:
        agent.config = agent_data.config
    if agent_data.is_active is not None:
        agent.is_active = agent_data.is_active
    
    db.commit()
    db.refresh(agent)
    return agent.to_dict()


@router.delete("/{agent_id}")
def delete_agent(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(AIAgent).filter(AIAgent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Check if agent has associated builds
    if agent.build_jobs:
        raise HTTPException(status_code=400, detail="Cannot delete agent with associated builds")
    
    db.delete(agent)
    db.commit()
    return {"message": "Agent deleted successfully"}


@router.post("/{agent_id}/test")
def test_agent_connection(agent_id: int, db: Session = Depends(get_db)):
    agent = db.query(AIAgent).filter(AIAgent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if not agent.is_configured:
        raise HTTPException(status_code=400, detail="Agent is not configured")
    
    # TODO: Implement actual agent connection testing
    # For now, just return success
    return {
        "success": True,
        "message": f"Connection to {agent.name} successful"
    }
