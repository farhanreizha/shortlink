import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import app from "../app.js"

// packages/shared/src/routes.ts is hand-maintained (TS 7 can't infer
// `typeof app` across workspaces). Nothing forces it to match the real API,
// which is how the /api/qrcode mount bug went unnoticed. This test is that
// force.
const ROUTES_SRC = readFileSync(
  new URL("../../../../packages/shared/src/routes.ts", import.meta.url),
  "utf8",
)
const ROUTE_KEYS = [...ROUTES_SRC.matchAll(/^ {2}"(\/[^"]+)":/gm)].map(
  (m) => m[1] as string,
)

describe("AppRoutes vs OpenAPI spec", () => {
  it("parses route keys from shared/routes.ts", () => {
    expect(ROUTE_KEYS.length).toBeGreaterThan(15)
  })

  it("declares every /api path the app serves", async () => {
    const res = await app.request("/api/doc")
    expect(res.status).toBe(200)
    const doc = (await res.json()) as { paths: Record<string, unknown> }
    // OpenAPI uses {slug}, hc() uses :slug. /doc, /docs and /health are
    // infra endpoints not exposed through the RPC client.
    const specPaths = Object.keys(doc.paths)
      .filter((p) => p.startsWith("/api/"))
      .filter((p) => !["/api/doc", "/api/docs", "/api/health"].includes(p))
      .map((p) => p.replace(/\{(\w+)\}/g, ":$1"))
      .sort()
    const missing = specPaths.filter((p) => !ROUTE_KEYS.includes(p))
    expect(missing).toEqual([])
  })
})
