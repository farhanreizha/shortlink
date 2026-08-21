import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { ErrorSchema } from "@knot/shared"
import QRCode from "qrcode"
import * as shortlinkService from "../services/shortlink.service.js"

const qrRoute = createRoute({
  method: "get",
  path: "/{slug}",
  request: {
    params: z.object({ slug: z.string() }),
    query: z.object({
      size: z.coerce.number().int().min(100).max(1000).default(300),
    }),
  },
  responses: {
    200: {
      content: { "image/png": { schema: z.string() } },
      description: "QR code PNG",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "Shortlink not found",
    },
  },
})

const qrRoutes = new OpenAPIHono<{ Variables: { userId: number } }>()

qrRoutes.openapi(qrRoute, async (c) => {
  const { slug } = c.req.valid("param")
  const { size } = c.req.valid("query")
  await shortlinkService.getOwnedIdBySlug(slug, c.get("userId"))

  const url = `${new URL(c.req.url).origin}/r/${slug}`
  const buffer = await QRCode.toBuffer(url, {
    width: size,
    margin: 2,
    color: { dark: "#000000", light: "#ffffff" },
  })

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  })
})

export default qrRoutes
