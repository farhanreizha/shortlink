import type { Shortlink, UpdateShortlink } from "@knot/shared"
import { useEffect, useState } from "react"
import { useI18n } from "../../lib/i18n"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"
import { Modal } from "../ui/modal"

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
  const [slug, setSlug] = useState(link.slug)
  const [url, setUrl] = useState(link.url)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSlug(link.slug)
    setUrl(link.url)
    setError("")
    setLoading(false)
  }, [link])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (!url) return
    setLoading(true)
    try {
      const data: UpdateShortlink = {}
      if (url !== link.url) data.url = url
      if (slug !== link.slug) data.slug = slug
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
            {loading ? t("modal.saving") : t("modal.save")}
          </button>
        </div>
      </form>
    </Modal>
  )
}
