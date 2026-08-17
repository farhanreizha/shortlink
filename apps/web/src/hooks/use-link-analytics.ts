import type { AnalyticsQuery, LinkAnalyticsOverview } from "@knot/shared"
import { useCallback, useEffect, useState } from "react"
import { client } from "../hono-client"

export function useLinkAnalytics(
  slug: string,
  initial: AnalyticsQuery = { range: "7d", bucket: "daily" },
) {
  const [query, setQuery] = useState<AnalyticsQuery>(initial)
  const [data, setData] = useState<LinkAnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const fetchData = useCallback(
    async (q: AnalyticsQuery) => {
      setLoading(true)
      setError("")
      try {
        const res = await client.api.analytics.links[":slug"].$get({
          param: { slug },
          query: q,
        })
        if (!res.ok) {
          setError("Failed to load analytics")
          return
        }
        setData(await res.json())
      } catch {
        setError("Failed to load analytics")
      } finally {
        setLoading(false)
      }
    },
    [slug],
  )

  useEffect(() => {
    fetchData(query)
  }, [query, fetchData])

  return { data, loading, error, query, setQuery }
}
