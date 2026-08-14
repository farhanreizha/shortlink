export const SITE = {
  name: "Knot",
  domain: "https://web-knot.vercel.app",
  image: "/og-image.svg",
} as const

export interface RouteSeo {
  path: string
  title: string
  description: string
}

export const seoRoutes: RouteSeo[] = [
  {
    path: "/",
    title: "Knot — Free URL Shortener & Link Manager",
    description:
      "Transform long, unwieldy URLs into concise, manageable links in seconds. Knot provides the speed and reliability your infrastructure demands.",
  },
  {
    path: "/privacy",
    title: "Privacy Policy — Knot",
    description:
      "How Knot collects, uses, and protects your information when you use our URL shortener service.",
  },
  {
    path: "/terms",
    title: "Terms of Service — Knot",
    description:
      "The terms governing your use of Knot's URL shortening, link management, and click analytics service.",
  },
  {
    path: "/support",
    title: "Support — Knot",
    description: "Find answers to common questions or get in touch with us.",
  },
]
