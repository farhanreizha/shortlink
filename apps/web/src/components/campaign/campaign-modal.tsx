import type { Campaign, CampaignSummary } from "@knot/shared"
import { useState } from "react"
import { useToast } from "../../hooks/use-toast"
import { useI18n } from "../../lib/i18n"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"
import { Modal } from "../ui/modal"

export function CampaignModal({
  campaign,
  onSave,
  onClose,
}: {
  campaign: CampaignSummary | null
  onSave: (input: {
    name: string
    description: string
    status: "active" | "archived"
  }) => Promise<Campaign | null>
  onClose: () => void
}) {
  const { toast } = useToast()
  const { t } = useI18n()
  const [name, setName] = useState(campaign?.name ?? "")
  const [description, setDescription] = useState(campaign?.description ?? "")
  const [status, setStatus] = useState<"active" | "archived">(
    campaign?.status ?? "active",
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const canSubmit = name.trim().length > 0 && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError("")
    const saved = await onSave({
      name: name.trim(),
      description: description.trim(),
      status,
    })
    setSubmitting(false)
    if (saved) {
      toast(campaign ? t("cm.updated") : t("cm.created"))
      onClose()
    } else {
      setError(t("cm.saveFailed"))
      toast(t("cm.saveFailed"), "error")
    }
  }

  return (
    <Modal
      open
      title={campaign ? t("cm.editTitle") : t("cm.createTitle")}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="cm-form">
        <FormField label={t("cm.name")} htmlFor="campaign-name">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("cm.namePlaceholder")}
          />
        </FormField>
        <FormField label={t("cm.desc")} htmlFor="campaign-desc">
          <textarea
            className="input cm-form__desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("cm.descPlaceholder")}
          />
        </FormField>
        <FormField label={t("cm.status")} htmlFor="campaign-status">
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "archived")}
          >
            <option value="active">{t("common.active")}</option>
            <option value="archived">{t("common.archived")}</option>
          </select>
        </FormField>
        {error && <ErrorBanner message={error} />}
        <div className="cm-form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            {t("cm.cancel")}
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!canSubmit}
          >
            {submitting
              ? t("cm.saving")
              : campaign
                ? t("cm.saveChanges")
                : t("cm.createCampaign")}
          </button>
        </div>
      </form>
    </Modal>
  )
}
