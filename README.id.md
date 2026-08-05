# Shortlink — Dokumentasi Bahasa Indonesia

URL shortener self-host yang dibangun dengan React, Hono, dan PostgreSQL.

## Daftar Isi

- [Prasyarat](#prasyarat)
- [Memulai (Development)](#memulai-development)
- [Scripts](#scripts)
- [Environment Variables](#environment-variables)
- [Ringkasan API](#ringkasan-api)
- [Database](#database)
- [Testing](#testing)
- [Production (Docker)](#production-docker)
- [Struktur Project](#struktur-project)

## Prasyarat

- Node.js >= 18
- pnpm 9 (disarankan `corepack enable`)
- Docker (untuk PostgreSQL)

## Memulai (Development)

```bash
# 1. Nyalakan PostgreSQL
docker compose up db -d

# 2. Install dependensi
pnpm install

# 3. Jalankan semua service (web + api)
pnpm dev
```

| Service  | URL                         |
|----------|-----------------------------|
| Web      | http://localhost:5173       |
| API      | http://localhost:3001       |
| OpenAPI  | http://localhost:3001/api/doc |

## Scripts

| Perintah | Deskripsi |
|---|---|
| `pnpm dev` | Jalankan web + api dalam mode watch (turbo) |
| `pnpm build` | Build semua paket |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format (write) |
| `pnpm typecheck` | `tsc --noEmit` untuk semua paket |
| `pnpm --filter api test` | Jalankan test integrasi API (Vitest) |
| `pnpm --filter api db:generate` | Generate migrasi Drizzle baru |
| `pnpm --filter api db:push` | Terapkan perubahan skema langsung (dev) |
| `pnpm --filter api db:migrate` | Terapkan migrasi (prod) |

## Environment Variables

Semua opsional kecuali yang disebutkan; default di bawah ini.

| Variable       | Default                                            | Deskripsi |
|----------------|----------------------------------------------------|-----------|
| `DATABASE_URL` | `postgres://shortlink:shortlink@localhost:5432/shortlink` | Connection string PostgreSQL |
| `JWT_SECRET`   | `dev-secret-change-in-production`                  | Secret penandatanganan JWT (wajib diganti di production) |
| `PORT`         | `3001`                                             | Port API |
| `CORS_ORIGIN`  | `*`                                                | Origin yang diizinkan, dipisahkan koma |

## Ringkasan API

Base URL: `/api`

| Method | Path                    | Deskripsi |
|--------|-------------------------|-----------|
| POST   | `/api/auth/register`    | Mendaftar pengguna |
| POST   | `/api/auth/login`       | Login |
| POST   | `/api/auth/logout`      | Logout |
| GET    | `/api/auth/me`          | Pengguna saat ini |
| PATCH  | `/api/auth/me`          | Update email/password |
| DELETE | `/api/auth/me`          | Hapus akun |
| GET    | `/api/shortlinks`       | List shortlink (paginasi + pencarian) |
| POST   | `/api/shortlinks`       | Buat shortlink |
| GET    | `/api/shortlinks/:slug` | Ambil shortlink |
| PATCH  | `/api/shortlinks/:slug` | Update shortlink |
| DELETE | `/api/shortlinks/:slug` | Hapus shortlink |
| GET    | `/r/:slug`              | Redirect ke URL tujuan |
| GET    | `/api/health`           | Health check (ping DB) |

Dokumentasi interaktif: http://localhost:3001/api/doc

Lihat [ARCHITECTURE.md](ARCHITECTURE.md) untuk pemetaan route lengkap, alur data, dan class error.

## Database

Perubahan skema:

```bash
# Development: push langsung
pnpm --filter api db:push

# Production: generate migrasi, lalu terapkan
pnpm --filter api db:generate
pnpm --filter api db:migrate
```

## Testing

```bash
pnpm --filter api test
```

Test membutuhkan PostgreSQL yang berjalan (lihat [Memulai](#memulai-development)).

## Production (Docker)

```bash
docker compose up --build
```

| Service | URL         |
|---------|-------------|
| Web     | http://localhost:80 |
| API     | http://localhost:3001 |

Semua service dikonfigurasi dengan `restart: unless-stopped` sehingga otomatis pulih setelah host reboot.

## Struktur Project

```
shortlink/
├── apps/
│   ├── api/          Backend HonoJS + @hono/zod-openapi
│   └── web/          Frontend React + Vite
├── packages/
│   ├── shared/       Skema Zod + tipe route RPC
│   └── typescript-config/  Konfigurasi TS base
├── docker-compose.yml
├── turbo.json
└── package.json
```

Untuk pemahaman mendalam tentang codebase, lihat [ARCHITECTURE.md](ARCHITECTURE.md).
