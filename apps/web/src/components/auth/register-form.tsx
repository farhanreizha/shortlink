import type { RegisterResult, User } from "@knot/shared"
import { RegisterSchema } from "@knot/shared"
import { useState } from "react"
import { client } from "../../hono-client"
import { useToast } from "../../hooks/use-toast"
import { clearFieldError } from "../../lib/form"
import { useI18n } from "../../lib/i18n"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"
import { PasswordField } from "../ui/password-field"
import { PasswordStrength } from "../ui/password-strength"
import { SubmitButton } from "../ui/submit-button"
import { SocialButtons } from "./social-buttons"

export function RegisterForm({ onAuth }: { onAuth: (user: User) => void }) {
  const { t } = useI18n()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setError("")
    const result = RegisterSchema.safeParse({ username, email, password })
    if (!result.success) {
      const field = result.error.flatten().fieldErrors
      setErrors({
        username: field.username?.[0] ?? "",
        email: field.email?.[0] ?? "",
        password: field.password?.[0] ?? "",
      })
      return
    }
    if (password !== confirmPassword) {
      setError(t("auth.passwordsMismatch"))
      return
    }
    setLoading(true)
    const ref =
      new URLSearchParams(window.location.search).get("ref") ?? undefined
    try {
      const res = await client.api.auth.register.$post({
        json: {
          username,
          email,
          password,
          ref,
        },
      })
      if (!res.ok) {
        const body = (await res.json()) as { message?: string }
        setError(body.message ?? t("auth.registrationFailed"))
        return
      }
      const { user, referrerApplied } = (await res.json()) as RegisterResult
      if (ref && !referrerApplied) toast(t("auth.refInvalid"), "error")
      onAuth(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <SocialButtons compact />
      <div className="auth-divider">
        <span>{t("auth.or")}</span>
      </div>
      <FormField
        label={t("auth.username")}
        htmlFor="reg-username"
        error={errors.username}
      >
        <input
          id="reg-username"
          className="input"
          placeholder={t("auth.usernamePlaceholder")}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setErrors(clearFieldError("username"))
          }}
        />
      </FormField>
      <FormField
        label={t("auth.email")}
        htmlFor="reg-email"
        error={errors.email}
      >
        <input
          id="reg-email"
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
        id="reg-password"
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
      />
      <PasswordStrength password={password} />
      <PasswordField
        id="reg-confirm"
        label={t("auth.confirmPassword")}
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder={t("auth.repeatPassword")}
        showPassword={showPassword}
      />
      <ErrorBanner message={error} />
      <label className="auth-checkbox">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
        />
        <span>
          {t("auth.agree1")}{" "}
          <button type="button" className="auth-checkbox__link">
            {t("auth.terms")}
          </button>{" "}
          {t("auth.and")}{" "}
          <button type="button" className="auth-checkbox__link">
            {t("auth.privacy")}
          </button>
        </span>
      </label>
      <SubmitButton
        block
        loading={loading}
        loadingLabel={t("common.loading")}
        disabled={
          !username || !email || !password || !confirmPassword || !agreed
        }
      >
        {t("auth.signUpBtn")}
      </SubmitButton>
    </form>
  )
}
