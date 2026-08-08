import type { Campaign, CampaignSummary } from "@knot/shared"
import { beforeEach, describe, expect, it } from "vitest"
import app from "../app.js"
import { authedRequest, cleanDatabase, registerUser } from "./helpers.js"

beforeEach(cleanDatabase)

describe("Campaigns", () => {
  it("creates and lists campaigns with stats", async () => {
    const { token } = await registerUser({
      email: "camp@test.com",
      username: "campuser",
    })

    const createRes = await authedRequest(token, "/api/campaigns", {
      method: "POST",
      body: JSON.stringify({ name: "Q3 Launch", description: "New tier" }),
    })
    expect(createRes.status).toBe(201)
    const campaign = (await createRes.json()) as Campaign
    expect(campaign).toMatchObject({
      name: "Q3 Launch",
      description: "New tier",
      status: "active",
    })

    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({
        slug: "camp1",
        url: "https://example.com/1",
        campaignId: Number(campaign.id),
      }),
    })
    await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({
        slug: "camp2",
        url: "https://example.com/2",
        campaignId: Number(campaign.id),
      }),
    })

    const listRes = await authedRequest(token, "/api/campaigns")
    const list = (await listRes.json()) as CampaignSummary[]
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({
      name: "Q3 Launch",
      linksCount: 2,
      clicks: 0,
    })
  })

  it("filters by status and searches by name", async () => {
    const { token } = await registerUser({
      email: "camp2@test.com",
      username: "camp2user",
    })
    await authedRequest(token, "/api/campaigns", {
      method: "POST",
      body: JSON.stringify({ name: "Summer Promo" }),
    })
    await authedRequest(token, "/api/campaigns", {
      method: "POST",
      body: JSON.stringify({ name: "Old Migration", status: "archived" }),
    })

    const active = (await (
      await authedRequest(token, "/api/campaigns?status=active")
    ).json()) as CampaignSummary[]
    expect(active).toHaveLength(1)
    expect(active[0]?.name).toBe("Summer Promo")

    const searched = (await (
      await authedRequest(token, "/api/campaigns?q=migration")
    ).json()) as CampaignSummary[]
    expect(searched).toHaveLength(1)
    expect(searched[0]?.status).toBe("archived")
  })

  it("updates and deletes a campaign", async () => {
    const { token } = await registerUser({
      email: "camp3@test.com",
      username: "camp3user",
    })
    const created = (await (
      await authedRequest(token, "/api/campaigns", {
        method: "POST",
        body: JSON.stringify({ name: "Temp" }),
      })
    ).json()) as Campaign

    const updateRes = await authedRequest(
      token,
      `/api/campaigns/${created.id}`,
      {
        method: "PATCH",
        body: JSON.stringify({ name: "Renamed", status: "archived" }),
      },
    )
    expect(updateRes.status).toBe(200)
    expect((await updateRes.json()) as Campaign).toMatchObject({
      name: "Renamed",
      status: "archived",
    })

    const delRes = await authedRequest(token, `/api/campaigns/${created.id}`, {
      method: "DELETE",
    })
    expect(delRes.status).toBe(200)
    const remaining = (await (
      await authedRequest(token, "/api/campaigns")
    ).json()) as CampaignSummary[]
    expect(remaining).toHaveLength(0)
  })

  it("rejects assigning a foreign campaign to a link", async () => {
    const other = await registerUser({
      email: "other@test.com",
      username: "otheruser",
    })
    const foreignCampaign = (await (
      await authedRequest(other.token, "/api/campaigns", {
        method: "POST",
        body: JSON.stringify({ name: "Theirs" }),
      })
    ).json()) as Campaign

    const { token } = await registerUser({
      email: "victim@test.com",
      username: "victimuser",
    })
    const res = await authedRequest(token, "/api/shortlinks", {
      method: "POST",
      body: JSON.stringify({
        slug: "sneaky",
        url: "https://example.com",
        campaignId: Number(foreignCampaign.id),
      }),
    })
    expect(res.status).toBe(400)
  })
})
