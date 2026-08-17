import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi"
import { ErrorSchema } from "@knot/shared"
import { getCookie, setCookie } from "hono/cookie"
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

// ponytail: UA list for social crawlers only (not SEO bots — those get the 302)
const SOCIAL_BOTS =
  /twitterbot|facebookexternalhit|linkedinbot|slackbot|discordbot|whatsapp|telegrambot|pinterest|embedly|iframely|tumblr|vkShare/i

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function passwordForm(slug: string, error = false) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Protected link</title>
<meta name="robots" content="noindex">
<style>body{font-family:system-ui,sans-serif;background:#0f1115;color:#e6e8eb;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}form{background:#1a1d24;border:1px solid #2b2f38;border-radius:12px;padding:2rem;width:320px}h1{font-size:1.2rem;margin:0 0 .25rem}p{color:#9aa0a6;margin:0 0 1rem;font-size:.9rem}input{width:100%;box-sizing:border-box;padding:.6rem .8rem;border:1px solid #2b2f38;border-radius:8px;background:#0f1115;color:#e6e8eb;font-size:1rem}button{width:100%;margin-top:.8rem;padding:.6rem;border:none;border-radius:8px;background:#3b82f6;color:#fff;font-size:1rem;cursor:pointer}.error{color:#f87171;font-size:.85rem;margin-top:.6rem}</style></head>
<body><form method="post" action="/r/${escapeHtml(slug)}"><h1>Protected link</h1><p>Enter the password to continue.</p>
<input type="password" name="password" placeholder="Password" autofocus autocomplete="current-password">
<button type="submit">Unlock</button>${error ? '<p class="error">Incorrect password. Try again.</p>' : ""}</form></body></html>`
}

const redirectRoutes = new OpenAPIHono()

redirectRoutes.openapi(redirectRoute, async (c) => {
  const { slug } = c.req.valid("param")
  const link = await shortlinkService.getBySlug(slug)

  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
    return c.html(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Link expired</title>
<meta name="robots" content="noindex">
<style>body{font-family:system-ui,sans-serif;background:#0f1115;color:#e6e8eb;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center}h1{font-size:1.4rem;margin-bottom:.5rem}p{color:#9aa0a6}</style></head>
<body><div><h1>This link has expired</h1><p>The link <strong>/${escapeHtml(slug)}</strong> is no longer available.</p></div></body></html>`,
    )
  }

  if (link.password) {
    if (getCookie(c, `knot_${slug}`) !== link.password) {
      return c.html(passwordForm(slug))
    }
  }

  const blocked = isBlockedRedirectUrl(link.url)
  if (blocked) return c.json({ message: blocked }, 400)

  const shortUrl = `${new URL(c.req.url).origin}/r/${slug}`
  const userAgent = c.req.header("user-agent") ?? ""
  if (SOCIAL_BOTS.test(userAgent)) {
    const title = link.title ?? link.slug
    const description = link.description ?? link.url
    return c.html(
      `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="https://${escapeHtml(shortUrl)}">
<meta name="twitter:card" content="summary">
<meta http-equiv="refresh" content="0;url=${escapeHtml(link.url)}">
<title>${escapeHtml(title)}</title></head><body><a href="${escapeHtml(link.url)}">Continue</a></body></html>`,
    )
  }

  // ponytail: awaited on serverless — Vercel can freeze the function before fire-and-forget writes land; ~10ms latency tradeoff
  await Promise.allSettled([
    shortlinkService.incrementVisits(slug),
    recordClick(link.id, c.req.raw.headers),
  ])

  c.header("Referrer-Policy", "no-referrer")
  return c.redirect(link.url, 302)
})

redirectRoutes.post("/:slug", async (c) => {
  const slug = c.req.param("slug") ?? ""
  const link = await shortlinkService.getBySlug(slug)
  if (!link.password) return c.redirect(`/r/${slug}`, 302)

  const body = await c.req.parseBody()
  const password = typeof body.password === "string" ? body.password : ""
  const ok = await shortlinkService.verifyLinkPassword(slug, password)
  if (!ok) {
    return c.html(passwordForm(slug, true))
  }
  setCookie(c, `knot_${slug}`, link.password, {
    httpOnly: true,
    sameSite: "Lax",
    path: `/r/${slug}`,
    maxAge: 60 * 60 * 24 * 30,
  })
  return c.redirect(`/r/${slug}`, 302)
})

export default redirectRoutes
