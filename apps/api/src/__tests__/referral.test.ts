import type { Notification, Referral } from "@knot/shared"
import { beforeEach, describe, expect, it } from "vitest"
import app from "../app.js"
import { authedRequest, cleanDatabase, registerUser } from "./helpers.js"

beforeEach(cleanDatabase)

async function referralCode(token: string): Promise<string> {
  const res = await authedRequest(token, "/api/referral")
  expect(res.status).toBe(200)
  return ((await res.json()) as Referral).code
}

describe("Referrals", () => {
  it("registers invitee with a valid ref code", async () => {
    const referrer = await registerUser({
      email: "ref@test.com",
      username: "refuser",
    })
    const code = await referralCode(referrer.token)
    expect(code).toMatch(/^[A-Z2-9]{8}$/)

    const invitee = await registerUser({
      email: "refinvitee@test.com",
      username: "refinvitee",
      ref: code,
    })
    expect(invitee.user.username).toBe("refinvitee")
    expect(invitee.referrerApplied).toBe(true)

    const res = await authedRequest(referrer.token, "/api/referral")
    const overview = (await res.json()) as Referral
    expect(overview.stats).toEqual({ referred: 1, rewarded: 0, proMonths: 0 })
    expect(overview.referredUsers[0]?.username).toBe("refinvitee")
    expect(overview.referredUsers[0]?.rewarded).toBe(false)
  })

  it("ignores an invalid ref code", async () => {
    const referrer = await registerUser({
      email: "ref2@test.com",
      username: "ref2user",
    })
    const invitee = await registerUser({
      email: "ref2invitee@test.com",
      username: "ref2invitee",
      ref: "NOPE1234",
    })
    expect(invitee.referrerApplied).toBe(false)

    const res = await authedRequest(referrer.token, "/api/referral")
    const overview = (await res.json()) as Referral
    expect(overview.stats.referred).toBe(0)
  })

  it("credits referrer after invitee activates (first shortlink)", async () => {
    const referrer = await registerUser({
      email: "ref3@test.com",
      username: "ref3user",
    })
    const code = await referralCode(referrer.token)
    const invitee = await registerUser({
      email: "ref3invitee@test.com",
      username: "ref3invitee",
      ref: code,
    })

    const create = await authedRequest(invitee.token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "firstlink", url: "https://example.com" }),
    })
    expect(create.status).toBe(201)

    const res = await authedRequest(referrer.token, "/api/referral")
    const overview = (await res.json()) as Referral
    expect(overview.stats).toEqual({ referred: 1, rewarded: 1, proMonths: 1 })
    expect(overview.referredUsers[0]?.rewarded).toBe(true)
    expect(overview.proUntil).toBeTruthy()
    const proUntil = new Date(overview.proUntil ?? 0).getTime()
    expect(proUntil).toBeGreaterThan(Date.now() + 29 * 24 * 60 * 60 * 1000)

    const notifRes = await authedRequest(referrer.token, "/api/notifications")
    const list = (await notifRes.json()) as Notification[]
    const referralNotif = list.find((n) => n.type === "referral")
    expect(referralNotif?.data?.username).toBe("ref3invitee")
  })

  it("credits both invitees without notification conflict", async () => {
    const referrer = await registerUser({
      email: "ref5@test.com",
      username: "ref5user",
    })
    const code = await referralCode(referrer.token)
    const inviteeA = await registerUser({
      email: "ref5a@test.com",
      username: "ref5a",
      ref: code,
    })
    const inviteeB = await registerUser({
      email: "ref5b@test.com",
      username: "ref5b",
      ref: code,
    })

    const createA = await authedRequest(inviteeA.token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "ref5a", url: "https://example.com" }),
    })
    expect(createA.status).toBe(201)

    const createB = await authedRequest(inviteeB.token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "ref5b", url: "https://example.com" }),
    })
    expect(createB.status).toBe(201)

    const res = await authedRequest(referrer.token, "/api/referral")
    const overview = (await res.json()) as Referral
    expect(overview.stats).toEqual({ referred: 2, rewarded: 2, proMonths: 2 })

    const notifRes = await authedRequest(referrer.token, "/api/notifications")
    const list = (await notifRes.json()) as Notification[]
    const referralNotifs = list.filter((n) => n.type === "referral")
    expect(referralNotifs).toHaveLength(2)
    expect(referralNotifs.map((n) => n.data?.username).sort()).toEqual([
      "ref5a",
      "ref5b",
    ])
  })

  it("does not double credit on subsequent shortlinks", async () => {
    const referrer = await registerUser({
      email: "ref4@test.com",
      username: "ref4user",
    })
    const code = await referralCode(referrer.token)
    const invitee = await registerUser({
      email: "ref4invitee@test.com",
      username: "ref4invitee",
      ref: code,
    })

    await authedRequest(invitee.token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "sla", url: "https://example.com" }),
    })
    await authedRequest(invitee.token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({ slug: "slb", url: "https://example.com" }),
    })

    const res = await authedRequest(referrer.token, "/api/referral")
    const overview = (await res.json()) as Referral
    expect(overview.stats).toEqual({ referred: 1, rewarded: 1, proMonths: 1 })
  })

  it("rejects unauthenticated access", async () => {
    const res = await app.request("/api/referral")
    expect(res.status).toBe(401)
  })
})
