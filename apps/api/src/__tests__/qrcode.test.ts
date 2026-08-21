import { beforeEach, describe, expect, it } from "vitest"
import app from "../app.js"
import { authedRequest, cleanDatabase, registerUser } from "./helpers.js"

beforeEach(cleanDatabase)

async function setup() {
  const { token } = await registerUser({
    email: "qr@test.com",
    username: "qruser",
  })
  await authedRequest(token, "/api/shortlinks", {
    method: "POST",
    body: JSON.stringify({ slug: "qrslug", url: "https://example.com" }),
  })
  return token
}

describe("GET /api/qrcode/{slug}", () => {
  it("returns a PNG at the mounted path", async () => {
    const token = await setup()
    const res = await authedRequest(token, "/api/qrcode/qrslug?size=300")
    expect(res.status).toBe(200)
    expect(res.headers.get("content-type")).toBe("image/png")
  })

  it("404s for a slug owned by someone else", async () => {
    await setup()
    const { token: other } = await registerUser({
      email: "other@test.com",
      username: "otheruser",
    })
    const res = await authedRequest(other, "/api/qrcode/qrslug")
    expect(res.status).toBe(404)
  })

  it("401s without a token", async () => {
    await setup()
    const res = await app.request("/api/qrcode/qrslug")
    expect(res.status).toBe(401)
  })

  it("rejects a non-numeric size instead of passing NaN through", async () => {
    const token = await setup()
    const res = await authedRequest(token, "/api/qrcode/qrslug?size=abc")
    expect(res.status).toBe(400)
  })
})
