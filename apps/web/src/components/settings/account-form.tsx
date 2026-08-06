import type { User } from "@knot/shared"
import { UpdateUserSchema } from "@knot/shared"
import { useState } from "react"
import { client } from "../../hono-client"
import { useToast } from "../../hooks/use-toast"
import { clearFieldError } from "../../lib/form"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"
import { PasswordField } from "../ui/password-field"

export function AccountForm({ user }: { user: User }) {
  const { toast } = useToast()
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setError("")

    const payload: Record<string, string> = {}
    if (email) payload.email = email
    if (currentPassword) payload.currentPassword = currentPassword
    if (newPassword) payload.newPassword = newPassword

    if (Object.keys(payload).length === 0) return

    const result = UpdateUserSchema.safeParse(payload)
    if (!result.success) {
      const field = result.error.flatten().fieldErrors
      setErrors({
        email: field.email?.[0] ?? "",
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
        setError(body.message ?? "Update failed")
        return
      }
      toast("Settings updated!")
      setEmail("")
      setCurrentPassword("")
      setNewPassword("")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={handleUpdate}>
      <FormField label="Email" htmlFor="settings-email" error={errors.email}>
        <input
          id="settings-email"
          type="email"
          className="input"
          placeholder={user.email}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors(clearFieldError("email"))
          }}
        />
      </FormField>

      <PasswordField
        id="settings-current"
        label="Current Password"
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
        label="New Password"
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

      <ErrorBanner message={error} />
      <button
        type="submit"
        className="btn btn--primary"
        disabled={loading || (!email && !newPassword)}
      >
        {loading ? "Saving…" : "Save Changes"}
      </button>
    </form>
  )
}
