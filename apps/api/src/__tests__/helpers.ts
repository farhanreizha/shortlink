import { sql } from "drizzle-orm"
import app from "../app.js"
import { db } from "../db/index.js"
import { resetRateLimitStore } from "../lib/rate-limiter.js"

interface TestUser {
  id: number
  username: string
  email: string
}

export interface AuthResult {
  token: string
  user: TestUser
}

export async function cleanDatabase() {
  resetRateLimitStore()
  await db.execute(
    sql`TRUNCATE TABLE shortlinks, campaigns, notifications, users RESTART IDENTITY CASCADE`,
  )
}

function parseSetCookie(cookie: string): string {
  const match = cookie.match(/^token=([^;]+)/)
  return match?.[1] ?? ""
}

export async function registerUser(
  overrides: Partial<{
    email: string
    username: string
    password: string
    ref: string
  }> = {},
): Promise<AuthResult> {
  const res = await app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `test-${Date.now()}@test.com`,
      username: `user-${Date.now()}`,
      password: "Test1234",
      ...overrides,
    }),
  })
  const user = (await res.json()) as TestUser
  const cookie = res.headers.get("Set-Cookie") ?? ""
  const token = cookie ? parseSetCookie(cookie) : ""
  return { token, user }
}

export function authedRequest(token: string, path: string, init?: RequestInit) {
  return app.request(path, {
    ...init,
    headers: {
      ...init?.headers,
      Cookie: `token=${token}`,
      "Content-Type": "application/json",
    },
  })
}
