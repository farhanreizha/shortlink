import net from "node:net"

const BLOCKED_HOSTNAMES = [
  "localhost",
  "metadata",
  "metadata.google.internal",
  "metadata.internal",
  "instance-data",
  "instance-data.ec2.internal",
] as const

// ponytail: blocks literal private/loopback/link-local IPs and known
// metadata hostnames without DNS resolution; internal hostnames that
// resolve to private addresses are not caught — add a dns.lookup pass
// if the deployment ever points at internal services
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

  const family = net.isIP(host)
  if (family === 4 && isBlockedIPv4(host)) {
    return "Redirects to private or reserved addresses are not allowed"
  }
  if (family === 6 && isBlockedIPv6(host)) {
    return "Redirects to private or reserved addresses are not allowed"
  }

  return null
}

function isBlockedIPv4(host: string): boolean {
  const [a = 0, b = 0] = host.split(".").map(Number)
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  )
}

function isBlockedIPv6(host: string): boolean {
  if (host === "::" || host === "::1") return true

  if (host.startsWith("::ffff:")) {
    return isBlockedIPv4(host.slice("::ffff:".length))
  }

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
