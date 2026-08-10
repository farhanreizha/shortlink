import type { MiddlewareHandler } from "hono"

export const securityHeaders: MiddlewareHandler = async (c, next) => {
  await next()
  c.header("X-Content-Type-Options", "nosniff")
  c.header("X-Frame-Options", "DENY")
  if (!c.res.headers.has("Referrer-Policy")) {
    c.header("Referrer-Policy", "strict-origin-when-cross-origin")
  }
  c.header(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  )
  c.header(
    "Content-Security-Policy",
    c.req.path.startsWith("/api/docs")
      ? "default-src 'none'; script-src 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' data:; connect-src 'self'; font-src https://cdn.jsdelivr.net data:; frame-ancestors 'none'"
      : "default-src 'none'; frame-ancestors 'none'",
  )
  c.header("Cross-Origin-Opener-Policy", "same-origin")
}
