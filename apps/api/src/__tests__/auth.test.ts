import { beforeEach, describe, expect, it } from "vitest"
import app from "../app.js"
import { cleanDatabase, registerUser } from "./helpers.js"

beforeEach(cleanDatabase)

describe("POST /api/auth/register", () => {
  it("registers a valid user", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "newuser@test.com",
        username: "newuser",
        password: "Test1234",
      }),
    })
    expect(res.status).toBe(201)
    const data = (await res.json()) as { username: string }
    expect(data.username).toBe("newuser")
    expect(res.headers.get("Set-Cookie")).toMatch(/^token=.+/)
  })

  it("rejects duplicate email", async () => {
    await registerUser({ email: "dup@test.com", username: "user1" })
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "dup@test.com",
        username: "user2",
        password: "Test1234",
      }),
    })
    expect(res.status).toBe(409)
  })

  it("rejects duplicate username", async () => {
    await registerUser({ email: "a@test.com", username: "dupuser" })
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "b@test.com",
        username: "dupuser",
        password: "Test1234",
      }),
    })
    expect(res.status).toBe(409)
  })

  it("rejects weak password", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "weak@test.com",
        username: "weakuser",
        password: "short",
      }),
    })
    expect(res.status).toBe(400)
  })

  it("rejects username containing HTML payload", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "xss@test.com",
        username: "<svg onload=alert(1)>",
        password: "Test1234",
      }),
    })
    expect(res.status).toBe(400)
  })

  it("rejects a common password", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "common@test.com",
        username: "commonuser",
        password: "Password123",
      }),
    })
    expect(res.status).toBe(400)
  })

  it("rejects password containing the username", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "contain@test.com",
        username: "alice",
        password: "AlicePass123",
      }),
    })
    expect(res.status).toBe(400)
  })
})

describe("POST /api/auth/login", () => {
  it("logs in with valid credentials", async () => {
    await registerUser({ email: "login@test.com", username: "loginuser" })
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "login@test.com",
        password: "Test1234",
      }),
    })
    expect(res.status).toBe(201)
    expect(res.headers.get("Set-Cookie")).toMatch(/^token=.+/)
  })

  it("rate limits login attempts and exposes limit headers", async () => {
    let last: Response | undefined
    for (let i = 0; i < 11; i++) {
      last = await app.request("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Forwarded-For": "198.51.100.7",
        },
        body: JSON.stringify({ email: "x@test.com", password: "WrongPass1" }),
      })
    }
    expect(last?.status).toBe(429)
    expect(last?.headers.get("Retry-After")).toBeTruthy()
    expect(last?.headers.get("X-RateLimit-Limit")).toBe("10")
    expect(last?.headers.get("X-RateLimit-Remaining")).toBe("0")
  })

  it("rejects wrong password", async () => {
    await registerUser({ email: "wrongpw@test.com", username: "wrongpw" })
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "wrongpw@test.com",
        password: "WrongPassword1",
      }),
    })
    expect(res.status).toBe(401)
  })

  it("rejects non-existent email", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "nobody@test.com",
        password: "Test1234",
      }),
    })
    expect(res.status).toBe(401)
  })
})

describe("GET /api/auth/me", () => {
  it("returns user with valid token", async () => {
    const { token } = await registerUser({
      email: "me@test.com",
      username: "meuser",
    })
    const res = await app.request("/api/auth/me", {
      headers: {
        Cookie: `token=${token}`,
      },
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as { username: string }
    expect(data.username).toBe("meuser")
  })

  it("rejects missing token", async () => {
    const res = await app.request("/api/auth/me")
    expect(res.status).toBe(401)
  })

  it("rejects invalid token", async () => {
    const res = await app.request("/api/auth/me", {
      headers: { Cookie: "token=invalid-token" },
    })
    expect(res.status).toBe(401)
  })
})

describe("POST /api/auth/logout", () => {
  it("clears the auth cookie", async () => {
    const { token } = await registerUser({
      email: "logout@test.com",
      username: "logoutuser",
    })
    const res = await app.request("/api/auth/logout", {
      method: "POST",
      headers: { Cookie: `token=${token}` },
    })
    expect(res.status).toBe(200)
    const setCookie = res.headers.get("Set-Cookie") ?? ""
    expect(setCookie).toContain("token=;")
  })
})

describe("PATCH /api/auth/me", () => {
  it("updates email", async () => {
    const { token } = await registerUser({
      email: "oldemail@test.com",
      username: "updateme",
    })
    const res = await app.request("/api/auth/me", {
      method: "PATCH",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: "newemail@test.com" }),
    })
    expect(res.status).toBe(200)
    const data = (await res.json()) as { email: string }
    expect(data.email).toBe("newemail@test.com")
  })

  it("updates password with valid current password", async () => {
    const { token } = await registerUser({
      email: "changepw@test.com",
      username: "changepw",
    })
    const res = await app.request("/api/auth/me", {
      method: "PATCH",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: "Test1234",
        newPassword: "NewPass123",
      }),
    })
    expect(res.status).toBe(200)
  })

  it("rejects password change without current password", async () => {
    const { token } = await registerUser({
      email: "nocurrent@test.com",
      username: "nocurrent",
    })
    const res = await app.request("/api/auth/me", {
      method: "PATCH",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ newPassword: "NewPass123" }),
    })
    expect(res.status).toBe(401)
  })

  it("rejects password change with wrong current password", async () => {
    const { token } = await registerUser({
      email: "wrongpw@test.com",
      username: "wrongpwuser",
    })
    const res = await app.request("/api/auth/me", {
      method: "PATCH",
      headers: {
        Cookie: `token=${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentPassword: "WrongPass1",
        newPassword: "NewPass123",
      }),
    })
    expect(res.status).toBe(401)
  })
})

describe("DELETE /api/auth/me", () => {
  it("deletes own account", async () => {
    const { token } = await registerUser({
      email: "delacct@test.com",
      username: "delacct",
    })
    const res = await app.request("/api/auth/me", {
      method: "DELETE",
      headers: { Cookie: `token=${token}` },
    })
    expect(res.status).toBe(200)

    const me = await app.request("/api/auth/me", {
      headers: { Cookie: `token=${token}` },
    })
    expect(me.status).toBe(401)
  })
})
