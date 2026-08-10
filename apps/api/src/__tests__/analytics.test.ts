import type { AnalyticsOverview } from "@knot/shared"
import { eq } from "drizzle-orm"
import { beforeEach, describe, expect, it } from "vitest"
import app from "../app.js"
import { db } from "../db/index.js"
import { clicks, shortlinks } from "../db/schema.js"
import { authedRequest, cleanDatabase, registerUser } from "./helpers.js"

beforeEach(cleanDatabase)

async function seedClicks() {
  const { token } = await registerUser({
    email: "analytics@test.com",
    username: "analyticsuser",
  })
  await authedRequest(token, "/api/shortlinks", {
    method: "POST",
    body: JSON.stringify({ slug: "stat", url: "https://example.com" }),
  })
  const [link] = await db
    .select()
    .from(shortlinks)
    .where(eq(shortlinks.slug, "stat"))
  if (!link) throw new Error("link not found")
  await db.insert(clicks).values([
    {
      shortlinkId: link.id,
      device: "mobile",
      country: "US",
      referrer: "https://twitter.com",
      visitor: "v1",
    },
    {
      shortlinkId: link.id,
      device: "mobile",
      country: "US",
      referrer: "https://twitter.com",
      visitor: "v1",
    },
    {
      shortlinkId: link.id,
      device: "desktop",
      country: "ID",
      referrer: "",
      visitor: "v2",
    },
  ])
  return { token }
}

describe("GET /api/analytics/overview", () => {
  it("returns zeros for a user with no clicks", async () => {
    const { token } = await registerUser({
      email: "empty@test.com",
      username: "emptyuser",
    })
    const res = await authedRequest(token, "/api/analytics/overview?range=7d")
    expect(res.status).toBe(200)
    const body = (await res.json()) as unknown as AnalyticsOverview
    expect(body.totalClicks).toBe(0)
    expect(body.uniqueVisitors).toBe(0)
    expect(body.topLinks).toEqual([])
  })

  it("aggregates clicks by device, country, referrer, and visitor", async () => {
    const { token } = await seedClicks()
    const res = await authedRequest(token, "/api/analytics/overview?range=7d")
    expect(res.status).toBe(200)
    const body = (await res.json()) as unknown as AnalyticsOverview

    expect(body.totalClicks).toBe(3)
    expect(body.uniqueVisitors).toBe(2)
    expect(body.topReferral).toBe("https://twitter.com")
    expect(body.clicksByDevice).toEqual({ mobile: 2, desktop: 1, tablet: 0 })
    expect(body.clicksByLocation[0]).toMatchObject({
      country: "US",
      count: 2,
      pct: 67,
    })
    expect(body.clicksOverTime).toHaveLength(1)
    expect(body.clicksOverTime[0]?.count).toBe(3)
    expect(body.topLinks).toHaveLength(1)
    expect(body.topLinks[0]).toMatchObject({
      slug: "stat",
      clicks: 3,
      unique: 2,
    })
  })

  it("scopes to the requested range", async () => {
    const { token } = await seedClicks()
    const res = await authedRequest(
      token,
      "/api/analytics/overview?range=custom&start=2000-01-01&end=2000-01-02",
    )
    expect(res.status).toBe(200)
    const body = (await res.json()) as unknown as AnalyticsOverview
    expect(body.totalClicks).toBe(0)
  })
})
