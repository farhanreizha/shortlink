import type {
  Campaign,
  CampaignQuery,
  CampaignSummary,
  CreateCampaign,
  UpdateCampaign,
} from "@knot/shared"
import { and, count, desc, eq, ilike, sql } from "drizzle-orm"
import { HTTPException } from "hono/http-exception"
import { db } from "../db/index.js"
import { campaigns, shortlinks } from "../db/schema.js"

function toCampaign(row: typeof campaigns.$inferSelect): Campaign {
  return {
    id: String(row.id),
    name: row.name,
    description: row.description,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }
}

export async function list(
  userId: number,
  query: CampaignQuery,
): Promise<CampaignSummary[]> {
  let conditions = eq(campaigns.userId, userId)
  if (query.status) {
    // biome-ignore lint/style/noNonNullAssertion: conditions always defined
    conditions = and(conditions, eq(campaigns.status, query.status))!
  }
  if (query.q) {
    // biome-ignore lint/style/noNonNullAssertion: conditions always defined
    conditions = and(conditions, ilike(campaigns.name, `%${query.q}%`))!
  }

  const rows = await db
    .select({
      id: campaigns.id,
      name: campaigns.name,
      description: campaigns.description,
      status: campaigns.status,
      createdAt: campaigns.createdAt,
      linksCount: count(shortlinks.id),
      clicks: sql<number>`coalesce(sum(${shortlinks.visits}), 0)`,
    })
    .from(campaigns)
    .leftJoin(shortlinks, eq(shortlinks.campaignId, campaigns.id))
    .where(conditions)
    .groupBy(campaigns.id)
    .orderBy(desc(campaigns.createdAt))

  return rows.map((r) => ({
    id: String(r.id),
    name: r.name,
    description: r.description,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    linksCount: Number(r.linksCount),
    clicks: Number(r.clicks),
  }))
}

export async function create(input: CreateCampaign, userId: number) {
  const rows = await db
    .insert(campaigns)
    .values({
      name: input.name,
      description: input.description ?? "",
      status: input.status ?? "active",
      userId,
    })
    .returning()
  // biome-ignore lint/style/noNonNullAssertion: returning() always returns inserted row
  return toCampaign(rows[0]!)
}

export async function update(
  id: number,
  userId: number,
  input: UpdateCampaign,
) {
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
    .limit(1)
  if (!campaign) throw new HTTPException(404, { message: "Campaign not found" })

  const rows = await db
    .update(campaigns)
    .set({
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
    })
    .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
    .returning()
  // biome-ignore lint/style/noNonNullAssertion: returning() always returns updated row
  return toCampaign(rows[0]!)
}

export async function remove(id: number, userId: number) {
  const [campaign] = await db
    .select()
    .from(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
    .limit(1)
  if (!campaign) throw new HTTPException(404, { message: "Campaign not found" })

  await db
    .delete(campaigns)
    .where(and(eq(campaigns.id, id), eq(campaigns.userId, userId)))
  return { message: "Campaign deleted" }
}
