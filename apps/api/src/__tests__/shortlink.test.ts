import { beforeEach, describe, expect, it } from "vitest"
import app from "../app.js"
import { authedRequest, cleanDatabase, registerUser } from "./helpers.js"

beforeEach(cleanDatabase)

describe("POST /api/shortlinks", () => {
  it("creates a shortlink", async () => {
    const { token } = await registerUser({
      email: "create@test.com",
      username: "createuser",
    })
    const res = await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "testlink", url: "https://example.com" }),
    })
    expect(res.status).toBe(201)
    const data = (await res.json()) as { slug: string; url: string }
    expect(data.slug).toBe("testlink")
    expect(data.url).toBe("https://example.com")
  })

  it("rejects duplicate slug", async () => {
    const { token } = await registerUser({
      email: "dup@test.com",
      username: "dupsluguser",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "mylink", url: "https://example.com" }),
    })
    const res = await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "mylink", url: "https://other.com" }),
    })
    expect(res.status).toBe(409)
  })

  it("rejects slug containing HTML payload", async () => {
    const { token } = await registerUser({
      email: "slugxss@test.com",
      username: "slugxssuser",
    })
    const res = await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({
        slug: "><script>alert('xss')</script>",
        url: "https://example.com",
      }),
    })
    expect(res.status).toBe(400)
  })

  it("rejects unsafe url schemes", async () => {
    const { token } = await registerUser({
      email: "scheme@test.com",
      username: "schemeuser",
    })
    for (const url of ["javascript:alert(1)", "ftp://evil.com/x"]) {
      const res = await authedRequest(token, "/api/shortlinks", {
        method: "POST",
        body: JSON.stringify({ slug: `schemelink-${url.length}`, url }),
      })
      expect(res.status).toBe(400)
    }
  })

  it("rejects redirects to private and local addresses", async () => {
    const { token } = await registerUser({
      email: "ssrf@test.com",
      username: "ssrfuser",
    })
    for (const url of [
      "http://169.254.169.254/latest/meta-data/",
      "http://localhost:5173",
      "http://127.0.0.1/x",
      "http://10.0.0.5/x",
      "http://192.168.1.1/x",
    ]) {
      const res = await authedRequest(token, "/api/shortlinks", {
        method: "POST",
        body: JSON.stringify({ slug: `ssrf-${url.length}`, url }),
      })
      expect(res.status).toBe(400)
    }
  })

  it("rejects unauthenticated request", async () => {
    const res = await app.request("/api/shortlinks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "nolink", url: "https://example.com" }),
    })
    expect(res.status).toBe(401)
  })
})

describe("GET /api/shortlinks", () => {
  it("lists own shortlinks", async () => {
    const { token } = await registerUser({
      email: "list@test.com",
      username: "listuser",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "link1", url: "https://a.com" }),
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "link2", url: "https://b.com" }),
    })
    const res = await authedRequest(token, "/api/shortlinks")
    const data = await res.json()
    expect(data).toHaveLength(2)
  })

  it("paginates results", async () => {
    const { token } = await registerUser({
      email: "pagin@test.com",
      username: "paginuser",
    })
    for (let i = 0; i < 5; i++) {
      await authedRequest(token, "/api/shortlinks", {
        method: "POST",
        body: JSON.stringify({
          slug: `page-${i}`,
          url: `https://example.com/${i}`,
        }),
      })
    }
    const res = await authedRequest(token, "/api/shortlinks?offset=0&limit=3")
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toHaveLength(3)
  })

  it("searches by URL", async () => {
    const { token } = await registerUser({
      email: "search@test.com",
      username: "searchuser",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "findme", url: "https://unique-abc.com" }),
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "other", url: "https://other.com" }),
    })
    const res = await authedRequest(token, "/api/shortlinks?q=unique")
    expect(res.status).toBe(200)
    const data = (await res.json()) as { slug: string }[]
    expect(data).toHaveLength(1)
    expect(data[0]?.slug).toBe("findme")
  })
})

describe("GET /api/shortlinks/:slug", () => {
  it("returns shortlink detail", async () => {
    const { token } = await registerUser({
      email: "detail@test.com",
      username: "detailuser",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "detailme", url: "https://detail.com" }),
    })
    const res = await authedRequest(token, "/api/shortlinks/detailme")
    expect(res.status).toBe(200)
    const data = (await res.json()) as { slug: string; url: string }
    expect(data.slug).toBe("detailme")
    expect(data.url).toBe("https://detail.com")
  })

  it("returns 404 for non-existent slug", async () => {
    const { token } = await registerUser({
      email: "nodetail@test.com",
      username: "nodetail",
    })
    const res = await authedRequest(token, "/api/shortlinks/nonexistent")
    expect(res.status).toBe(404)
  })
})

describe("DELETE /api/shortlinks/:slug", () => {
  it("deletes own shortlink", async () => {
    const { token } = await registerUser({
      email: "del@test.com",
      username: "deluser",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({
        slug: "todel",
        url: "https://example.com",
      }),
    })
    const res = await authedRequest(token, "/api/shortlinks/todel", {
      method: "DELETE",
    })
    expect(res.status).toBe(200)
  })

  it("returns 404 for non-existent slug", async () => {
    const { token } = await registerUser({
      email: "noex@test.com",
      username: "noexuser",
    })
    const res = await authedRequest(token, "/api/shortlinks/nonexistent", {
      method: "DELETE",
    })
    expect(res.status).toBe(404)
  })

  it("rejects unauthenticated delete", async () => {
    const res = await app.request("/api/shortlinks/something", {
      method: "DELETE",
    })
    expect(res.status).toBe(401)
  })
})

describe("PATCH /api/shortlinks/:slug", () => {
  it("updates a shortlink url", async () => {
    const { token } = await registerUser({
      email: "updateurl@test.com",
      username: "updateurl",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "editme", url: "https://original.com" }),
    })
    const res = await authedRequest(token, "/api/shortlinks/editme", {
      method: "PATCH",
      body: JSON.stringify({ url: "https://updated.com" }),
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as { url: string }
    expect(data.url).toBe("https://updated.com")
  })

  it("updates a shortlink slug", async () => {
    const { token } = await registerUser({
      email: "updateslug@test.com",
      username: "updateslug",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "oldslug", url: "https://example.com" }),
    })
    const res = await authedRequest(token, "/api/shortlinks/oldslug", {
      method: "PATCH",
      body: JSON.stringify({ slug: "newslug" }),
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as { slug: string }
    expect(data.slug).toBe("newslug")
  })

  it("rejects duplicate slug on update", async () => {
    const { token } = await registerUser({
      email: "dupupdate@test.com",
      username: "dupupdate",
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "first", url: "https://a.com" }),
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "second", url: "https://b.com" }),
    })
    const res = await authedRequest(token, "/api/shortlinks/first", {
      method: "PATCH",
      body: JSON.stringify({ slug: "second" }),
    })
    expect(res.status).toBe(409)
  })

  it("rejects update of non-existent shortlink", async () => {
    const { token } = await registerUser({
      email: "noexupdate@test.com",
      username: "noexupdate",
    })
    const res = await authedRequest(token, "/api/shortlinks/nonexistent", {
      method: "PATCH",
      body: JSON.stringify({ url: "https://example.com" }),
    })
    expect(res.status).toBe(404)
  })

  it("rejects unauthenticated update", async () => {
    const res = await app.request("/api/shortlinks/something", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: "https://example.com" }),
    })
    expect(res.status).toBe(401)
  })
})
