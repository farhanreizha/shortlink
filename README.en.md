# Knot — English Documentation

Self-hosted URL shortener built with React, Hono, and PostgreSQL.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started (Development)](#getting-started-development)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Database](#database)
- [Testing](#testing)
- [Production (Docker)](#production-docker)
- [Project Structure](#project-structure)

## Prerequisites

- Node.js >= 18
- pnpm 9 (`corepack enable` recommended)
- Docker (for PostgreSQL)

## Getting Started (Development)

```bash
# 1. Start PostgreSQL
docker compose up db -d

# 2. Install dependencies
pnpm install

# 3. Start all services (web + api)
pnpm dev
```

| Service  | URL                         |
|----------|-----------------------------|
| Web      | http://localhost:5173       |
| API      | http://localhost:3001       |
| OpenAPI  | http://localhost:3001/api/doc |

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Run web + api in watch mode (turbo) |
| `pnpm build` | Build all packages |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format (write) |
| `pnpm typecheck` | `tsc --noEmit` for all packages |
| `pnpm --filter api test` | Run API integration tests (Vitest) |
| `pnpm --filter api db:generate` | Generate a new Drizzle migration |
| `pnpm --filter api db:push` | Apply schema changes directly (dev) |
| `pnpm --filter api db:migrate` | Apply migrations (prod) |

## Environment Variables

All optional except where noted; defaults shown below.

| Variable       | Default                                            | Description |
|----------------|----------------------------------------------------|-------------|
| `DATABASE_URL` | `postgres://shortlink:shortlink@localhost:5432/shortlink` | PostgreSQL connection string |
| `JWT_SECRET`   | `dev-secret-change-in-production`                  | JWT signing secret (must be changed in production) |
| `PORT`         | `3001`                                             | API port |
| `CORS_ORIGIN`  | `*`                                                | Allowed origin(s), comma-separated |

## API Overview

Base URL: `/api`

| Method | Path                    | Description |
|--------|-------------------------|-------------|
| POST   | `/api/auth/register`    | Register a user |
| POST   | `/api/auth/login`       | Log in |
| POST   | `/api/auth/logout`      | Log out |
| GET    | `/api/auth/me`          | Current user |
| PATCH  | `/api/auth/me`          | Update email/password |
| DELETE | `/api/auth/me`          | Delete account |
| GET    | `/api/shortlinks`       | List links (paginated + searchable) |
| POST   | `/api/shortlinks`       | Create a link |
| GET    | `/api/shortlinks/:slug` | Get a shortlink |
| PATCH  | `/api/shortlinks/:slug` | Update a shortlink |
| DELETE | `/api/shortlinks/:slug` | Delete a shortlink |
| GET    | `/r/:slug`              | Redirect to target URL |
| GET    | `/api/health`           | Health check (DB ping) |

Interactive docs: http://localhost:3001/api/doc

See [ARCHITECTURE.md](ARCHITECTURE.md) for the full route mapping, data flow, and error classes.

## Database

Schema changes:

```bash
# Development: push directly
pnpm --filter api db:push

# Production: generate a migration, then apply
pnpm --filter api db:generate
pnpm --filter api db:migrate
```

## Testing

```bash
pnpm --filter api test
```

Tests require PostgreSQL running (see [Getting Started](#getting-started-development)).

## Production (Docker)

```bash
docker compose up --build
```

| Service | URL         |
|---------|-------------|
| Web     | http://localhost:80 |
| API     | http://localhost:3001 |

Services are configured with `restart: unless-stopped` so they recover automatically after a host reboot.

## Project Structure

```
shortlink/
├── apps/
│   ├── api/          HonoJS + @hono/zod-openapi backend
│   └── web/          React + Vite frontend
├── packages/
│   ├── shared/       Zod schemas + RPC route types
│   └── typescript-config/  Shared TS config base
├── docker-compose.yml
├── turbo.json
└── package.json
```

For a deep dive into the codebase, see [ARCHITECTURE.md](ARCHITECTURE.md).
