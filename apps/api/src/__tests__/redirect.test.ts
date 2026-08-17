import { beforeEach, describe, expect, it } from "vitest"
import app from "../app.js"
import { db } from "../db/index.js"
import { clicks, shortlinks } from "../db/schema.js"
import { hashPassword } from "../lib/auth.js"
import { authedRequest, cleanDatabase, registerUser } from "./helpers.js"

beforeEach(cleanDatabase)

async function waitForClick() {
  for (let i = 0; i < 40; i++) {
    const rows = await db.select().from(clicks)
    if (rows.length === 0) {
      await new Promise((r) => setTimeout(r, 50))
      continue
    }
    return rows[0]
  }
  return undefined
}

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
    expect(res.headers.get("Referrer-Policy")).toBe("no-referrer")
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
    const click = await waitForClick()
    if (!click) throw new Error("click not recorded")
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
    const click = await waitForClick()
    if (!click) throw new Error("click not recorded")
    expect(click.visitor).toBe("anon")
  })

  it("returns 404 for unknown slug", async () => {
    const res = await app.request("/r/unknown")
    expect(res.status).toBe(404)
  })

  it("rejects javascript: URLs", async () => {
    const { user } = await registerUser({
      email: "jsredir@test.com",
      username: "jsredir",
    })
    await db.insert(shortlinks).values({
      slug: "xss",
      url: "javascript:alert(1)",
      userId: user.id,
    })
    const res = await app.request("/r/xss")
    expect(res.status).toBe(400)
  })

  it("rejects data: URLs", async () => {
    const { user } = await registerUser({
      email: "dataredir@test.com",
      username: "dataredir",
    })
    await db.insert(shortlinks).values({
      slug: "dataurl",
      url: "data:text/html,<script>alert(1)</script>",
      userId: user.id,
    })
    const res = await app.request("/r/dataurl")
    expect(res.status).toBe(400)
  })

  it("does not record a click for blocked URLs", async () => {
    const { user } = await registerUser({
      email: "blockredir@test.com",
      username: "blockredir",
    })
    await db.insert(shortlinks).values({
      slug: "blocked",
      url: "http://localhost:5432",
      userId: user.id,
    })
    const res = await app.request("/r/blocked")
    expect(res.status).toBe(400)

    await new Promise((r) => setTimeout(r, 100))
    const rows = await db.select().from(clicks)
    expect(rows).toHaveLength(0)
  })

  it("serves an expired page for expired links", async () => {
    const { user } = await registerUser({
      email: "exp@test.com",
      username: "expuser",
    })
    await db.insert(shortlinks).values({
      slug: "oldlink",
      url: "https://example.com",
      userId: user.id,
      expiresAt: new Date(Date.now() - 1000),
    })
    const res = await app.request("/r/oldlink")
    expect(res.status).toBe(200)
    expect(await res.text()).toContain("has expired")
  })

  it("serves a password form for protected links", async () => {
    const { user } = await registerUser({
      email: "pw@test.com",
      username: "pwuser",
    })
    await db.insert(shortlinks).values({
      slug: "secret",
      url: "https://example.com",
      userId: user.id,
      password: await hashPassword("hunter2"),
    })
    const res = await app.request("/r/secret")
    expect(res.status).toBe(200)
    expect(await res.text()).toContain("password")
  })

  it("unlocks a protected link with the correct password", async () => {
    const { user } = await registerUser({
      email: "pw2@test.com",
      username: "pw2user",
    })
    await db.insert(shortlinks).values({
      slug: "secret2",
      url: "https://example.com",
      userId: user.id,
      password: await hashPassword("hunter2"),
    })
    const post = await app.request("/r/secret2", {
      method: "POST",
      body: new URLSearchParams({ password: "wrong" }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    expect(post.status).toBe(200)
    expect(await post.text()).toContain("Incorrect password")

    const ok = await app.request("/r/secret2", {
      method: "POST",
      body: new URLSearchParams({ password: "hunter2" }),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
    expect(ok.status).toBe(302)
    expect(ok.headers.get("Set-Cookie")).toContain("knot_secret2")
    expect(ok.headers.get("Location")).toBe("/r/secret2")

    const follow = await app.request("/r/secret2", {
      headers: { Cookie: ok.headers.get("Set-Cookie")?.split(";")[0] ?? "" },
    })
    expect(follow.status).toBe(302)
    expect(follow.headers.get("Location")).toBe("https://example.com")
  })

  it("serves OG preview for social crawlers", async () => {
    const { user } = await registerUser({
      email: "og@test.com",
      username: "oguser",
    })
    await db.insert(shortlinks).values({
      slug: "preview",
      url: "https://example.com",
      userId: user.id,
      title: "My Great Link",
      description: "A useful destination",
    })
    const res = await app.request("/r/preview", {
      headers: { "user-agent": "Twitterbot/1.0" },
    })
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('property="og:title" content="My Great Link"')
    expect(html).toContain(
      'property="og:description" content="A useful destination"',
    )
  })
})
