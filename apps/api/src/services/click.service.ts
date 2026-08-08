import { createHash } from "node:crypto"
import { db } from "../db/index.js"
import { clicks } from "../db/schema.js"

// ponytail: regex UA parse + header geo, no geo/device libs; upgrade when accuracy matters
function parseDevice(userAgent: string): "mobile" | "desktop" | "tablet" {
  if (/ipad|tablet/i.test(userAgent)) return "tablet"
  if (/android|iphone|mobile/i.test(userAgent)) return "mobile"
  return "desktop"
}

function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  return forwarded || headers.get("x-real-ip") || ""
}

export async function recordClick(shortlinkId: number, headers: Headers) {
  const ua = headers.get("user-agent") ?? ""
  const ip = getClientIp(headers)
  const visitor = ip
    ? createHash("sha256").update(ip).digest("hex").slice(0, 16)
    : "anon"

  await db.insert(clicks).values({
    shortlinkId,
    device: parseDevice(ua),
    country: headers.get("cf-ipcountry") ?? headers.get("x-vercel-ip-country") ?? "Unknown",
    referrer: headers.get("referer") ?? "",
    visitor,
  })
}
