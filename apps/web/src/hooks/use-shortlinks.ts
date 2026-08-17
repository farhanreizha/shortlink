import type { Shortlink, ShortlinkQuery, UpdateShortlink } from "@knot/shared"
import { useCallback, useEffect, useState } from "react"
import { client } from "../hono-client"

export function useShortlinks() {
  const [links, setLinks] = useState<Shortlink[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState<ShortlinkQuery>({
    offset: 0,
    limit: 50,
    sortBy: "createdAt",
  })

  const fetchLinks = useCallback(async (q: ShortlinkQuery) => {
    setLoading(true)
    try {
      const res = await client.api.shortlinks.$get({ query: q })
      if (!res.ok) return
      const data = (await res.json()) as Shortlink[]
      setLinks(data)
      setTotal(Number(res.headers.get("X-Total-Count") ?? data.length))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLinks(query)
  }, [query, fetchLinks])

  const create = useCallback(
    async (
      slug: string,
      url: string,
      campaignId?: number | null,
      options?: { expiresAt?: string; password?: string },
    ) => {
      const res = await client.api.shortlinks.$post({
        json: {
          slug,
          url,
          campaignId: campaignId ?? undefined,
          ...(options?.expiresAt ? { expiresAt: options.expiresAt } : {}),
          ...(options?.password ? { password: options.password } : {}),
        },
      })
      if (!res.ok) {
        const body = (await res.json()) as { message?: string }
        throw new Error(body.message ?? "Something went wrong")
      }
      const link = (await res.json()) as Shortlink
      setLinks((prev) => [link, ...prev])
      return link
    },
    [],
  )

  const remove = useCallback(async (slug: string) => {
    const res = await client.api.shortlinks[":slug"].$delete({
      param: { slug },
    })
    if (!res.ok) {
      const body = (await res.json()) as { message?: string }
      throw new Error(body.message ?? "Failed to delete")
    }
    setLinks((prev) => prev.filter((l) => l.slug !== slug))
  }, [])

  const update = useCallback(async (slug: string, data: UpdateShortlink) => {
    const res = await client.api.shortlinks[":slug"].$patch({
      param: { slug },
      json: data,
    })
    if (!res.ok) {
      const body = (await res.json()) as { message?: string }
      throw new Error(body.message ?? "Failed to update")
    }
    const link = (await res.json()) as Shortlink
    setLinks((prev) => prev.map((l) => (l.slug === slug ? link : l)))
  }, [])

  const bulkRemove = useCallback(async (slugs: string[]) => {
    const res = await client.api.shortlinks["bulk-delete"].$post({
      json: { slugs },
    })
    if (!res.ok) {
      const body = (await res.json()) as { message?: string }
      throw new Error(body.message ?? "Bulk delete failed")
    }
    setLinks((prev) => prev.filter((l) => !slugs.includes(l.slug)))
    return (await res.json()).deleted
  }, [])

  const bulkAssignCampaign = useCallback(
    async (slugs: string[], campaignId: number | null) => {
      const res = await client.api.shortlinks["bulk-update"].$post({
        json: { slugs, campaignId },
      })
      if (!res.ok) {
        const body = (await res.json()) as { message?: string }
        throw new Error(body.message ?? "Bulk update failed")
      }
      const id = campaignId === null ? null : String(campaignId)
      setLinks((prev) =>
        prev.map((l) =>
          slugs.includes(l.slug) ? { ...l, campaignId: id } : l,
        ),
      )
      return (await res.json()).updated
    },
    [],
  )

  return {
    links,
    total,
    loading,
    query,
    setQuery,
    create,
    remove,
    update,
    bulkRemove,
    bulkAssignCampaign,
  }
}
