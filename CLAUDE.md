# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`boklisten.no` is a monorepo for a library and book management service for upper secondary schools. It unifies what were previously separate `bl-web` and `bl-admin` projects into a single customer-facing site with integrated administration.

## Workspaces

- **`backend/`** — AdonisJS v7 REST API with MongoDB/Mongoose v9
- **`frontend/`** — TanStack Start (React 19) SPA with Mantine v8 UI
- **`cron_jobs/`** — Standalone scheduled tasks (DB cleanup, prod→staging sync)

The frontend imports shared types directly from `backend/shared/`.

## Commands

Run from the repo root unless noted:

```bash
bun install          # Install all workspace dependencies
bun dev              # Start frontend (:3000) and backend (:3333) concurrently
bun build            # Build all workspaces
bun test             # Run tests in all workspaces (only backend has real tests)
bun lint             # oxlint across all workspaces
bun lint:fix         # Auto-fix lint issues
bun format           # oxfmt formatter
bun format:check     # Check formatting
bun typecheck        # TypeScript type checking for all workspaces
bun fix              # Runs lint:fix + typecheck + format sequentially
bun ace              # AdonisJS CLI (e.g. bun ace make:controller Foo)
```

**Run a single backend test file:**

```bash
cd backend && bun run test --files tests/blid_service.spec.ts
```

**Production start (backend requires custom ENV_PATH):**

```bash
bun build:backend && ENV_PATH=../ bun start:backend
bun build:frontend && bun start:frontend
```

## Environment Setup

Copy `.env.example` → `.env.local` in both `backend/` and `frontend/`. Minimum required:

- `backend/.env.local`: `MONGODB_URI`, `APP_KEY`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`
- `frontend/.env.local`: `VITE_API_URL` (point to backend, e.g. `http://localhost:3333`)

## Architecture

### Backend (`backend/`)

AdonisJS follows a standard MVC layout:

- `app/models/` — Mongoose schemas (`*.schema.ts`)
- `app/controllers/` — Route handlers; auth has its own subdirectory
- `app/services/` — Business logic
- `app/validators/` — VineJS request validators
- `app/policies/` + `app/abilities/` — Authorization layer
- `app/listeners/` + `app/events/` — Event-driven side effects (emails, SMS)
- `app/mails/` — SendGrid email templates
- `app/transformers/` — Response shaping
- `start/routes.ts` — All route definitions
- `start/env.ts` — Validated environment variable declarations
- `config/` — Per-concern config files (auth, cors, database, logger, etc.)
- `shared/` — TypeScript types exported for use by the frontend
- `tests/` — Japa unit tests (`*.spec.ts`); uses Chai assertions and Sinon mocking

### Frontend (`frontend/`)

TanStack Start uses file-based routing:

- `src/routes/` — Pages; route groups in parentheses: `(administrasjon)`, `(offentlig)`, `(legacy)`
- `src/features/` — Feature modules (auth, order, checkout, payment, cart, items, branches, matches, etc.); each encapsulates its own components, hooks, and queries
- `src/shared/` — Cross-feature hooks, utilities, and components

Data fetching uses TanStack React Query v5. Forms use TanStack React Form v1.

## CI/CD & Branches

- `main` → auto-deploys to **staging**
- `production` → auto-deploys to **live**

GitHub Actions runs: format check → typecheck → lint → build backend → build frontend → backend tests.

## Key External Integrations

| Service          | Purpose                                    |
| ---------------- | ------------------------------------------ |
| Vipps Mobile Pay | Payment processing                         |
| SendGrid         | Transactional email                        |
| Twilio           | SMS notifications                          |
| Bring            | Shipping/logistics                         |
| Sentry           | Error tracking (both frontend and backend) |
