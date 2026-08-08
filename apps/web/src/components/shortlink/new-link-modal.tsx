import { CreateShortlinkSchema } from "@knot/shared"
import { Link as LinkIcon, Scissors } from "lucide-react"
import { useState } from "react"
import { useToast } from "../../hooks/use-toast"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"
import { Modal } from "../ui/modal"

function randomSlug() {
  return Math.random().toString(36).slice(2, 8)
}

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
      setError(result.error.flatten().fieldErrors.url?.[0] ?? "Invalid URL")
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
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} title="New Custom Link" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <FormField label="Original URL" htmlFor="new-link-url">
          <input
            id="new-link-url"
            className="input"
            type="url"
            placeholder="https://example.com/very/long/path"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              setError("")
            }}
          />
        </FormField>
        <FormField label="Branded Slug" htmlFor="new-link-slug">
          <input
            id="new-link-slug"
            className="input input--mono"
            placeholder="sale"
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
            Cancel
          </button>
          <button
            className="btn btn--primary"
            type="submit"
            disabled={loading || !url}
          >
            <LinkIcon size={16} />
            {loading ? "Creating…" : "Create Link"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
