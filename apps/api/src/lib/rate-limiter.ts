import type { Context, Next } from "hono"
import { HTTPException } from "hono/http-exception"

interface Entry {
  count: number
  resetTime: number
}

const store = new Map<string, Entry>()
const MAX_STORE_SIZE = 10000

export function resetRateLimitStore() {
  store.clear()
}

function cleanExpired() {
  if (store.size < MAX_STORE_SIZE) return
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now >= entry.resetTime) store.delete(key)
  }
}

export function rateLimit(opts: { windowMs: number; max: number }) {
  return async (c: Context, next: Next) => {
    const ip =
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
    const now = Date.now()
    const entry = store.get(ip)

    if (!entry || now >= entry.resetTime) {
      store.set(ip, { count: 1, resetTime: now + opts.windowMs })
      cleanExpired()
      return next()
    }

    if (entry.count >= opts.max) {
      throw new HTTPException(429, {
        message: "Too many requests. Please try again later.",
      })
    }

    entry.count++
    return next()
  }
}
