import { CreateShortlinkSchema } from "@knot/shared"
import { Dices } from "lucide-react"
import { useState } from "react"
import { clearFieldError } from "../../lib/form"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"

function randomSlug() {
  return Math.random().toString(36).slice(2, 8)
}

export function CreateForm({
  onCreate,
}: {
  onCreate: (slug: string, url: string) => Promise<unknown>
}) {
  const [url, setUrl] = useState("")
  const [slug, setSlug] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setError("")
    const result = CreateShortlinkSchema.safeParse({ slug, url })
    if (!result.success) {
      const field = result.error.flatten().fieldErrors
      setErrors({
        slug: field.slug?.[0] ?? "",
        url: field.url?.[0] ?? "",
      })
      return
    }
    setLoading(true)
    try {
      await onCreate(slug, url)
      setUrl("")
      setSlug("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <FormField label="URL" htmlFor="url" error={errors.url}>
        <input
          id="url"
          className="input"
          placeholder="https://example.com/very/long/url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setErrors(clearFieldError("url"))
          }}
        />
      </FormField>
      <div className="form__row">
        <FormField label="Slug" htmlFor="slug" error={errors.slug}>
          <input
            id="slug"
            className="input input--mono input--slug"
            placeholder="my-link"
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value)
              setErrors(clearFieldError("slug"))
            }}
          />
        </FormField>
        <button
          type="button"
          className="btn btn--ghost"
          style={{ marginTop: "var(--space-5)", minWidth: 40 }}
          onClick={() => setSlug(randomSlug())}
          title="Auto-generate slug"
        >
          <Dices size={20} />
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          style={{ marginTop: "var(--space-5)" }}
          disabled={loading || !url || !slug}
        >
          {loading ? "Creating…" : "Create"}
        </button>
      </div>
      <ErrorBanner message={error} onClose={() => setError("")} />
    </form>
  )
}
