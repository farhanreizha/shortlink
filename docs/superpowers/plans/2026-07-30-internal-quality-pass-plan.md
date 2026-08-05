# Internal Quality Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strengthen the shortlink MVP foundation with CORS config, health check, migration fix, password policy, rate limiting, and testing setup.

**Architecture:** Six independent tasks touching the API config, routes, middleware, shared schema, and test infrastructure. Each task is self-contained with its own verification.

**Tech Stack:** HonoJS + @hono/zod-openapi (API), Drizzle ORM + PostgreSQL (DB), Vitest (tests), pnpm (monorepo), Biome (format/lint)

## Global Constraints

- All TypeScript: strict mode, `noUncheckedIndexedAccess`
- Biome only for formatting/linting (no ESLint/Prettier)
- `@hono/zod-openapi` for route definitions — use `createRoute()` + `app.openapi()`
- Drizzle ORM for all database queries
- `packages/shared` owns all Zod schemas consumed by API + web
- After any file changes: run `pnpm --filter api format && pnpm --filter api lint && pnpm --filter api typecheck`
- After all tasks: run `pnpm lint && pnpm typecheck` from root

---

### Task 1: CORS Config

**Files:**
- Modify: `apps/api/src/config.ts`
- Modify: `apps/api/src/app.ts`
- Modify: `docker-compose.yml`

**Interfaces:**
- Consumes: Nothing from earlier tasks
- Produces: `env.CORS_ORIGIN` available in app.ts

- [ ] **Step 1: Read current config.ts**

Read `apps/api/src/config.ts` to understand the env schema structure.

- [ ] **Step 2: Add CORS_ORIGIN to env schema**

Edit `apps/api/src/config.ts` to add `CORS_ORIGIN` env with default `"*"`:

```ts
const envSchema = z.object({
  DATABASE_URL: z.string().default("postgres://shortlink:shortlink@localhost:5432/shortlink"),
  JWT_SECRET: z.string().default("dev-secret-change-in-production"),
  PORT: z.coerce.number().default(3001),
  CORS_ORIGIN: z.string().default("*"),
})
```

- [ ] **Step 3: Add cors middleware to app.ts**

Edit `apps/api/src/app.ts` — import `cors` from `hono/cors`, mount before auth middleware:

```ts
import { OpenAPIHono } from "@hono/zod-openapi"
import { cors } from "hono/cors"
import { authMiddleware } from "./middleware/auth"
import { errorHandler } from "./middleware/error-handler"
import { env } from "./config"
import authRoutes from "./routes/auth.route"
import redirectRoutes from "./routes/redirect.route"
import shortlinkRoutes from "./routes/shortlink.route"

const app = new OpenAPIHono<{ Variables: { userId: number } }>()

app.onError(errorHandler)

const origin = env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(",").map(s => s.trim())
app.use("/api/*", cors({ origin, credentials: true }))

app.use("/api/*", authMiddleware)

app.route("/api/auth", authRoutes)
app.route("/api/shortlinks", shortlinkRoutes)
app.route("/r", redirectRoutes)
```

- [ ] **Step 4: Add CORS_ORIGIN to docker-compose.yml**

Edit `docker-compose.yml`, add `CORS_ORIGIN` to the api service environment:

```yaml
  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    ports:
      - "3001:3001"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://shortlink:shortlink@db:5432/shortlink
      CORS_ORIGIN: http://localhost:80
```

- [ ] **Step 5: Format, lint, typecheck**

```bash
pnpm --filter api format && pnpm --filter api lint && pnpm --filter api typecheck
```

Expected: all pass

---

### Task 2: Health Check Endpoint

**Files:**
- Create: `apps/api/src/routes/health.route.ts`
- Modify: `apps/api/src/app.ts`

**Interfaces:**
- Consumes: `db` from `../db` (already exists)
- Produces: `GET /api/health` endpoint

- [ ] **Step 1: Create health route file**

Create `apps/api/src/routes/health.route.ts`:

```ts
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
    return c.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
    })
  } catch {
    return c.json(
      {
        status: "degraded",
        db: "disconnected",
        timestamp: new Date().toISOString(),
      },
      503,
    )
  }
})

export default app
```

- [ ] **Step 2: Mount health routes in app.ts**

Edit `apps/api/src/app.ts` — import and mount health routes AFTER other routes but BEFORE auth middleware is already scoped to `/api/*`:

```ts
import healthRoutes from "./routes/health.route"

// ... existing code ...

app.route("/api", healthRoutes)
```

> The health check route is NOT behind auth middleware. Add `/api/health` to the auth middleware's `publicPaths` array.

Edit `apps/api/src/middleware/auth.ts`:

```ts
const publicPaths = ["/api/auth/register", "/api/auth/login", "/api/doc", "/api/health"]
```

Mount in `apps/api/src/app.ts`:

```ts
app.route("/api", healthRoutes)
```

- [ ] **Step 3: Format, lint, typecheck**

```bash
pnpm --filter api format && pnpm --filter api lint && pnpm --filter api typecheck
```

Expected: all pass

---

### Task 3: Migration Fix

**Files:**
- Delete: `apps/api/migrations/` directory
- Regenerate: via drizzle-kit

**Interfaces:**
- Consumes: Nothing from earlier tasks
- Produces: Fresh migration file matching `schema.ts`

- [ ] **Step 1: Remove existing migration**

```bash
rm -rf apps/api/migrations
```

- [ ] **Step 2: Regenerate migration from schema**

```bash
pnpm --filter api db:generate
```

Expected output: new migration file created in `apps/api/migrations/` containing both `users` and `shortlinks` tables with FK.

- [ ] **Step 3: Apply migration to dev database**

Ensure postgres is running first:

```bash
docker compose up db -d
pnpm --filter api db:migrate
```

Expected output: migration applied successfully. The `shortlinks` table now has `user_id` column and FK to `users`.

- [ ] **Step 4: Verify migration is in sync**

```bash
pnpm --filter api db:push
```

Expected output: "No changes" — meaning schema.ts matches the database.

---

### Task 4: Password Policy

**Files:**
- Modify: `packages/shared/src/index.ts`

**Interfaces:**
- Consumes: Nothing from earlier tasks
- Produces: Updated `RegisterSchema` with stricter password validation

- [ ] **Step 1: Update password validation in RegisterSchema**

Edit `packages/shared/src/index.ts`, change the `password` field:

```ts
export const RegisterSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
})
```

- [ ] **Step 2: Format, lint, typecheck all packages**

```bash
pnpm --filter shared format && pnpm --filter shared lint && pnpm --filter shared typecheck
pnpm --filter api lint && pnpm --filter api typecheck
pnpm --filter web lint && pnpm --filter web typecheck
```

Expected: all pass. The API route validator uses `@hono/zod-openapi` which infers validation from RegisterSchema — no route code changes needed. The frontend register form also uses the same schema via `safeParse` — no code changes needed there either.

---

### Task 5: Rate Limiting

**Files:**
- Modify: `apps/api/package.json`
- Modify: `apps/api/src/app.ts`

**Interfaces:**
- Consumes: Nothing from earlier tasks
- Produces: Rate-limited auth endpoints (register: 5/15min, login: 10/15min)

- [ ] **Step 1: Add dependencies**

```bash
pnpm --filter api add @hono-rate-limiter/core @hono-rate-limiter/memory
```

- [ ] **Step 2: Verify deps installed correctly**

```bash
pnpm --filter api ls --depth 0
```

Expected: both packages listed under dependencies.

- [ ] **Step 3: Add rate limiter middleware to app.ts**

Edit `apps/api/src/app.ts` — import and mount rate limiters before auth middleware:

```ts
import { rateLimiter } from "@hono-rate-limiter/core"
import { memoryStore } from "@hono-rate-limiter/memory"

// ... after CORS, before auth middleware ...

app.use(
  "/api/auth/register",
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many requests. Please try again later." },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    store: memoryStore(),
  }),
)

app.use(
  "/api/auth/login",
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many requests. Please try again later." },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    store: memoryStore(),
  }),
)

app.use("/api/*", authMiddleware)
```

The full `app.ts` after this step should look like:

```ts
import { OpenAPIHono } from "@hono/zod-openapi"
import { cors } from "hono/cors"
import { rateLimiter } from "@hono-rate-limiter/core"
import { memoryStore } from "@hono-rate-limiter/memory"
import { authMiddleware } from "./middleware/auth"
import { errorHandler } from "./middleware/error-handler"
import { env } from "./config"
import authRoutes from "./routes/auth.route"
import healthRoutes from "./routes/health.route"
import redirectRoutes from "./routes/redirect.route"
import shortlinkRoutes from "./routes/shortlink.route"

const app = new OpenAPIHono<{ Variables: { userId: number } }>()

app.onError(errorHandler)

const origin = env.CORS_ORIGIN === "*" ? "*" : env.CORS_ORIGIN.split(",").map(s => s.trim())
app.use("/api/*", cors({ origin, credentials: true }))

app.route("/api", healthRoutes)

app.use(
  "/api/auth/register",
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { message: "Too many requests. Please try again later." },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    store: memoryStore(),
  }),
)

app.use(
  "/api/auth/login",
  rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many requests. Please try again later." },
    statusCode: 429,
    standardHeaders: true,
    legacyHeaders: false,
    store: memoryStore(),
  }),
)

app.use("/api/*", authMiddleware)

app.route("/api/auth", authRoutes)
app.route("/api/shortlinks", shortlinkRoutes)
app.route("/r", redirectRoutes)

app.doc("/api/doc", {
  openapi: "3.0.0",
  info: {
    title: "Shortlink API",
    version: "1.0.0",
  },
})

export default app
```

- [ ] **Step 4: Format, lint, typecheck**

```bash
pnpm --filter api format && pnpm --filter api lint && pnpm --filter api typecheck
```

Expected: all pass

---

### Task 6: Testing Setup

**Depends on:** Task 3 (migration must include `users` table + FK for tests to work)

**Files:**
- Create: `apps/api/vitest.config.ts`
- Create: `apps/api/src/__tests__/setup.ts`
- Create: `apps/api/src/__tests__/helpers.ts`
- Create: `apps/api/src/__tests__/auth.test.ts`
- Create: `apps/api/src/__tests__/shortlink.test.ts`
- Create: `apps/api/src/__tests__/redirect.test.ts`
- Modify: `apps/api/package.json` (add vitest, test script)
- Modify: `apps/api/src/db/index.ts` (export pool for test teardown)

**Interfaces:**
- Consumes: `db` from `../db`, `app` from `../../app`, fixed migration from Task 3
- Produces: Test suite covering auth, shortlinks, redirect

- [ ] **Step 1: Add vitest dev dependency**

```bash
pnpm --filter api add -D vitest
```

- [ ] **Step 2: Create vitest config**

Create `apps/api/vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    globals: true,
    env: {
      DATABASE_URL: "postgres://shortlink:shortlink@localhost:5432/shortlink_test",
      JWT_SECRET: "test-secret",
      CORS_ORIGIN: "*",
    },
    setupFiles: ["./src/__tests__/setup.ts"],
  },
})
```

- [ ] **Step 3: Export pool from db/index.ts**

Edit `apps/api/src/db/index.ts`:

```ts
import { drizzle } from "drizzle-orm/node-postgres"
import pg from "pg"
import { env } from "../config"
import * as schema from "./schema"

const pool = new pg.Pool({ connectionString: env.DATABASE_URL })

export const db = drizzle(pool, { schema })
export { pool }
```

- [ ] **Step 4: Create test setup file**

Create `apps/api/src/__tests__/setup.ts`:

```ts
import { afterAll, beforeAll } from "vitest"
import { migrate } from "drizzle-orm/node-postgres/migrator"
import { db, pool } from "../db"

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./migrations" })
})

afterAll(async () => {
  await pool.end()
})
```

- [ ] **Step 5: Create test helpers**

Create `apps/api/src/__tests__/helpers.ts`:

```ts
import { sql } from "drizzle-orm"
import { db } from "../db"
import app from "../app"

interface TestUser {
  id: number
  username: string
  email: string
}

interface AuthResult {
  token: string
  user: TestUser
}

export async function cleanDatabase() {
  await db.execute(sql`TRUNCATE TABLE shortlinks, users RESTART IDENTITY CASCADE`)
}

export async function registerUser(
  overrides: Partial<{ email: string; username: string; password: string }> = {},
): Promise<AuthResult> {
  const res = await app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test-" + Date.now() + "@test.com",
      username: "user-" + Date.now(),
      password: "Test1234",
      ...overrides,
    }),
  })
  return res.json()
}

export function authedRequest(token: string, path: string, init?: RequestInit) {
  return app.request(path, {
    ...init,
    headers: {
      ...init?.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })
}
```

- [ ] **Step 6: Create auth test file**

Create `apps/api/src/__tests__/auth.test.ts`:

```ts
import { describe, expect, it, beforeEach } from "vitest"
import app from "../app"
import { cleanDatabase, registerUser } from "./helpers"

beforeEach(cleanDatabase)

describe("POST /api/auth/register", () => {
  it("registers a valid user", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "newuser@test.com",
        username: "newuser",
        password: "Test1234",
      }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty("token")
    expect(data.user.username).toBe("newuser")
  })

  it("rejects duplicate email", async () => {
    await registerUser({ email: "dup@test.com", username: "user1" })
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "dup@test.com",
        username: "user2",
        password: "Test1234",
      }),
    })
    expect(res.status).toBe(409)
  })

  it("rejects duplicate username", async () => {
    await registerUser({ email: "a@test.com", username: "dupuser" })
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "b@test.com",
        username: "dupuser",
        password: "Test1234",
      }),
    })
    expect(res.status).toBe(409)
  })

  it("rejects weak password", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "weak@test.com",
        username: "weakuser",
        password: "short",
      }),
    })
    expect(res.status).toBe(400)
  })
})

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials", async () => {
    await registerUser({ email: "login@test.com", username: "loginuser" })
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "login@test.com",
        password: "Test1234",
      }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveProperty("token")
  })

  it("rejects wrong password", async () => {
    await registerUser({ email: "wrongpw@test.com", username: "wrongpw" })
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "wrongpw@test.com",
        password: "WrongPassword1",
      }),
    })
    expect(res.status).toBe(401)
  })

  it("rejects non-existent email", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nobody@test.com",
        password: "Test1234",
      }),
    })
    expect(res.status).toBe(401)
  })
})

describe("GET /api/auth/me", () => {
  it("returns user with valid token", async () => {
    const { token, user } = await registerUser({ email: "me@test.com", username: "meuser" })
    const res = await app.request("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.username).toBe(user.username)
  })

  it("rejects missing token", async () => {
    const res = await app.request("/api/auth/me")
    expect(res.status).toBe(401)
  })

  it("rejects invalid token", async () => {
    const res = await app.request("/api/auth/me", {
      headers: { Authorization: "Bearer invalid-token" },
    })
    expect(res.status).toBe(401)
  })
})
```

- [ ] **Step 7: Create shortlink test file**

Create `apps/api/src/__tests__/shortlink.test.ts`:

```ts
import { describe, expect, it, beforeEach } from "vitest"
import app from "../app"
import { cleanDatabase, registerUser, authedRequest } from "./helpers"

beforeEach(cleanDatabase)

describe("POST /api/shortlinks", () => {
  it("creates a shortlink", async () => {
    const { token } = await registerUser({ email: "create@test.com", username: "createuser" })
    const res = await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "testlink", url: "https://example.com" }),
    })
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.slug).toBe("testlink")
    expect(data.url).toBe("https://example.com")
  })

  it("rejects duplicate slug", async () => {
    const { token } = await registerUser({ email: "dup@test.com", username: "dupsluguser" })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "mylink", url: "https://example.com" }),
    })
    const res = await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "mylink", url: "https://other.com" }),
    })
    expect(res.status).toBe(409)
  })

  it("rejects unauthenticated request", async () => {
    const res = await app.request("/api/shortlinks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "nolink", url: "https://example.com" }),
    })
    expect(res.status).toBe(401)
  })
})

describe("GET /api/shortlinks", () => {
  it("lists own shortlinks", async () => {
    const { token } = await registerUser({ email: "list@test.com", username: "listuser" })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "link1", url: "https://a.com" }),
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "link2", url: "https://b.com" }),
    })
    const res = await authedRequest(token, "/api/shortlinks")
    const data = await res.json()
    expect(data).toHaveLength(2)
  })
})

describe("DELETE /api/shortlinks/:slug", () => {
  it("deletes own shortlink", async () => {
    const { token } = await registerUser({ email: "del@test.com", username: "deluser" })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "todel", url: "https://example.com" }),
    })
    const res = await authedRequest(token, "/api/shortlinks/todel", {
      method: "DELETE",
    })
    expect(res.status).toBe(200)
  })

  it("returns 404 for non-existent slug", async () => {
    const { token } = await registerUser({ email: "noex@test.com", username: "noexuser" })
    const res = await authedRequest(token, "/api/shortlinks/nonexistent", {
      method: "DELETE",
    })
    expect(res.status).toBe(404)
  })

  it("rejects unauthenticated delete", async () => {
    const res = await app.request("/api/shortlinks/something", { method: "DELETE" })
    expect(res.status).toBe(401)
  })
})
```

- [ ] **Step 8: Create redirect test file**

Create `apps/api/src/__tests__/redirect.test.ts`:

```ts
import { describe, expect, it, beforeEach } from "vitest"
import app from "../app"
import { cleanDatabase, registerUser, authedRequest } from "./helpers"

beforeEach(cleanDatabase)

describe("GET /r/:slug", () => {
  it("redirects to the original URL", async () => {
    const { token } = await registerUser({ email: "redir@test.com", username: "rediruser" })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "go", url: "https://example.com" }),
    })
    const res = await app.request("/r/go")
    expect(res.status).toBe(302)
    expect(res.headers.get("Location")).toBe("https://example.com")
  })

  it("returns 404 for unknown slug", async () => {
    const res = await app.request("/r/unknown")
    expect(res.status).toBe(404)
  })
})
```

- [ ] **Step 9: Add test script to package.json**

Edit `apps/api/package.json`, add to `"scripts"`:

```json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "lint": "biome check src/",
    "format": "biome format --write src/",
    "typecheck": "tsc --noEmit",
    "db:generate": "drizzle-kit generate",
    "db:push": "drizzle-kit push",
    "db:migrate": "drizzle-kit migrate",
    "test": "vitest run",
    "test:watch": "vitest"
  }
}
```

- [ ] **Step 10: Create test database and run tests**

```bash
# Create the test database (run once)
docker compose exec -T db psql -U shortlink -c "CREATE DATABASE shortlink_test"

# Run tests
pnpm --filter api test
```

Expected output: all tests pass (14+ tests across 3 files).

> If `docker compose exec` is unavailable, create the database via:
> ```bash
> PGPASSWORD=shortlink psql -h localhost -U shortlink -c "CREATE DATABASE shortlink_test"
> ```

- [ ] **Step 11: Run full repo lint + typecheck**

```bash
pnpm lint && pnpm typecheck
```

Expected: all pass

---

### Self-Review Checklist

After all tasks are complete:

1. **CORS**: Can a browser on a different origin make a request to the API? (Test manually with curl from a different Origin header)
2. **Health check**: Does `GET /api/health` return `{ status: "ok", db: "connected" }`?
3. **Migration**: Does `apps/api/migrations/` have a single migration with both `users` and `shortlinks` tables?
4. **Password policy**: Does registering with password `"abc"` return 400 validation error?
5. **Rate limiting**: Does hitting `/api/auth/login` 11 times in quick succession return 429 on the 11th?
6. **Tests**: Do all 14+ tests pass with `pnpm --filter api test`?
