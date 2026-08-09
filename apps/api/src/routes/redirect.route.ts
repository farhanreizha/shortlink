import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { ErrorSchema } from "../lib/schemas.js"
import { isBlockedRedirectUrl } from "../lib/url-safety.js"
import { recordClick } from "../services/click.service.js"
import * as shortlinkService from "../services/shortlink.service.js"

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
  // ponytail: fire-and-forget, redirect latency must not wait on click log
  shortlinkService.incrementVisits(slug).catch(() => {})
  recordClick(link.id, c.req.raw.headers).catch(() => {})

  const blocked = isBlockedRedirectUrl(link.url)
  if (blocked) return c.json({ message: blocked }, 400)

  return c.redirect(link.url, 302)
})

export default redirectRoutes
