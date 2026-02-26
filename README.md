# AppHub

A platform for developers to submit code repositories, choose an AI agent to build the application binary, and download the resulting artifact from a centralized hub.

## Features

- 🚀 Submit code repositories (GitHub, GitLab, or manual upload)
- 🤖 Choose from multiple AI agents (Google Jules, Cursor Agent, Codemagic, GitHub Copilot, AMP Remote)  
- 🔧 Remote sandboxed build environments
- 📦 Centralized hub for built application binaries
- 📥 Secure artifact download with checksums
- 📋 Real-time build logs and metadata
- ⚙️ Configure AI agent API keys in Settings

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173 and sign in with any email/password.

## Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS
- React Router v6
- Zustand (state management)
- TanStack Query
- React Hook Form + Zod
- Vitest + Testing Library

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Lint
npm test         # Run tests
```
