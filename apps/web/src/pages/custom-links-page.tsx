import type { UpdateShortlink, User } from "@knot/shared"
import { Info, Plus, Search } from "lucide-react"
import { useState } from "react"
import { EditModal } from "../components/shortlink/edit-modal"
import { HowItWorksModal } from "../components/shortlink/how-it-works-modal"
import { LinksTable } from "../components/shortlink/links-table"
import { NewLinkModal } from "../components/shortlink/new-link-modal"
import { ConfirmModal } from "../components/ui/confirm-modal"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { Pagination } from "../components/ui/pagination"
import { Reveal } from "../components/ui/reveal"
import { PAGE_SIZE } from "../constants/custom-links"
import { useCampaigns } from "../hooks/use-campaigns"
import { useShortlinks } from "../hooks/use-shortlinks"
import { useToast } from "../hooks/use-toast"
import { useI18n } from "../lib/i18n"

export function CustomLinksPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { toast } = useToast()
  const { t } = useI18n()
  const { data: campaigns } = useCampaigns()
  const { links, total, loading, query, setQuery, create, remove, update } =
    useShortlinks()
  const [q, setQ] = useState("")
  const [filterCampaign, setFilterCampaign] = useState("")
  const [showNew, setShowNew] = useState(false)
  const [showHow, setShowHow] = useState(false)
  const [editing, setEditing] = useState<{ slug: string } | null>(null)
  const [deleting, setDeleting] = useState<{ slug: string } | null>(null)

  const campaignNames = new Map(campaigns.map((c) => [c.id, c.name] as const))

  const page = Math.floor(query.offset / query.limit)
  const pageCount = Math.max(1, Math.ceil(total / query.limit))
  const from = total === 0 ? 0 : query.offset + 1
  const to = Math.min(query.offset + query.limit, total)

  function search(e: React.FormEvent) {
    e.preventDefault()
    setQuery({ ...query, q: q || undefined, offset: 0 })
  }

  function applyCampaignFilter(value: string) {
    setFilterCampaign(value)
    setQuery({
      ...query,
      campaignId: value === "" ? undefined : Number(value),
      offset: 0,
    })
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
          <select
            className="cl-filter"
            aria-label={t("cl.colCampaign")}
            value={filterCampaign}
            onChange={(e) => applyCampaignFilter(e.target.value)}
          >
            <option value="">{t("cl.filterAllCampaigns")}</option>
            {campaigns.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </form>

        <Reveal delay={0.1}>
          <div className="cl-table-wrap">
            <LinksTable
              links={links}
              loading={loading}
              campaignNames={campaignNames}
              onEdit={(slug) => setEditing({ slug })}
              onDelete={(slug) => setDeleting({ slug })}
            />
          </div>
        </Reveal>

        <Pagination
          page={page}
          pageCount={pageCount}
          from={from}
          to={to}
          total={total}
          disabled={loading}
          onPage={goToPage}
        />
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
