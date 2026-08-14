import type { Context, Next } from "hono"
import { getCookie } from "hono/cookie"
import { HTTPException } from "hono/http-exception"
import { verifyToken } from "../lib/auth.js"

// Public endpoints that don't require authentication
const PUBLIC_PATHS = new Set([
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/doc",
  "/api/health",
])

export async function authMiddleware(
  c: Context<{ Variables: { userId: number } }>,
  next: Next,
) {
  if (PUBLIC_PATHS.has(c.req.path)) return next()

  const token = getCookie(c, "token")
  if (!token) throw new HTTPException(401, { message: "Unauthorized" })

  try {
    const payload = await verifyToken(token)
    c.set("userId", Number(payload.sub))
    return next()
  } catch {
    throw new HTTPException(401, { message: "Invalid token" })
  }
}
