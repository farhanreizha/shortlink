import { Gauge, Rocket, Scissors, Share2, ShieldCheck } from "lucide-react"
import { Link } from "wouter"
import { FeatureCard } from "../components/ui/feature-card"
import { Footer } from "../components/ui/footer"
import { Hero } from "../components/ui/hero"
import { Navbar } from "../components/ui/navbar"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#cta" },
  { label: "Enterprise", href: "#reliability" },
  { label: "Resources", href: "#resources" },
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
          <span className="landing-section__eyebrow">Features</span>
          <h2 className="landing-section__title">
            Everything you need to manage links
          </h2>
          <p className="landing-section__desc">
            Simple tools designed for speed and reliability.
          </p>
          <div className="features-grid">
            <FeatureCard
              icon={<Scissors size={32} />}
              title="Quick Shorten"
              tag="Lightning Fast"
              description="Instant link generation with one click. Paste, shorten, and go without unnecessary steps slowing you down."
              delay={0.1}
            />
            <FeatureCard
              icon={<Share2 size={32} />}
              title="Easy Share"
              tag="Multi-Channel"
              description="Distribute your shortened links directly to social media platforms or generate high-quality QR codes instantly."
              delay={0.15}
            />
            <FeatureCard
              icon={<Gauge size={32} />}
              title="Simple Dashboard"
              tag="Analytics Included"
              description="Track clicks, analyze geographic data, and monitor performance in a clean, intuitive, distraction-free interface."
              delay={0.2}
            />
          </div>
        </section>

        <section
          className="landing-section landing-section--bordered"
          id="reliability"
        >
          <span className="landing-section__eyebrow">Reliability</span>
          <h2 className="landing-section__title">Engineered for Reliability</h2>
          <p className="landing-section__desc">
            When you share a link, you need to know it will work every time.
            Knot is built on robust infrastructure designed to handle
            high-volume redirects with near-zero latency.
          </p>
          <div className="reliability-grid">
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
            <div className="card reliability-card">
              <div className="reliability-card__icon">
                <Rocket size={24} />
              </div>
              <div>
                <h3 className="reliability-card__title">Global Edge Network</h3>
                <p className="reliability-card__desc">
                  Redirects routed through the nearest edge node for maximum
                  speed.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-cta" id="cta">
          <h2 className="landing-cta__title">Ready to optimize your links?</h2>
          <p className="landing-cta__desc">
            Join thousands of professionals who trust Knot for their URL
            management needs.
          </p>
          <Link className="landing-cta__btn" href="/register">
            Sign Up for Free
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
