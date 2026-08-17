import { createHash, randomBytes } from "node:crypto"
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateUser,
  User,
} from "@knot/shared"
import { eq } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { env } from "../config.js"
import { db } from "../db/index.js"
import { campaigns, shortlinks, users } from "../db/schema.js"
import { hashPassword, signToken, verifyPassword } from "../lib/auth.js"
import { sendPasswordReset, sendVerificationEmail } from "../lib/mailer.js"
import * as referralService from "./referral.service.js"

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000

// PostgreSQL error code for unique_violation
function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  )
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

function toUser(row: typeof users.$inferSelect): User {
  return {
    id: String(row.id),
    username: row.username,
    email: row.email,
    emailVerified: row.emailVerified,
    notificationPrefs: row.notificationPrefs,
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
  const referralCode = await referralService.generateUniqueCode()
  let referrerId: number | undefined
  if (input.ref) {
    const referrer = await referralService.findByCode(input.ref)
    if (referrer) referrerId = referrer.id
  }
  const rows = await db
    .insert(users)
    .values({
      username: input.username,
      email: input.email,
      password: hashed,
      referralCode,
      ...(referrerId !== undefined ? { referrerId } : {}),
    })
    .returning()
    .catch((err: unknown) => {
      // unique violation race between pre-check and insert → 409, not 500
      if (isUniqueViolation(err)) {
        throw new HTTPException(409, {
          message: "Email or username already taken",
        })
      }
      throw err
    })
  // biome-ignore lint/style/noNonNullAssertion: returning() always returns inserted row
  const row = rows[0]!
  await issueVerificationToken(row.id, row.email)
  const token = await signToken(row.id)
  return {
    token,
    user: toUser(row),
    referrerApplied: referrerId !== undefined,
  }
}

// Token is stored hashed (same pattern as password reset) and is single-use;
// verifyEmail() clears it, so a used link can't be replayed
async function issueVerificationToken(userId: number, email: string) {
  const token = randomBytes(32).toString("base64url")
  await db
    .update(users)
    .set({
      emailVerified: false,
      emailVerificationToken: hashToken(token),
    })
    .where(eq(users.id, userId))
  const verifyUrl = `${env.APP_URL}/verify-email?token=${token}`
  await sendVerificationEmail(email, verifyUrl)
}

export async function verifyEmail(token: string) {
  const [row] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.emailVerificationToken, hashToken(token)))
    .limit(1)
  if (!row) throw new HTTPException(400, { message: "Invalid token" })
  await db
    .update(users)
    .set({ emailVerified: true, emailVerificationToken: null })
    .where(eq(users.id, row.id))
}

export async function resendVerification(userId: number) {
  const [row] = await db
    .select({ email: users.email, verified: users.emailVerified })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!row) throw new HTTPException(401, { message: "User not found" })
  if (row.verified) {
    throw new HTTPException(400, { message: "Email already verified" })
  }
  await issueVerificationToken(userId, row.email)
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

  if (input.notificationPrefs) {
    updates.notificationPrefs = input.notificationPrefs
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

export async function deleteAccount(userId: number, password: string) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (!row) throw new HTTPException(401, { message: "User not found" })
  if (!(await verifyPassword(password, row.password))) {
    throw new HTTPException(401, { message: "Current password is incorrect" })
  }

  await db.delete(campaigns).where(eq(campaigns.userId, userId))
  await db.delete(shortlinks).where(eq(shortlinks.userId, userId))
  await db.delete(users).where(eq(users.id, userId))
}

export async function requestPasswordReset(input: ForgotPasswordInput) {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1)
  if (!row) return { resetUrl: undefined }

  const token = randomBytes(32).toString("base64url")
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS)
  await db
    .update(users)
    .set({ resetTokenHash: hashToken(token), resetTokenExpiresAt: expiresAt })
    .where(eq(users.id, row.id))

  const resetUrl = `${env.APP_URL}/reset-password?token=${token}`
  const sent = await sendPasswordReset(row.email, resetUrl)
  // ponytail: leak resetUrl only outside production (dev/test need it); never in prod
  return {
    resetUrl:
      sent || process.env.NODE_ENV === "production" ? undefined : resetUrl,
  }
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashToken(input.token)
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.resetTokenHash, tokenHash))
    .limit(1)
  if (
    !row?.resetTokenExpiresAt ||
    row.resetTokenExpiresAt.getTime() <= Date.now()
  ) {
    throw new HTTPException(400, {
      message: "Reset link is invalid or expired",
    })
  }

  const lower = input.password.toLowerCase()
  const parts = [row.username, row.email.split("@")[0]].filter(
    (part): part is string => part !== undefined && part !== "",
  )
  if (parts.some((part) => lower.includes(part.toLowerCase()))) {
    throw new HTTPException(400, {
      message: "Password must not contain your username or email",
    })
  }

  await db
    .update(users)
    .set({
      password: await hashPassword(input.password),
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    })
    .where(eq(users.id, row.id))
}
