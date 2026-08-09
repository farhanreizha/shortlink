import { CheckCircle2, LinkIcon } from "lucide-react"
import { useLocation } from "wouter"
import { useI18n } from "../../lib/i18n"

export function Hero() {
  const [, navigate] = useLocation()
  const { t } = useI18n()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    navigate("/register")
  }

  return (
    <section className="landing-hero">
      <span className="landing-hero__eyebrow animate-slide-up">
        {t("hero.eyebrow")}
      </span>
      <h1
        className="landing-hero__title animate-slide-up"
        style={{ animationDelay: "0.1s" }}
      >
        {t("hero.title")}
      </h1>
      <p
        className="landing-hero__desc animate-slide-up"
        style={{ animationDelay: "0.2s" }}
      >
        {t("hero.desc")}
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
          placeholder={t("hero.placeholder")}
          aria-label={t("hero.placeholder")}
          defaultValue=""
        />
        <button className="landing-hero__submit" type="submit">
          {t("hero.submit")}
        </button>
      </form>
      <div
        className="landing-hero__badges animate-slide-up"
        style={{ animationDelay: "0.35s" }}
      >
        <span className="landing-badge">
          <CheckCircle2 size={16} /> {t("hero.badge1")}
        </span>
        <span className="landing-badge">
          <CheckCircle2 size={16} /> {t("hero.badge2")}
        </span>
      </div>
    </section>
  )
}
