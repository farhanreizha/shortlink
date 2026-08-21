import type {
  CreateShortlink,
  Shortlink,
  ShortlinkQuery,
  UpdateShortlink,
} from "@knot/shared"
import { and, desc, eq, ilike, or, sql } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { db } from "../db/index.js"
import { campaigns, shortlinks } from "../db/schema.js"
import { hashPassword, verifyPassword } from "../lib/auth.js"
import { isBlockedRedirectUrl } from "../lib/url-safety.js"
import * as referralService from "./referral.service.js"

async function assertCampaignOwned(campaignId: number, userId: number) {
  const [campaign] = await db
    .select({ id: campaigns.id })
    .from(campaigns)
    .where(and(eq(campaigns.id, campaignId), eq(campaigns.userId, userId)))
    .limit(1)
  if (!campaign) throw new HTTPException(400, { message: "Invalid campaign" })
}

function toShortlink(row: typeof shortlinks.$inferSelect): Shortlink {
  return {
    id: String(row.id),
    slug: row.slug,
    url: row.url,
    visits: row.visits,
    campaignId: row.campaignId === null ? null : String(row.campaignId),
    expiresAt: row.expiresAt === null ? null : row.expiresAt.toISOString(),
    hasPassword: row.password !== null,
    title: row.title,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}

const sortMap = {
  createdAt: () => desc(shortlinks.createdAt),
  visits: () => desc(shortlinks.visits),
} as const

export async function list(userId: number, query: ShortlinkQuery) {
  let conditions = eq(shortlinks.userId, userId)
  if (query.q) {
    const pattern = `%${query.q}%`
    // biome-ignore lint/style/noNonNullAssertion: conditions always defined
    conditions = and(
      conditions,
      or(
        ilike(shortlinks.url, pattern),
        ilike(shortlinks.slug, pattern),
        ilike(shortlinks.title, pattern),
        ilike(shortlinks.description, pattern),
      ),
    )!
  }
  if (query.campaignId !== undefined) {
    // biome-ignore lint/style/noNonNullAssertion: conditions always defined
    conditions = and(conditions, eq(shortlinks.campaignId, query.campaignId))!
  }

  const [rows, [countRow]] = await Promise.all([
    db
      .select()
      .from(shortlinks)
      .where(conditions)
      .orderBy(sortMap[query.sortBy]())
      .limit(query.limit)
      .offset(query.offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(shortlinks)
      .where(conditions),
  ])

  return { items: rows.map(toShortlink), total: Number(countRow?.count ?? 0) }
}

export async function getDetail(slug: string, userId: number) {
  const [link] = await db
    .select()
    .from(shortlinks)
    .where(and(eq(shortlinks.slug, slug), eq(shortlinks.userId, userId)))
    .limit(1)
  if (!link) throw new HTTPException(404, { message: "Shortlink not found" })
  return toShortlink(link)
}

export async function create(input: CreateShortlink, userId: number) {
  const blocked = isBlockedRedirectUrl(input.url)
  if (blocked) throw new HTTPException(400, { message: blocked })

  const [existing] = await db
    .select()
    .from(shortlinks)
    .where(eq(shortlinks.slug, input.slug))
    .limit(1)
  if (existing) throw new HTTPException(409, { message: "Slug already taken" })

  if (input.campaignId != null) {
    await assertCampaignOwned(input.campaignId, userId)
  }

  const rows = await db
    .insert(shortlinks)
    .values({
      slug: input.slug,
      url: input.url,
      userId,
      ...(input.campaignId !== undefined && input.campaignId !== null
        ? { campaignId: input.campaignId }
        : {}),
      ...(input.expiresAt !== undefined && input.expiresAt !== null
        ? { expiresAt: new Date(input.expiresAt) }
        : {}),
      ...(input.password
        ? { password: await hashPassword(input.password) }
        : {}),
      ...(input.title ? { title: input.title } : {}),
      ...(input.description ? { description: input.description } : {}),
    })
    .returning()
  // biome-ignore lint/style/noNonNullAssertion: returning() always returns inserted row
  const row = rows[0]!
  await referralService.creditReferrer(userId)
  return toShortlink(row)
}

export async function getBySlug(slug: string) {
  const [link] = await db
    .select()
    .from(shortlinks)
    .where(eq(shortlinks.slug, slug))
    .limit(1)
  if (!link) throw new HTTPException(404, { message: "Not found" })
  return link
}

// QR generation needs only ownership + existence, not the full row
export async function getOwnedIdBySlug(
  slug: string,
  userId: number,
): Promise<number> {
  const [link] = await db
    .select({ id: shortlinks.id })
    .from(shortlinks)
    .where(and(eq(shortlinks.slug, slug), eq(shortlinks.userId, userId)))
    .limit(1)
  if (!link) throw new HTTPException(404, { message: "Shortlink not found" })
  return link.id
}

export async function verifyLinkPassword(slug: string, password: string) {
  const [link] = await db
    .select({ password: shortlinks.password })
    .from(shortlinks)
    .where(eq(shortlinks.slug, slug))
    .limit(1)
  if (!link?.password) return false
  return verifyPassword(password, link.password)
}

export async function update(
  slug: string,
  userId: number,
  input: UpdateShortlink,
) {
  const [link] = await db
    .select()
    .from(shortlinks)
    .where(and(eq(shortlinks.slug, slug), eq(shortlinks.userId, userId)))
    .limit(1)
  if (!link) throw new HTTPException(404, { message: "Shortlink not found" })

  if (input.url) {
    const blocked = isBlockedRedirectUrl(input.url)
    if (blocked) throw new HTTPException(400, { message: blocked })
  }

  if (input.slug && input.slug !== slug) {
    const [existing] = await db
      .select()
      .from(shortlinks)
      .where(eq(shortlinks.slug, input.slug))
      .limit(1)
    if (existing)
      throw new HTTPException(409, { message: "Slug already taken" })
  }

  if (input.campaignId != null) {
    await assertCampaignOwned(input.campaignId, userId)
  }

  const rows = await db
    .update(shortlinks)
    .set({
      ...(input.slug !== undefined ? { slug: input.slug } : {}),
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.campaignId !== undefined
        ? { campaignId: input.campaignId }
        : {}),
      ...(input.expiresAt !== undefined
        ? {
            expiresAt:
              input.expiresAt === null ? null : new Date(input.expiresAt),
          }
        : {}),
      ...(input.password !== undefined
        ? {
            password:
              input.password === null
                ? null
                : await hashPassword(input.password),
          }
        : {}),
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(shortlinks.slug, slug), eq(shortlinks.userId, userId)))
    .returning()
  // biome-ignore lint/style/noNonNullAssertion: returning() always returns updated row
  return toShortlink(rows[0]!)
}

export async function incrementVisits(slug: string) {
  await db
    .update(shortlinks)
    .set({ visits: sql`${shortlinks.visits} + 1` })
    .where(eq(shortlinks.slug, slug))
}

export async function remove(slug: string, userId: number) {
  const [link] = await db
    .select()
    .from(shortlinks)
    .where(and(eq(shortlinks.slug, slug), eq(shortlinks.userId, userId)))
    .limit(1)
  if (!link) throw new HTTPException(404, { message: "Shortlink not found" })

  await db.delete(shortlinks).where(eq(shortlinks.slug, slug))
  return toShortlink(link)
}

export async function bulkRemove(slugs: string[], userId: number) {
  const deleted = await db
    .delete(shortlinks)
    .where(
      and(
        eq(shortlinks.userId, userId),
        sql`${shortlinks.slug} IN (${sql.join(
          slugs.map((s) => sql`${s}`),
          sql`, `,
        )})`,
      ),
    )
    .returning()
  return deleted.length
}

export async function bulkAssignCampaign(
  slugs: string[],
  campaignId: number | null,
  userId: number,
) {
  if (campaignId != null) {
    await assertCampaignOwned(campaignId, userId)
  }
  const rows = await db
    .update(shortlinks)
    .set({ campaignId, updatedAt: new Date() })
    .where(
      and(
        eq(shortlinks.userId, userId),
        sql`${shortlinks.slug} IN (${sql.join(
          slugs.map((s) => sql`${s}`),
          sql`, `,
        )})`,
      ),
    )
    .returning()
  return rows.length
}
