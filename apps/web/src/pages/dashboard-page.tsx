import type { UpdateShortlink, User } from "@knot/shared"
import { Search } from "lucide-react"
import { useEffect, useState } from "react"
import { CreateForm } from "../components/shortlink/create-form"
import { LinkCard } from "../components/shortlink/link-card"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { Reveal } from "../components/ui/reveal"
import { Skeleton } from "../components/ui/skeleton"
import { useDebouncedValue } from "../hooks/use-debounced-value"
import { useShortlinks } from "../hooks/use-shortlinks"
import { useToast } from "../hooks/use-toast"
import { useI18n } from "../lib/i18n"

export function DashboardPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { toast } = useToast()
  const { t } = useI18n()
  const [q, setQ] = useState("")
  const debouncedQ = useDebouncedValue(q, 300)
  const { links, loading, create, remove, update, query, setQuery } =
    useShortlinks()

  useEffect(() => {
    setQuery((prev) => ({ ...prev, q: debouncedQ || undefined, offset: 0 }))
  }, [debouncedQ, setQuery])

  async function handleCreate(
    slug: string,
    url: string,
    campaignId?: number | null,
  ) {
    await create(slug, url, campaignId)
    toast(`${window.location.origin}/r/${slug}`)
  }
  async function handleDelete(slug: string) {
    await remove(slug)
    toast(t("dash.linkDeleted"))
  }

  async function handleUpdate(slug: string, data: UpdateShortlink) {
    await update(slug, data)
    toast(t("dash.linkUpdated"))
  }

  return (
    <DashboardShell user={user} onLogout={onLogout}>
      <section className="dash-hero" id="dash-create">
        <h1 className="dash-hero__title">{t("dash.heroTitle")}</h1>
        <p className="dash-hero__desc">{t("dash.heroDesc")}</p>
        <CreateForm onCreate={handleCreate} />
      </section>

      <section className="dash-recent">
        <Reveal delay={0.05}>
          <div className="dash-recent__header">
            <h2 className="dash-recent__title">{t("dash.recentTitle")}</h2>
            <button
              className="dash-recent__viewall"
              type="button"
              onClick={() => setQuery({ ...query, limit: 100, offset: 0 })}
            >
              {t("dash.viewAll")}
            </button>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="cl-toolbar dash-search">
            <div className="cl-search">
              <Search size={16} className="cl-search__icon" />
              <input
                className="cl-search__input"
                type="search"
                placeholder={t("dash.searchPlaceholder")}
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </Reveal>

        {loading ? (
          <div className="dash-recent__list">
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                style={{ height: 88, borderRadius: "var(--radius-md)" }}
              />
            ))}
          </div>
        ) : links.length === 0 ? (
          <Reveal>
            <div className="empty-state">
              <div className="empty-state__title">{t("dash.noLinks")}</div>
              <div className="empty-state__text">{t("dash.noLinksText")}</div>
            </div>
          </Reveal>
        ) : (
          <div className="dash-recent__list">
            {links.map((link, i) => (
              <Reveal key={link.id} delay={0.15 + i * 0.05}>
                <LinkCard
                  link={link}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  )
}
