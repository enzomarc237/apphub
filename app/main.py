"""
AppHub - Web-based platform for building application binaries from code repositories.
"""
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.db.database import engine, Base
from app.api import builds, agents, artifacts, settings as settings_api
from app.services.build_service import BuildService


# Create database tables
Base.metadata.create_all(bind=engine)


# Ensure directories exist
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.ARTIFACTS_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    # Startup
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    yield
    # Shutdown
    print(f"Shutting down {settings.APP_NAME}")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Platform for building application binaries from code repositories using AI agents",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Templates
templates = Jinja2Templates(directory="app/templates")

# API routes
app.include_router(builds.router)
app.include_router(agents.router)
app.include_router(artifacts.router)
app.include_router(settings_api.router)


@app.get("/")
async def root(request: Request):
    """Serve the main dashboard."""
    return templates.TemplateResponse("index.html", {"request": request})


@app.get("/builds")
async def builds_page(request: Request):
    """Serve the builds page."""
    return templates.TemplateResponse("builds.html", {"request": request})


@app.get("/builds/new")
async def new_build_page(request: Request):
    """Serve the new build page."""
    return templates.TemplateResponse("new_build.html", {"request": request})


@app.get("/builds/{build_id}")
async def build_detail_page(request: Request, build_id: int):
    """Serve the build detail page."""
    return templates.TemplateResponse("build_detail.html", {"request": request, "build_id": build_id})


@app.get("/agents")
async def agents_page(request: Request):
    """Serve the agents page."""
    return templates.TemplateResponse("agents.html", {"request": request})


@app.get("/artifacts")
async def artifacts_page(request: Request):
    """Serve the artifacts page."""
    return templates.TemplateResponse("artifacts.html", {"request": request})


@app.get("/settings")
async def settings_page(request: Request):
    """Serve the settings page."""
    return templates.TemplateResponse("settings.html", {"request": request})


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "version": settings.APP_VERSION}
