import type { User } from "@shortlink/shared"
import { UpdateUserSchema } from "@shortlink/shared"
import { useState } from "react"
import { ConfirmModal } from "../components/ui/confirm-modal"
import { ErrorBanner } from "../components/ui/error-banner"
import { FormField } from "../components/ui/form-field"
import { PageLayout } from "../components/ui/page-layout"
import { PasswordField } from "../components/ui/password-field"
import { client } from "../hono-client"
import { useToast } from "../hooks/use-toast"
import { clearFieldError } from "../lib/form"

export function SettingsPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { toast } = useToast()
  const [email, setEmail] = useState(user.email)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  async function handleDelete() {
    setDeleting(true)
    try {
      await client.api.auth.me.$delete()
      toast("Account deleted")
      onLogout()
    } catch {
      setError("Failed to delete account")
      setDeleting(false)
    }
  }

  return (
    <PageLayout user={user} onLogout={onLogout}>
      <main className="main">
        <div className="card">
          <h1 className="main__title">Account Settings</h1>

          <form className="form" onSubmit={handleUpdate}>
            <FormField
              label="Email"
              htmlFor="settings-email"
              error={errors.email}
            >
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
        </div>

        <div className="card" style={{ marginTop: "var(--space-6)" }}>
          <h2 className="main__title">Danger Zone</h2>
          <p
            style={{
              marginBottom: "var(--space-4)",
              color: "var(--color-neutral)",
            }}
          >
            Delete your account and all associated shortlinks. This action
            cannot be undone.
          </p>
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => setShowDelete(true)}
          >
            Delete Account
          </button>
        </div>

        <ConfirmModal
          open={showDelete}
          title="Delete account?"
          message="All your shortlinks will be permanently deleted. Are you sure?"
          confirmLabel={deleting ? "Deleting…" : "Delete Account"}
          confirmDisabled={deleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      </main>
    </PageLayout>
  )
}
