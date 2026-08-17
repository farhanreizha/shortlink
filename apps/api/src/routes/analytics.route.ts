import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import {
  AnalyticsOverviewSchema,
  AnalyticsQuerySchema,
  LinkAnalyticsOverviewSchema,
} from "@knot/shared"
import { z } from "zod"
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

const getLinkAnalyticsRoute = createRoute({
  method: "get",
  path: "/links/{slug}",
  request: {
    params: z.object({ slug: z.string() }),
    query: AnalyticsQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: LinkAnalyticsOverviewSchema,
        },
      },
      description: "Per-link analytics overview",
    },
  },
})

const analyticsRoutes = new OpenAPIHono<{ Variables: { userId: number } }>()

analyticsRoutes.openapi(getAnalyticsRoute, async (c) => {
  const query = c.req.valid("query")
  const overview = await analyticsService.overview(c.get("userId"), query)
  return c.json(overview)
})

analyticsRoutes.openapi(getLinkAnalyticsRoute, async (c) => {
  const { slug } = c.req.valid("param")
  const query = c.req.valid("query")
  const overview = await analyticsService.linkOverview(
    c.get("userId"),
    slug,
    query,
  )
  return c.json(overview)
})

export default analyticsRoutes
