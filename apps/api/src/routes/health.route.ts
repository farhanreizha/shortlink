import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { sql } from "drizzle-orm"
import { db } from "../db"

const route = createRoute({
  method: "get",
  path: "/health",
  responses: {
    200: { description: "Service healthy" },
    503: { description: "Service degraded" },
  },
})

const app = new OpenAPIHono()

app.openapi(route, async (c) => {
  try {
    await db.execute(sql`SELECT 1`)
    return c.json({
      status: "ok",
      db: "connected",
      timestamp: new Date().toISOString(),
    })
  } catch {
    return c.json(
      {
        status: "degraded",
        db: "disconnected",
        timestamp: new Date().toISOString(),
      },
      503,
    )
  }
})

export default app
