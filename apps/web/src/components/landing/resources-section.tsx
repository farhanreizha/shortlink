import { RESOURCES } from "../../constants/landing"
import { ReliabilityCard } from "./reliability-card"
import { SectionHeader } from "./section-header"

export function ResourcesSection() {
  return (
    <section
      className="landing-section landing-section--bordered"
      id="resources"
    >
      <SectionHeader
        eyebrowKey="landing.resourcesEyebrow"
        titleKey="landing.resourcesTitle"
        descKey="landing.resourcesDesc"
      />
      <div className="reliability-grid">
        {RESOURCES.map((resource, i) => (
          <ReliabilityCard
            key={resource.titleKey}
            icon={resource.icon}
            titleKey={resource.titleKey}
            descKey={resource.descKey}
            delay={i * 0.1}
          />
        ))}
      </div>
    </section>
  )
}
