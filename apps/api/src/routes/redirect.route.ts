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

const LOGO_MARK =
  '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4.5" r="2.5"/><path d="m10.2 6.3-3.9 3.9"/><circle cx="4.5" cy="12" r="2.5"/><path d="M7 12h10"/><circle cx="19.5" cy="12" r="2.5"/><path d="m13.8 17.7 3.9-3.9"/><circle cx="12" cy="19.5" r="2.5"/></svg>'

const PAGE_CSS = `
:root{--primary:#0052ff;--primary-hover:#003ec7;--border:#c3c5d9;--text:#131b2e;--text-secondary:#5b616e;--error:#df2935;--radius-sm:4px;--radius-md:8px;--radius-lg:16px;--radius-btn:12px;--shadow-card:0 4px 20px rgba(15,23,42,.05)}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:"Space Grotesk",system-ui,sans-serif;font-size:16px;line-height:1.5;color:var(--text);background:radial-gradient(1000px 600px at 85% -10%,rgba(0,82,255,.06),transparent 60%),#faf8ff;display:flex;flex-direction:column;min-height:100vh;-webkit-font-smoothing:antialiased}
.navbar{height:72px;background:rgba(250,248,255,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 24px;position:sticky;top:0;z-index:10}
.navbar__inner{max-width:1280px;width:100%;margin:0 auto}
.logo{display:flex;align-items:center;gap:8px;font-size:20px;font-weight:700;color:var(--text);letter-spacing:-.02em}
.logo__mark{width:30px;height:30px;border-radius:var(--radius-md);background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,82,255,.3)}
.page{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 16px}
.card{background:#fff;border:1px solid var(--border);border-radius:var(--radius-lg);box-shadow:var(--shadow-card);padding:2rem;width:min(360px,100%)}
h1{font-size:1.25rem;font-weight:700;margin:0 0 .25rem}
p.sub{color:var(--text-secondary);font-size:.9rem;margin:0 0 1.25rem}
label{display:block;font-size:.875rem;font-weight:500;margin-bottom:.4rem}
input{width:100%;height:44px;padding:0 .8rem;border:1px solid var(--border);border-radius:var(--radius-md);background:#fff;color:var(--text);font:inherit;outline:none;transition:border-color .15s,box-shadow .15s}
input:focus{border-color:var(--primary);box-shadow:0 0 0 4px rgba(0,82,255,.1)}
button{width:100%;height:44px;margin-top:1rem;border:none;border-radius:var(--radius-btn);background:var(--primary);color:#fff;font:inherit;font-weight:700;cursor:pointer;transition:background .15s}
button:hover{background:var(--primary-hover)}
.error{color:var(--error);font-size:.85rem;margin-top:.6rem}
.expired{text-align:center}
.expired p{color:var(--text-secondary);margin-top:.25rem}
.expired code{font-family:ui-monospace,monospace;background:rgba(0,82,255,.08);color:var(--primary);padding:2px 6px;border-radius:var(--radius-sm)}
`

function pageShell(title: string, content: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title>
<meta name="robots" content="noindex">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet">
<style>${PAGE_CSS}</style></head>
<body><header class="navbar"><div class="navbar__inner"><span class="logo"><span class="logo__mark">${LOGO_MARK}</span>Knot</span></div></header>
<div class="page">${content}</div></body></html>`
}

function passwordForm(slug: string, error = false) {
  return pageShell(
    "Protected link",
    `<div class="card"><form method="post" action="/r/${escapeHtml(slug)}"><h1>Protected link</h1><p class="sub">Enter the password to continue.</p>
<label for="password">Password</label>
<input type="password" id="password" name="password" placeholder="Enter your password" autofocus autocomplete="current-password">
<button type="submit">Unlock</button>${error ? '<p class="error">Incorrect password. Try again.</p>' : ""}</form></div>`,
  )
}

function expiredPage(slug: string) {
  return pageShell(
    "Link expired",
    `<div class="card expired"><h1>This link has expired</h1><p>The link <code>/${escapeHtml(slug)}</code> is no longer available.</p></div>`,
  )
}

const redirectRoutes = new OpenAPIHono()

redirectRoutes.openapi(redirectRoute, async (c) => {
  const { slug } = c.req.valid("param")
  const link = await shortlinkService.getBySlug(slug)

  if (link.expiresAt && link.expiresAt.getTime() < Date.now()) {
    return c.html(expiredPage(slug))
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
