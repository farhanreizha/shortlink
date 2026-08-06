import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import {
  CreateShortlinkSchema,
  ShortlinkQuerySchema,
  ShortlinkSchema,
  UpdateShortlinkSchema,
} from "@knot/shared"
import { ErrorSchema } from "../lib/schemas.js"
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

const shortlinkRoutes = new OpenAPIHono<{ Variables: { userId: number } }>()

shortlinkRoutes.openapi(getShortlinksRoute, async (c) => {
  const query = c.req.valid("query")
  const links = await shortlinkService.list(c.get("userId"), query)
  return c.json(links)
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

export default shortlinkRoutes
