import { CreateShortlinkSchema } from "@knot/shared"
import { Link as LinkIcon, Scissors } from "lucide-react"
import { useState } from "react"
import { useI18n } from "../../lib/i18n"
import { randomSlug } from "../../lib/slug"
import { ErrorBanner } from "../ui/error-banner"

export function CreateForm({
  onCreate,
}: {
  onCreate: (slug: string, url: string) => Promise<unknown>
}) {
  const { t } = useI18n()
  const [url, setUrl] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    const slug = randomSlug()
    const result = CreateShortlinkSchema.safeParse({ slug, url })
    if (!result.success) {
      setError(
        result.error.flatten().fieldErrors.url?.[0] ?? t("form.invalidUrl"),
      )
      return
    }
    setLoading(true)
    try {
      await onCreate(slug, url)
      setUrl("")
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="dash-hero__form" onSubmit={handleSubmit}>
      <div className="dash-hero__field">
        <LinkIcon size={20} className="dash-hero__icon" />
        <input
          className="dash-hero__input"
          type="url"
          placeholder={t("form.urlPlaceholder")}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            setError("")
          }}
        />
        {error && <span className="dash-hero__error">{error}</span>}
      </div>
      <button
        className="dash-hero__btn"
        type="submit"
        disabled={loading || !url}
      >
        <Scissors size={18} />
        {loading ? t("form.shortening") : t("form.shorten")}
      </button>
      <ErrorBanner message={error} onClose={() => setError("")} />
    </form>
  )
}
