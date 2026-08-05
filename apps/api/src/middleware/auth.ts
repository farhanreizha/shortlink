import type { Context, Next } from "hono"
import { getCookie } from "hono/cookie"
import { verifyToken } from "../lib/auth"
import { UnauthorizedError } from "../lib/errors"

const publicPaths = [
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/doc",
  "/api/health",
]

export async function authMiddleware(
  c: Context<{ Variables: { userId: number } }>,
  next: Next,
) {
  if (publicPaths.includes(c.req.path)) return next()

  const token = getCookie(c, "token")
  if (!token) throw new UnauthorizedError()

  try {
    const payload = await verifyToken(token)
    c.set("userId", Number(payload.sub))
    return next()
  } catch {
    throw new UnauthorizedError("Invalid token")
  }
}
