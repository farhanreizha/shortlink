import {
  BookOpen,
  Code2,
  Gauge,
  LifeBuoy,
  Rocket,
  Scissors,
  Share2,
  ShieldCheck,
  TrendingUp,
} from "lucide-react"
import { Link } from "wouter"
import { FeatureCard } from "../components/ui/feature-card"
import { Footer } from "../components/ui/footer"
import { Hero } from "../components/ui/hero"
import { Navbar } from "../components/ui/navbar"
import { Reveal } from "../components/ui/reveal"
import { type MessageKey, useI18n } from "../lib/i18n"

const NAV_LINKS = [
  { labelKey: "nav.features", href: "#features" },
  { labelKey: "nav.pricing", href: "#pricing" },
  { labelKey: "nav.enterprise", href: "#enterprise" },
  { labelKey: "nav.resources", href: "#resources" },
] as const

const PLANS: Array<{
  nameKey: MessageKey
  price?: string
  priceKey?: MessageKey
  periodKey?: MessageKey
  taglineKey: MessageKey
  featureKeys: MessageKey[]
  ctaKey: MessageKey
  featured: boolean
}> = [
  {
    nameKey: "pricing.free.name",
    price: "Rp0",
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
    price: "Rp49.000",
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

const RESOURCES = [
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
] as const

export function LandingPage() {
  const { t } = useI18n()
  const navLinks = NAV_LINKS.map((l) => ({ ...l, label: t(l.labelKey) }))

  return (
    <div>
      <Navbar links={navLinks}>
        <Link className="btn btn--ghost" href="/login">
          {t("nav.signIn")}
        </Link>
        <Link className="btn btn--primary" href="/register">
          {t("nav.getStarted")}
        </Link>
      </Navbar>

      <main className="main">
        <Hero />

        <section className="landing-section" id="features">
          <Reveal>
            <span className="landing-section__eyebrow">
              {t("landing.featuresEyebrow")}
            </span>
            <h2 className="landing-section__title">
              {t("landing.featuresTitle")}
            </h2>
            <p className="landing-section__desc">{t("landing.featuresDesc")}</p>
          </Reveal>
          <div className="features-grid">
            <Reveal delay={0}>
              <FeatureCard
                icon={<Scissors size={32} />}
                title={t("landing.feature1.title")}
                tag={t("landing.feature1.tag")}
                description={t("landing.feature1.desc")}
              />
            </Reveal>
            <Reveal delay={0.1}>
              <FeatureCard
                icon={<Share2 size={32} />}
                title={t("landing.feature2.title")}
                tag={t("landing.feature2.tag")}
                description={t("landing.feature2.desc")}
              />
            </Reveal>
            <Reveal delay={0.2}>
              <FeatureCard
                icon={<Gauge size={32} />}
                title={t("landing.feature3.title")}
                tag={t("landing.feature3.tag")}
                description={t("landing.feature3.desc")}
              />
            </Reveal>
          </div>
        </section>

        <section className="landing-section" id="pricing">
          <Reveal>
            <span className="landing-section__eyebrow">{t("nav.pricing")}</span>
            <h2 className="landing-section__title">{t("pricing.title")}</h2>
            <p className="landing-section__desc">{t("pricing.desc")}</p>
          </Reveal>
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
                    <span className="pricing-card__amount">
                      {plan.priceKey ? t(plan.priceKey) : plan.price}
                    </span>
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

        <section
          className="landing-section landing-section--bordered"
          id="enterprise"
        >
          <Reveal>
            <span className="landing-section__eyebrow">
              {t("landing.enterpriseEyebrow")}
            </span>
            <h2 className="landing-section__title">
              {t("landing.enterpriseTitle")}
            </h2>
            <p className="landing-section__desc">
              {t("landing.enterpriseDesc")}
            </p>
          </Reveal>
          <div className="reliability-grid">
            <Reveal>
              <div className="card reliability-card">
                <div className="reliability-card__icon">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="reliability-card__title">
                    {t("landing.reliability1.title")}
                  </h3>
                  <p className="reliability-card__desc">
                    {t("landing.reliability1.desc")}
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="card reliability-card">
                <div className="reliability-card__icon">
                  <Rocket size={24} />
                </div>
                <div>
                  <h3 className="reliability-card__title">
                    {t("landing.reliability2.title")}
                  </h3>
                  <p className="reliability-card__desc">
                    {t("landing.reliability2.desc")}
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="card reliability-card">
                <div className="reliability-card__icon">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="reliability-card__title">
                    {t("landing.reliability3.title")}
                  </h3>
                  <p className="reliability-card__desc">
                    {t("landing.reliability3.desc")}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          className="landing-section landing-section--bordered"
          id="reliability"
        >
          <Reveal>
            <span className="landing-section__eyebrow">
              {t("landing.reliabilityEyebrow")}
            </span>
            <h2 className="landing-section__title">
              {t("landing.reliabilityTitle")}
            </h2>
            <p className="landing-section__desc">
              {t("landing.reliabilityDesc")}
            </p>
          </Reveal>
          <div className="reliability-grid">
            <Reveal>
              <div className="card reliability-card">
                <div className="reliability-card__icon">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="reliability-card__title">
                    {t("landing.reliability1.title")}
                  </h3>
                  <p className="reliability-card__desc">
                    {t("landing.reliability1.desc")}
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="card reliability-card">
                <div className="reliability-card__icon">
                  <Rocket size={24} />
                </div>
                <div>
                  <h3 className="reliability-card__title">
                    {t("landing.reliability2.title")}
                  </h3>
                  <p className="reliability-card__desc">
                    {t("landing.reliability2.desc")}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section
          className="landing-section landing-section--bordered"
          id="resources"
        >
          <Reveal>
            <span className="landing-section__eyebrow">
              {t("landing.resourcesEyebrow")}
            </span>
            <h2 className="landing-section__title">
              {t("landing.resourcesTitle")}
            </h2>
            <p className="landing-section__desc">
              {t("landing.resourcesDesc")}
            </p>
          </Reveal>
          <div className="reliability-grid">
            {RESOURCES.map((resource, i) => (
              <Reveal key={resource.titleKey} delay={i * 0.1}>
                <div className="card reliability-card">
                  <div className="reliability-card__icon">{resource.icon}</div>
                  <div>
                    <h3 className="reliability-card__title">
                      {t(resource.titleKey)}
                    </h3>
                    <p className="reliability-card__desc">
                      {t(resource.descKey)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="landing-cta" id="cta">
          <Reveal>
            <h2 className="landing-cta__title">{t("landing.ctaTitle")}</h2>
            <p className="landing-cta__desc">{t("landing.ctaDesc")}</p>
            <Link className="landing-cta__btn" href="/register">
              {t("landing.ctaBtn")}
            </Link>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  )
}
