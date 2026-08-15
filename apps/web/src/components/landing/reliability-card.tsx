import type { ReactNode } from "react"
import { type MessageKey, useI18n } from "../../lib/i18n"
import { Reveal } from "../ui/reveal"

export function ReliabilityCard({
  icon,
  titleKey,
  descKey,
  delay = 0,
}: {
  icon: ReactNode
  titleKey: MessageKey
  descKey: MessageKey
  delay?: number
}) {
  const { t } = useI18n()
  return (
    <Reveal delay={delay}>
      <div className="card reliability-card">
        <div className="reliability-card__icon">{icon}</div>
        <div>
          <h3 className="reliability-card__title">{t(titleKey)}</h3>
          <p className="reliability-card__desc">{t(descKey)}</p>
        </div>
      </div>
    </Reveal>
  )
}
