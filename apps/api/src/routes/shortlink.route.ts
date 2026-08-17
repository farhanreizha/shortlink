import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import {
  BulkDeleteSchema,
  BulkUpdateSchema,
  CreateShortlinkSchema,
  ErrorSchema,
  ShortlinkQuerySchema,
  ShortlinkSchema,
  UpdateShortlinkSchema,
} from "@knot/shared"
import * as shortlinkService from "../services/shortlink.service.js"

const getShortlinksRoute = createRoute({
  method: "get",
  path: "/",
  request: {
    query: ShortlinkQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.array(ShortlinkSchema),
        },
      },
      description: "List shortlinks",
    },
  },
})

const getShortlinkRoute = createRoute({
  method: "get",
  path: "/{slug}",
  request: {
    params: z.object({ slug: z.string() }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ShortlinkSchema,
        },
      },
      description: "Shortlink detail",
    },
  },
})

const createShortlinkRoute = createRoute({
  method: "post",
  path: "/",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateShortlinkSchema,
        },
      },
    },
  },
  responses: {
    201: {
      content: {
        "application/json": {
          schema: ShortlinkSchema,
        },
      },
      description: "Shortlink created",
    },
    409: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Slug already taken",
    },
  },
})

const deleteShortlinkRoute = createRoute({
  method: "delete",
  path: "/{slug}",
  request: {
    params: z.object({ slug: z.string() }),
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ShortlinkSchema,
        },
      },
      description: "Shortlink deleted",
    },
  },
})

const updateShortlinkRoute = createRoute({
  method: "patch",
  path: "/{slug}",
  request: {
    params: z.object({ slug: z.string() }),
    body: {
      content: {
        "application/json": {
          schema: UpdateShortlinkSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ShortlinkSchema,
        },
      },
      description: "Shortlink updated",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Shortlink not found",
    },
    409: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Slug already taken",
    },
  },
})

const bulkDeleteRoute = createRoute({
  method: "post",
  path: "/bulk-delete",
  request: {
    body: {
      content: {
        "application/json": {
          schema: BulkDeleteSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ deleted: z.number() }),
        },
      },
      description: "Bulk deleted shortlinks",
    },
  },
})

const bulkUpdateRoute = createRoute({
  method: "post",
  path: "/bulk-update",
  request: {
    body: {
      content: {
        "application/json": {
          schema: BulkUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ updated: z.number() }),
        },
      },
      description: "Bulk updated shortlinks",
    },
  },
})

const shortlinkRoutes = new OpenAPIHono<{ Variables: { userId: number } }>()

shortlinkRoutes.openapi(getShortlinksRoute, async (c) => {
  const query = c.req.valid("query")
  const { items, total } = await shortlinkService.list(c.get("userId"), query)
  c.header("X-Total-Count", String(total))
  return c.json(items)
})

shortlinkRoutes.openapi(getShortlinkRoute, async (c) => {
  const { slug } = c.req.valid("param")
  const link = await shortlinkService.getDetail(slug, c.get("userId"))
  return c.json(link)
})

shortlinkRoutes.openapi(createShortlinkRoute, async (c) => {
  const input = c.req.valid("json")
  const link = await shortlinkService.create(input, c.get("userId"))
  return c.json(link, 201)
})

shortlinkRoutes.openapi(deleteShortlinkRoute, async (c) => {
  const { slug } = c.req.valid("param")
  const link = await shortlinkService.remove(slug, c.get("userId"))
  return c.json(link)
})

shortlinkRoutes.openapi(updateShortlinkRoute, async (c) => {
  const { slug } = c.req.valid("param")
  const input = c.req.valid("json")
  const link = await shortlinkService.update(slug, c.get("userId"), input)
  return c.json(link, 200)
})

shortlinkRoutes.openapi(bulkDeleteRoute, async (c) => {
  const { slugs } = c.req.valid("json")
  const deleted = await shortlinkService.bulkRemove(slugs, c.get("userId"))
  return c.json({ deleted })
})

shortlinkRoutes.openapi(bulkUpdateRoute, async (c) => {
  const { slugs, campaignId } = c.req.valid("json")
  const updated = await shortlinkService.bulkAssignCampaign(
    slugs,
    campaignId,
    c.get("userId"),
  )
  return c.json({ updated })
})

export default shortlinkRoutes
