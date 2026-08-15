import { type MessageKey, useI18n } from "../../lib/i18n"
import { Reveal } from "../ui/reveal"

export function SectionHeader({
  eyebrowKey,
  titleKey,
  descKey,
}: {
  eyebrowKey: MessageKey
  titleKey: MessageKey
  descKey: MessageKey
}) {
  const { t } = useI18n()
  return (
    <Reveal>
      <span className="landing-section__eyebrow">{t(eyebrowKey)}</span>
      <h2 className="landing-section__title">{t(titleKey)}</h2>
      <p className="landing-section__desc">{t(descKey)}</p>
    </Reveal>
  )
}
