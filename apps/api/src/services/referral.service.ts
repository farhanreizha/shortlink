import type { Referral } from "@knot/shared"
import { desc, eq, sql } from "drizzle-orm"
import { db } from "../db/index.js"
import { notifications, users } from "../db/schema.js"

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const CODE_LENGTH = 8

function randomCode(): string {
  let code = ""
  for (let i = 0; i < CODE_LENGTH; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  }
  return code
}

export async function generateUniqueCode(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode()
    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.referralCode, code))
      .limit(1)
    if (!existing) return code
  }
  throw new Error("Failed to generate a unique referral code")
}

// ponytail: backfills codes lazily on first read (covers existing users);
// a migration could do it once instead
export async function ensureCode(userId: number): Promise<string> {
  const [user] = await db
    .select({ referralCode: users.referralCode })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)
  if (user?.referralCode) return user.referralCode
  const code = await generateUniqueCode()
  await db.update(users).set({ referralCode: code }).where(eq(users.id, userId))
  return code
}

export async function findByCode(code: string) {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.referralCode, code))
    .limit(1)
  return user ?? null
}

export async function getOverview(userId: number): Promise<Referral> {
  const code = await ensureCode(userId)
  const [user] = await db
    .select({ proUntil: users.proUntil })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1)

  const referred = await db
    .select()
    .from(users)
    .where(eq(users.referrerId, userId))
    .orderBy(desc(users.createdAt))

  const rewarded = referred.filter((u) => u.referralRewarded).length

  return {
    code,
    proUntil: user?.proUntil?.toISOString() ?? null,
    stats: { referred: referred.length, rewarded, proMonths: rewarded },
    referredUsers: referred.map((u) => ({
      id: String(u.id),
      username: u.username,
      createdAt: u.createdAt.toISOString(),
      rewarded: u.referralRewarded,
    })),
  }
}

// ponytail: rewards once per invitee (referralRewarded flag); anti-abuse
// (self-referral via duplicate email) deferred until real billing exists
export async function creditReferrer(inviteeId: number) {
  await db.transaction(async (tx) => {
    const [invitee] = await tx
      .select()
      .from(users)
      .where(eq(users.id, inviteeId))
      .limit(1)
    if (!invitee?.referrerId || invitee.referralRewarded) return

    await tx
      .update(users)
      .set({ referralRewarded: true })
      .where(eq(users.id, inviteeId))

    await tx
      .update(users)
      .set({
        proUntil: sql`coalesce(greatest(${users.proUntil}, now()), now()) + interval '30 days'`,
      })
      .where(eq(users.id, invitee.referrerId))

    await tx.insert(notifications).values({
      userId: invitee.referrerId,
      type: "referral",
      data: { username: invitee.username },
    })
  })
}
