import type { UpdateShortlink, User } from "@knot/shared"
import { CreateForm } from "../components/shortlink/create-form"
import { LinkCard } from "../components/shortlink/link-card"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { Skeleton } from "../components/ui/skeleton"
import { useShortlinks } from "../hooks/use-shortlinks"
import { useToast } from "../hooks/use-toast"

export function DashboardPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { toast } = useToast()
  const { links, loading, create, remove, update, query, setQuery } =
    useShortlinks()

  async function handleCreate(slug: string, url: string) {
    await create(slug, url)
    toast(`${window.location.origin}/r/${slug}`)
  }

  async function handleDelete(slug: string) {
    await remove(slug)
    toast("Link deleted")
  }

  async function handleUpdate(slug: string, data: UpdateShortlink) {
    await update(slug, data)
    toast("Link updated!")
  }

  return (
    <DashboardShell user={user} onLogout={onLogout}>
      <section className="dash-hero" id="dash-create">
        <h1 className="dash-hero__title">Shorten your link</h1>
        <p className="dash-hero__desc">
          Paste your long URL below to create a concise, trackable link.
        </p>
        <CreateForm onCreate={handleCreate} />
      </section>

      <section className="dash-recent">
        <div className="dash-recent__header">
          <h2 className="dash-recent__title">Recent Links</h2>
          <button
            className="dash-recent__viewall"
            type="button"
            onClick={() => setQuery({ ...query, limit: 1000, offset: 0 })}
          >
            View All
          </button>
        </div>

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
          <div className="empty-state">
            <div className="empty-state__title">No links yet</div>
            <div className="empty-state__text">
              Create your first link above
            </div>
          </div>
        ) : (
          <div className="dash-recent__list">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        )}
      </section>
    </DashboardShell>
  )
}
