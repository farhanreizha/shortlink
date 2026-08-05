# Shortlink

> A self-hosted URL shortener — React + Hono + PostgreSQL, built as a pnpm monorepo.

**Shortlink** is a minimal, self-hostable URL shortener with user accounts, click tracking, and an OpenAPI-documented backend. It is built as a pnpm + Turborepo monorepo with a typed-shared schema package between the frontend and backend.

**Shortlink** adalah URL shortener self-host yang minimal, dengan akun pengguna, pelacakan kunjungan, dan backend ber-dokumentasi OpenAPI. Dibangun sebagai monorepo pnpm + Turborepo dengan paket skema bersama yang bertipe antara frontend dan backend.

## Features

- User authentication with httpOnly JWT cookies (register, login, logout)
- Shortlink CRUD with visit tracking, search, and pagination
- Public redirect endpoint (`/r/{slug}`)
- OpenAPI documentation at `/api/doc`
- Rate limiting on auth and shortlink endpoints
- Docker Compose setup for production

## Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19, Vite, wouter |
| Backend  | Hono, @hono/zod-openapi, Drizzle ORM |
| Database | PostgreSQL |
| Monorepo | pnpm workspaces, Turborepo |
| Tooling  | TypeScript 7, Biome, Vitest |

## Documentation

- [English documentation](README.en.md)
- [Dokumentasi Bahasa Indonesia](README.id.md)
- [Architecture](ARCHITECTURE.md)
