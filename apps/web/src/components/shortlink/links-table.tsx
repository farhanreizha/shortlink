import type { Shortlink } from "@knot/shared"
import { Link as LinkIcon, Pencil, QrCode, Trash2 } from "lucide-react"
import { formatDate } from "../../lib/date"
import { useI18n } from "../../lib/i18n"

export function LinksTable({
  links,
  loading,
  campaignNames,
  selected,
  onToggle,
  onToggleAll,
  onEdit,
  onDelete,
  onQr,
}: {
  links: Shortlink[]
  loading: boolean
  campaignNames: Map<string, string>
  selected: Set<string>
  onToggle: (slug: string) => void
  onToggleAll: () => void
  onEdit: (slug: string) => void
  onDelete: (slug: string) => void
  onQr: (slug: string) => void
}) {
  const { t } = useI18n()
  return (
    <table className="cl-table">
      <thead>
        <tr>
          <th className="cl-table__check-col">
            <input
              type="checkbox"
              aria-label={t("cl.selectAll")}
              checked={
                links.length > 0 && links.every((l) => selected.has(l.slug))
              }
              onChange={onToggleAll}
            />
          </th>
          <th>{t("cl.colBranded")}</th>
          <th>{t("cl.colOriginal")}</th>
          <th>{t("cl.colCampaign")}</th>
          <th>{t("cl.colCreated")}</th>
          <th>{t("cl.colClicks")}</th>
          <th className="cl-table__action-col">{t("cl.colAction")}</th>
        </tr>
      </thead>
      <tbody>
        {links.map((link, i) => (
          <tr
            key={link.id}
            className={`cl-table__row${selected.has(link.slug) ? " cl-table__row--selected" : ""}`}
            style={{ animationDelay: `${i * 0.04}s` }}
          >
            <td>
              <input
                type="checkbox"
                aria-label={t("cl.selectAria", { slug: link.slug })}
                checked={selected.has(link.slug)}
                onChange={() => onToggle(link.slug)}
              />
            </td>
            <td>
              <span className="cl-table__brand">
                <LinkIcon size={16} />
                {window.location.origin}/r/{link.slug}
              </span>
            </td>
            <td>
              <span className="cl-table__url" title={link.url}>
                {link.url}
              </span>
            </td>
            <td>
              <span className="cl-table__campaign">
                {link.campaignId
                  ? (campaignNames.get(link.campaignId) ?? "—")
                  : "—"}
              </span>
            </td>
            <td>{formatDate(link.createdAt)}</td>
            <td>{link.visits.toLocaleString()}</td>
            <td>
              <div className="cl-table__actions">
                <button
                  className="btn btn--ghost"
                  type="button"
                  aria-label={t("cl.qrAria", { slug: link.slug })}
                  onClick={() => onQr(link.slug)}
                >
                  <QrCode size={14} />
                </button>
                <button
                  className="btn btn--ghost"
                  type="button"
                  aria-label={t("cl.editAria", { slug: link.slug })}
                  onClick={() => onEdit(link.slug)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  className="btn btn--ghost btn--danger-ghost"
                  type="button"
                  aria-label={t("cl.deleteAria", { slug: link.slug })}
                  onClick={() => onDelete(link.slug)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </td>
          </tr>
        ))}
        {!loading && links.length === 0 && (
          <tr>
            <td colSpan={7}>
              <div className="empty-state">
                <div className="empty-state__title">{t("cl.noLinks")}</div>
                <div className="empty-state__text">{t("cl.noLinksText")}</div>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
