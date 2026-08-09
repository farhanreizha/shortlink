import type { Notification } from "@knot/shared"
import { beforeEach, describe, expect, it } from "vitest"
import app from "../app.js"
import { authedRequest, cleanDatabase, registerUser } from "./helpers.js"

beforeEach(cleanDatabase)

describe("Notifications", () => {
  it("seeds default notifications on first fetch", async () => {
    const { token } = await registerUser({
      email: "notif@test.com",
      username: "notifuser",
    })

    const res = await authedRequest(token, "/api/notifications")
    expect(res.status).toBe(200)
    const list = (await res.json()) as Notification[]
    expect(list).toHaveLength(2)
    expect(list.every((n) => !n.read)).toBe(true)
    expect(list.map((n) => n.type).sort()).toEqual(["new_feature", "welcome"])
  })

  it("marks all notifications as read", async () => {
    const { token } = await registerUser({
      email: "notif2@test.com",
      username: "notif2user",
    })
    await authedRequest(token, "/api/notifications")

    const res = await authedRequest(token, "/api/notifications/read", {
      method: "POST",
    })
    expect(res.status).toBe(200)
    const list = (await res.json()) as Notification[]
    expect(list).toHaveLength(2)
    expect(list.every((n) => n.read)).toBe(true)
  })

  it("does not reseed after being read", async () => {
    const { token } = await registerUser({
      email: "notif3@test.com",
      username: "notif3user",
    })
    await authedRequest(token, "/api/notifications")
    await authedRequest(token, "/api/notifications/read", { method: "POST" })

    const res = await authedRequest(token, "/api/notifications")
    const list = (await res.json()) as Notification[]
    expect(list).toHaveLength(2)
    expect(list.every((n) => n.read)).toBe(true)
  })

  it("scopes notifications to the current user", async () => {
    const first = await registerUser({
      email: "notif4@test.com",
      username: "notif4user",
    })
    const second = await registerUser({
      email: "notif5@test.com",
      username: "notif5user",
    })
    await authedRequest(first.token, "/api/notifications")

    const res = await authedRequest(second.token, "/api/notifications")
    const list = (await res.json()) as Notification[]
    expect(list).toHaveLength(2)
    const firstList = (await (
      await authedRequest(first.token, "/api/notifications")
    ).json()) as Notification[]
    expect(firstList).toHaveLength(2)
    expect(firstList.every((n) => !n.read)).toBe(true)
  })

  it("rejects unauthenticated access", async () => {
    const res = await app.request("/api/notifications")
    expect(res.status).toBe(401)
  })
})
