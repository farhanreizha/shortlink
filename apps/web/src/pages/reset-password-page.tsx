import { ResetPasswordSchema } from "@knot/shared"
import { useState } from "react"
import { Link, useLocation } from "wouter"
import { AuthShell } from "../components/auth/auth-shell"
import { ErrorBanner } from "../components/ui/error-banner"
import { PasswordField } from "../components/ui/password-field"
import { client } from "../hono-client"
import { clearFieldError } from "../lib/form"
import { useI18n } from "../lib/i18n"

export function ResetPasswordPage() {
  const { t } = useI18n()
  const [location] = useLocation()
  const params = new URLSearchParams(location.split("?")[1] ?? "")
  const token = params.get("token") ?? ""

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setError("")
    if (password !== confirm) {
      setErrors({ confirm: t("auth.passwordsMismatch") })
      return
    }
    const result = ResetPasswordSchema.safeParse({ token, password })
    if (!result.success) {
      setErrors({
        password: result.error.flatten().fieldErrors.password?.[0] ?? "",
      })
      return
    }
    setLoading(true)
    try {
      const res = await client.api.auth["reset-password"].$post({
        json: { token, password },
      })
      if (!res.ok) {
        const body = (await res.json()) as { message?: string }
        setError(body.message ?? t("reset.invalidLink"))
        return
      }
      setDone(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <AuthShell
        brandTitle={t("auth.loginTitle")}
        brandSubtitle={t("auth.loginSubtitle")}
        title={t("reset.title")}
        subtitle={t("reset.subtitle")}
        footer={<Link href="/forgot-password">{t("reset.requestNew")}</Link>}
      >
        <ErrorBanner message={t("reset.missingToken")} />
      </AuthShell>
    )
  }

  return (
    <AuthShell
      brandTitle={t("auth.loginTitle")}
      brandSubtitle={t("auth.loginSubtitle")}
      title={t("reset.title")}
      subtitle={t("reset.subtitle")}
      footer={<Link href="/login">{t("reset.goToLogin")}</Link>}
    >
      {done ? (
        <div className="form">
          <p className="auth-main__subtitle">{t("reset.success")}</p>
          <Link
            className="btn btn--primary"
            href="/login"
            style={{ width: "100%" }}
          >
            {t("reset.goToLogin")}
          </Link>
        </div>
      ) : (
        <form className="form" onSubmit={handleSubmit}>
          <PasswordField
            id="reset-password"
            label={t("reset.newPassword")}
            value={password}
            onChange={(v) => {
              setPassword(v)
              setErrors(clearFieldError("password"))
            }}
            showPassword={showPassword}
            onToggle={() => setShowPassword(!showPassword)}
            showToggle
            error={errors.password}
          />
          <PasswordField
            id="reset-confirm"
            label={t("auth.confirmPassword")}
            value={confirm}
            onChange={(v) => {
              setConfirm(v)
              setErrors(clearFieldError("confirm"))
            }}
            showPassword={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
            showToggle
            error={errors.confirm}
          />
          <ErrorBanner message={error} />
          <button
            type="submit"
            className="btn btn--primary"
            style={{ width: "100%" }}
            disabled={loading || !password || !confirm}
          >
            {loading ? t("common.loading") : t("reset.submit")}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
