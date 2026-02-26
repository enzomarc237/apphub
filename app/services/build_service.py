"""
Service for managing build execution and orchestration.
"""
import os
import json
import asyncio
from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session

from app.models import BuildJob, BuildStatus, Artifact
from app.services.agent_service import get_agent_service
from app.core.config import settings


class BuildService:
    """Service for managing build execution."""
    
    def __init__(self, db: Session):
        self.db = db
        self.build_logs: Dict[int, list] = {}
    
    async def execute_build(self, build_id: int) -> None:
        """Execute a build job."""
        build = self.db.query(BuildJob).filter(BuildJob.id == build_id).first()
        if not build:
            raise ValueError(f"Build {build_id} not found")
        
        # Initialize logs
        self.build_logs[build_id] = []
        
        try:
            # Update status to running
            build.status = BuildStatus.RUNNING
            build.started_at = datetime.utcnow()
            build.status_message = "Starting build process..."
            self.db.commit()
            
            self._log(build_id, f"Build started at {build.started_at}")
            self._log(build_id, f"Source: {build.source_type}")
            if build.repository_url:
                self._log(build_id, f"Repository: {build.repository_url}")
                self._log(build_id, f"Branch: {build.branch}")
            if build.upload_path:
                self._log(build_id, f"Upload: {build.upload_path}")
            
            # Get agent service
            agent = build.agent
            if not agent:
                raise ValueError("No agent assigned to build")
            
            if not agent.is_configured:
                raise ValueError(f"Agent {agent.name} is not configured")
            
            self._log(build_id, f"Using agent: {agent.name} ({agent.agent_type})")
            
            agent_service = get_agent_service(agent)
            
            # Parse environment variables
            env_vars = {}
            if build.environment_vars:
                try:
                    env_vars = json.loads(build.environment_vars)
                except json.JSONDecodeError:
                    self._log(build_id, "Warning: Could not parse environment variables")
            
            # Trigger build on agent platform
            self._log(build_id, "Triggering remote build...")
            
            result = await agent_service.trigger_build(
                repository_url=build.repository_url,
                branch=build.branch,
                build_command=build.build_command,
                environment_vars=env_vars
            )
            
            external_build_id = result.get("build_id")
            self._log(build_id, f"Remote build ID: {external_build_id}")
            
            # Poll for build status
            await self._poll_build_status(build_id, agent_service, external_build_id)
            
        except Exception as e:
            self._log(build_id, f"Error: {str(e)}")
            build.status = BuildStatus.FAILED
            build.status_message = str(e)
            build.completed_at = datetime.utcnow()
            self.db.commit()
        finally:
            # Save logs to file
            await self._save_logs(build_id)
    
    async def _poll_build_status(
        self,
        build_id: int,
        agent_service,
        external_build_id: str,
        max_attempts: int = 60,
        poll_interval: int = 10
    ) -> None:
        """Poll for build status from agent platform."""
        build = self.db.query(BuildJob).filter(BuildJob.id == build_id).first()
        
        for attempt in range(max_attempts):
            await asyncio.sleep(poll_interval)
            
            try:
                status_result = await agent_service.get_build_status(external_build_id)
                status = status_result.get("status", "unknown")
                
                self._log(build_id, f"Build status: {status} (attempt {attempt + 1})")
                
                if status == "completed":
                    build.status = BuildStatus.SUCCESS
                    build.status_message = "Build completed successfully"
                    build.completed_at = datetime.utcnow()
                    
                    # Create artifact records if available
                    artifacts = status_result.get("artifacts", [])
                    for artifact_info in artifacts:
                        artifact = Artifact(
                            build_job_id=build_id,
                            name=artifact_info.get("name", "Unnamed Artifact"),
                            filename=artifact_info.get("filename", "artifact"),
                            file_path=artifact_info.get("path", ""),
                            file_size=artifact_info.get("size", 0),
                            platform=artifact_info.get("platform"),
                            architecture=artifact_info.get("architecture"),
                            version=artifact_info.get("version")
                        )
                        self.db.add(artifact)
                    
                    self.db.commit()
                    self._log(build_id, "Build completed successfully")
                    return
                
                elif status == "failed":
                    build.status = BuildStatus.FAILED
                    build.status_message = status_result.get("error", "Build failed")
                    build.completed_at = datetime.utcnow()
                    self.db.commit()
                    self._log(build_id, f"Build failed: {build.status_message}")
                    return
                
                elif status == "cancelled":
                    build.status = BuildStatus.CANCELLED
                    build.status_message = "Build was cancelled"
                    build.completed_at = datetime.utcnow()
                    self.db.commit()
                    self._log(build_id, "Build cancelled")
                    return
                
            except Exception as e:
                self._log(build_id, f"Error polling status: {str(e)}")
        
        # Timeout reached
        build.status = BuildStatus.FAILED
        build.status_message = "Build timed out"
        build.completed_at = datetime.utcnow()
        self.db.commit()
        self._log(build_id, "Build timed out")
    
    def _log(self, build_id: int, message: str) -> None:
        """Add a log entry for a build."""
        timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {message}"
        
        if build_id not in self.build_logs:
            self.build_logs[build_id] = []
        
        self.build_logs[build_id].append(log_entry)
        print(f"[Build {build_id}] {message}")
    
    async def _save_logs(self, build_id: int) -> None:
        """Save build logs to file."""
        if build_id not in self.build_logs:
            return
        
        log_file = os.path.join(settings.ARTIFACTS_DIR, f"build_{build_id}.log")
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        
        with open(log_file, "w") as f:
            f.write("\n".join(self.build_logs[build_id]))
        
        # Clean up from memory
        del self.build_logs[build_id]


async def execute_build_async(build_id: int, db: Session) -> None:
    """Execute a build asynchronously."""
    service = BuildService(db)
    await service.execute_build(build_id)
