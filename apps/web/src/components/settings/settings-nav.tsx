import { SETTINGS_NAV, type SettingsTab } from "../../constants/settings"
import { useI18n } from "../../lib/i18n"

export function SettingsNav({
  tab,
  onSelect,
}: {
  tab: SettingsTab
  onSelect: (tab: SettingsTab) => void
}) {
  const { t } = useI18n()
  return (
    <aside className="set-sidebar">
      <h1 className="set-sidebar__title">{t("set.title")}</h1>
      <nav className="set-nav" aria-label={t("set.navAria")}>
        {SETTINGS_NAV.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`set-nav__item${tab === item.key ? " set-nav__item--active" : ""}`}
            onClick={() => onSelect(item.key)}
          >
            <item.icon size={20} />
            {t(item.labelKey)}
          </button>
        ))}
      </nav>
    </aside>
  )
}
