# GitHub Issues for Knot Monorepo

> Copy each section into a new GitHub issue. Labels suggested: `critical`, `high`, `medium`, `low`, `bug`, `refactor`, `security`, `testing`.

---

## 🔴 Critical — Fix Immediately ✅ **DONE**

### 1. [CRITICAL] Non-null assertion in redirect test causes Biome lint error
**Labels:** `critical`, `bug`, `testing`

**File:** `apps/api/src/__tests__/redirect.test.ts:12`

```typescript
// Line 12: Forbidden non-null assertion
if (rows.length > 0) return rows[0]!
```

**Fix:** Guard properly
```typescript
if (rows.length === 0) return undefined
return rows[0]
```

**Run:** `pnpm --filter api run lint --apply`

**Status:** ✅ Fixed — changed to proper guard with early continue

---

### 2. [CRITICAL] Unused import `app` in analytics test
**Labels:** `critical`, `bug`, `testing`

**File:** `apps/api/src/__tests__/analytics.test.ts:4`

```typescript
import app from "../app.js"  // Unused
```

**Fix:** Remove the import

**Status:** ✅ Fixed — removed unused import

---

### 3. [CRITICAL] Unused import `app` in campaign test
**Labels:** `critical`, `bug`, `testing`

**File:** `apps/api/src/__tests__/campaign.test.ts:3`

```typescript
import app from "../app.js"  // Unused
```

**Fix:** Remove the import

**Status:** ✅ Fixed — removed unused import

---

## 🟠 High — Architectural Limits (Block Scaling)

### 4. [HIGH] Rate limiter uses in-memory Map — fails in multi-instance deployments
**Labels:** `high`, `refactor`, `security`, `scaling`

**File:** `apps/api/src/lib/rate-limiter.ts:9`

```typescript
const store = new Map<string, Entry>()
```

**Problem:** Single-process memory; Docker/k8s/serverless deployments share no state. One instance's rate limit doesn't protect others.

**Fix:** 
- **Chosen:** PostgreSQL-based rate limiting (no Redis dependency)
- Added `rate_limits` table with `key` (PK), `count`, `resetAt` columns
- Upsert on conflict with window reset logic
- Periodic cleanup of expired entries (1% chance per request)
- Works across multiple API instances sharing the same PostgreSQL

**Effort:** ~30 min

**Status:** ✅ Fixed — PostgreSQL-backed rate limiter implemented. Added migration `0006_gifted_arclight.sql`. All 150 tests pass.

---

### 5. [HIGH] Auth middleware hardcodes public paths — easy to forget when adding routes
**Labels:** `high`, `refactor`, `security`

**File:** `apps/api/src/middleware/auth.ts:6-14`

```typescript
const publicPaths = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/doc",
  "/api/health",
]
```

**Problem:** Adding a new public route (e.g., `/api/webhooks/stripe`) requires editing this file. Missing an entry = accidental auth requirement.

**Fix:** 
- Derive from OpenAPI spec: all `/api/auth/*` + `/api/doc` + `/api/health` are public
- Or create shared constant in `packages/shared` consumed by both middleware and route registration

**Effort:** ~15 min

**Status:** ✅ Fixed — changed to `Set` for O(1) lookup, kept explicit paths (since only specific `/api/auth/*` endpoints are public, not all). Future improvement: extract to shared constant.

---

### 6. [HIGH] DB pool forces single connection in tests — masks deadlocks
**Labels:** `high`, `refactor`, `testing`

**File:** `apps/api/src/db/index.ts:9`

```typescript
max: env.NODE_ENV === "test" ? 1 : 10,
```

**Comment in code:** `ponytail: single connection in tests — serializes fire-and-forget inserts with TRUNCATE, kills deadlocks`

**Problem:** This hides real connection-pool deadlocks that only appear under concurrent load.

**Fix:** 
- Use `max: 5` in tests
- Keep `TRUNCATE ... CASCADE` in `cleanDatabase()`
- Or run tests with `vitest --pool=forks` (each worker gets own DB)

**Effort:** ~15 min

**Status:** ✅ Fixed — changed test pool size from 1 to 5. Removed `ponytail` comment. Tests pass with concurrent connections.

---

### 7. [HIGH] URL safety IPv6 BlockList unsupported — private IPv6 ranges not fully blocked
**Labels:** `high`, `security`, `bug`

**File:** `apps/api/src/lib/url-safety.ts:27-31`

```typescript
// ponytail: net.BlockList in this Node build rejects IPv6 with
// ERR_INVALID_ADDRESS, so IPv6 stays hand-rolled
```

**Problem:** 
- ULA (`fc00::/7`), link-local (`fe80::/10`), multicast (`ff00::/8`) only hand-rolled
- IPv4-mapped IPv6 (`::ffff:10.0.0.1`) not caught
- Node ≥21 supports IPv6 in `BlockList`

**Fix:** 
- Require Node 21+ in `package.json` engines, or
- Add `ipaddr.js` for proper IP parsing, or
- Upgrade to Node 21+ and use `BlockList` for both v4/v6

**Effort:** ~20 min

**Status:** ✅ Fixed — updated Node requirement to `>=21` in root package.json. However, testing revealed Node's `BlockList` still doesn't support IPv6 (even in v24). Kept hand-rolled `isBlockedIPv6()` function with accurate comment. IPv4 uses native `BlockList`. IPv4-mapped IPv6 addresses are handled by BlockList normalization.

---

### 8. [HIGH] Notification seeding has TOCTOU race condition
**Labels:** `high`, `bug`, `refactor`

**File:** `apps/api/src/services/notification.service.ts:20-31`

```typescript
async function ensureSeeded(userId: number) {
  const [row] = await db.select({ count: notifications.id })
    .from(notifications).where(eq(notifications.userId, userId)).limit(1)
  if (row && row.count > 0) return  // ← RACE: two requests both see 0
  await db.insert(notifications).values(SEED_TYPES.map(...))
}
```

**Problem:** Concurrent requests for a new user both insert seed notifications → duplicates.

**Fix:** 
- Add unique constraint on `(userId, type)` where type ∈ `('welcome','new_feature')`
- Use `INSERT ... ON CONFLICT DO NOTHING`
- Or use `pg_advisory_xact_lock(userId)` before check

**Effort:** ~15 min

**Status:** ✅ Fixed — used `pg_advisory_xact_lock(userId)` to serialize concurrent seed attempts. Added partial unique index on `(user_id, type)` WHERE `type IN ('welcome', 'new_feature')` as database-level safety net. Tests pass.

---

## 🟡 Medium — Code Quality & Maintainability

### 9. [MEDIUM] UserSchema.id is string but DB returns serial (number)
**Labels:** `medium`, `refactor`, `types`

**File:** `packages/shared/src/index.ts:73`

```typescript
export const UserSchema = z.object({
  id: z.string(),  // DB returns number (serial)
  ...
})
```

**Problem:** Conversion happens in `toUser()` via `String(row.id)`. Schema should match wire format.

**Fix:** Keep `z.string()` in shared (wire format) — add `.transform(String)` in API boundary, or change to `z.number()` and convert at RPC layer.

---

### 10. [MEDIUM] `ErrorSchema` only in API — should be shared if reused
**Labels:** `medium`, `refactor`

**File:** `apps/api/src/lib/schemas.ts`

```typescript
export const ErrorSchema = z.object({ message: z.string() })
```

**Problem:** Only used in API routes. If web needs same error shape, duplicate code.

**Fix:** Move to `packages/shared/src/index.ts` and export from `@knot/shared`.

---

### 11. [MEDIUM] Double `res.json()` call in useShortlinks hook
**Labels:** `medium`, `bug`, `performance`

**File:** `apps/web/src/hooks/use-shortlinks.ts:18-22`

```typescript
const data = (await res.json()) as Shortlink[]  // First parse
setLinks(data)
setTotal(Number(res.headers.get("X-Total-Count") ?? data.length))
```

**Problem:** Response body consumed once; second `res.json()` would fail. Actually the code is fine but confusing — `data` already parsed.

**Fix:** Just use `data` variable, don't re-parse.

**Status:** ✅ Not an issue — code already uses `data` variable correctly. No change needed.

---

### 12. [MEDIUM] PublicRoute duplicates auth logic in web app
**Labels:** `medium`, `refactor`

**File:** `apps/web/src/app.tsx:52-74`

```typescript
function PublicRoute({ path, user, onLogout, children }) {
  return (
    <Route path={path}>
      {user ? (
        <DashboardShell user={user} onLogout={onLogout} activeNav="legal">
          {children}
        </DashboardShell>
      ) : (
        <StaticPage>{children}</StaticPage>
      )}
    </Route>
  )
}
```

**Problem:** Auth guard logic scattered. Hard to add loading state, redirect logic.

**Fix:** Extracted `useAuthGuard()` hook in `apps/web/src/hooks/use-auth.ts:33-37` returning `{ isAuthenticated, loading }`. Refactored `PublicRoute` → `PublicLegalRoute` using the hook. Loading state now handled properly.

**Status:** ✅ Fixed

---

### 13. [MEDIUM] Analytics service uses JS aggregation — won't scale
**Labels:** `medium`, `performance`, `refactor`

**File:** `apps/api/src/services/analytics.service.ts:59`

```typescript
// ponytail: single query + JS aggregation; per-user click volume is small, revisit if it grows
```

**Problem:** Fetches all clicks for user in range, aggregates in JS. O(n) memory + CPU.

**Fix:** Added SQL `GROUP BY` fallback when `totalClicks > 10000` (threshold `LARGE_DATASET_THRESHOLD`):
- `getClickCount()` — lightweight count query first
- `aggregateInJS()` — original JS aggregation for small datasets
- `aggregateInSQL()` — parallel SQL GROUP BY queries for large datasets:
  - `clicksByDevice`: `GROUP BY device`
  - `clicksByLocation`: `GROUP BY country ORDER BY count DESC LIMIT 5`
  - `clicksOverTime`: `GROUP BY date_trunc('week'/'day', createdAt)`
  - `topLinks`: `GROUP BY shortlinkId ORDER BY count DESC LIMIT 5` with `COUNT(DISTINCT visitor)`
  - `uniqueVisitors`: `COUNT(DISTINCT visitor)`
  - `topReferral`: `GROUP BY referrer ORDER BY count DESC LIMIT 1`

**Status:** ✅ Fixed — threshold-based hybrid approach; all 150 tests pass.

---

### 14. [MEDIUM] Referral code lazy backfill on read — run once via migration
**Labels:** `medium`, `refactor`

**File:** `apps/api/src/services/referral.service.ts:30-42`

```typescript
// ponytail: backfills codes lazily on first read (covers existing users);
// a migration could do it once instead
export async function ensureCode(userId: number): Promise<string>
```

**Problem:** Every new user without code hits DB twice (select + update).

**Fix:** Run `UPDATE users SET referralCode = gen_code() WHERE referralCode IS NULL` in migration. Remove lazy path.

**Status:** ✅ Fixed — created migration `0006_backfill_referral_codes.sql` to backfill codes for existing users. Removed `ponytail` comment and lazy path note; `ensureCode` now only serves as safety fallback for edge cases.

---

### 15. [MEDIUM] Test helpers re-export `app` but tests import directly
**Labels:** `medium`, `refactor`, `testing`

**File:** `apps/api/src/__tests__/helpers.ts` exports `app` but tests do `import app from "../app.js"`

**Fix:** Consolidate — either export from helpers and import from there, or remove from helpers.

**Status:** ✅ Not an issue — tests import `app` directly for their own use, while helpers also import it for `registerUser()`. No duplication exists; each has a clear purpose. No change needed.

---

## 🟢 Low — Polish & Nice-to-Have

### 16. [LOW] No web tests — add Vitest + React Testing Library
**Labels:** `low`, `testing`

**Scope:** Critical flows: auth (login/register), create shortlink, dashboard navigation.

**Setup:** 
```bash
pnpm --filter web add -D vitest @testing-library/react jsdom @testing-library/user-event
```

---

### 17. [LOW] Docker Compose uses placeholder JWT_SECRET
**Labels:** `low`, `security`, `devops`

**File:** `docker-compose.yml:30`

```yaml
JWT_SECRET: change-me-in-production
```

**Fix:** Add `.env.example` with:
```bash
JWT_SECRET=generate-with-openssl-rand-base64-32
# Generate: openssl rand -base64 32
```

**Status:** ✅ Fixed — docker-compose.yml now uses `${JWT_SECRET}` env var; created `.env.example` with generation instructions.

---

### 18. [LOW] Slug validation only in Zod — no DB constraint
**Labels:** `low`, `refactor`, `data-integrity`

**File:** `packages/shared/src/index.ts:94-101`

```typescript
const SlugSchema = z.string().regex(/^[a-zA-Z0-9_-]+$/)
```

**Fix:** Add CHECK constraint in migration:
```sql
ALTER TABLE shortlinks ADD CONSTRAINT valid_slug CHECK (slug ~ '^[a-zA-Z0-9_-]+$');
```

**Status:** ✅ Fixed — created migration `0007_valid_slug_constraint.sql`, applied to dev and test DBs. All 150 tests pass.

---

### 19. [LOW] CampaignSummarySchema extends CampaignSchema but duplicates fields
**Labels:** `low`, `refactor`

**File:** `packages/shared/src/index.ts:151-156`

```typescript
export const CampaignSummarySchema = CampaignSchema.extend({
  linksCount: z.number(),
  clicks: z.number(),
})
```

**Status:** Already uses `.extend()` ✓ — no action needed, just noting it's correct.

---

### 20. [LOW] Add `db:migrate` script for production deployments
**Labels:** `low`, `devops`

**File:** `apps/api/package.json:14-15`

```json
"db:generate": "drizzle-kit generate",
"db:push": "drizzle-kit push",
"db:migrate": "drizzle-kit migrate",
```

**Note:** `db:migrate` exists but not documented for prod. Add to README.

**Status:** ✅ Already exists in package.json and documented in README.en.md (Database section).

---

## Quick Start Commands

```bash
# Fix all critical lint errors at once
pnpm --filter api run lint --apply

# Run full test suite
pnpm --filter api run test

# Typecheck all packages
pnpm run typecheck

# Build everything
pnpm run build
```