from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os

from app.db.database import get_db
from app.models import Artifact
from app.models.schemas import ArtifactResponse
from app.core.config import settings

router = APIRouter(prefix="/api/artifacts", tags=["artifacts"])


@router.get("", response_model=List[ArtifactResponse])
def list_artifacts(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    artifacts = db.query(Artifact).order_by(Artifact.created_at.desc()).offset(skip).limit(limit).all()
    return [artifact.to_dict() for artifact in artifacts]


@router.get("/{artifact_id}", response_model=ArtifactResponse)
def get_artifact(artifact_id: int, db: Session = Depends(get_db)):
    artifact = db.query(Artifact).filter(Artifact.id == artifact_id).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    return artifact.to_dict()


@router.get("/{artifact_id}/download")
def download_artifact(artifact_id: int, db: Session = Depends(get_db)):
    artifact = db.query(Artifact).filter(Artifact.id == artifact_id).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    
    if not os.path.exists(artifact.file_path):
        raise HTTPException(status_code=404, detail="Artifact file not found")
    
    # Increment download count
    artifact.download_count += 1
    db.commit()
    
    return FileResponse(
        path=artifact.file_path,
        filename=artifact.filename,
        media_type="application/octet-stream"
    )


@router.delete("/{artifact_id}")
def delete_artifact(artifact_id: int, db: Session = Depends(get_db)):
    artifact = db.query(Artifact).filter(Artifact.id == artifact_id).first()
    if not artifact:
        raise HTTPException(status_code=404, detail="Artifact not found")
    
    # Delete file if it exists
    if os.path.exists(artifact.file_path):
        os.remove(artifact.file_path)
    
    db.delete(artifact)
    db.commit()
    
    return {"message": "Artifact deleted successfully"}
