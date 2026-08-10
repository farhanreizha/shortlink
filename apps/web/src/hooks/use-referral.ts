import type { Referral } from "@knot/shared"
import { useEffect, useState } from "react"
import { client } from "../hono-client"

export function useReferral() {
  const [referral, setReferral] = useState<Referral | null>(null)
  const [loading, setLoading] = useState(true)

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

  return { referral, loading }
}
