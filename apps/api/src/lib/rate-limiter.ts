import net from "node:net"
import { sql } from "drizzle-orm"
import type { Context, Next } from "hono"
import { db } from "../db/index.js"
import { rateLimits } from "../db/schema.js"

export function resetRateLimitStore() {
  // No-op for PostgreSQL-backed rate limiter; tests use cleanDatabase()
}

// Trust only headers set by our reverse proxy (nginx sets X-Real-IP and
// X-Forwarded-For for every proxied request); reject spoofed values that
// are not valid IPs. Without a client IP (direct access, e.g. dev via the
// vite proxy) rate limiting is skipped — a shared fallback bucket would
// let one client lock out every other client at once.
function clientKey(c: Context): string | null {
  for (const header of ["x-forwarded-for", "x-real-ip"]) {
    const value = c.req.header(header)?.split(",")[0]?.trim()
    if (value && net.isIP(value)) return value
  }
  return null
}

async function cleanupExpired() {
  // Periodically clean up expired entries (fire-and-forget)
  await db.delete(rateLimits).where(sql`${rateLimits.resetAt} < now()`)
}

export function rateLimit(opts: {
  scope: string
  windowMs: number
  max: number
}) {
  return async (c: Context, next: Next) => {
    const ip = clientKey(c)
    if (!ip) return next()
    const key = `${opts.scope}:${ip}`

    const now = new Date()
    const resetAt = new Date(now.getTime() + opts.windowMs)

    // Upsert: insert new or increment existing
    const result = await db
      .insert(rateLimits)
      .values({ key, count: 1, resetAt })
      .onConflictDoUpdate({
        target: rateLimits.key,
        set: {
          count: sql`CASE
            WHEN ${rateLimits.resetAt} < ${now} THEN 1
            ELSE ${rateLimits.count} + 1
          END`,
          resetAt: sql`CASE
            WHEN ${rateLimits.resetAt} < ${now} THEN ${resetAt}
            ELSE ${rateLimits.resetAt}
          END`,
        },
      })
      .returning({ count: rateLimits.count, resetAt: rateLimits.resetAt })

    const row = result[0]
    if (!row) return next()
    const { count, resetAt: currentResetAt } = row

    c.header("X-RateLimit-Limit", String(opts.max))
    c.header("X-RateLimit-Remaining", String(Math.max(0, opts.max - count)))

    if (count > opts.max) {
      const retryAfter = Math.ceil(
        (currentResetAt.getTime() - now.getTime()) / 1000,
      )
      c.header("Retry-After", String(retryAfter))
      return c.json(
        { message: "Too many requests. Please try again later." },
        429,
      )
    }

    // Periodic cleanup (1% chance per request)
    if (Math.random() < 0.01) cleanupExpired()

    return next()
  }
}
