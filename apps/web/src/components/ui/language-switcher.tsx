import { Languages } from "lucide-react"
import { useI18n } from "../../lib/i18n"

export function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()
  const next = lang === "id" ? "en" : "id"
  return (
    <button
      type="button"
      className="lang-switch"
      aria-label={t("lang.switchTo", { lang: next.toUpperCase() })}
      title={t("lang.switchTo", { lang: next.toUpperCase() })}
      onClick={() => setLang(next)}
    >
      <Languages size={16} />
      <span>{lang === "id" ? "EN" : "ID"}</span>
    </button>
  )
}
