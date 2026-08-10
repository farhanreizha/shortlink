import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const dist = join(root, "dist")
const ssrDir = join(root, "dist-ssr")

const entryName = readdirSync(ssrDir).find((f) =>
  f.startsWith("prerender-entry"),
)
if (!entryName) throw new Error("SSR entry not found in dist-ssr")

const { renderRoute, seoRoutes } = await import(
  pathToFileURL(join(ssrDir, entryName)).href
)

const template = readFileSync(join(dist, "index.html"), "utf8")

function replaceTag(html, pattern, value) {
  const re = new RegExp(pattern)
  if (!re.test(html)) throw new Error(`Tag not found: ${pattern}`)
  return html.replace(re, value)
}

for (const route of seoRoutes) {
  const body = renderRoute(route.path)
  let html = template.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
  html = replaceTag(html, /<title>.*?<\/title>/, `<title>${route.title}</title>`)
  html = replaceTag(
    html,
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${route.description}"`,
  )
  html = replaceTag(
    html,
    /<link rel="canonical" href="[^"]*"/,
    `<link rel="canonical" href="https://shortlink.example.com${route.path}"`,
  )
  html = replaceTag(
    html,
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="https://shortlink.example.com${route.path}"`,
  )
  html = replaceTag(
    html,
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${route.title}"`,
  )
  html = replaceTag(
    html,
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${route.description}"`,
  )
  html = replaceTag(
    html,
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${route.title}"`,
  )
  html = replaceTag(
    html,
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${route.description}"`,
  )

  if (route.path === "/") {
    writeFileSync(join(dist, "index.html"), html)
  } else {
    const dir = join(dist, route.path.slice(1))
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, "index.html"), html)
  }
  console.log(`prerendered ${route.path}`)
}
