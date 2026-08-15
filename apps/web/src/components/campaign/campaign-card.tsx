import type { CampaignSummary } from "@knot/shared"
import { useI18n } from "../../lib/i18n"

export function CampaignCard({
  campaign,
  onEdit,
  onDelete,
}: {
  campaign: CampaignSummary
  onEdit: () => void
  onDelete: () => void
}) {
  const { t } = useI18n()
  return (
    <article className="camp-card">
      <div className="camp-card__top">
        <span
          className={`camp-card__status camp-card__status--${campaign.status}`}
        >
          {campaign.status === "active"
            ? t("common.active")
            : t("common.archived")}
        </span>
        <div className="camp-card__actions">
          <button
            type="button"
            className="camp-card__btn"
            aria-label={t("camp.editAria", { name: campaign.name })}
            onClick={onEdit}
          >
            {t("camp.edit")}
          </button>
          <button
            type="button"
            className="camp-card__btn camp-card__btn--danger"
            aria-label={t("camp.deleteAria", { name: campaign.name })}
            onClick={onDelete}
          >
            {t("camp.delete")}
          </button>
        </div>
      </div>
      <h2 className="camp-card__name">{campaign.name}</h2>
      <p className="camp-card__desc">
        {campaign.description || t("camp.noDesc")}
      </p>
      <div className="camp-card__stats">
        <span>
          <strong>{campaign.linksCount}</strong> {t("camp.linksLabel")}
        </span>
        <span>
          <strong>{campaign.clicks.toLocaleString()}</strong>{" "}
          {t("camp.clicksLabel")}
        </span>
      </div>
    </article>
  )
}
