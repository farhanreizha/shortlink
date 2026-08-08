import { beforeEach, describe, expect, it } from "vitest"
import app from "../app.js"
import { db } from "../db/index.js"
import { clicks } from "../db/schema.js"
import { authedRequest, cleanDatabase, registerUser } from "./helpers.js"

beforeEach(cleanDatabase)

describe("GET /r/:slug", () => {
  it("redirects to the original URL", async () => {
    const { token } = await registerUser({
      email: "redir@test.com",
      username: "rediruser",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "go", url: "https://example.com" }),
    })
    const res = await app.request("/r/go")
    expect(res.status).toBe(302)
    expect(res.headers.get("Location")).toBe("https://example.com")
  })

  it("records a click with device and referrer", async () => {
    const { token } = await registerUser({
      email: "click@test.com",
      username: "clickuser",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "track", url: "https://example.com" }),
    })
    const res = await app.request("/r/track", {
      headers: {
        "user-agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
        referer: "https://twitter.com",
        "x-forwarded-for": "203.0.113.9",
      },
    })
    expect(res.status).toBe(302)
    await new Promise((r) => setTimeout(r, 50))
    const [click] = await db.select().from(clicks)
    expect(click).toMatchObject({
      device: "mobile",
      referrer: "https://twitter.com",
    })
    expect(click.visitor).not.toBe("anon")
  })

  it("records anon visitor when no IP header is present", async () => {
    const { token } = await registerUser({
      email: "anonclick@test.com",
      username: "anonclick",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "anon", url: "https://example.com" }),
    })
    await app.request("/r/anon")
    await new Promise((r) => setTimeout(r, 50))
    const [click] = await db.select().from(clicks)
    expect(click.visitor).toBe("anon")
  })

  it("returns 404 for unknown slug", async () => {
    const res = await app.request("/r/unknown")
    expect(res.status).toBe(404)
  })

  it("rejects javascript: URLs", async () => {
    const { token } = await registerUser({
      email: "jsredir@test.com",
      username: "jsredir",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({
        slug: "xss",
        url: "javascript:alert(1)",
      }),
    })
    const res = await app.request("/r/xss")
    expect(res.status).toBe(400)
  })

  it("rejects data: URLs", async () => {
    const { token } = await registerUser({
      email: "dataredir@test.com",
      username: "dataredir",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({
        slug: "dataurl",
        url: "data:text/html,<script>alert(1)</script>",
      }),
    })
    const res = await app.request("/r/dataurl")
    expect(res.status).toBe(400)
  })
})
