from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime


class Artifact(Base):
    __tablename__ = "artifacts"
    
    id = Column(Integer, primary_key=True, index=True)
    build_job_id = Column(Integer, ForeignKey("build_jobs.id"), nullable=False)
    
    # Artifact details
    name = Column(String, nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(BigInteger, default=0)
    file_type = Column(String, nullable=True)
    checksum = Column(String, nullable=True)
    
    # Metadata
    platform = Column(String, nullable=True)  # linux, windows, macos
    architecture = Column(String, nullable=True)  # x64, arm64, etc.
    version = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    download_count = Column(Integer, default=0)
    
    # Relationships
    build_job = relationship("BuildJob", back_populates="artifacts")
    
    def to_dict(self):
        return {
            "id": self.id,
            "build_job_id": self.build_job_id,
            "name": self.name,
            "filename": self.filename,
            "file_size": self.file_size,
            "file_type": self.file_type,
            "platform": self.platform,
            "architecture": self.architecture,
            "version": self.version,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "download_count": self.download_count,
        }
