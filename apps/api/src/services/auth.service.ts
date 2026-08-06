import type { LoginInput, RegisterInput, UpdateUser, User } from "@knot/shared"
import { eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { db } from "../db/index.js"
import { shortlinks, users } from "../db/schema.js"
import { hashPassword, signToken, verifyPassword } from "../lib/auth.js"

function toUser(row: typeof users.$inferSelect): User {
  return {
    id: String(row.id),
    username: row.username,
    email: row.email,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function register(input: RegisterInput) {
  const [byEmail] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1)
  if (byEmail)
    throw new HTTPException(409, { message: "Email already registered" })

  const [byUsername] = await db
    .select()
    .from(users)
    .where(eq(users.username, input.username))
    .limit(1)
  if (byUsername)
    throw new HTTPException(409, { message: "Username already taken" })

  const hashed = await hashPassword(input.password)
  const rows = await db
    .insert(users)
    .values({
      username: input.username,
      email: input.email,
      password: hashed,
    })
    .returning()
  // biome-ignore lint/style/noNonNullAssertion: returning() always returns inserted row
  const row = rows[0]!
  const token = await signToken(row.id)
  return { token, user: toUser(row) }
}

export async function login(input: LoginInput) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1)
  if (!row || !(await verifyPassword(input.password, row.password))) {
    throw new HTTPException(401, { message: "Invalid email or password" })
  }
  const token = await signToken(row.id)
  return { token, user: toUser(row) }
}

export async function getMe(userId: number) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!row) throw new HTTPException(401, { message: "User not found" })
  return toUser(row)
}

export async function updateUser(userId: number, input: UpdateUser) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!row) throw new HTTPException(401, { message: "User not found" })

  const updates: Partial<typeof users.$inferInsert> = {}

  if (input.email && input.email !== row.email) {
    const [byEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1)
    if (byEmail)
      throw new HTTPException(409, { message: "Email already in use" })
    updates.email = input.email
  }

  if (input.newPassword) {
    if (!input.currentPassword) {
      throw new HTTPException(401, { message: "Current password is required" })
    }
    if (!(await verifyPassword(input.currentPassword, row.password))) {
      throw new HTTPException(401, { message: "Current password is incorrect" })
    }
    updates.password = await hashPassword(input.newPassword)
  }

  if (Object.keys(updates).length === 0) return toUser(row)

  const [updated] = await db
    .update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .returning()
  // biome-ignore lint/style/noNonNullAssertion: returning() always returns updated row
  return toUser(updated!)
}

export async function deleteAccount(userId: number) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!row) throw new HTTPException(401, { message: "User not found" })

  await db.delete(shortlinks).where(eq(shortlinks.userId, userId))
  await db.delete(users).where(eq(users.id, userId))
}
