import { UpdateUserSchema } from "@knot/shared"
import { useState } from "react"
import { client } from "../../hono-client"
import { useToast } from "../../hooks/use-toast"
import { clearFieldError } from "../../lib/form"
import { useI18n } from "../../lib/i18n"
import { ErrorBanner } from "../ui/error-banner"
import { PasswordField } from "../ui/password-field"
import { SubmitButton } from "../ui/submit-button"
import { SettingsCard } from "./settings-card"

export function SecurityForm() {
  const { toast } = useToast()
  const { t } = useI18n()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setError("")

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: t("sec.mismatch") })
      return
    }

    const result = UpdateUserSchema.safeParse({
      currentPassword,
      newPassword,
    })
    if (!result.success) {
      const field = result.error.flatten().fieldErrors
      setErrors({
        currentPassword: field.currentPassword?.[0] ?? "",
        newPassword: field.newPassword?.[0] ?? "",
      })
      return
    }

    setLoading(true)
    try {
      const res = await client.api.auth.me.$patch({ json: result.data })
      if (!res.ok) {
        const body = (await res.json()) as { message?: string }
        setError(body.message ?? t("pf.updateFailed"))
        return
      }
      toast(t("sec.updated"))
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setError(t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <SettingsCard
      modifier="set-card--security"
      title={t("sec.title")}
      desc={t("sec.desc")}
    >
      <form className="set-form" onSubmit={handleSubmit}>
        <PasswordField
          id="settings-current"
          label={t("sec.current")}
          value={currentPassword}
          onChange={(v) => {
            setCurrentPassword(v)
            setErrors(clearFieldError("currentPassword"))
          }}
          showPassword={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          showToggle
          error={errors.currentPassword}
        />

        <PasswordField
          id="settings-new"
          label={t("sec.new")}
          value={newPassword}
          onChange={(v) => {
            setNewPassword(v)
            setErrors(clearFieldError("newPassword"))
          }}
          showPassword={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          showToggle
          error={errors.newPassword}
        />
        <div className="set-form__hint">{t("sec.hint")}</div>

        <PasswordField
          id="settings-confirm"
          label={t("sec.confirm")}
          value={confirmPassword}
          onChange={(v) => {
            setConfirmPassword(v)
            setErrors(clearFieldError("confirmPassword"))
          }}
          showPassword={showPassword}
          onToggle={() => setShowPassword(!showPassword)}
          showToggle
          error={errors.confirmPassword}
        />

        <ErrorBanner message={error} onClose={() => setError("")} />
        <div className="set-form__footer">
          <SubmitButton
            loading={loading}
            loadingLabel={t("common.saving")}
            disabled={!currentPassword || !newPassword}
          >
            {t("pf.save")}
          </SubmitButton>
        </div>
      </form>
    </SettingsCard>
  )
}
