# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal Goal Management OS — a full-stack web app for hierarchical goal tracking, discipline enforcement (Beast Mode), and momentum scoring. The frontend is in Vietnamese/English; the backend is in English.

## Development Commands

### Start Services (Backend + DB + Cache)
```bash
docker compose up -d          # Start PostgreSQL, Redis, and Go backend
docker compose logs -f        # Follow logs
docker compose down           # Stop services
```

### Frontend (Next.js)
```bash
cd web
npm install
npm run dev     # localhost:3000
npm run build   # Production build
npm run lint    # ESLint check
```

### Backend (Go) — local without Docker
```bash
cd backend
go run cmd/api/main.go
```

### Production
```bash
docker compose -f docker-compose.prod.yml up -d
```

## Architecture

### Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Shadcn/UI (Radix), TanStack Query (server state), Zustand (UI state), Axios
- **Backend**: Go 1.23, Gin, GORM, PostgreSQL 16, Redis, Viper (config), Robfig Cron (background jobs), Telegram Bot API
- **Infra**: Docker Compose, Nginx (prod only)

### Backend Layout (`backend/`)
```
cmd/api/main.go       → Entry point, route registration
internal/
  config/             → Viper-based env loading
  database/           → GORM connection + auto-migrate
  models/             → Domain structs (Goal, Activity, Violation)
  repository/         → Data access (SQL/GORM queries)
  handlers/           → HTTP controllers (thin, delegate to repo/service)
  services/           → Business logic, cron jobs, Telegram notifications
```

Routing follows `/api/v1/*`. The handler layer is intentionally thin — business logic lives in services, data access in repositories.

### Frontend Layout (`web/src/`)
```
app/                  → Next.js pages and layouts (App Router)
components/ui/        → Shadcn/UI + project-specific components
hooks/                → Data-fetching hooks wrapping TanStack Query + Axios
stores/               → Zustand stores for UI-only state
lib/                  → Utilities
types/                → Shared TypeScript interfaces
```

API calls go through hooks in `hooks/`. Components do not call Axios directly.

### Key Architectural Decisions
- **Goal hierarchy**: PostgreSQL recursive CTEs enable infinite-depth goal trees. Any query touching goal ancestors/descendants uses CTEs — do not flatten with application-level recursion.
- **State split**: TanStack Query owns server data (caching, invalidation); Zustand owns ephemeral UI state (modals, Beast Mode lock, active filters).
- **Notifications**: Telegram bot notifications are triggered by `robfig/cron` jobs in the backend — no webhook, pure polling/push from the server side.
- **Discipline (Beast Mode)**: When a violation is triggered, the frontend locks the UI until the user acknowledges the penalty. Backend tracks violation state in the `disciplines` table.
- **Momentum Score**: Calculated daily at midnight via cron; stored as activity records used to render the heatmap.

## Environment Variables

Copy `.env.example` to `.env`. Key variables:

| Variable | Description |
|---|---|
| `DB_HOST/USER/PASSWORD/NAME/PORT` | PostgreSQL connection |
| `PORT` | Go backend port (default 8080) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot credentials |
| `TELEGRAM_CHAT_ID` | Recipient chat ID |
| `DOMAIN` | Production domain for Nginx |

## Design System

`design-system/` contains a separate package (`personal-goal-os`) with shared UI primitives. Changes there do not automatically reflect in `web/` — check if the package needs to be rebuilt/re-linked.
