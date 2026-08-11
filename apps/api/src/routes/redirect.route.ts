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
  // ponytail: awaited on serverless — Vercel can freeze the function before fire-and-forget writes land; ~10ms latency tradeoff
  await Promise.allSettled([
    shortlinkService.incrementVisits(slug),
    recordClick(link.id, c.req.raw.headers),
  ])

  const blocked = isBlockedRedirectUrl(link.url)
  if (blocked) return c.json({ message: blocked }, 400)

  c.header("Referrer-Policy", "no-referrer")
  return c.redirect(link.url, 302)
})

export default redirectRoutes
