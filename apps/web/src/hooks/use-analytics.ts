import type { AnalyticsOverview, AnalyticsQuery } from "@knot/shared"
import { useCallback, useEffect, useState } from "react"
import { client } from "../hono-client"

export function useAnalytics(
  initial: AnalyticsQuery = { range: "7d", bucket: "daily" },
) {
  const [query, setQuery] = useState<AnalyticsQuery>(initial)
  const [data, setData] = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchOverview = useCallback(async (q: AnalyticsQuery) => {
    setLoading(true)
    setError("")
    try {
      const res = await client.api.analytics.overview.$get({ query: q })
      if (!res.ok) {
        const body = (await res.json()) as { message?: string }
        setError(body.message ?? "Failed to load analytics")
        return
      }
      setData((await res.json()) as AnalyticsOverview)
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOverview(query)
  }, [query, fetchOverview])

  return { data, loading, error, query, setQuery }
}
