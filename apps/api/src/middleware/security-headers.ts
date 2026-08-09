import type { MiddlewareHandler } from "hono"

export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await next()
  c.header("X-Content-Type-Options", "nosniff")
  c.header("X-Frame-Options", "DENY")
  c.header("Referrer-Policy", "strict-origin-when-cross-origin")
  c.header(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  )
  c.header(
    "Content-Security-Policy",
    "default-src 'none'; frame-ancestors 'none'",
  )
  c.header("Cross-Origin-Opener-Policy", "same-origin")
}
