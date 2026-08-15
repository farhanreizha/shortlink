import { BookOpen, Code2, LifeBuoy, TrendingUp } from "lucide-react"
import type { ReactNode } from "react"
import type { MessageKey } from "../lib/i18n"

export const NAV_LINKS = [
  { labelKey: "nav.features", href: "#features" },
  { labelKey: "nav.pricing", href: "#pricing" },
  { labelKey: "nav.enterprise", href: "#enterprise" },
  { labelKey: "nav.resources", href: "#resources" },
] as const

export const PLANS: Array<{
  nameKey: MessageKey
  priceKey: MessageKey
  periodKey?: MessageKey
  taglineKey: MessageKey
  featureKeys: MessageKey[]
  ctaKey: MessageKey
  featured: boolean
}> = [
  {
    nameKey: "pricing.free.name",
    priceKey: "pricing.free.price",
    periodKey: "pricing.free.period",
    taglineKey: "pricing.free.tagline",
    featureKeys: [
      "pricing.free.feat1",
      "pricing.free.feat2",
      "pricing.free.feat3",
      "pricing.free.feat4",
    ],
    ctaKey: "pricing.free.cta",
    featured: false,
  },
  {
    nameKey: "pricing.pro.name",
    priceKey: "pricing.pro.price",
    periodKey: "pricing.pro.period",
    taglineKey: "pricing.pro.tagline",
    featureKeys: [
      "pricing.pro.feat1",
      "pricing.pro.feat2",
      "pricing.pro.feat3",
      "pricing.pro.feat4",
      "pricing.pro.feat5",
    ],
    ctaKey: "pricing.pro.cta",
    featured: true,
  },
  {
    nameKey: "pricing.enterprise.name",
    priceKey: "pricing.enterprise.price",
    taglineKey: "pricing.enterprise.tagline",
    featureKeys: [
      "pricing.enterprise.feat1",
      "pricing.enterprise.feat2",
      "pricing.enterprise.feat3",
      "pricing.enterprise.feat4",
      "pricing.enterprise.feat5",
    ],
    ctaKey: "pricing.enterprise.cta",
    featured: false,
  },
]
export const RESOURCES: Array<{
  icon: ReactNode
  titleKey: MessageKey
  descKey: MessageKey
}> = [
  {
    icon: <BookOpen size={22} />,
    titleKey: "landing.resource1.title",
    descKey: "landing.resource1.desc",
  },
  {
    icon: <Code2 size={22} />,
    titleKey: "landing.resource2.title",
    descKey: "landing.resource2.desc",
  },
  {
    icon: <TrendingUp size={22} />,
    titleKey: "landing.resource3.title",
    descKey: "landing.resource3.desc",
  },
  {
    icon: <LifeBuoy size={22} />,
    titleKey: "landing.resource4.title",
    descKey: "landing.resource4.desc",
  },
]
