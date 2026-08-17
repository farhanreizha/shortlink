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
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Protected link</title>
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<style>
:root{--primary:#0052ff;--primary-hover:#003ec7;--border:#c3c5d9;--text:#131b2e;--text-secondary:#5b616e;--error:#df2935;--radius-md:8px;--radius-lg:16px;--radius-btn:12px;--shadow-card:0 4px 20px rgba(15,23,42,.05)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Space Grotesk",system-ui,sans-serif;font-size:16px;line-height:1.5;color:var(--text);background:radial-gradient(1000px 600px at 85% -10%,rgba(0,82,255,.06),transparent 60%),#faf8ff;display:flex;align-items:center;justify-content:center;min-height:100vh;-webkit-font-smoothing:antialiased}
.card{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-card);padding:2rem;width:min(360px,calc(100vw - 2rem))}
h1{font-size:1.25rem;font-weight:700;margin:0 0 .25rem}
p.sub{color:var(--text-secondary);font-size:.9rem;margin:0 0 1.25rem}
label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.4rem}
input{width:100%;height:44px;padding:0 .8rem;border:1px solid var(--border);border-radius:var(--radius-md);background:#fff;color:var(--text);font:inherit;outline:none;transition:border-color .15s,box-shadow .15s}
input:focus{border-color:var(--primary);box-shadow:0 0 0 4px rgba(0,82,255,.1)}
button{width:100%;height:44px;margin-top:1rem;border:none;border-radius:var(--radius-btn);background:var(--primary);color:#fff;font:inherit;font-weight:700;cursor:pointer;transition:background .15s}
button:hover{background:var(--primary-hover)}
.error{color:var(--error);font-size:.85rem;margin-top:.6rem}</style></head>
<body><div class="card"><form method="post" action="/r/${escapeHtml(slug)}"><h1>Protected link</h1><p class="sub">Enter the password to continue.</p>
<label for="password">Password</label>
<input type="password" id="password" name="password" placeholder="Enter your password" autofocus autocomplete="current-password">
<button type="submit">Unlock</button>${error ? '<p class="error">Incorrect password. Try again.</p>' : ""}</form></div></body></html>`
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
