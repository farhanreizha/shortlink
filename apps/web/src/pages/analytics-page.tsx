import type { User } from "@knot/shared"
import { useMemo, useState } from "react"
import { CountUp } from "../components/ui/count-up"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { Reveal } from "../components/ui/reveal"
import { Skeleton } from "../components/ui/skeleton"
import { useAnalytics } from "../hooks/use-analytics"

const RANGES = [
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "month", label: "This Month" },
  { key: "custom", label: "Custom Range…" },
] as const

const DEVICES = [
  { key: "mobile", label: "Mobile", color: "#0052ff" },
  { key: "desktop", label: "Desktop", color: "#00c1fd" },
  { key: "tablet", label: "Tablet", color: "#007462" },
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

export function AnalyticsPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { data, loading, error, query, setQuery } = useAnalytics()
  const [custom, setCustom] = useState({ start: "", end: "" })

  const maxBar = useMemo(
    () => Math.max(1, ...(data?.clicksOverTime.map((d) => d.count) ?? [1])),
    [data],
  )
  const maxLocation = useMemo(
    () => Math.max(1, ...(data?.clicksByLocation.map((l) => l.count) ?? [1])),
    [data],
  )

  function selectRange(key: (typeof RANGES)[number]["key"]) {
    if (key === "custom") {
      if (custom.start && custom.end) {
        setQuery({
          ...query,
          range: "custom",
          start: custom.start,
          end: custom.end,
        })
      }
      return
    }
    setQuery({ ...query, range: key, start: undefined, end: undefined })
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
            <h1 className="an-header__title">Analytics Overview</h1>
            <p className="an-header__desc">
              Track your link performance and audience engagement.
            </p>
          </div>
          <div className="an-range">
            {RANGES.map((r) => (
              <button
                key={r.key}
                type="button"
                className={`an-range__btn${query.range === r.key ? " an-range__btn--active" : ""}`}
                onClick={() => selectRange(r.key)}
              >
                {r.label}
              </button>
            ))}
          </div>
          {query.range === "custom" && (
            <div className="an-range__custom">
              <input
                type="date"
                aria-label="Start date"
                value={custom.start}
                onChange={(e) =>
                  setCustom({ ...custom, start: e.target.value })
                }
              />
              <span>to</span>
              <input
                type="date"
                aria-label="End date"
                value={custom.end}
                onChange={(e) => setCustom({ ...custom, end: e.target.value })}
              />
              <button
                className="btn btn--primary"
                type="button"
                onClick={() =>
                  custom.start &&
                  custom.end &&
                  setQuery({
                    ...query,
                    range: "custom",
                    start: custom.start,
                    end: custom.end,
                  })
                }
              >
                Apply
              </button>
            </div>
          )}
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
                    <span className="an-stat__label">Total Clicks</span>
                    <span className="an-stat__value">
                      <CountUp value={data.totalClicks} />
                    </span>
                  </div>
                </Reveal>
                <Reveal delay={0.06}>
                  <div className="an-stat">
                    <span className="an-stat__label">Unique Visitors</span>
                    <span className="an-stat__value">
                      <CountUp value={data.uniqueVisitors} />
                    </span>
                  </div>
                </Reveal>
                <Reveal delay={0.12}>
                  <div className="an-stat">
                    <span className="an-stat__label">Top Referral</span>
                    <span
                      className="an-stat__value an-stat__value--sm"
                      title={data.topReferral}
                    >
                      {data.topReferral}
                    </span>
                  </div>
                </Reveal>
                <Reveal delay={0.18}>
                  <div className="an-stat">
                    <span className="an-stat__label">Avg. CTR</span>
                    <span className="an-stat__value">
                      {data.avgCtr === null ? (
                        "—"
                      ) : (
                        <CountUp value={data.avgCtr} suffix="%" />
                      )}
                    </span>
                  </div>
                </Reveal>
              </div>

              <div className="an-grid">
                <Reveal className="an-card an-card--wide" delay={0.1}>
                  <div className="an-card__header">
                    <h2 className="an-card__title">Clicks Over Time</h2>
                    <div className="an-toggle">
                      <button
                        type="button"
                        className={`an-toggle__btn${query.bucket === "daily" ? " an-toggle__btn--active" : ""}`}
                        onClick={() => setQuery({ ...query, bucket: "daily" })}
                      >
                        Daily
                      </button>
                      <button
                        type="button"
                        className={`an-toggle__btn${query.bucket === "weekly" ? " an-toggle__btn--active" : ""}`}
                        onClick={() => setQuery({ ...query, bucket: "weekly" })}
                      >
                        Weekly
                      </button>
                    </div>
                  </div>
                  {data.clicksOverTime.length === 0 ? (
                    <div className="an-empty">No clicks in this period</div>
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
                  <h2 className="an-card__title">Clicks by Device</h2>
                  {deviceTotal === 0 ? (
                    <div className="an-empty">No clicks in this period</div>
                  ) : (
                    <div className="an-devices">
                      {DEVICES.map((d, i) => {
                        const count = data.clicksByDevice[d.key]
                        const pct = Math.round((count / deviceTotal) * 100)
                        return (
                          <div className="an-device" key={d.key}>
                            <div className="an-device__row">
                              <span>{d.label}</span>
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
                  <h2 className="an-card__title">Clicks by Location</h2>
                  {data.clicksByLocation.length === 0 ? (
                    <div className="an-empty">No clicks in this period</div>
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
                <h2 className="an-card__title">Top Performing Links</h2>
                {data.topLinks.length === 0 ? (
                  <div className="an-empty">No clicks in this period</div>
                ) : (
                  <table className="an-table">
                    <thead>
                      <tr>
                        <th>Link Details</th>
                        <th>Clicks</th>
                        <th>Unique</th>
                        <th>Status</th>
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
                            <span className="dash-link__status">Active</span>
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
