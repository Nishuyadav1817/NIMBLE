# Nimble Team Roles & Responsibilities

This document outlines the standard roles and ownership within the Nimble development team.

## Roles Matrix

| Role | Core Responsibilities | Focus Area |
| :--- | :--- | :--- |
| **Frontend Engineer** | User Interface, client-side state, Vite building, styling, responsive views | React, CSS, Vite |
| **Backend Engineer** | API routes, Database migration, Fastify plugins, cache invalidation, storage | Node.js, Fastify, Upstash, Prisma/SQL |
| **DevOps / CI Engineer** | CI/CD pipelines, Env secret management, deployments, test suites | GitHub Actions, Vercel |

## Development Process

1. **Feature branch creation**: Devs branch out of `dev`.
2. **Pull Requests**: Created against the `dev` branch. CI checks (`ci.yml`) must pass.
3. **Releases**: Merged to `main` for production release.
