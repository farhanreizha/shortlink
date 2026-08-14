import { BlockList, isIP } from "node:net"

const BLOCKED_HOSTNAMES = [
  "localhost",
  "metadata",
  "metadata.google.internal",
  "metadata.internal",
  "instance-data",
  "instance-data.ec2.internal",
] as const

// Node's BlockList only supports IPv4; IPv6 stays hand-rolled.
// Revisit when BlockList.addSubnet supports IPv6 (tracked in nodejs/node#xxxxx)
const BLOCKED_IPV4 = new BlockList()
BLOCKED_IPV4.addSubnet("0.0.0.0", 8)
BLOCKED_IPV4.addSubnet("10.0.0.0", 8)
BLOCKED_IPV4.addSubnet("127.0.0.0", 8)
BLOCKED_IPV4.addSubnet("169.254.0.0", 16)
BLOCKED_IPV4.addSubnet("172.16.0.0", 12)
BLOCKED_IPV4.addSubnet("192.168.0.0", 16)
BLOCKED_IPV4.addSubnet("100.64.0.0", 10)
BLOCKED_IPV4.addSubnet("198.18.0.0", 15)
BLOCKED_IPV4.addSubnet("224.0.0.0", 3)

function isBlockedIPv6(host: string): boolean {
  if (host === "::" || host === "::1") return true
  const first = host.split(":")[0] ?? ""
  if (!/^[0-9a-f]{1,4}$/.test(first)) return false
  const val = parseInt(first, 16)
  if (
    (val >= 0xfc00 && val <= 0xfdff) || // ULA fc00::/7
    (val >= 0xfe80 && val <= 0xfebf) || // link-local fe80::/10
    val >= 0xff00 // multicast ff00::/8
  ) {
    return true
  }
  return false
}

export function isBlockedRedirectUrl(raw: string): string | null {
  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return "Invalid URL"
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "URL must use the http or https scheme"
  }

  const host = url.hostname.replace(/^\[|\]$/g, "").toLowerCase()

  if (
    host === "" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    (BLOCKED_HOSTNAMES as readonly string[]).includes(host)
  ) {
    return "Redirects to local or internal addresses are not allowed"
  }

  const family = isIP(host)
  if (family === 4 && BLOCKED_IPV4.check(host)) {
    return "Redirects to private or reserved addresses are not allowed"
  }
  if (family === 6 && isBlockedIPv6(host)) {
    return "Redirects to private or reserved addresses are not allowed"
  }

  return null
}
