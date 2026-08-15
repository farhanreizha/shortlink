import { Rocket, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"
import type { MessageKey } from "../../lib/i18n"
import { ReliabilityCard } from "./reliability-card"
import { SectionHeader } from "./section-header"

export const ENTERPRISE_ITEMS = [
  {
    icon: <ShieldCheck size={24} />,
    titleKey: "landing.reliability1.title",
    descKey: "landing.reliability1.desc",
  },
  {
    icon: <Rocket size={24} />,
    titleKey: "landing.reliability2.title",
    descKey: "landing.reliability2.desc",
  },
  {
    icon: <ShieldCheck size={24} />,
    titleKey: "landing.reliability3.title",
    descKey: "landing.reliability3.desc",
  },
] as const

export const RELIABILITY_ITEMS = [
  {
    icon: <ShieldCheck size={24} />,
    titleKey: "landing.reliability1.title",
    descKey: "landing.reliability1.desc",
  },
  {
    icon: <Rocket size={24} />,
    titleKey: "landing.reliability2.title",
    descKey: "landing.reliability2.desc",
  },
] as const

export function ReliabilitySection({
  id,
  eyebrowKey,
  titleKey,
  descKey,
  items,
}: {
  id: string
  eyebrowKey: MessageKey
  titleKey: MessageKey
  descKey: MessageKey
  items: ReadonlyArray<{
    icon: ReactNode
    titleKey: MessageKey
    descKey: MessageKey
  }>
}) {
  return (
    <section className="landing-section landing-section--bordered" id={id}>
      <SectionHeader
        eyebrowKey={eyebrowKey}
        titleKey={titleKey}
        descKey={descKey}
      />
      <div className="reliability-grid">
        {items.map((item, i) => (
          <ReliabilityCard
            key={item.titleKey}
            icon={item.icon}
            titleKey={item.titleKey}
            descKey={item.descKey}
            delay={i * 0.1}
          />
        ))}
      </div>
    </section>
  )
}
