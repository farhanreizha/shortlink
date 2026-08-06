import { beforeEach, describe, expect, it } from "vitest"
import app from "../app.js"
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
