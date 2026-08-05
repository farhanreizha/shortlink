import type {
  Shortlink,
  ShortlinkQuery,
  UpdateShortlink,
} from "@shortlink/shared"
import { useCallback, useEffect, useState } from "react"
import { client } from "../hono-client"

export function useShortlinks() {
  const [links, setLinks] = useState<Shortlink[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState<ShortlinkQuery>({
    offset: 0,
    limit: 50,
    sortBy: "createdAt",
    order: "desc",
  })

  const fetchLinks = useCallback(async (q: ShortlinkQuery) => {
    setLoading(true)
    try {
      const res = await client.api.shortlinks.$get({ query: q })
      const data = (await res.json()) as Shortlink[]
      setLinks(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLinks(query)
  }, [query, fetchLinks])

  const create = useCallback(async (slug: string, url: string) => {
    const res = await client.api.shortlinks.$post({ json: { slug, url } })
    if (!res.ok) {
      const body = (await res.json()) as { message?: string }
      throw new Error(body.message ?? "Something went wrong")
    }
    const link = (await res.json()) as Shortlink
    setLinks((prev) => [link, ...prev])
    return link
  }, [])

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

  return { links, loading, query, setQuery, create, remove, update }
}
