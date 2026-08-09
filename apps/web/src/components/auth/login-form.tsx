import type { User } from "@knot/shared"
import { LoginSchema } from "@knot/shared"
import { useState } from "react"
import { client } from "../../hono-client"
import { clearFieldError } from "../../lib/form"
import { useI18n } from "../../lib/i18n"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"
import { PasswordField } from "../ui/password-field"
import { SocialButtons } from "./social-buttons"

export function LoginForm({ onAuth }: { onAuth: (user: User) => void }) {
  const { t } = useI18n()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setError("")
    const result = LoginSchema.safeParse({ email, password })
    if (!result.success) {
      const field = result.error.flatten().fieldErrors
      setErrors({
        email: field.email?.[0] ?? "",
        password: field.password?.[0] ?? "",
      })
      return
    }
    setLoading(true)
    try {
      const res = await client.api.auth.login.$post({
        json: { email, password },
      })
      if (!res.ok) {
        const body = (await res.json()) as { message?: string }
        setError(body.message ?? t("auth.invalidLogin"))
        return
      }
      const user = (await res.json()) as User
      onAuth(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <SocialButtons />
      <div className="auth-divider">
        <span>{t("auth.orContinue")}</span>
      </div>
      <FormField
        label={t("auth.email")}
        htmlFor="login-email"
        error={errors.email}
      >
        <input
          id="login-email"
          type="email"
          className="input"
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors(clearFieldError("email"))
          }}
        />
      </FormField>
      <PasswordField
        id="login-password"
        label={t("auth.password")}
        value={password}
        onChange={(v) => {
          setPassword(v)
          setErrors(clearFieldError("password"))
        }}
        showPassword={showPassword}
        onToggle={() => setShowPassword(!showPassword)}
        showToggle
        error={errors.password}
        trailing={
          <button type="button" className="form__label-link">
            {t("auth.forgot")}
          </button>
        }
      />
      <ErrorBanner message={error} />
      <button
        type="submit"
        className="btn btn--primary"
        style={{ width: "100%" }}
        disabled={loading || !email || !password}
      >
        {loading ? t("common.loading") : t("auth.signIn")}
      </button>
    </form>
  )
}
