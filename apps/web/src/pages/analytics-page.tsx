import type { User } from "@knot/shared"
import { useEffect, useMemo, useState } from "react"
import { type DateRange, DayPicker } from "react-day-picker"
import "react-day-picker/style.css"
import { CountUp } from "../components/ui/count-up"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { Reveal } from "../components/ui/reveal"
import { Skeleton } from "../components/ui/skeleton"
import { useAnalytics } from "../hooks/use-analytics"
import { useI18n } from "../lib/i18n"

const RANGES = [
  { key: "7d", labelKey: "an.range7d" },
  { key: "30d", labelKey: "an.range30d" },
  { key: "month", labelKey: "an.rangeMonth" },
  { key: "custom", labelKey: "an.rangeCustom" },
] as const

const DEVICES = [
  { key: "mobile", labelKey: "an.deviceMobile", color: "#0052ff" },
  { key: "desktop", labelKey: "an.deviceDesktop", color: "#00c1fd" },
  { key: "tablet", labelKey: "an.deviceTablet", color: "#007462" },
] as const

function countryFlag(country: string) {
  if (country === "Unknown" || country.length !== 2) return "🌐"
  const base = 0x1f1e6
  const a = country.charCodeAt(0) - 65
  const b = country.charCodeAt(1) - 65
  if (a < 0 || a > 25 || b < 0 || b > 25) return "🌐"
  return String.fromCodePoint(base + a, base + b)
}

function formatCompact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

function fmtDate(d: Date) {
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${d.getFullYear()}-${m}-${day}`
}

function parseDate(s: string) {
  const [y = 0, m = 1, d = 1] = s.split("-").map(Number)
  return new Date(y, m - 1, d)
}

const fmtShort = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" })

export function AnalyticsPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { data, loading, error, query, setQuery } = useAnalytics()
  const { t } = useI18n()
  const [customRange, setCustomRange] = useState<DateRange>()
  const [customOpen, setCustomOpen] = useState(false)

  const maxBar = useMemo(
    () => Math.max(1, ...(data?.clicksOverTime.map((d) => d.count) ?? [1])),
    [data],
  )
  const maxLocation = useMemo(
    () => Math.max(1, ...(data?.clicksByLocation.map((l) => l.count) ?? [1])),
    [data],
  )

  useEffect(() => {
    if (!customOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCustomOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [customOpen])

  function selectRange(key: (typeof RANGES)[number]["key"]) {
    if (key === "custom") {
      if (query.range === "custom" && query.start && query.end) {
        setCustomRange({
          from: parseDate(query.start),
          to: parseDate(query.end),
        })
      }
      setCustomOpen(true)
      return
    }
    setCustomOpen(false)
    setQuery({ ...query, range: key, start: undefined, end: undefined })
  }

  function applyCustom() {
    if (!customRange?.from || !customRange?.to) return
    setCustomOpen(false)
    setQuery({
      ...query,
      range: "custom",
      start: fmtDate(customRange.from),
      end: fmtDate(customRange.to),
    })
  }

  const deviceTotal = data
    ? data.clicksByDevice.mobile +
      data.clicksByDevice.desktop +
      data.clicksByDevice.tablet
    : 0

  return (
    <DashboardShell user={user} onLogout={onLogout} activeNav="analytics">
      <div className="an-page">
        <div className="an-header">
          <div>
            <h1 className="an-header__title">{t("an.title")}</h1>
            <p className="an-header__desc">{t("an.desc")}</p>
          </div>
          <div className="an-range-wrap">
            <div className="an-range">
              {RANGES.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className={`an-range__btn${query.range === r.key || (r.key === "custom" && customOpen) ? " an-range__btn--active" : ""}`}
                  onClick={() => selectRange(r.key)}
                >
                  {t(r.labelKey)}
                </button>
              ))}
            </div>
            {customOpen && (
              <>
                <button
                  type="button"
                  className="an-cal-backdrop"
                  aria-label={t("an.closePicker")}
                  onClick={() => setCustomOpen(false)}
                />
                <div
                  className="an-cal-popover"
                  role="dialog"
                  aria-label={t("an.selectRange")}
                >
                  <DayPicker
                    mode="range"
                    selected={customRange}
                    onSelect={setCustomRange}
                    disabled={{ after: new Date() }}
                  />
                  <div className="an-cal-popover__footer">
                    <span className="an-cal-popover__summary">
                      {customRange?.from && customRange?.to
                        ? `${fmtShort(customRange.from)} – ${fmtShort(customRange.to)}`
                        : t("an.selectDates")}
                    </span>
                    <div className="an-cal-popover__actions">
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => setCustomOpen(false)}
                      >
                        {t("an.cancel")}
                      </button>
                      <button
                        type="button"
                        className="btn btn--primary"
                        disabled={!customRange?.from || !customRange?.to}
                        onClick={applyCustom}
                      >
                        {t("an.apply")}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {error && <div className="an-error">{error}</div>}

        {loading && !data ? (
          <div className="an-loading">
            <Skeleton
              style={{ height: 96, borderRadius: "var(--radius-lg)" }}
            />
            <Skeleton
              style={{ height: 96, borderRadius: "var(--radius-lg)" }}
            />
            <Skeleton
              style={{ height: 96, borderRadius: "var(--radius-lg)" }}
            />
            <Skeleton
              style={{ height: 96, borderRadius: "var(--radius-lg)" }}
            />
          </div>
        ) : (
          data && (
            <>
              <div className="an-stats">
                <Reveal delay={0}>
                  <div className="an-stat">
                    <span className="an-stat__label">
                      {t("an.totalClicks")}
                    </span>
                    <span className="an-stat__value">
                      <CountUp value={data.totalClicks} />
                    </span>
                  </div>
                </Reveal>
                <Reveal delay={0.06}>
                  <div className="an-stat">
                    <span className="an-stat__label">
                      {t("an.uniqueVisitors")}
                    </span>
                    <span className="an-stat__value">
                      <CountUp value={data.uniqueVisitors} />
                    </span>
                  </div>
                </Reveal>
                <Reveal delay={0.12}>
                  <div className="an-stat">
                    <span className="an-stat__label">
                      {t("an.topReferral")}
                    </span>
                    <span
                      className="an-stat__value an-stat__value--sm"
                      title={data.topReferral}
                    >
                      {data.topReferral}
                    </span>
                  </div>
                </Reveal>
              </div>

              <div className="an-grid">
                <Reveal className="an-card an-card--wide" delay={0.1}>
                  <div className="an-card__header">
                    <h2 className="an-card__title">{t("an.clicksOverTime")}</h2>
                    <div className="an-toggle">
                      <button
                        type="button"
                        className={`an-toggle__btn${query.bucket === "daily" ? " an-toggle__btn--active" : ""}`}
                        onClick={() => setQuery({ ...query, bucket: "daily" })}
                      >
                        {t("an.daily")}
                      </button>
                      <button
                        type="button"
                        className={`an-toggle__btn${query.bucket === "weekly" ? " an-toggle__btn--active" : ""}`}
                        onClick={() => setQuery({ ...query, bucket: "weekly" })}
                      >
                        {t("an.weekly")}
                      </button>
                    </div>
                  </div>
                  {data.clicksOverTime.length === 0 ? (
                    <div className="an-empty">{t("an.noClicks")}</div>
                  ) : (
                    <div className="an-bars">
                      {data.clicksOverTime.map((d, i) => (
                        <div
                          className="an-bars__col"
                          key={d.date}
                          title={`${d.date}: ${d.count}`}
                        >
                          <div
                            className="an-bars__bar"
                            style={{
                              height: `${Math.max(4, (d.count / maxBar) * 100)}%`,
                              animationDelay: `${i * 0.015}s`,
                            }}
                          />
                          <span className="an-bars__label">
                            {d.date.slice(5)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </Reveal>

                <Reveal className="an-card" delay={0.2}>
                  <h2 className="an-card__title">{t("an.byDevice")}</h2>
                  {deviceTotal === 0 ? (
                    <div className="an-empty">{t("an.noClicks")}</div>
                  ) : (
                    <div className="an-devices">
                      {DEVICES.map((d, i) => {
                        const count = data.clicksByDevice[d.key]
                        const pct = Math.round((count / deviceTotal) * 100)
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
                </Reveal>

                <Reveal className="an-card" delay={0.3}>
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
                                width: `${Math.round((l.count / maxLocation) * 100)}%`,
                                background: "var(--color-primary)",
                                animationDelay: `${0.3 + i * 0.1}s`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Reveal>
              </div>

              <Reveal className="an-card" delay={0.1}>
                <h2 className="an-card__title">{t("an.topLinks")}</h2>
                {data.topLinks.length === 0 ? (
                  <div className="an-empty">{t("an.noClicks")}</div>
                ) : (
                  <table className="an-table">
                    <thead>
                      <tr>
                        <th>{t("an.colDetails")}</th>
                        <th>{t("an.colClicks")}</th>
                        <th>{t("an.colUnique")}</th>
                        <th>{t("common.status")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.topLinks.map((link) => (
                        <tr key={link.id}>
                          <td>
                            <div className="an-table__slug">
                              {window.location.origin}/r/{link.slug}
                            </div>
                            <div className="an-table__url" title={link.url}>
                              {link.url}
                            </div>
                          </td>
                          <td>{link.clicks.toLocaleString()}</td>
                          <td>{link.unique.toLocaleString()}</td>
                          <td>
                            <span className="dash-link__status">
                              {t("common.active")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </Reveal>
            </>
          )
        )}
      </div>
    </DashboardShell>
  )
}
