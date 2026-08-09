import { createRoute, OpenAPIHono } from "@hono/zod-openapi"
import { ReferralSchema } from "@knot/shared"
import * as referralService from "../services/referral.service.js"

const overviewRoute = createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: { "application/json": { schema: ReferralSchema } },
      description: "Referral overview",
    },
  },
})

const referralRoutes = new OpenAPIHono<{ Variables: { userId: number } }>()

referralRoutes.openapi(overviewRoute, async (c) => {
  const overview = await referralService.getOverview(c.get("userId"))
  return c.json(overview)
})

export default referralRoutes
