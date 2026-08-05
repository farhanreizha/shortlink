import type { User } from "@shortlink/shared"
import { useCallback, useEffect, useState } from "react"
import { client } from "../hono-client"

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    client.api.auth.me
      .$get()
      .then((res: Response) =>
        res.ok ? (res.json() as Promise<User>) : Promise.reject(),
      )
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback((user: User) => {
    setUser(user)
  }, [])

  const logout = useCallback(() => {
    client.api.auth.logout.$post().catch(() => {})
    setUser(null)
  }, [])

  return { loading, user, login, logout }
}
