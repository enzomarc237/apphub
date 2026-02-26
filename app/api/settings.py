from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models import UserSettings
from app.models.schemas import SettingsUpdate, SettingsResponse

router = APIRouter(prefix="/api/settings", tags=["settings"])


def get_or_create_settings(db: Session) -> UserSettings:
    settings = db.query(UserSettings).first()
    if not settings:
        settings = UserSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=SettingsResponse)
def get_settings(db: Session = Depends(get_db)):
    settings = get_or_create_settings(db)
    return settings.to_dict()


@router.put("", response_model=SettingsResponse)
def update_settings(settings_data: SettingsUpdate, db: Session = Depends(get_db)):
    settings = get_or_create_settings(db)
    
    if settings_data.google_jules_api_key is not None:
        settings.google_jules_api_key = settings_data.google_jules_api_key
    if settings_data.cursor_agent_api_key is not None:
        settings.cursor_agent_api_key = settings_data.cursor_agent_api_key
    if settings_data.codemagic_api_key is not None:
        settings.codemagic_api_key = settings_data.codemagic_api_key
    if settings_data.github_copilot_token is not None:
        settings.github_copilot_token = settings_data.github_copilot_token
    if settings_data.amp_remote_api_key is not None:
        settings.amp_remote_api_key = settings_data.amp_remote_api_key
    if settings_data.default_agent_id is not None:
        settings.default_agent_id = settings_data.default_agent_id
    if settings_data.notification_email is not None:
        settings.notification_email = settings_data.notification_email
    if settings_data.webhook_url is not None:
        settings.webhook_url = settings_data.webhook_url
    
    db.commit()
    db.refresh(settings)
    return settings.to_dict()


@router.get("/agents")
def get_agent_configurations(db: Session = Depends(get_db)):
    settings = get_or_create_settings(db)
    return {
        "agents": [
            {
                "type": "google_jules",
                "name": "Google Jules",
                "configured": bool(settings.google_jules_api_key),
                "description": "AI-powered coding agent from Google"
            },
            {
                "type": "cursor_agent",
                "name": "Cursor Agent",
                "configured": bool(settings.cursor_agent_api_key),
                "description": "AI assistant from Cursor IDE"
            },
            {
                "type": "codemagic",
                "name": "Codemagic",
                "configured": bool(settings.codemagic_api_key),
                "description": "CI/CD platform for mobile apps"
            },
            {
                "type": "github_copilot",
                "name": "GitHub Copilot",
                "configured": bool(settings.github_copilot_token),
                "description": "AI pair programmer from GitHub"
            },
            {
                "type": "amp_remote",
                "name": "AMP Remote",
                "configured": bool(settings.amp_remote_api_key),
                "description": "Remote build execution platform"
            }
        ]
    }
