# AppHub

A web-based platform designed to empower developers by simplifying the process of building application binaries from code repositories.

## Overview

AppHub allows developers to:
- Submit code from GitHub, GitLab, or direct uploads
- Select AI agents to automate dependency management and environment setup
- Monitor build jobs in real-time
- Download compiled binary artifacts
- Manage multiple builds and artifacts centrally

## Supported AI Agents

AppHub integrates with various AI agent platforms:

- **Google Jules** - AI-powered coding agent from Google
- **Cursor Agent** - AI assistant from Cursor IDE
- **Codemagic** - CI/CD platform for mobile apps
- **GitHub Copilot** - AI pair programmer from GitHub
- **AMP Remote** - Remote build execution platform
- **Custom Agents** - Support for custom AI agent integrations

## Features

### Core Features
- ✅ **Code Repository Submission** - Support for GitHub, GitLab, and manual uploads
- ✅ **AI Agent Selection** - Multiple AI agents for different languages and frameworks
- ✅ **Build Job Management** - Dashboard for submitting, monitoring, and managing builds
- ✅ **Centralized Hub** - Repository of built binaries with versioning and metadata
- ✅ **Artifact Download** - Secure download links for built binaries
- ✅ **Build Logs** - Access to detailed build logs for troubleshooting
- ✅ **Settings Management** - Configure AI agent API keys and preferences

### Security & Scalability
- Sandboxed build environments (via AI agent platforms)
- Secure API key storage
- Scalable architecture for multiple concurrent builds

## Quick Start

### Prerequisites
- Python 3.9+
- pip

### Installation

1. Clone the repository:
```bash
git clone https://github.com/enzomarc237/apphub.git
cd apphub
```

2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python run.py
```

5. Open your browser and navigate to:
```
http://localhost:8000
```

## Configuration

### AI Agent API Keys

To enable AI agent integrations, configure API keys in the Settings page:

1. Navigate to **Settings** → **AI Agent APIs**
2. Click on each agent type to expand its configuration
3. Enter your API key (obtain from the respective platform)
4. Click **Save API Keys**

#### Obtaining API Keys

- **Google Jules**: Visit [jules.google.com](https://jules.google.com)
- **Cursor Agent**: Visit [cursor.sh](https://cursor.sh)
- **Codemagic**: Visit [codemagic.io](https://codemagic.io)
- **GitHub Copilot**: Visit GitHub Settings → Copilot
- **AMP Remote**: Visit [amp.remote](https://amp.remote)

## API Documentation

Once the server is running, API documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### API Endpoints

#### Builds
- `GET /api/builds` - List all builds
- `POST /api/builds` - Create a new build
- `GET /api/builds/{id}` - Get build details
- `POST /api/builds/{id}/cancel` - Cancel a build
- `DELETE /api/builds/{id}` - Delete a build
- `GET /api/builds/{id}/logs` - Get build logs
- `GET /api/builds/{id}/artifacts` - Get build artifacts

#### AI Agents
- `GET /api/agents` - List all agents
- `POST /api/agents` - Create a new agent
- `GET /api/agents/types` - List available agent types
- `GET /api/agents/{id}` - Get agent details
- `PUT /api/agents/{id}` - Update agent
- `DELETE /api/agents/{id}` - Delete agent
- `POST /api/agents/{id}/test` - Test agent connection

#### Artifacts
- `GET /api/artifacts` - List all artifacts
- `GET /api/artifacts/{id}` - Get artifact details
- `GET /api/artifacts/{id}/download` - Download artifact
- `DELETE /api/artifacts/{id}` - Delete artifact

#### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update settings
- `GET /api/settings/agents` - Get agent configurations

## Project Structure

```
apphub/
├── app/
│   ├── api/              # API routes
│   │   ├── agents.py
│   │   ├── artifacts.py
│   │   ├── builds.py
│   │   └── settings.py
│   ├── core/             # Core configuration
│   │   └── config.py
│   ├── db/               # Database
│   │   └── database.py
│   ├── models/           # Data models
│   │   ├── agent.py
│   │   ├── artifact.py
│   │   ├── build.py
│   │   ├── schemas.py
│   │   └── user_settings.py
│   ├── services/         # Business logic
│   │   ├── agent_service.py
│   │   └── build_service.py
│   ├── static/           # Static files
│   │   ├── css/
│   │   │   └── styles.css
│   │   └── js/
│   │       └── app.js
│   ├── templates/        # HTML templates
│   │   ├── base.html
│   │   ├── index.html
│   │   ├── builds.html
│   │   ├── new_build.html
│   │   ├── build_detail.html
│   │   ├── agents.html
│   │   ├── artifacts.html
│   │   └── settings.html
│   └── main.py           # Application entry point
├── uploads/              # Uploaded code archives
├── artifacts/            # Built artifacts
├── init_db.py            # Database initialization
├── run.py                # Startup script
├── requirements.txt      # Python dependencies
└── README.md             # This file
```

## Technology Stack

- **Backend**: Python 3.9+, FastAPI
- **Database**: SQLite (configurable)
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **UI Framework**: Custom CSS with responsive design
- **Icons**: Font Awesome

## Development

### Running in Development Mode

```bash
python run.py
```

The server will automatically reload on code changes.

### Database Migrations

The application uses SQLAlchemy ORM. Database tables are created automatically on startup.

### Environment Variables

Create a `.env` file to configure:

```env
# Database
DATABASE_URL=sqlite:///./apphub.db

# Storage
UPLOAD_DIR=./uploads
ARTIFACTS_DIR=./artifacts

# Security
SECRET_KEY=your-secret-key

# Redis (for future Celery integration)
REDIS_URL=redis://localhost:6379/0
```

## User Personas

### Independent Developer
Freelance or hobbyist developers looking to quickly build and distribute applications without managing complex build environments.

### Development Team Lead
Leads a team of developers and wants to streamline the build process and artifact management.

### DevOps Engineer
Focuses on continuous integration and deployment pipelines, ensuring secure and reproducible builds.

## Roadmap

- [ ] WebSocket support for real-time build updates
- [ ] Celery integration for background job processing
- [ ] Docker-based sandboxed build environments
- [ ] Multi-platform build support (Linux, Windows, macOS)
- [ ] Build caching and incremental builds
- [ ] Team collaboration features
- [ ] Build pipelines and workflows
- [ ] Integration with more CI/CD platforms

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue on GitHub.

---

Built with ❤️ for developers who want to focus on coding, not build infrastructure.
