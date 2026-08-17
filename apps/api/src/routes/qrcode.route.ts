import { eq } from "drizzle-orm"
import { Hono } from "hono"
import QRCode from "qrcode"
import { db } from "../db/index.js"
import { shortlinks } from "../db/schema.js"

const qrRoutes = new Hono<{ Variables: { userId: number } }>()

qrRoutes.get("/qrcode/:slug", async (c) => {
  const slug = c.req.param("slug")
  const size = Number(c.req.query("size") ?? "300")

  const link = await db
    .select({ userId: shortlinks.userId })
    .from(shortlinks)
    .where(eq(shortlinks.slug, slug))
    .limit(1)

  if (!link[0] || link[0].userId !== c.get("userId")) {
    return c.json({ message: "Link not found" }, 404)
  }

  const url = `${new URL(c.req.url).origin}/r/${slug}`
  const buffer = await QRCode.toBuffer(url, {
    width: Math.min(Math.max(size, 100), 1000),
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
