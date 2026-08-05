# Internal Quality Pass — Shortlink MVP

Date: 2026-07-30
Status: Draft

## Objective

Strengthen the shortlink MVP's foundation before adding user-facing features. Six items prioritized by the developer:

1. CORS config
2. Testing setup (Vitest + API integration tests)
3. Rate limiting (brute force protection)
4. Migration fix (sync migration with schema)
5. Password policy (minimal strength requirements)
6. Health check endpoint

---

## 1. CORS Config

**Problem:** No CORS middleware configured. Works in dev via Vite proxy, but production nginx or direct API access could fail.

**Solution:** Add `cors()` middleware from Hono's built-in `hono/cors`.

**Implementation:**

- `apps/api/src/config.ts` — add `CORS_ORIGIN` env with default `"*"`
- `apps/api/src/app.ts` — import `cors()`, parse env (comma-separated → array), mount before other middleware
- `docker-compose.yml` — add `CORS_ORIGIN` to api service

**Key decisions:**
- Accept `"*"` or comma-separated origins (e.g. `"https://app.example.com,https://admin.example.com"`)
- `credentials: true` for future cookie-based auth compatibility
- Middleware mounted on `/api/*` only

```ts
const origin = env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(",").map(s => s.trim())
app.use("/api/*", cors({ origin, credentials: true }))
```

---

## 2. Testing Setup

**Problem:** Zero tests across the entire monorepo. No way to verify changes without manual testing.

**Solution:** Vitest (Vite-native test runner) for the API package with integration tests targeting endpoints directly via `app.request()` (no actual HTTP server needed).

**Files to create:**
- `apps/api/vitest.config.ts`
- `apps/api/src/__tests__/helpers.ts` — test utilities (create authed client, test user factory)
- `apps/api/src/__tests__/auth.test.ts`
- `apps/api/src/__tests__/shortlink.test.ts`
- `apps/api/src/__tests__/redirect.test.ts`

**Test database approach:** Dedicated PostgreSQL database `shortlink_test`. The test runner pushes schema via Drizzle in `beforeAll` and cleans up between test files.

**Test client:** Use Hono's built-in `app.request()` which dispatches a `Request` through the full middleware stack without starting an HTTP server — fast and close to production.

**Helper API:**
```ts
// helpers.ts
import app from "../app"
import { db } from "../db"

export async function createApp() {
  return app
}

export async function registerUser() {
  const res = await app.request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email: "test@test.com", username: "testuser", password: "Test1234" }),
    headers: { "Content-Type": "application/json" },
  })
  const data = await res.json()
  return { token: data.token, user: data.user }
}
```

**Test scenarios per endpoint:**

### Auth
| Scenario | Expected |
|---|---|
| Register valid user | 200, returns token + user |
| Register duplicate email | 409, error message |
| Register duplicate username | 409, error message |
| Register weak password | 400, validation error |
| Login valid credentials | 200, returns token |
| Login wrong password | 401 |
| Login non-existent email | 401 |
| GET /me with valid token | 200, returns user |
| GET /me without token | 401 |
| GET /me with expired token | 401 |

### Shortlinks
| Scenario | Expected |
|---|---|
| Create valid shortlink | 200, returns shortlink |
| Create duplicate slug | 409 |
| Create without auth | 401 |
| List own shortlinks | 200, returns array |
| Delete own shortlink | 200 |
| Delete non-existent slug | 404 |
| Delete without auth | 401 |

### Redirect
| Scenario | Expected |
|---|---|
| Valid slug | 302, redirects to URL |
| Invalid slug | 404 |

**Config:**
```ts
// vitest.config.ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    env: {
      DATABASE_URL: "postgres://shortlink:shortlink@localhost:5432/shortlink_test",
    },
    setupFiles: ["./src/__tests__/setup.ts"],
  },
})
```

> `env` option sets env vars before any modules are imported, so `config.ts` reads the test DB URL correctly.

**Setup file** (`setup.ts`) handles:
- `beforeAll`: push schema via `drizzle-kit push`
- `afterAll`: close database pool

**Package.json additions:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^3.x"
  }
}
```

---

## 3. Rate Limiting

**Problem:** No protection against brute force on auth endpoints. An attacker can fire unlimited login/register attempts.

**Solution:** `@hono-rate-limiter/core` with in-memory store. Low effort, proper rate limiting, can swap to Redis store later without changing middleware code.

**New dependencies:**
- `@hono-rate-limiter/core`
- `@hono-rate-limiter/memory`

**Files modified:**
- `apps/api/package.json` — add deps
- `apps/api/src/app.ts` — mount rate limiter before auth middleware

**Limits:**
| Endpoint | Window | Max requests | Rationale |
|---|---|---|---|
| `POST /api/auth/register` | 15 min | 5 | Prevent abuse account creation |
| `POST /api/auth/login` | 15 min | 10 | Prevent brute force, but allow legitimate retries |

**Implementation detail in app.ts:**
```ts
import { rateLimiter } from "@hono-rate-limiter/core"
import { memoryStore } from "@hono-rate-limiter/memory"

// Must be before authMiddleware — rate check is cheaper than JWT verify
app.use("/api/auth/register", rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many requests. Please try again later." },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  store: memoryStore(),
}))

app.use("/api/auth/login", rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many requests. Please try again later." },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,
  store: memoryStore(),
}))
```

**Key decisions:**
- `standardHeaders: true` — sends `RateLimit-*` headers per spec
- `legacyHeaders: false` — skip `X-RateLimit-*` headers
- In-memory store is fine for single-process Node.js; upgrade to Redis when horizontally scaling
- Rate limit checked before JWT auth (cheaper path for blocked requests)
- Uses `message` format matching the existing error response shape (`{ message: string }`)

---

## 4. Migration Fix

**Problem:** Migration file `0000_marvelous_amazoness` only creates `shortlinks` with `id`, `slug`, `url`, `created_at`. The current schema has `users` table and `user_id` FK on shortlinks. Dev uses `db:push` directly, bypassing migrations.

**Solution:** Regenerate migration from scratch (dev only, no production data to preserve).

**Steps:**
```bash
rm -rf apps/api/migrations
pnpm --filter api db:generate
pnpm --filter api db:migrate
```

**Files affected:**
- `apps/api/migrations/` — directory recreated with single migration containing both tables + FK
- `apps/api/drizzle.config.ts` — verify config points to correct schema path

**Why not create a 0001 migration:** Dev database has no meaningful data. Starting clean ensures the migration file is a true snapshot of the schema. If production data existed, we'd use a migration 0001.

---

## 5. Password Policy

**Problem:** Password only requires `min(6)` — too weak for real use.

**Solution:** Upgrade `RegisterSchema` in shared package with letter-case + number requirements.

**Schema change** in `packages/shared/src/index.ts`:
```ts
export const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
})
```

**Validation flow:**
1. Client-side: Zod `safeParse` in register form before submit → show errors inline
2. Server-side: Route validation (already using `@hono/zod-openapi` validator) → returns 400 with Zod issues

**Note:** The existing `z.string().min(6)` becomes `z.string().min(8)` — this is a breaking change for existing users if any exist in the test DB. Since this is dev, acceptable.

---

## 6. Health Check Endpoint

**Problem:** No way to know if the API is running and the database is reachable.

**Solution:** `GET /api/health` endpoint that checks database connectivity.

**File created:** `apps/api/src/routes/health.route.ts`
**File modified:** `apps/api/src/app.ts` — mount route

```ts
// health.route.ts
import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { sql } from "drizzle-orm"
import { db } from "../db"

const route = createRoute({
  method: "get",
  path: "/health",
  responses: {
    200: { description: "Service healthy" },
    503: { description: "Service degraded" },
  },
})

const app = new OpenAPIHono()
app.openapi(route, async (c) => {
  try {
    await db.execute(sql`SELECT 1`)
    return c.json({ status: "ok", db: "connected", timestamp: new Date().toISOString() })
  } catch {
    return c.json({ status: "degraded", db: "disconnected", timestamp: new Date().toISOString() }, 503)
  }
})

export default app
```

> Route path is `/health` (not `/api/health`) because mounting with `app.route("/api", healthRoutes)` prepends `/api`. Final path: `GET /api/health`.

**Mount in app.ts:**
```ts
// After existing routes
import healthRoutes from "./routes/health.route"
app.route("/api", healthRoutes)
```

**Health check is NOT auth-protected** — monitoring systems don't have credentials.

---

## Error Handling & Edge Cases

| Item | Edge Case | Handling |
|---|---|---|
| CORS | Invalid origin format | Default to `*` when env is empty/malformed |
| Rate limit | Memory store reset on restart | Acceptable — rate limits reset; burst attacks limited to window after restart |
| Rate limit | Distributed/containerized | Memory store per-instance; upgrade to Redis when scaling horizontally |
| Tests | Test DB doesn't exist | Setup script creates it; fail fast with clear message if DB unreachable |
| Password policy | Existing users with weak passwords | Not applicable (dev DB, no users); production would need migration |
| Health check | DB pool exhausted | `SELECT 1` reuses existing pool; won't create new connections |
| Migration | Existing data in dev DB | Instructed to backup or ignore (dev only) |

---

## Files Summary

| Action | File | Purpose |
|---|---|---|
| Modify | `apps/api/src/config.ts` | Add `CORS_ORIGIN` env |
| Modify | `apps/api/src/app.ts` | Add CORS + rate limit middleware |
| Create | `apps/api/src/routes/health.route.ts` | Health check endpoint |
| Create | `apps/api/vitest.config.ts` | Test runner config |
| Create | `apps/api/src/__tests__/setup.ts` | Test DB setup/teardown |
| Create | `apps/api/src/__tests__/helpers.ts` | Test utilities |
| Create | `apps/api/src/__tests__/auth.test.ts` | Auth endpoint tests |
| Create | `apps/api/src/__tests__/shortlink.test.ts` | Shortlink endpoint tests |
| Create | `apps/api/src/__tests__/redirect.test.ts` | Redirect endpoint tests |
| Modify | `apps/api/package.json` | Add deps + test script |
| Modify | `packages/shared/src/index.ts` | Password validation |
| Modify | `docker-compose.yml` | Add `CORS_ORIGIN` env |
| Delete+recreate | `apps/api/migrations/` | Regenerate migration |
