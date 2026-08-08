import type { User } from "@knot/shared"
import { useState } from "react"
import { CampaignModal } from "../components/campaign/campaign-modal"
import { ConfirmModal } from "../components/ui/confirm-modal"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { Skeleton } from "../components/ui/skeleton"
import { useCampaigns } from "../hooks/use-campaigns"
import { useToast } from "../hooks/use-toast"

const FILTERS = [
  { key: undefined, label: "All" },
  { key: "active", label: "Active" },
  { key: "archived", label: "Archived" },
] as const

export function CampaignsPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { toast } = useToast()
  const { data, loading, error, query, setQuery, create, update, remove } =
    useCampaigns()
  const [modal, setModal] = useState<
    "create" | { edit: (typeof data)[number] } | null
  >(null)
  const [deleting, setDeleting] = useState<(typeof data)[number] | null>(null)

  async function handleDelete() {
    if (!deleting) return
    const ok = await remove(deleting.id)
    if (ok) {
      toast("Campaign deleted")
      setDeleting(null)
    } else {
      toast("Failed to delete campaign", "error")
    }
  }

  return (
    <DashboardShell user={user} onLogout={onLogout} activeNav="campaigns">
      <div className="camp-page">
        <div className="camp-header">
          <div>
            <h1 className="camp-header__title">Campaigns</h1>
            <p className="camp-header__desc">
              Organize your links into marketing campaigns and track
              performance.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setModal("create")}
          >
            Create Campaign
          </button>
        </div>

        <div className="camp-toolbar">
          <input
            className="input camp-search"
            placeholder="Search campaigns…"
            defaultValue={query.q ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                setQuery({ ...query, q: e.currentTarget.value || undefined })
            }}
          />
          <div className="camp-filters">
            {FILTERS.map((f) => (
              <button
                key={f.label}
                type="button"
                className={`camp-filters__btn${(query.status ?? undefined) === f.key ? " camp-filters__btn--active" : ""}`}
                onClick={() => setQuery({ ...query, status: f.key })}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {error && <div className="camp-error">{error}</div>}

        {loading ? (
          <div className="camp-grid">
            {[0, 1, 2].map((i) => (
              <Skeleton
                key={i}
                style={{ height: 140, borderRadius: "var(--radius-lg)" }}
              />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="camp-empty">
            <p>No campaigns found</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setModal("create")}
            >
              Create your first campaign
            </button>
          </div>
        ) : (
          <div className="camp-grid">
            {data.map((campaign) => (
              <article className="camp-card" key={campaign.id}>
                <div className="camp-card__top">
                  <span
                    className={`camp-card__status camp-card__status--${campaign.status}`}
                  >
                    {campaign.status === "active" ? "Active" : "Archived"}
                  </span>
                  <div className="camp-card__actions">
                    <button
                      type="button"
                      className="camp-card__btn"
                      aria-label={`Edit ${campaign.name}`}
                      onClick={() => setModal({ edit: campaign })}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="camp-card__btn camp-card__btn--danger"
                      aria-label={`Delete ${campaign.name}`}
                      onClick={() => setDeleting(campaign)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <h2 className="camp-card__name">{campaign.name}</h2>
                <p className="camp-card__desc">
                  {campaign.description || "No description provided."}
                </p>
                <div className="camp-card__stats">
                  <span>
                    <strong>{campaign.linksCount}</strong> Links
                  </span>
                  <span>
                    <strong>{campaign.clicks.toLocaleString()}</strong> Clicks
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {modal === "create" && (
        <CampaignModal
          campaign={null}
          onSave={create}
          onClose={() => setModal(null)}
        />
      )}
      {modal && modal !== "create" && (
        <CampaignModal
          campaign={modal.edit}
          onSave={(input) => update(modal.edit.id, input)}
          onClose={() => setModal(null)}
        />
      )}
      {deleting && (
        <ConfirmModal
          open
          title="Delete Campaign"
          message={`Delete "${deleting.name}"? Its links will be kept but detached from this campaign.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </DashboardShell>
  )
}
