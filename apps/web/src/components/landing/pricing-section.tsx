import { Link } from "wouter"
import { PLANS } from "../../constants/landing"
import { useI18n } from "../../lib/i18n"
import { Reveal } from "../ui/reveal"
import { SectionHeader } from "./section-header"

export function PricingSection() {
  const { t } = useI18n()
  return (
    <section className="landing-section" id="pricing">
      <SectionHeader
        eyebrowKey="nav.pricing"
        titleKey="pricing.title"
        descKey="pricing.desc"
      />
      <div className="pricing-grid">
        {PLANS.map((plan, i) => (
          <Reveal key={plan.nameKey} delay={i * 0.1}>
            <div
              className={`card pricing-card${plan.featured ? " pricing-card--featured" : ""}`}
            >
              {plan.featured && (
                <span className="pricing-card__badge">
                  {t("pricing.mostPopular")}
                </span>
              )}
              <h3 className="pricing-card__name">{t(plan.nameKey)}</h3>
              <div className="pricing-card__price">
                <span className="pricing-card__amount">{t(plan.priceKey)}</span>
                {plan.periodKey && (
                  <span className="pricing-card__period">
                    {t(plan.periodKey)}
                  </span>
                )}
              </div>
              <p className="pricing-card__tagline">{t(plan.taglineKey)}</p>
              <ul className="pricing-card__features">
                {plan.featureKeys.map((key) => (
                  <li key={key}>{t(key)}</li>
                ))}
              </ul>
              <Link
                className={`btn${plan.featured ? " btn--primary" : " btn--ghost"} pricing-card__cta`}
                href="/register"
              >
                {t(plan.ctaKey)}
              </Link>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
