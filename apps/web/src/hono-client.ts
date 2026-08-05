import type { AppRoutes } from "@shortlink/shared/routes"
import type { Hono } from "hono"
import { hc } from "hono/client"

// biome-ignore lint/complexity/noBannedTypes: `{}` = BlankEnv, matches Hono's default Env
export const client = hc<Hono<{}, AppRoutes, "/">>("/", {
  fetch: (input: RequestInfo | URL, init?: RequestInit) => {
    return fetch(input, init).then((res) => {
      if (res.status === 401 && !input.toString().includes("/api/auth/")) {
        window.location.href = "/login"
      }
      return res
    })
  },
})
