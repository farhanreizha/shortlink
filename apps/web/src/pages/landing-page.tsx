import { LayoutDashboard, Scissors, Share2 } from "lucide-react"
import { Link } from "wouter"
import { FeatureCard } from "../components/ui/feature-card"
import { Footer } from "../components/ui/footer"
import { Hero } from "../components/ui/hero"
import { Navbar } from "../components/ui/navbar"

export function LandingPage() {
  return (
    <div>
      <Navbar>
        <Link className="btn btn--ghost" href="/login">
          Sign In
        </Link>
        <Link className="btn btn--primary" href="/register">
          Get Started
        </Link>
      </Navbar>

      <main className="main">
        <Hero />

        <section className="features-grid">
          <FeatureCard
            icon={<Scissors size={32} />}
            title="Quick Shorten"
            description="Create short links in seconds with our instant URL shortener."
            delay={0.1}
          />
          <FeatureCard
            icon={<Share2 size={32} />}
            title="Easy Share"
            description="Share clean, memorable links across all your channels."
            delay={0.15}
          />
          <FeatureCard
            icon={<LayoutDashboard size={32} />}
            title="Simple Dashboard"
            description="Manage all your links from one place — view, copy, and organise."
            delay={0.2}
          />
        </section>
      </main>

      <Footer />
    </div>
  )
}
