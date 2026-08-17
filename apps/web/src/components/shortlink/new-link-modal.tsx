import { CreateShortlinkSchema } from "@knot/shared"
import { Link as LinkIcon } from "lucide-react"
import { useState } from "react"
import { useToast } from "../../hooks/use-toast"
import { useI18n } from "../../lib/i18n"
import { randomSlug } from "../../lib/slug"
import { CampaignSelect } from "../ui/campaign-select"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"
import { Modal } from "../ui/modal"
import { ModalActions } from "../ui/modal-actions"
import { SubmitButton } from "../ui/submit-button"

export function NewLinkModal({
  open,
  onCreate,
  onClose,
}: {
  open: boolean
  onCreate: (
    slug: string,
    url: string,
    campaignId?: number | null,
    options?: { expiresAt?: string; password?: string },
  ) => Promise<unknown>
  onClose: () => void
}) {
  const { toast } = useToast()
  const { t } = useI18n()
  const [url, setUrl] = useState("")
  const [slug, setSlug] = useState("")
  const [campaignId, setCampaignId] = useState<number | null>(null)
  const [expiresAt, setExpiresAt] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const finalSlug = slug || randomSlug()
    const isoExpiry = expiresAt ? new Date(expiresAt).toISOString() : undefined
    const result = CreateShortlinkSchema.safeParse({
      slug: finalSlug,
      url,
      expiresAt: isoExpiry,
      password: password || undefined,
    })
    if (!result.success) {
      const field = result.error.flatten().fieldErrors
      setError(field.url?.[0] ?? field.slug?.[0] ?? t("form.invalidUrl"))
      return
    }
    setLoading(true)
    try {
      await onCreate(finalSlug, url, campaignId, {
        expiresAt: isoExpiry,
        password: password || undefined,
      })
      toast(`${window.location.origin}/r/${finalSlug}`)
      setUrl("")
      setSlug("")
      setCampaignId(null)
      setExpiresAt("")
      setPassword("")
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} title={t("modal.newLink")} onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <FormField label={t("modal.originalUrl")} htmlFor="new-link-url">
          <input
            id="new-link-url"
            className="input"
            type="url"
            placeholder={t("modal.urlPlaceholder")}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError("")
            }}
          />
        </FormField>
        <FormField label={t("modal.brandedSlug")} htmlFor="new-link-slug">
          <input
            id="new-link-slug"
            className="input input--mono"
            placeholder={t("modal.slugPlaceholder")}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </FormField>
        <FormField label={t("modal.campaign")} htmlFor="new-link-campaign">
          <CampaignSelect
            id="new-link-campaign"
            className="input"
            value={campaignId}
            onChange={setCampaignId}
          />
        </FormField>
        <FormField label={t("modal.expiresAt")} htmlFor="new-link-expires">
          <input
            id="new-link-expires"
            className="input"
            type="datetime-local"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </FormField>
        <FormField label={t("modal.password")} htmlFor="new-link-password">
          <input
            id="new-link-password"
            className="input"
            type="password"
            placeholder={t("modal.passwordHint")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
          />
        </FormField>
        <ErrorBanner message={error} onClose={() => setError("")} />
        <ModalActions onCancel={onClose} cancelDisabled={loading}>
          <SubmitButton
            loading={loading}
            loadingLabel={t("modal.creating")}
            disabled={!url}
          >
            <LinkIcon size={16} />
            {t("modal.createLink")}
          </SubmitButton>
        </ModalActions>
      </form>
    </Modal>
  )
}
