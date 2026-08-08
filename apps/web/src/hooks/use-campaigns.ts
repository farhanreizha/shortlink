import type {
  Campaign,
  CampaignQuery,
  CampaignSummary,
  CreateCampaign,
  UpdateCampaign,
} from "@knot/shared"
import { useCallback, useEffect, useState } from "react"
import { client } from "../hono-client"

export function useCampaigns(initial: CampaignQuery = {}) {
  const [query, setQuery] = useState<CampaignQuery>(initial)
  const [data, setData] = useState<CampaignSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchCampaigns = useCallback(async (q: CampaignQuery) => {
    setLoading(true)
    setError("")
    try {
      const res = await client.api.campaigns.$get({ query: q })
      if (!res.ok) {
        const body = (await res.json()) as { message?: string }
        setError(body.message ?? "Failed to load campaigns")
        return
      }
      setData((await res.json()) as CampaignSummary[])
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCampaigns(query)
  }, [query, fetchCampaigns])

  const create = useCallback(async (input: CreateCampaign) => {
    const res = await client.api.campaigns.$post({ json: input })
    if (!res.ok) return null
    const created = (await res.json()) as Campaign
    setQuery({})
    return created
  }, [])

  const update = useCallback(async (id: string, input: UpdateCampaign) => {
    const res = await client.api.campaigns[":id"].$patch({
      param: { id },
      json: input,
    })
    if (!res.ok) return null
    const updated = (await res.json()) as Campaign
    setQuery({})
    return updated
  }, [])

  const remove = useCallback(async (id: string) => {
    const res = await client.api.campaigns[":id"].$delete({ param: { id } })
    if (!res.ok) return false
    setQuery({})
    return true
  }, [])

  return { data, loading, error, query, setQuery, create, update, remove }
}
