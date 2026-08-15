import type { AnalyticsOverview } from "@knot/shared"
import { useI18n } from "../../lib/i18n"

export function TopLinksTable({ data }: { data: AnalyticsOverview }) {
  const { t } = useI18n()
  return (
    <div className="an-card">
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
    </div>
  )
}
