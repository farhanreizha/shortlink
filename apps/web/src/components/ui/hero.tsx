import { Zap } from "lucide-react"
import { Link } from "wouter"

export function Hero() {
  return (
    <section className="landing-hero">
      <Zap size={48} className="landing-hero__icon animate-fade-in" />
      <h1
        className="landing-hero__title animate-slide-up"
        style={{ animationDelay: "0.1s" }}
      >
        Short links, big impact
      </h1>
      <p
        className="landing-hero__desc animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        Create clean, memorable short links in seconds. Share them anywhere and
        track everything from one dashboard.
      </p>
      <Link
        className="btn btn--primary landing-hero__cta animate-slide-up"
        href="/register"
        style={{ animationDelay: "0.3s" }}
      >
        Get Started &rarr;
      </Link>
    </section>
  )
}
