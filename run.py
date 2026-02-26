#!/usr/bin/env python3
"""
AppHub - Main entry point
"""
import uvicorn
import sys
import os

# Add the project directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings


def main():
    print(f"""
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║                    AppHub v{settings.APP_VERSION}                        ║
║                                                              ║
║   Web-based platform for building application binaries       ║
║   from code repositories using AI agents                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
    """)
    
    # Initialize database
    print("Initializing database...")
    from init_db import init_database
    init_database()
    
    print("\nStarting server...")
    print("Access the application at: http://localhost:8000")
    print("API documentation at: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop the server\n")
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )


if __name__ == "__main__":
    main()
