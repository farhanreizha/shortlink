import { Waypoints } from "lucide-react"
import { Link } from "wouter"
import { useI18n } from "../../lib/i18n"

export function Footer() {
  const { t } = useI18n()
  return (
    <footer className="landing-footer">
      <div className="landing-footer__inner">
        <div className="landing-footer__brand">
          <Link className="landing-footer__logo" href="/">
            <span className="landing-footer__logo-mark">
              <Waypoints size={16} />
            </span>
            Knot
          </Link>
          <p className="landing-footer__tagline">{t("footer.tagline")}</p>
        </div>

        <div className="landing-footer__col">
          <span className="landing-footer__heading">{t("footer.product")}</span>
          <Link className="landing-footer__link" href="/login">
            {t("footer.login")}
          </Link>
          <Link className="landing-footer__link" href="/register">
            {t("footer.getStarted")}
          </Link>
        </div>

        <div className="landing-footer__col" id="resources">
          <span className="landing-footer__heading">
            {t("footer.resources")}
          </span>
          <a className="landing-footer__link" href="#features">
            {t("footer.features")}
          </a>
          <a className="landing-footer__link" href="#reliability">
            {t("footer.reliability")}
          </a>
        </div>
      </div>

      <div className="landing-footer__bottom">
        {t("footer.rights", { year: new Date().getFullYear() })}
      </div>
    </footer>
  )
}
