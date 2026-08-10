import { describe, expect, it } from "vitest"
import { isBlockedRedirectUrl } from "../lib/url-safety.js"

describe("isBlockedRedirectUrl", () => {
  it("allows public URLs", () => {
    expect(isBlockedRedirectUrl("https://8.8.8.8/x")).toBeNull()
    expect(isBlockedRedirectUrl("https://1.1.1.1")).toBeNull()
    expect(isBlockedRedirectUrl("https://example.com/path?q=1")).toBeNull()
  })

  it("rejects invalid URLs and non-http schemes", () => {
    expect(isBlockedRedirectUrl("not a url")).toBe("Invalid URL")
    expect(isBlockedRedirectUrl("ftp://example.com")).toBe(
      "URL must use the http or https scheme",
    )
    expect(isBlockedRedirectUrl("javascript:alert(1)")).toBe(
      "URL must use the http or https scheme",
    )
  })

  it("rejects local and metadata hostnames", () => {
    expect(isBlockedRedirectUrl("http://localhost")).toMatch(/local/i)
    expect(isBlockedRedirectUrl("http://foo.localhost/x")).toMatch(/local/i)
    expect(isBlockedRedirectUrl("http://metadata.google.internal")).toMatch(
      /local/i,
    )
  })

  it("rejects private and reserved IPs", () => {
    for (const host of [
      "10.0.0.5",
      "192.168.1.1",
      "172.16.0.1",
      "172.31.255.254",
      "127.0.0.1",
      "169.254.169.254",
      "100.64.0.1",
      "198.18.0.1",
      "224.0.0.1",
      "0.0.0.0",
    ]) {
      expect(isBlockedRedirectUrl(`https://${host}/x`)).toMatch(
        /private|reserved/i,
      )
    }
  })

  it("rejects blocked IPv6 addresses", () => {
    expect(isBlockedRedirectUrl("https://[::1]/")).toMatch(/private|reserved/i)
    expect(isBlockedRedirectUrl("https://[fd00::1]/")).toMatch(
      /private|reserved/i,
    )
    expect(isBlockedRedirectUrl("https://[fe80::1]/")).toMatch(
      /private|reserved/i,
    )
    expect(isBlockedRedirectUrl("https://[2001:4860:4860::8888]/")).toBeNull()
  })
})
