import type { AnalyticsQuery } from "@knot/shared"
import { useI18n } from "../../lib/i18n"

export function ClicksChart({
  data,
  query,
  onChange,
}: {
  data: Array<{ date: string; count: number }>
  query: AnalyticsQuery
  onChange: (q: AnalyticsQuery) => void
}) {
  const { t } = useI18n()
  const max = Math.max(1, ...data.map((d) => d.count))

  return (
    <div className="an-card an-card--wide">
      <div className="an-card__header">
        <h2 className="an-card__title">{t("an.clicksOverTime")}</h2>
        <div className="an-toggle">
          <button
            type="button"
            className={`an-toggle__btn${query.bucket === "daily" ? " an-toggle__btn--active" : ""}`}
            onClick={() => onChange({ ...query, bucket: "daily" })}
          >
            {t("an.daily")}
          </button>
          <button
            type="button"
            className={`an-toggle__btn${query.bucket === "weekly" ? " an-toggle__btn--active" : ""}`}
            onClick={() => onChange({ ...query, bucket: "weekly" })}
          >
            {t("an.weekly")}
          </button>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="an-empty">{t("an.noClicks")}</div>
      ) : (
        <div className="an-bars">
          {data.map((d, i) => (
            <div
              className="an-bars__col"
              key={d.date}
              title={`${d.date}: ${d.count}`}
            >
              <div
                className="an-bars__bar"
                style={{
                  height: `${Math.max(4, (d.count / max) * 100)}%`,
                  animationDelay: `${i * 0.015}s`,
                }}
              />
              <span className="an-bars__label">{d.date.slice(5)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
