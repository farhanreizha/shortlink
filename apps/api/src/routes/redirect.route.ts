import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { ErrorSchema } from "../lib/schemas.js"
import * as shortlinkService from "../services/shortlink.service.js"

const SAFE_SCHEMES = ["http:", "https:"]

const redirectRoute = createRoute({
  method: "get",
  path: "/{slug}",
  request: {
    params: z.object({ slug: z.string() }),
  },
  responses: {
    302: {
      description: "Redirect to original URL",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Shortlink not found",
    },
  },
})

const redirectRoutes = new OpenAPIHono()

redirectRoutes.openapi(redirectRoute, async (c) => {
  const { slug } = c.req.valid("param")
  const link = await shortlinkService.getBySlug(slug)
  shortlinkService.incrementVisits(slug).catch(() => {})

  try {
    const url = new URL(link.url)
    if (!SAFE_SCHEMES.includes(url.protocol)) {
      return c.json({ message: "Invalid URL scheme" }, 400)
    }
  } catch {
    return c.json({ message: "Invalid URL" }, 400)
  }

  return c.redirect(link.url, 302)
})

export default redirectRoutes
