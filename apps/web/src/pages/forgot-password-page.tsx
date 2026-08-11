import { ForgotPasswordSchema } from "@knot/shared"
import { useState } from "react"
import { Link } from "wouter"
import { AuthShell } from "../components/auth/auth-shell"
import { ErrorBanner } from "../components/ui/error-banner"
import { FormField } from "../components/ui/form-field"
import { client } from "../hono-client"
import { useI18n } from "../lib/i18n"

export function ForgotPasswordPage() {
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [fieldError, setFieldError] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setFieldError("")
    const result = ForgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      setFieldError(t("forgot.invalidEmail"))
      return
    }
    setLoading(true)
    try {
      await client.api.auth["forgot-password"].$post({ json: { email } })
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      brandTitle={t("auth.loginTitle")}
      brandSubtitle={t("auth.loginSubtitle")}
      title={t("forgot.title")}
      subtitle={t("forgot.subtitle")}
      footer={<Link href="/login">{t("forgot.backToLogin")}</Link>}
    >
      {sent ? (
        <div className="form">
          <p className="auth-main__subtitle">{t("forgot.sentBody")}</p>
          <Link
            className="btn btn--primary"
            href="/login"
            style={{ width: "100%" }}
          >
            {t("forgot.backToLogin")}
          </Link>
        </div>
      ) : (
        <form className="form" onSubmit={handleSubmit}>
          <FormField
            label={t("auth.email")}
            htmlFor="forgot-email"
            error={fieldError}
          >
            <input
              id="forgot-email"
              type="email"
              className="input"
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setFieldError("")
              }}
            />
          </FormField>
          <ErrorBanner message={error} />
          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: "100%" }}
            disabled={loading || !email}
          >
            {loading ? t("common.loading") : t("forgot.submit")}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
