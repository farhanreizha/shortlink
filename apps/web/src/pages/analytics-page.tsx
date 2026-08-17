import type { User } from "@knot/shared"
import { Download } from "lucide-react"
import { ClicksChart } from "../components/analytics/clicks-chart"
import { DeviceBars } from "../components/analytics/device-bars"
import { LocationBars } from "../components/analytics/location-bars"
import { AnalyticsRangePicker } from "../components/analytics/range-picker"
import { StatCard } from "../components/analytics/stat-card"
import { TopLinksTable } from "../components/analytics/top-links-table"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { Reveal } from "../components/ui/reveal"
import { Skeleton } from "../components/ui/skeleton"
import { useAnalytics } from "../hooks/use-analytics"
import { downloadCsv } from "../lib/csv"
import { useI18n } from "../lib/i18n"

export function AnalyticsPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { data, loading, error, query, setQuery } = useAnalytics()
  const { t } = useI18n()

  function handleExport() {
    if (!data) return
    downloadCsv(
      "analytics.csv",
      [t("an.date"), t("an.clicks")],
      data.clicksOverTime.map((r) => [r.date, String(r.count)]),
    )
  }

  return (
    <DashboardShell user={user} onLogout={onLogout} activeNav="analytics">
      <div className="an-page">
        <div className="an-header">
          <div>
            <h1 className="an-header__title">{t("an.title")}</h1>
            <p className="an-header__desc">{t("an.desc")}</p>
          </div>
          <div className="an-header__actions">
            <AnalyticsRangePicker query={query} onChange={setQuery} />
            <button
              className="btn btn--ghost"
              type="button"
              onClick={handleExport}
              disabled={!data}
            >
              <Download size={16} />
              {t("an.exportCsv")}
            </button>
          </div>
        </div>

        {error && <div className="an-error">{error}</div>}

        {loading && !data ? (
          <>
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
            </div>
            <div className="an-grid" style={{ marginTop: 16 }}>
              <Skeleton
                style={{
                  height: 240,
                  gridColumn: "1 / -1",
                  borderRadius: "var(--radius-lg)",
                }}
              />
              <Skeleton
                style={{ height: 180, borderRadius: "var(--radius-lg)" }}
              />
              <Skeleton
                style={{ height: 180, borderRadius: "var(--radius-lg)" }}
              />
            </div>
            <Skeleton
              style={{
                height: 200,
                marginTop: 16,
                borderRadius: "var(--radius-lg)",
              }}
            />
          </>
        ) : (
          data && (
            <>
              <div className="an-stats">
                <StatCard
                  label={t("an.totalClicks")}
                  value={data.totalClicks}
                  delay={0}
                />
                <StatCard
                  label={t("an.uniqueVisitors")}
                  value={data.uniqueVisitors}
                  delay={0.06}
                />
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
                <Reveal delay={0.1}>
                  <ClicksChart
                    data={data.clicksOverTime}
                    query={query}
                    onChange={setQuery}
                  />
                </Reveal>
                <Reveal delay={0.2}>
                  <DeviceBars data={data} />
                </Reveal>
                <Reveal delay={0.3}>
                  <LocationBars data={data} />
                </Reveal>
              </div>

              <Reveal delay={0.1}>
                <TopLinksTable data={data} />
              </Reveal>
            </>
          )
        )}
      </div>
    </DashboardShell>
  )
}
