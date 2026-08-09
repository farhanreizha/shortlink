import type { Notification } from "@knot/shared"
import { useCallback, useEffect, useState } from "react"
import { client } from "../hono-client"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    client.api.notifications
      .$get()
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => {
        if (!cancelled) setNotifications(list)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const unread = notifications.filter((n) => !n.read).length

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    const res = await client.api.notifications.read.$post()
    if (res.ok) setNotifications(await res.json())
  }, [])

  return { notifications, unread, loading, markAllRead }
}
