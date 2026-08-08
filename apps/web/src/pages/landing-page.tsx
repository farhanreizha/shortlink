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

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Enterprise", href: "#enterprise" },
  { label: "Resources", href: "#resources" },
]

const PLANS = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    tagline: "For personal projects and quick sharing.",
    features: [
      "Unlimited shortened links",
      "Basic click analytics",
      "Custom link aliases",
      "Community support",
    ],
    cta: "Get Started",
    featured: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "/mo",
    tagline: "For creators and marketers who need more.",
    features: [
      "Everything in Free",
      "Real-time analytics & charts",
      "Campaign management",
      "Custom branded domains",
      "Priority support",
    ],
    cta: "Start Free Trial",
    featured: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "For teams that need scale and control.",
    features: [
      "Everything in Pro",
      "SSO & team permissions",
      "Advanced security controls",
      "Dedicated success manager",
      "99.99% uptime SLA",
    ],
    cta: "Contact Sales",
    featured: false,
  },
]

const RESOURCES = [
  {
    icon: <BookOpen size={22} />,
    title: "Documentation",
    desc: "Guides and tutorials for getting the most out of Knot.",
  },
  {
    icon: <Code2 size={22} />,
    title: "API Reference",
    desc: "Integrate Knot links into your own applications.",
  },
  {
    icon: <TrendingUp size={22} />,
    title: "Link Marketing Tips",
    desc: "Best practices for driving more clicks and conversions.",
  },
  {
    icon: <LifeBuoy size={22} />,
    title: "Help Center",
    desc: "Answers to common questions and troubleshooting guides.",
  },
]

export function LandingPage() {
  return (
    <div>
      <Navbar links={NAV_LINKS}>
        <Link className="btn btn--ghost" href="/login">
          Sign In
        </Link>
        <Link className="btn btn--primary" href="/register">
          Get Started
        </Link>
      </Navbar>

      <main className="main">
        <Hero />

        <section className="landing-section" id="features">
          <Reveal>
            <span className="landing-section__eyebrow">Features</span>
            <h2 className="landing-section__title">
              Everything you need to manage links
            </h2>
            <p className="landing-section__desc">
              Simple tools designed for speed and reliability.
            </p>
          </Reveal>
          <div className="features-grid">
            <Reveal delay={0}>
              <FeatureCard
                icon={<Scissors size={32} />}
                title="Quick Shorten"
                tag="Lightning Fast"
                description="Instant link generation with one click. Paste, shorten, and go without unnecessary steps slowing you down."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <FeatureCard
                icon={<Share2 size={32} />}
                title="Easy Share"
                tag="Multi-Channel"
                description="Distribute your shortened links directly to social media platforms or generate high-quality QR codes instantly."
              />
            </Reveal>
            <Reveal delay={0.2}>
              <FeatureCard
                icon={<Gauge size={32} />}
                title="Simple Dashboard"
                tag="Analytics Included"
                description="Track clicks, analyze geographic data, and monitor performance in a clean, intuitive, distraction-free interface."
              />
            </Reveal>
          </div>
        </section>

        <section className="landing-section" id="pricing">
          <Reveal>
            <span className="landing-section__eyebrow">Pricing</span>
            <h2 className="landing-section__title">
              Simple, transparent pricing
            </h2>
            <p className="landing-section__desc">
              Start free. Upgrade when you're ready to grow.
            </p>
          </Reveal>
          <div className="pricing-grid">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.1}>
                <div
                  className={`card pricing-card${plan.featured ? " pricing-card--featured" : ""}`}
                >
                  {plan.featured && (
                    <span className="pricing-card__badge">Most Popular</span>
                  )}
                  <h3 className="pricing-card__name">{plan.name}</h3>
                  <div className="pricing-card__price">
                    <span className="pricing-card__amount">{plan.price}</span>
                    {plan.period && (
                      <span className="pricing-card__period">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="pricing-card__tagline">{plan.tagline}</p>
                  <ul className="pricing-card__features">
                    {plan.features.map((feature) => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <Link
                    className={`btn${plan.featured ? " btn--primary" : " btn--ghost"} pricing-card__cta`}
                    href="/register"
                  >
                    {plan.cta}
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
            <span className="landing-section__eyebrow">Enterprise</span>
            <h2 className="landing-section__title">Built for teams at scale</h2>
            <p className="landing-section__desc">
              Knot Enterprise gives your organization the controls, security and
              support it needs to manage links with confidence.
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
                    Enterprise-Grade Security
                  </h3>
                  <p className="reliability-card__desc">
                    HTTPS on all links with active malicious domain scanning.
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
                    Global Edge Network
                  </h3>
                  <p className="reliability-card__desc">
                    Redirects routed through the nearest edge node for maximum
                    speed.
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
                    SSO & Team Controls
                  </h3>
                  <p className="reliability-card__desc">
                    Single sign-on, role-based permissions and full audit logs.
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
            <span className="landing-section__eyebrow">Reliability</span>
            <h2 className="landing-section__title">
              Engineered for Reliability
            </h2>
            <p className="landing-section__desc">
              When you share a link, you need to know it will work every time.
              Knot is built on robust infrastructure designed to handle
              high-volume redirects with near-zero latency.
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
                    Enterprise-Grade Security
                  </h3>
                  <p className="reliability-card__desc">
                    HTTPS on all links with active malicious domain scanning.
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
                    Global Edge Network
                  </h3>
                  <p className="reliability-card__desc">
                    Redirects routed through the nearest edge node for maximum
                    speed.
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
            <span className="landing-section__eyebrow">Resources</span>
            <h2 className="landing-section__title">
              Learn, build and get help
            </h2>
            <p className="landing-section__desc">
              Everything you need to make the most of Knot.
            </p>
          </Reveal>
          <div className="reliability-grid">
            {RESOURCES.map((resource, i) => (
              <Reveal key={resource.title} delay={i * 0.1}>
                <div className="card reliability-card">
                  <div className="reliability-card__icon">{resource.icon}</div>
                  <div>
                    <h3 className="reliability-card__title">
                      {resource.title}
                    </h3>
                    <p className="reliability-card__desc">{resource.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="landing-cta" id="cta">
          <Reveal>
            <h2 className="landing-cta__title">
              Ready to optimize your links?
            </h2>
            <p className="landing-cta__desc">
              Join thousands of professionals who trust Knot for their URL
              management needs.
            </p>
            <Link className="landing-cta__btn" href="/register">
              Sign Up for Free
            </Link>
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  )
}
