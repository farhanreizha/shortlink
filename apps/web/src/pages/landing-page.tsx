import { Link } from "wouter"
import { CtaSection } from "../components/landing/cta-section"
import { FeaturesSection } from "../components/landing/features-section"
import { PricingSection } from "../components/landing/pricing-section"
import {
  ENTERPRISE_ITEMS,
  RELIABILITY_ITEMS,
  ReliabilitySection,
} from "../components/landing/reliability-section"
import { ResourcesSection } from "../components/landing/resources-section"
import { Footer } from "../components/ui/footer"
import { Hero } from "../components/ui/hero"
import { Navbar } from "../components/ui/navbar"
import { NAV_LINKS } from "../constants/landing"
import { useI18n } from "../lib/i18n"

export function LandingPage({
  user,
  onLogout,
}: {
  user?: { username: string } | null
  onLogout?: () => void
}) {
  const { t } = useI18n()
  const navLinks = NAV_LINKS.map((l) => ({ ...l, label: t(l.labelKey) }))

  return (
    <div>
      <Navbar links={navLinks} user={user} onLogout={onLogout}>
        <Link className="btn btn--ghost" href="/login">
          {t("nav.signIn")}
        </Link>
        <Link className="btn btn--primary" href="/register">
          {t("nav.getStarted")}
        </Link>
      </Navbar>

      <main className="main">
        <Hero />
        <FeaturesSection />
        <PricingSection />
        <ReliabilitySection
          id="enterprise"
          eyebrowKey="landing.enterpriseEyebrow"
          titleKey="landing.enterpriseTitle"
          descKey="landing.enterpriseDesc"
          items={ENTERPRISE_ITEMS}
        />
        <ReliabilitySection
          id="reliability"
          eyebrowKey="landing.reliabilityEyebrow"
          titleKey="landing.reliabilityTitle"
          descKey="landing.reliabilityDesc"
          items={RELIABILITY_ITEMS}
        />
        <ResourcesSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  )
}
