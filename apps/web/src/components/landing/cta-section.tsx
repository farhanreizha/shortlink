import { Link } from "wouter"
import { useI18n } from "../../lib/i18n"
import { Reveal } from "../ui/reveal"

export function CtaSection() {
  const { t } = useI18n()
  return (
    <section className="landing-cta" id="cta">
      <Reveal>
        <h2 className="landing-cta__title">{t("landing.ctaTitle")}</h2>
        <p className="landing-cta__desc">{t("landing.ctaDesc")}</p>
        <Link className="landing-cta__btn" href="/register">
          {t("landing.ctaBtn")}
        </Link>
      </Reveal>
    </section>
  )
}
