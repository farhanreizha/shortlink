import type { AnalyticsOverview } from "@knot/shared"
import { countryFlag } from "../../lib/format"
import { useI18n } from "../../lib/i18n"

export function LocationBars({ data }: { data: AnalyticsOverview }) {
  const { t } = useI18n()
  const max = Math.max(1, ...data.clicksByLocation.map((l) => l.count))

  return (
    <div className="an-card">
      <h2 className="an-card__title">{t("an.byLocation")}</h2>
      {data.clicksByLocation.length === 0 ? (
        <div className="an-empty">{t("an.noClicks")}</div>
      ) : (
        <div className="an-locations">
          {data.clicksByLocation.map((l, i) => (
            <div className="an-location" key={l.country}>
              <div className="an-location__row">
                <span>
                  <span className="an-location__flag">
                    {countryFlag(l.country)}
                  </span>
                  {l.country}
                </span>
                <span>{l.pct}%</span>
              </div>
              <div className="an-device__track">
                <div
                  className="an-device__fill"
                  style={{
                    width: `${Math.round((l.count / max) * 100)}%`,
                    background: "var(--color-primary)",
                    animationDelay: `${0.3 + i * 0.1}s`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
