import type { User } from "@knot/shared"
import { ArrowLeft } from "lucide-react"
import { Link, useRoute } from "wouter"
import { ClicksChart } from "../components/analytics/clicks-chart"
import { DeviceBars } from "../components/analytics/device-bars"
import { LocationBars } from "../components/analytics/location-bars"
import { AnalyticsRangePicker } from "../components/analytics/range-picker"
import { StatCard } from "../components/analytics/stat-card"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { Reveal } from "../components/ui/reveal"
import { Skeleton } from "../components/ui/skeleton"
import { useLinkAnalytics } from "../hooks/use-link-analytics"
import { useI18n } from "../lib/i18n"

function ReferrerTable({
  data,
}: {
  data: { referrer: string; count: number }[]
}) {
  const { t } = useI18n()
  if (data.length === 0) return null
  return (
    <div className="an-card">
      <h2 className="an-card__title">{t("an.topReferrers")}</h2>
      <table className="cl-table">
        <thead>
          <tr>
            <th>{t("an.referrer")}</th>
            <th>{t("an.clicks")}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.referrer}>
              <td>{r.referrer}</td>
              <td>{r.count.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function LinkAnalyticsPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { t } = useI18n()
  const [, params] = useRoute("/analytics/:slug")
  const slug = params?.slug ?? ""
  const { data, loading, error, query, setQuery } = useLinkAnalytics(slug)

  return (
    <DashboardShell user={user} onLogout={onLogout} activeNav="analytics">
      <div className="an-page">
        <div className="an-header">
          <div>
            <h1 className="an-header__title">{t("an.linkTitle", { slug })}</h1>
            {data && (
              <p className="an-header__desc" title={data.url}>
                {data.url}
              </p>
            )}
          </div>
          <div className="an-header__actions">
            <AnalyticsRangePicker query={query} onChange={setQuery} />
            <Link className="btn btn--ghost" href="/analytics">
              <ArrowLeft size={16} />
              {t("an.backToOverview")}
            </Link>
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
              style={{ height: 240, borderRadius: "var(--radius-lg)" }}
            />
          </div>
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
                <ReferrerTable data={data.topReferrers} />
              </Reveal>
            </>
          )
        )}
      </div>
    </DashboardShell>
  )
}
