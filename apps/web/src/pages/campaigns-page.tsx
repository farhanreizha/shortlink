import type { User } from "@knot/shared"
import { useState } from "react"
import { CampaignCard } from "../components/campaign/campaign-card"
import { CampaignModal } from "../components/campaign/campaign-modal"
import { ConfirmModal } from "../components/ui/confirm-modal"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { Reveal } from "../components/ui/reveal"
import { Skeleton } from "../components/ui/skeleton"
import { FILTERS } from "../constants/campaigns"
import { useCampaigns } from "../hooks/use-campaigns"
import { useToast } from "../hooks/use-toast"
import { useI18n } from "../lib/i18n"

export function CampaignsPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { toast } = useToast()
  const { t } = useI18n()
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
      toast(t("camp.deleted"))
      setDeleting(null)
    } else {
      toast(t("camp.deleteFailed"), "error")
    }
  }

  return (
    <DashboardShell user={user} onLogout={onLogout} activeNav="campaigns">
      <div className="camp-page">
        <div className="camp-header">
          <div>
            <h1 className="camp-header__title">{t("camp.title")}</h1>
            <p className="camp-header__desc">{t("camp.desc")}</p>
          </div>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setModal("create")}
          >
            {t("camp.create")}
          </button>
        </div>

        <div className="camp-toolbar">
          <input
            className="input camp-search"
            placeholder={t("camp.searchPlaceholder")}
            defaultValue={query.q ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter")
                setQuery({ ...query, q: e.currentTarget.value || undefined })
            }}
          />
          <div className="camp-filters">
            {FILTERS.map((f) => (
              <button
                key={f.labelKey}
                type="button"
                className={`camp-filters__btn${(query.status ?? undefined) === f.key ? " camp-filters__btn--active" : ""}`}
                onClick={() => setQuery({ ...query, status: f.key })}
              >
                {t(f.labelKey)}
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
            <p>{t("camp.none")}</p>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => setModal("create")}
            >
              {t("camp.first")}
            </button>
          </div>
        ) : (
          <div className="camp-grid">
            {data.map((campaign, i) => (
              <Reveal key={campaign.id} delay={i * 0.06}>
                <CampaignCard
                  campaign={campaign}
                  onEdit={() => setModal({ edit: campaign })}
                  onDelete={() => setDeleting(campaign)}
                />
              </Reveal>
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
          title={t("camp.deleteTitle")}
          message={t("camp.deleteMessage", { name: deleting.name })}
          confirmLabel={t("common.delete")}
          onConfirm={handleDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </DashboardShell>
  )
}
