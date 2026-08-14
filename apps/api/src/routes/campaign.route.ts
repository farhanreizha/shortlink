import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import {
  CampaignQuerySchema,
  CampaignSchema,
  CampaignSummarySchema,
  CreateCampaignSchema,
  ErrorSchema,
  UpdateCampaignSchema,
} from "@knot/shared"
import * as campaignService from "../services/campaign.service.js"

const listCampaignsRoute = createRoute({
  method: "get",
  path: "/",
  request: {
    query: CampaignQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(CampaignSummarySchema),
        },
      },
      description: "List campaigns with stats",
    },
  },
})

const createCampaignRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCampaignSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: CampaignSchema,
        },
      },
      description: "Campaign created",
    },
  },
})

const updateCampaignRoute = createRoute({
  method: "patch",
  path: "/{id}",
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: UpdateCampaignSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: CampaignSchema,
        },
      },
      description: "Campaign updated",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Campaign not found",
    },
  },
})

const deleteCampaignRoute = createRoute({
  method: "delete",
  path: "/{id}",
  request: {
    params: z.object({ id: z.string() }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "Campaign deleted",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Campaign not found",
    },
  },
})

const campaignRoutes = new OpenAPIHono<{ Variables: { userId: number } }>()

campaignRoutes.openapi(listCampaignsRoute, async (c) => {
  const query = c.req.valid("query")
  return c.json(await campaignService.list(c.get("userId"), query))
})

campaignRoutes.openapi(createCampaignRoute, async (c) => {
  const input = c.req.valid("json")
  const campaign = await campaignService.create(input, c.get("userId"))
  return c.json(campaign, 201)
})

campaignRoutes.openapi(updateCampaignRoute, async (c) => {
  const id = Number(c.req.valid("param").id)
  const input = c.req.valid("json")
  return c.json(await campaignService.update(id, c.get("userId"), input), 200)
})

campaignRoutes.openapi(deleteCampaignRoute, async (c) => {
  const id = Number(c.req.valid("param").id)
  return c.json(await campaignService.remove(id, c.get("userId")), 200)
})

export default campaignRoutes
