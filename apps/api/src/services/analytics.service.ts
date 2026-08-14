import type { AnalyticsOverview, AnalyticsQuery } from "@knot/shared"
import { and, count, eq, gt, lte, sql } from "drizzle-orm"
import { db } from "../db/index.js"
import { clicks, shortlinks } from "../db/schema.js"

const LARGE_DATASET_THRESHOLD = 10000

function resolveRange(query: AnalyticsQuery): { start: Date; end: Date } {
  const now = new Date()
  if (query.range === "7d")
    return { start: new Date(now.getTime() - 7 * 864e5), end: now }
  if (query.range === "30d")
    return { start: new Date(now.getTime() - 30 * 864e5), end: now }
  if (query.range === "month")
    return {
      start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)),
      end: now,
    }
  return {
    start: new Date(`${query.start ?? "1970-01-01"}T00:00:00`),
    end: new Date(`${query.end ?? "2999-12-31"}T23:59:59`),
  }
}

function mode(values: string[]): string | null {
  const counts = new Map<string, number>()
  let best: string | null = null
  let bestCount = 0
  for (const v of values) {
    const n = (counts.get(v) ?? 0) + 1
    counts.set(v, n)
    if (n > bestCount) {
      bestCount = n
      best = v
    }
  }
  return best
}

function startOfWeek(d: Date): string {
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  )
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() - day + 1)
  return date.toISOString().slice(0, 10)
}

function emptyOverview(): AnalyticsOverview {
  return {
    totalClicks: 0,
    uniqueVisitors: 0,
    topReferral: "-",
    clicksByDevice: { mobile: 0, desktop: 0, tablet: 0 },
    clicksByLocation: [],
    clicksOverTime: [],
    topLinks: [],
  }
}

async function getClickCount(
  userId: number,
  start: Date,
  end: Date,
): Promise<number> {
  const result = await db
    .select({ count: count() })
    .from(clicks)
    .innerJoin(shortlinks, eq(clicks.shortlinkId, shortlinks.id))
    .where(
      and(
        eq(shortlinks.userId, userId),
        gt(clicks.createdAt, start),
        lte(clicks.createdAt, end),
      ),
    )
  return result[0]?.count ?? 0
}

async function aggregateInJS(
  userId: number,
  query: AnalyticsQuery,
  start: Date,
  end: Date,
): Promise<AnalyticsOverview> {
  const rows = await db
    .select({
      shortlinkId: clicks.shortlinkId,
      device: clicks.device,
      country: clicks.country,
      referrer: clicks.referrer,
      visitor: clicks.visitor,
      createdAt: clicks.createdAt,
      slug: shortlinks.slug,
      url: shortlinks.url,
    })
    .from(clicks)
    .innerJoin(shortlinks, eq(clicks.shortlinkId, shortlinks.id))
    .where(
      and(
        eq(shortlinks.userId, userId),
        gt(clicks.createdAt, start),
        lte(clicks.createdAt, end),
      ),
    )

  if (rows.length === 0) return emptyOverview()

  const totalClicks = rows.length
  const uniqueVisitors = new Set(rows.map((r) => r.visitor)).size
  const topReferral = mode(rows.map((r) => r.referrer || "Direct")) ?? "-"

  const byDevice: AnalyticsOverview["clicksByDevice"] = {
    mobile: 0,
    desktop: 0,
    tablet: 0,
  }
  const byLocation = new Map<string, number>()
  const overTime = new Map<string, number>()
  const byLink = new Map<
    number,
    {
      id: string
      slug: string
      url: string
      clicks: number
      unique: Set<string>
    }
  >()

  for (const row of rows) {
    byDevice[row.device] += 1
    byLocation.set(row.country, (byLocation.get(row.country) ?? 0) + 1)

    const key =
      query.bucket === "weekly"
        ? startOfWeek(row.createdAt)
        : row.createdAt.toISOString().slice(0, 10)
    overTime.set(key, (overTime.get(key) ?? 0) + 1)

    const link = byLink.get(row.shortlinkId) ?? {
      id: String(row.shortlinkId),
      slug: row.slug,
      url: row.url,
      clicks: 0,
      unique: new Set<string>(),
    }
    link.clicks += 1
    link.unique.add(row.visitor)
    byLink.set(row.shortlinkId, link)
  }

  const total = Math.max(totalClicks, 1)
  const clicksByLocation = [...byLocation.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([country, count]) => ({
      country,
      count,
      pct: Math.round((count / total) * 100),
    }))

  const clicksOverTime = [...overTime.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))

  const topLinks = [...byLink.values()]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5)
    .map((l) => ({
      id: l.id,
      slug: l.slug,
      url: l.url,
      clicks: l.clicks,
      unique: l.unique.size,
    }))

  return {
    totalClicks,
    uniqueVisitors,
    topReferral,
    clicksByDevice: byDevice,
    clicksByLocation,
    clicksOverTime,
    topLinks,
  }
}

async function aggregateInSQL(
  userId: number,
  query: AnalyticsQuery,
  start: Date,
  end: Date,
  totalClicks: number,
): Promise<AnalyticsOverview> {
  const bucketExpr =
    query.bucket === "weekly"
      ? sql`date_trunc('week', ${clicks.createdAt})::date`
      : sql`${clicks.createdAt}::date`

  const [
    byDevice,
    byLocation,
    overTime,
    topLinksRows,
    uniqueVisitors,
    topReferral,
  ] = await Promise.all([
    db
      .select({ device: clicks.device, count: count() })
      .from(clicks)
      .innerJoin(shortlinks, eq(clicks.shortlinkId, shortlinks.id))
      .where(
        and(
          eq(shortlinks.userId, userId),
          gt(clicks.createdAt, start),
          lte(clicks.createdAt, end),
        ),
      )
      .groupBy(clicks.device),
    db
      .select({ country: clicks.country, count: count() })
      .from(clicks)
      .innerJoin(shortlinks, eq(clicks.shortlinkId, shortlinks.id))
      .where(
        and(
          eq(shortlinks.userId, userId),
          gt(clicks.createdAt, start),
          lte(clicks.createdAt, end),
        ),
      )
      .groupBy(clicks.country)
      .orderBy(sql`count desc`)
      .limit(5),
    db
      .select({ date: bucketExpr, count: count() })
      .from(clicks)
      .innerJoin(shortlinks, eq(clicks.shortlinkId, shortlinks.id))
      .where(
        and(
          eq(shortlinks.userId, userId),
          gt(clicks.createdAt, start),
          lte(clicks.createdAt, end),
        ),
      )
      .groupBy(bucketExpr)
      .orderBy(bucketExpr),
    db
      .select({
        shortlinkId: clicks.shortlinkId,
        slug: shortlinks.slug,
        url: shortlinks.url,
        clicks: count(),
        uniqueVisitors: sql<number>`count(distinct ${clicks.visitor})`,
      })
      .from(clicks)
      .innerJoin(shortlinks, eq(clicks.shortlinkId, shortlinks.id))
      .where(
        and(
          eq(shortlinks.userId, userId),
          gt(clicks.createdAt, start),
          lte(clicks.createdAt, end),
        ),
      )
      .groupBy(clicks.shortlinkId, shortlinks.slug, shortlinks.url)
      .orderBy(sql`clicks desc`)
      .limit(5),
    db
      .select({ count: sql<number>`count(distinct ${clicks.visitor})` })
      .from(clicks)
      .innerJoin(shortlinks, eq(clicks.shortlinkId, shortlinks.id))
      .where(
        and(
          eq(shortlinks.userId, userId),
          gt(clicks.createdAt, start),
          lte(clicks.createdAt, end),
        ),
      ),
    db
      .select({ referrer: clicks.referrer, count: count() })
      .from(clicks)
      .innerJoin(shortlinks, eq(clicks.shortlinkId, shortlinks.id))
      .where(
        and(
          eq(shortlinks.userId, userId),
          gt(clicks.createdAt, start),
          lte(clicks.createdAt, end),
        ),
      )
      .groupBy(clicks.referrer)
      .orderBy(sql`count desc`)
      .limit(1),
  ])

  const clicksByDevice: AnalyticsOverview["clicksByDevice"] = {
    mobile: 0,
    desktop: 0,
    tablet: 0,
  }
  for (const row of byDevice) {
    clicksByDevice[row.device as keyof typeof clicksByDevice] = row.count
  }

  const clicksByLocation = byLocation.map((row) => ({
    country: row.country,
    count: row.count,
    pct: Math.round((row.count / Math.max(totalClicks, 1)) * 100),
  }))

  const clicksOverTime = overTime.map((row) => ({
    date: (row.date as Date).toISOString().slice(0, 10),
    count: row.count,
  }))

  const topLinks = topLinksRows.map((row) => ({
    id: String(row.shortlinkId),
    slug: row.slug,
    url: row.url,
    clicks: row.clicks,
    unique: row.uniqueVisitors,
  }))

  return {
    totalClicks,
    uniqueVisitors: uniqueVisitors[0]?.count ?? 0,
    topReferral: topReferral[0]?.referrer ?? "-",
    clicksByDevice,
    clicksByLocation,
    clicksOverTime,
    topLinks,
  }
}

export async function overview(
  userId: number,
  query: AnalyticsQuery,
): Promise<AnalyticsOverview> {
  const { start, end } = resolveRange(query)

  const totalClicks = await getClickCount(userId, start, end)
  if (totalClicks === 0) return emptyOverview()

  if (totalClicks > LARGE_DATASET_THRESHOLD) {
    return aggregateInSQL(userId, query, start, end, totalClicks)
  }

  return aggregateInJS(userId, query, start, end)
}
