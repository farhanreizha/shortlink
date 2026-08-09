import type { UpdateShortlink, User } from "@knot/shared"
import {
  ChevronLeft,
  ChevronRight,
  Info,
  Link as LinkIcon,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react"
import { useState } from "react"
import { EditModal } from "../components/shortlink/edit-modal"
import { HowItWorksModal } from "../components/shortlink/how-it-works-modal"
import { NewLinkModal } from "../components/shortlink/new-link-modal"
import { ConfirmModal } from "../components/ui/confirm-modal"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { Reveal } from "../components/ui/reveal"
import { useShortlinks } from "../hooks/use-shortlinks"
import { useToast } from "../hooks/use-toast"
import { useI18n } from "../lib/i18n"

const PAGE_SIZE = 10

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function CustomLinksPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { toast } = useToast()
  const { t } = useI18n()
  const { links, total, loading, query, setQuery, create, remove, update } =
    useShortlinks()
  const [q, setQ] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showHow, setShowHow] = useState(false)
  const [editing, setEditing] = useState<{ slug: string } | null>(null)
  const [deleting, setDeleting] = useState<{ slug: string } | null>(null)

  const page = Math.floor(query.offset / query.limit)
  const pageCount = Math.max(1, Math.ceil(total / query.limit))
  const from = total === 0 ? 0 : query.offset + 1
  const to = Math.min(query.offset + query.limit, total)

  function search(e: React.FormEvent) {
    e.preventDefault()
    setQuery({ ...query, q: q || undefined, offset: 0 })
  }

  function goToPage(p: number) {
    setQuery({ ...query, offset: p * PAGE_SIZE, limit: PAGE_SIZE })
  }

  async function handleUpdate(slug: string, data: UpdateShortlink) {
    await update(slug, data)
    toast(t("dash.linkUpdated"))
  }

  async function handleDelete(slug: string) {
    await remove(slug)
    toast(t("dash.linkDeleted"))
  }

  const editLink = editing
    ? links.find((l) => l.slug === editing.slug)
    : undefined
  const deleteLink = deleting
    ? links.find((l) => l.slug === deleting.slug)
    : undefined

  return (
    <DashboardShell user={user} onLogout={onLogout} activeNav="custom-links">
      <div className="cl-page">
        <Reveal>
          <div className="cl-header">
            <div>
              <h1 className="cl-header__title">{t("cl.title")}</h1>
              <p className="cl-header__desc">{t("cl.desc")}</p>
            </div>
            <div className="cl-header__actions">
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => setShowHow(true)}
              >
                <Info size={16} />
                {t("cl.how")}
              </button>
              <button
                className="btn btn--primary"
                type="button"
                onClick={() => setShowNew(true)}
              >
                <Plus size={16} />
                {t("cl.new")}
              </button>
            </div>
          </div>
        </Reveal>

        <form className="cl-toolbar" onSubmit={search}>
          <div className="cl-search">
            <Search size={16} className="cl-search__icon" />
            <input
              className="cl-search__input"
              type="search"
              placeholder={t("cl.searchPlaceholder")}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </form>

        <Reveal delay={0.1}>
          <div className="cl-table-wrap">
            <table className="cl-table">
              <thead>
                <tr>
                  <th>{t("cl.colBranded")}</th>
                  <th>{t("cl.colOriginal")}</th>
                  <th>{t("cl.colCreated")}</th>
                  <th>{t("cl.colClicks")}</th>
                  <th className="cl-table__action-col">{t("cl.colAction")}</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link, i) => (
                  <tr
                    key={link.id}
                    className="cl-table__row"
                    style={{ animationDelay: `${i * 0.04}s` }}
                  >
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
                    <td>{formatDate(link.createdAt)}</td>
                    <td>{link.visits.toLocaleString()}</td>
                    <td>
                      <div className="cl-table__actions">
                        <button
                          className="btn btn--ghost"
                          type="button"
                          aria-label={t("cl.editAria", { slug: link.slug })}
                          onClick={() => setEditing({ slug: link.slug })}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="btn btn--ghost btn--danger-ghost"
                          type="button"
                          aria-label={t("cl.deleteAria", { slug: link.slug })}
                          onClick={() => setDeleting({ slug: link.slug })}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && links.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-state">
                        <div className="empty-state__title">
                          {t("cl.noLinks")}
                        </div>
                        <div className="empty-state__text">
                          {t("cl.noLinksText")}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Reveal>

        <div className="cl-pagination">
          <span className="cl-pagination__info">
            {t("cl.showing", { from, to, total })}
          </span>
          <div className="cl-pagination__controls">
            <button
              className="btn btn--ghost"
              type="button"
              aria-label={t("cl.prev")}
              disabled={page === 0 || loading}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="btn btn--ghost"
              type="button"
              aria-label={t("cl.next")}
              disabled={page >= pageCount - 1 || loading}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <NewLinkModal
        open={showNew}
        onCreate={create}
        onClose={() => setShowNew(false)}
      />
      <HowItWorksModal open={showHow} onClose={() => setShowHow(false)} />
      {editLink && (
        <EditModal
          open={editing !== null}
          link={editLink}
          onSave={handleUpdate}
          onClose={() => setEditing(null)}
        />
      )}
      {deleteLink && (
        <ConfirmModal
          open={deleting !== null}
          title={t("link.deleteTitle")}
          message={t("link.deleteMessage", { slug: deleteLink.slug })}
          onConfirm={() => {
            handleDelete(deleteLink.slug)
            setDeleting(null)
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </DashboardShell>
  )
}
