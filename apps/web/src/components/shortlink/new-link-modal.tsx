import { CreateShortlinkSchema } from "@knot/shared"
import { Link as LinkIcon } from "lucide-react"
import { useState } from "react"
import { useToast } from "../../hooks/use-toast"
import { useI18n } from "../../lib/i18n"
import { randomSlug } from "../../lib/slug"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"
import { Modal } from "../ui/modal"

export function NewLinkModal({
  open,
  onCreate,
  onClose,
}: {
  open: boolean
  onCreate: (slug: string, url: string) => Promise<unknown>
  onClose: () => void
}) {
  const { toast } = useToast()
  const { t } = useI18n()
  const [url, setUrl] = useState("")
  const [slug, setSlug] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const finalSlug = slug || randomSlug()
    const result = CreateShortlinkSchema.safeParse({ slug: finalSlug, url })
    if (!result.success) {
      setError(
        result.error.flatten().fieldErrors.url?.[0] ?? t("form.invalidUrl"),
      )
      return
    }
    setLoading(true)
    try {
      await onCreate(finalSlug, url)
      toast(`${window.location.origin}/r/${finalSlug}`)
      setUrl("")
      setSlug("")
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
        <ErrorBanner message={error} onClose={() => setError("")} />
        <div className="modal-actions">
          <button
            className="btn btn--ghost"
            type="button"
            onClick={onClose}
            disabled={loading}
          >
            {t("common.cancel")}
          </button>
          <button
            className="btn btn--primary"
            type="submit"
            disabled={loading || !url}
          >
            <LinkIcon size={16} />
            {loading ? t("modal.creating") : t("modal.createLink")}
          </button>
        </div>
      </form>
    </Modal>
  )
}
