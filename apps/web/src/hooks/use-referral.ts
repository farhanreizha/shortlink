import type { Referral } from "@knot/shared"
import { useCallback, useEffect, useState } from "react"
import { client } from "../hono-client"

export function useReferral() {
  const [referral, setReferral] = useState<Referral | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const res = await client.api.referral.$get()
    if (res.ok) setReferral(await res.json())
  }, [])

  useEffect(() => {
    let cancelled = false
    client.api.referral
      .$get()
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled) setReferral(data)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { referral, loading, refresh }
}
