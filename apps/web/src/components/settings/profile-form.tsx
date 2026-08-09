import type { User } from "@knot/shared"
import { useState } from "react"
import { client } from "../../hono-client"
import { useToast } from "../../hooks/use-toast"
import { useI18n } from "../../lib/i18n"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"

export function ProfileForm({ user }: { user: User }) {
  const { toast } = useToast()
  const { t } = useI18n()
  const [email, setEmail] = useState(user.email)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await client.api.auth.me.$patch({ json: { email } })
      if (!res.ok) {
        const body = (await res.json()) as { message?: string }
        setError(body.message ?? t("pf.updateFailed"))
        return
      }
      toast(t("pf.updated"))
    } catch {
      setError(t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="set-card">
      <div className="set-card__header">
        <h2 className="set-card__title">{t("pf.title")}</h2>
        <p className="set-card__desc">{t("pf.desc")}</p>
      </div>
      <form className="set-form" onSubmit={handleSubmit}>
        <FormField label={t("pf.email")} htmlFor="settings-email" error={error}>
          <input
            id="settings-email"
            type="email"
            className="input"
            placeholder={user.email}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setError("")
            }}
          />
        </FormField>
        <ErrorBanner message={error} onClose={() => setError("")} />
        <div className="set-form__footer">
          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading || !email}
          >
            {loading ? t("common.saving") : t("pf.save")}
          </button>
        </div>
      </form>
    </section>
  )
}
