# Nimble Monorepo

Welcome to the **Nimble** monorepo workspace.

## Folder Structure

```
nimble/
├── frontend/          # React + Vite + TypeScript web application
├── backend/           # Node.js + Fastify + TypeScript API server
├── docs/              # Architecture doc, team roles doc
├── .github/
│   └── workflows/
│       └── ci.yml     # Lint + build GitHub actions workflow
├── .env.example       # Example environment configuration
├── package.json       # Monorepo workspaces definition
└── README.md          # This file
```

## Setup & Running

This monorepo uses `pnpm` for package management.

### Installation

To install all dependencies for both frontend and backend:
```bash
pnpm install
```

### Running Locally

- **Backend**: `pnpm --filter @nimble/backend dev`
- **Frontend**: `pnpm --filter @nimble/frontend dev`
