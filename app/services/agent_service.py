"""
Service for managing AI agent integrations.
Supports Google Jules, Cursor Agent, Codemagic, GitHub Copilot, and AMP Remote.
"""
from typing import Optional, Dict, Any
import httpx
from app.core.config import settings
from app.models.agent import AIAgent, AgentType


class AgentService:
    """Service for interacting with various AI agents."""
    
    def __init__(self, agent: AIAgent):
        self.agent = agent
        self.api_key = agent.api_key_encrypted
    
    async def trigger_build(
        self,
        repository_url: Optional[str],
        branch: str,
        build_command: Optional[str],
        environment_vars: Optional[Dict[str, str]]
    ) -> Dict[str, Any]:
        """Trigger a build on the agent platform."""
        
        if self.agent.agent_type == AgentType.GOOGLE_JULES.value:
            return await self._trigger_google_jules(repository_url, branch, build_command)
        elif self.agent.agent_type == AgentType.CURSOR_AGENT.value:
            return await self._trigger_cursor_agent(repository_url, branch, build_command)
        elif self.agent.agent_type == AgentType.CODEMAGIC.value:
            return await self._trigger_codemagic(repository_url, branch, build_command)
        elif self.agent.agent_type == AgentType.GITHUB_COPILOT.value:
            return await self._trigger_github_copilot(repository_url, branch, build_command)
        elif self.agent.agent_type == AgentType.AMP_REMOTE.value:
            return await self._trigger_amp_remote(repository_url, branch, build_command)
        else:
            raise ValueError(f"Unsupported agent type: {self.agent.agent_type}")
    
    async def _trigger_google_jules(
        self,
        repository_url: Optional[str],
        branch: str,
        build_command: Optional[str]
    ) -> Dict[str, Any]:
        """Trigger build using Google Jules API."""
        # Google Jules API integration
        # https://jules.google.com
        
        if not self.api_key:
            raise ValueError("Google Jules API key not configured")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.jules.google.com/v1/builds",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "repository_url": repository_url,
                    "branch": branch,
                    "build_command": build_command or "./build.sh",
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def _trigger_cursor_agent(
        self,
        repository_url: Optional[str],
        branch: str,
        build_command: Optional[str]
    ) -> Dict[str, Any]:
        """Trigger build using Cursor Agent API."""
        # Cursor Agent API integration
        
        if not self.api_key:
            raise ValueError("Cursor Agent API key not configured")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.cursor.sh/v1/builds",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "repository_url": repository_url,
                    "branch": branch,
                    "build_command": build_command,
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def _trigger_codemagic(
        self,
        repository_url: Optional[str],
        branch: str,
        build_command: Optional[str]
    ) -> Dict[str, Any]:
        """Trigger build using Codemagic API."""
        # Codemagic API integration
        # https://docs.codemagic.io/rest-api/
        
        if not self.api_key:
            raise ValueError("Codemagic API key not configured")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.codemagic.io/builds",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "repository_url": repository_url,
                    "branch": branch,
                    "workflow": build_command or "default",
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def _trigger_github_copilot(
        self,
        repository_url: Optional[str],
        branch: str,
        build_command: Optional[str]
    ) -> Dict[str, Any]:
        """Trigger build using GitHub Copilot API."""
        # GitHub Copilot API integration
        
        if not self.api_key:
            raise ValueError("GitHub Copilot token not configured")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.github.com/copilot/builds",
                headers={
                    "Authorization": f"token {self.api_key}",
                    "Content-Type": "application/json",
                    "Accept": "application/vnd.github.v3+json"
                },
                json={
                    "repository_url": repository_url,
                    "branch": branch,
                    "build_command": build_command,
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def _trigger_amp_remote(
        self,
        repository_url: Optional[str],
        branch: str,
        build_command: Optional[str]
    ) -> Dict[str, Any]:
        """Trigger build using AMP Remote API."""
        # AMP Remote API integration
        
        if not self.api_key:
            raise ValueError("AMP Remote API key not configured")
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.amp.remote/v1/builds",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "repository_url": repository_url,
                    "branch": branch,
                    "build_command": build_command,
                },
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def get_build_status(self, external_build_id: str) -> Dict[str, Any]:
        """Get the status of a build from the agent platform."""
        
        if not self.api_key:
            raise ValueError("API key not configured")
        
        # Determine the status endpoint based on agent type
        status_urls = {
            AgentType.GOOGLE_JULES.value: f"https://api.jules.google.com/v1/builds/{external_build_id}",
            AgentType.CURSOR_AGENT.value: f"https://api.cursor.sh/v1/builds/{external_build_id}",
            AgentType.CODEMAGIC.value: f"https://api.codemagic.io/builds/{external_build_id}",
            AgentType.GITHUB_COPILOT.value: f"https://api.github.com/copilot/builds/{external_build_id}",
            AgentType.AMP_REMOTE.value: f"https://api.amp.remote/v1/builds/{external_build_id}",
        }
        
        url = status_urls.get(self.agent.agent_type)
        if not url:
            raise ValueError(f"Unsupported agent type: {self.agent.agent_type}")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=30.0
            )
            response.raise_for_status()
            return response.json()
    
    async def get_build_logs(self, external_build_id: str) -> str:
        """Get the logs of a build from the agent platform."""
        
        if not self.api_key:
            raise ValueError("API key not configured")
        
        # Determine the logs endpoint based on agent type
        logs_urls = {
            AgentType.GOOGLE_JULES.value: f"https://api.jules.google.com/v1/builds/{external_build_id}/logs",
            AgentType.CURSOR_AGENT.value: f"https://api.cursor.sh/v1/builds/{external_build_id}/logs",
            AgentType.CODEMAGIC.value: f"https://api.codemagic.io/builds/{external_build_id}/logs",
            AgentType.GITHUB_COPILOT.value: f"https://api.github.com/copilot/builds/{external_build_id}/logs",
            AgentType.AMP_REMOTE.value: f"https://api.amp.remote/v1/builds/{external_build_id}/logs",
        }
        
        url = logs_urls.get(self.agent.agent_type)
        if not url:
            raise ValueError(f"Unsupported agent type: {self.agent.agent_type}")
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                timeout=30.0
            )
            response.raise_for_status()
            return response.text


def get_agent_service(agent: AIAgent) -> AgentService:
    """Factory function to create an AgentService instance."""
    return AgentService(agent)
