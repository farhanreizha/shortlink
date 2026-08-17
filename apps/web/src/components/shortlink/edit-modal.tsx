import type { Shortlink, UpdateShortlink } from "@knot/shared"
import { useEffect, useState } from "react"
import { useI18n } from "../../lib/i18n"
import { CampaignSelect } from "../ui/campaign-select"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"
import { Modal } from "../ui/modal"
import { ModalActions } from "../ui/modal-actions"
import { SubmitButton } from "../ui/submit-button"

function toLocalInput(iso: string | null) {
  return iso ? iso.slice(0, 16) : ""
}

export function EditModal({
  open,
  link,
  onSave,
  onClose,
}: {
  open: boolean
  link: Shortlink
  onSave: (slug: string, data: UpdateShortlink) => Promise<void>
  onClose: () => void
}) {
  const { t } = useI18n()
  const currentCampaign = link.campaignId ? Number(link.campaignId) : null
  const [slug, setSlug] = useState(link.slug)
  const [url, setUrl] = useState(link.url)
  const [campaignId, setCampaignId] = useState<number | null>(currentCampaign)
  const [expiresAt, setExpiresAt] = useState(toLocalInput(link.expiresAt))
  const [password, setPassword] = useState("")
  const [title, setTitle] = useState(link.title ?? "")
  const [description, setDescription] = useState(link.description ?? "")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSlug(link.slug)
    setUrl(link.url)
    setCampaignId(currentCampaign)
    setExpiresAt(toLocalInput(link.expiresAt))
    setPassword("")
    setTitle(link.title ?? "")
    setDescription(link.description ?? "")
    setError("")
    setLoading(false)
  }, [link, currentCampaign])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!url) return
    setLoading(true)
    try {
      const data: UpdateShortlink = {}
      if (url !== link.url) data.url = url
      if (slug !== link.slug) data.slug = slug
      if (campaignId !== currentCampaign) data.campaignId = campaignId
      const isoExpiry = expiresAt ? new Date(expiresAt).toISOString() : null
      if (isoExpiry !== link.expiresAt) data.expiresAt = isoExpiry
      if (password) data.password = password
      if (title !== (link.title ?? "")) data.title = title || null
      if (description !== (link.description ?? ""))
        data.description = description || null
      if (Object.keys(data).length === 0) {
        onClose()
        return
      }
      await onSave(link.slug, data)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} title={t("modal.editLink")} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <FormField label={t("modal.url")} htmlFor="edit-url">
          <input
            id="edit-url"
            className="input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </FormField>
        <FormField label={t("modal.slug")} htmlFor="edit-slug">
          <input
            id="edit-slug"
            className="input input--mono"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </FormField>
        <FormField label={t("modal.campaign")} htmlFor="edit-campaign">
          <CampaignSelect
            id="edit-campaign"
            className="input"
            value={campaignId}
            onChange={setCampaignId}
          />
        </FormField>
        <FormField label={t("modal.expiresAt")} htmlFor="edit-expires">
          <input
            id="edit-expires"
            className="input"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </FormField>
        <FormField
          label={t("modal.password")}
          htmlFor="edit-password"
          trailing={
            link.hasPassword ? (
              <span className="form__hint">{t("modal.passwordSet")}</span>
            ) : undefined
          }
        >
          <input
            id="edit-password"
            className="input"
            type="password"
            placeholder={t("modal.passwordHint")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </FormField>
        <FormField label={t("modal.ogTitle")} htmlFor="edit-og-title">
          <input
            id="edit-og-title"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormField>
        <FormField label={t("modal.ogDesc")} htmlFor="edit-og-desc">
          <textarea
            id="edit-og-desc"
            className="input"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </FormField>
        <ErrorBanner message={error} onClose={() => setError("")} />
        <ModalActions onCancel={onClose} cancelDisabled={loading}>
          <SubmitButton
            loading={loading}
            loadingLabel={t("modal.saving")}
            disabled={!url}
          >
            {t("modal.save")}
          </SubmitButton>
        </ModalActions>
      </form>
    </Modal>
  )
}
