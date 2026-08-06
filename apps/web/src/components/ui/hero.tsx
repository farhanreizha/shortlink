import { CheckCircle2, LinkIcon } from "lucide-react"
import { useLocation } from "wouter"

export function Hero() {
  const [, navigate] = useLocation()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate("/register")
  }

  return (
    <section className="landing-hero">
      <span className="landing-hero__eyebrow animate-slide-up">
        Knot URL Shortener
      </span>
      <h1
        className="landing-hero__title animate-slide-up"
        style={{ animationDelay: "0.1s" }}
      >
        Shorten Your Links, Expand Your Reach
      </h1>
      <p
        className="landing-hero__desc animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        Transform long, unwieldy URLs into concise, manageable links in seconds.
        Knot provides the speed and reliability your infrastructure demands.
      </p>
      <form
        className="landing-hero__form animate-slide-up"
        style={{ animationDelay: "0.3s" }}
        onSubmit={handleSubmit}
      >
        <span className="landing-hero__prefix">
          <LinkIcon size={20} />
        </span>
        <input
          className="landing-hero__input"
          type="url"
          placeholder="Paste a long URL here..."
          aria-label="URL to shorten"
          defaultValue=""
        />
        <button className="landing-hero__submit" type="submit">
          Shorten
        </button>
      </form>
      <div
        className="landing-hero__badges animate-slide-up"
        style={{ animationDelay: "0.35s" }}
      >
        <span className="landing-badge">
          <CheckCircle2 size={16} /> No credit card required
        </span>
        <span className="landing-badge">
          <CheckCircle2 size={16} /> Free plan available
        </span>
      </div>
    </section>
  )
}
