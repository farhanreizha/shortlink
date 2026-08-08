import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { AnalyticsOverviewSchema, AnalyticsQuerySchema } from "@knot/shared"
import * as analyticsService from "../services/analytics.service.js"

const getAnalyticsRoute = createRoute({
  method: "get",
  path: "/overview",
  request: {
    query: AnalyticsQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: AnalyticsOverviewSchema,
        },
      },
      description: "Analytics overview",
    },
  },
})

const analyticsRoutes = new OpenAPIHono<{ Variables: { userId: number } }>()

analyticsRoutes.openapi(getAnalyticsRoute, async (c) => {
  const query = c.req.valid("query")
  const overview = await analyticsService.overview(c.get("userId"), query)
  return c.json(overview)
})

export default analyticsRoutes
