import type { AnalyticsOverview } from "@knot/shared"
import { DEVICES } from "../../constants/analytics"
import { formatCompact } from "../../lib/format"
import { useI18n } from "../../lib/i18n"

export function DeviceBars({
  data,
}: {
  data: Pick<AnalyticsOverview, "clicksByDevice">
}) {
  const { t } = useI18n()
  const total =
    data.clicksByDevice.mobile +
    data.clicksByDevice.desktop +
    data.clicksByDevice.tablet

  return (
    <div className="an-card">
      <h2 className="an-card__title">{t("an.byDevice")}</h2>
      {total === 0 ? (
        <div className="an-empty">{t("an.noClicks")}</div>
      ) : (
        <div className="an-devices">
          {DEVICES.map((d, i) => {
            const count = data.clicksByDevice[d.key]
            const pct = Math.round((count / total) * 100)
            return (
              <div className="an-device" key={d.key}>
                <div className="an-device__row">
                  <span>{t(d.labelKey)}</span>
                  <span>
                    {pct}% · {formatCompact(count)}
                  </span>
                </div>
                <div className="an-device__track">
                  <div
                    className="an-device__fill"
                    style={{
                      width: `${pct}%`,
                      background: d.color,
                      animationDelay: `${0.3 + i * 0.1}s`,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
