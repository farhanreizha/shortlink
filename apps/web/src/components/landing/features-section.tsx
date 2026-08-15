import { Gauge, Scissors, Share2 } from "lucide-react"
import { useI18n } from "../../lib/i18n"
import { FeatureCard } from "../ui/feature-card"
import { Reveal } from "../ui/reveal"
import { SectionHeader } from "./section-header"

const FEATURES = [
  { icon: <Scissors size={32} />, key: "landing.feature1" },
  { icon: <Share2 size={32} />, key: "landing.feature2" },
  { icon: <Gauge size={32} />, key: "landing.feature3" },
] as const

export function FeaturesSection() {
  const { t } = useI18n()
  return (
    <section className="landing-section" id="features">
      <SectionHeader
        eyebrowKey="landing.featuresEyebrow"
        titleKey="landing.featuresTitle"
        descKey="landing.featuresDesc"
      />
      <div className="features-grid">
        {FEATURES.map((f, i) => (
          <Reveal key={f.key} delay={i * 0.1}>
            <FeatureCard
              icon={f.icon}
              title={t(`${f.key}.title`)}
              tag={t(`${f.key}.tag`)}
              description={t(`${f.key}.desc`)}
            />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
