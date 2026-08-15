import { type LegalPrefix, META, SECTIONS } from "../constants/legal"
import { useI18n } from "../lib/i18n"

export function LegalContent({ prefix }: { prefix: LegalPrefix }) {
  const { t } = useI18n()
  const meta = META[prefix]
  return (
    <div className="static-page__inner">
      <h1 className="static-page__title">{t(meta.title)}</h1>
      <p className="static-page__desc">
        {t(meta.updated)} · {t(meta.intro)}
      </p>
      {SECTIONS[prefix].map(([title, body]) => (
        <section key={title} className="static-page__section">
          <h2>{t(title)}</h2>
          <p>{t(body, { email: t("support.contactEmail") })}</p>
        </section>
      ))}
    </div>
  )
}
