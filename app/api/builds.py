from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json
import os
import shutil
from datetime import datetime

from app.db.database import get_db
from app.models import BuildJob, BuildStatus, AIAgent, Artifact
from app.models.schemas import BuildJobCreate, BuildJobResponse, BuildJobList, BuildLogResponse
from app.core.config import settings

router = APIRouter(prefix="/api/builds", tags=["builds"])

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.ARTIFACTS_DIR, exist_ok=True)


@router.get("", response_model=BuildJobList)
def list_builds(
    skip: int = 0,
    limit: int = 50,
    status: Optional[BuildStatus] = None,
    db: Session = Depends(get_db)
):
    query = db.query(BuildJob)
    if status:
        query = query.filter(BuildJob.status == status)
    
    total = query.count()
    builds = query.order_by(BuildJob.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "items": [build.to_dict() for build in builds],
        "total": total
    }


@router.post("", response_model=BuildJobResponse)
def create_build(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    source_type: str = Form(...),
    repository_url: Optional[str] = Form(None),
    branch: str = Form("main"),
    agent_id: int = Form(...),
    build_command: Optional[str] = Form(None),
    environment_vars: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # Validate agent
    agent = db.query(AIAgent).filter(AIAgent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    if not agent.is_active:
        raise HTTPException(status_code=400, detail="Agent is not active")
    
    # Validate source type
    if source_type == "upload" and not file:
        raise HTTPException(status_code=400, detail="File is required for upload source type")
    if source_type in ["github", "gitlab"] and not repository_url:
        raise HTTPException(status_code=400, detail="Repository URL is required")
    
    upload_path = None
    if file:
        # Save uploaded file
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        upload_path = os.path.join(settings.UPLOAD_DIR, filename)
        with open(upload_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
    
    build_job = BuildJob(
        title=title,
        description=description,
        source_type=source_type,
        repository_url=repository_url,
        branch=branch,
        upload_path=upload_path,
        agent_id=agent_id,
        build_command=build_command,
        environment_vars=environment_vars,
        status=BuildStatus.PENDING
    )
    
    db.add(build_job)
    db.commit()
    db.refresh(build_job)
    
    return build_job.to_dict()


@router.get("/{build_id}", response_model=BuildJobResponse)
def get_build(build_id: int, db: Session = Depends(get_db)):
    build = db.query(BuildJob).filter(BuildJob.id == build_id).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    return build.to_dict()


@router.post("/{build_id}/cancel")
def cancel_build(build_id: int, db: Session = Depends(get_db)):
    build = db.query(BuildJob).filter(BuildJob.id == build_id).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    
    if build.status in [BuildStatus.SUCCESS, BuildStatus.FAILED, BuildStatus.CANCELLED]:
        raise HTTPException(status_code=400, detail="Cannot cancel completed build")
    
    build.status = BuildStatus.CANCELLED
    build.status_message = "Build cancelled by user"
    db.commit()
    
    return {"message": "Build cancelled successfully"}


@router.delete("/{build_id}")
def delete_build(build_id: int, db: Session = Depends(get_db)):
    build = db.query(BuildJob).filter(BuildJob.id == build_id).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    
    # Clean up uploaded file if exists
    if build.upload_path and os.path.exists(build.upload_path):
        os.remove(build.upload_path)
    
    db.delete(build)
    db.commit()
    
    return {"message": "Build deleted successfully"}


@router.get("/{build_id}/logs", response_model=BuildLogResponse)
def get_build_logs(build_id: int, db: Session = Depends(get_db)):
    build = db.query(BuildJob).filter(BuildJob.id == build_id).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    
    # Read logs from file if they exist
    log_file = os.path.join(settings.ARTIFACTS_DIR, f"build_{build_id}.log")
    logs = []
    if os.path.exists(log_file):
        with open(log_file, "r") as f:
            logs = f.read().splitlines()
    
    return {
        "build_id": build_id,
        "logs": logs
    }


@router.get("/{build_id}/artifacts")
def get_build_artifacts(build_id: int, db: Session = Depends(get_db)):
    build = db.query(BuildJob).filter(BuildJob.id == build_id).first()
    if not build:
        raise HTTPException(status_code=404, detail="Build not found")
    
    artifacts = db.query(Artifact).filter(Artifact.build_job_id == build_id).all()
    return {
        "items": [artifact.to_dict() for artifact in artifacts],
        "total": len(artifacts)
    }
