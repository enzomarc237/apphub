"""
Database initialization script for AppHub.
Creates default AI agents and initial settings.
"""
from app.db.database import SessionLocal
from app.models import AIAgent, UserSettings, AgentType


def init_database():
    db = SessionLocal()
    
    try:
        # Create default agents
        default_agents = [
            {
                "name": "Google Jules",
                "description": "AI-powered coding agent from Google for automated builds",
                "agent_type": AgentType.GOOGLE_JULES.value,
                "is_active": True,
                "is_configured": False
            },
            {
                "name": "Cursor Agent",
                "description": "AI assistant from Cursor IDE",
                "agent_type": AgentType.CURSOR_AGENT.value,
                "is_active": True,
                "is_configured": False
            },
            {
                "name": "Codemagic",
                "description": "CI/CD platform for mobile apps",
                "agent_type": AgentType.CODEMAGIC.value,
                "is_active": True,
                "is_configured": False
            },
            {
                "name": "GitHub Copilot",
                "description": "AI pair programmer from GitHub",
                "agent_type": AgentType.GITHUB_COPILOT.value,
                "is_active": True,
                "is_configured": False
            },
            {
                "name": "AMP Remote",
                "description": "Remote build execution platform",
                "agent_type": AgentType.AMP_REMOTE.value,
                "is_active": True,
                "is_configured": False
            },
            {
                "name": "Custom Agent",
                "description": "Your own custom AI agent",
                "agent_type": AgentType.CUSTOM.value,
                "is_active": True,
                "is_configured": False
            }
        ]
        
        for agent_data in default_agents:
            # Check if agent already exists
            existing = db.query(AIAgent).filter(
                AIAgent.agent_type == agent_data["agent_type"]
            ).first()
            
            if not existing:
                agent = AIAgent(**agent_data)
                db.add(agent)
                print(f"Created agent: {agent_data['name']}")
            else:
                print(f"Agent already exists: {agent_data['name']}")
        
        # Create default user settings
        existing_settings = db.query(UserSettings).first()
        if not existing_settings:
            settings = UserSettings()
            db.add(settings)
            print("Created default user settings")
        else:
            print("User settings already exist")
        
        db.commit()
        print("\nDatabase initialization completed successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    init_database()
