import type { MeResult, User } from "@knot/shared"
import { useCallback, useEffect, useState } from "react"
import { client } from "../hono-client"

export function useAuth() {
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    client.api.auth.me
      .$get()
      .then((res: Response) => res.json() as Promise<MeResult>)
      .then((data) => setUser(data.user))
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

export function useAuthGuard() {
  const { loading, user } = useAuth()
  return { isAuthenticated: !!user, loading }
}
