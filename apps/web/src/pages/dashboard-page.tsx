import type { UpdateShortlink, User } from "@knot/shared"
import { Search } from "lucide-react"
import { useState } from "react"
import { CreateForm } from "../components/shortlink/create-form"
import { LinkCard } from "../components/shortlink/link-card"
import { PageLayout } from "../components/ui/page-layout"
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
  const [search, setSearch] = useState("")

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setQuery({ ...query, q: search || undefined, offset: 0 })
  }

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
    <PageLayout user={user} onLogout={onLogout}>
      <main className="main">
        <div className="card">
          <h1 className="main__title">Create Link</h1>
          <CreateForm onCreate={handleCreate} />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-4)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "var(--space-10)",
            }}
          >
            <h2 className="main__title" style={{ margin: 0 }}>
              Your Links
            </h2>
            <form
              className="form"
              onSubmit={handleSearch}
              style={{ flexDirection: "row", gap: "var(--space-2)", margin: 0 }}
            >
              <div className="input-group">
                <Search
                  size={14}
                  style={{
                    position: "absolute",
                    left: "var(--space-2)",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-neutral)",
                  }}
                />
                <input
                  className="input"
                  type="text"
                  placeholder="Search URLs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: "var(--space-8)" }}
                />
              </div>
              <button type="submit" className="btn btn--primary">
                Search
              </button>
            </form>
          </div>

          {loading ? (
            <div className="link-list">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton
                  key={i}
                  style={{
                    height: 88,
                    borderRadius: "var(--radius-lg)",
                  }}
                />
              ))}
            </div>
          ) : links.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__title">
                {query.q ? "No matching links" : "No links yet"}
              </div>
              <div className="empty-state__text">
                {query.q
                  ? "Try a different search term"
                  : "Create your first link above"}
              </div>
            </div>
          ) : (
            <div className="link-list">
              {links.map((link, i) => (
                <div
                  key={link.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <LinkCard
                    link={link}
                    onDelete={handleDelete}
                    onUpdate={handleUpdate}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </PageLayout>
  )
}
