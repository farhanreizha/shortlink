import net from "node:net"
import type { Context, Next } from "hono"

interface Entry {
  count: number
  resetTime: number
}

const store = new Map<string, Entry>()

export function resetRateLimitStore() {
  store.clear()
}

// Trust only headers set by our reverse proxy (nginx sets X-Real-IP and
// X-Forwarded-For for every proxied request); reject spoofed values that
// are not valid IPs. Falls back to a shared bucket when neither is present
// (e.g. direct API access in dev) — ponytail: per-account limits if the
// API is ever reachable without the proxy.
function clientKey(c: Context): string {
  for (const header of ["x-forwarded-for", "x-real-ip"]) {
    const value = c.req.header(header)?.split(",")[0]?.trim()
    if (value && net.isIP(value)) return value
  }
  return "unknown"
}

export function rateLimit(opts: { windowMs: number; max: number }) {
  return async (c: Context, next: Next) => {
    const key = clientKey(c)
    const now = Date.now()
    const entry = store.get(key)
    const current: Entry =
      !entry || now >= entry.resetTime
        ? { count: 1, resetTime: now + opts.windowMs }
        : entry

    c.header("X-RateLimit-Limit", String(opts.max))
    c.header(
      "X-RateLimit-Remaining",
      String(Math.max(0, opts.max - current.count)),
    )

    if (current.count > opts.max) {
      c.header(
        "Retry-After",
        String(Math.ceil((current.resetTime - now) / 1000)),
      )
      return c.json(
        { message: "Too many requests. Please try again later." },
        429,
      )
    }

    current.count++
    store.set(key, current)
    return next()
  }
}
