# Shortlink Monorepo

## Structure
- `apps/web` — React + Vite frontend
- `apps/api` — HonoJS backend with `@hono/zod-openapi`
- `packages/shared` — shared Zod schemas + types

## Commands

| Command | Scope |
|---|---|
| `pnpm dev` | All services (turbo) |
| `pnpm build` | All packages |
| `pnpm lint` | Biome check |
| `pnpm format` | Biome format |
| `pnpm typecheck` | `tsc --noEmit` all |
| `pnpm --filter <pkg> <cmd>` | Single package |

## Key conventions
- Strict TS, root `tsconfig.json` as shared base don't using `any`
- Biome only (no ESLint/Prettier)
- `packages/shared` owns Zod schemas → consumed by API (validation) and web (RPC client types)
- `packages/shared/src/routes.ts` exports `AppRoutes` — a route schema type used by web's RPC client
- `apps/web` uses `hc<Hono<{}, AppRoutes, "/">>("/")` in `apps/web/src/hono-client.ts` — never imports `apps/api` directly
- `@hono/zod-openapi` `typeof app` type inference doesn't cross workspace boundary with TS 7; `AppRoutes` in shared is the substitute

## Docker
- `apps/api/Dockerfile` + `apps/web/Dockerfile`
- `docker-compose.yml` at root, `docker-compose up --build` for prod

## Dev gotchas
- Vite dev server needs proxy config forwarding `/api` → Hono
- `@hono/zod-openapi` needs explicit OpenAPI spec generation (separate from route registration)
- workspace protocol (`"@shortlink/shared": "workspace:*"`) for internal deps
- `packages/shared/src/routes.ts` must be kept in sync with `apps/api/src/index.ts` routes — adding a route in the API means adding its type in the shared schema
- Start PostgreSQL first: `docker compose up db -d`; then `pnpm dev`
- After modifying DB schema: `DATABASE_URL=... pnpm --filter api db:push` to apply
- `db:generate` creates migration file, `db:push` applies it; use `db:push` for dev, `db:generate` + `db:migrate` for prod
- DB schema in `apps/api/src/db/schema.ts`, connection in `apps/api/src/db/index.ts`
- `DATABASE_URL` env var needed; default: `postgres://shortlink:shortlink@localhost:5432/shortlink`
- Handlers must be `async` to use `await db...`; response type conversion: `serial` → `String()`, `timestamp` → `.toISOString()`

## Do
- always double-check with linter before calling a feature done
- use `pnpm add <package>` (newest version, e.g. `pnpm add hono`) for dependencies
- use context7 for library/framework docs

## Don't
- never ship without verifying with linter first
