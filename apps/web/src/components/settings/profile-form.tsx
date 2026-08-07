import type { User } from "@knot/shared"
import { useState } from "react"
import { client } from "../../hono-client"
import { useToast } from "../../hooks/use-toast"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"

export function ProfileForm({ user }: { user: User }) {
  const { toast } = useToast()
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
        setError(body.message ?? "Update failed")
        return
      }
      toast("Profile updated!")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="set-card">
      <div className="set-card__header">
        <h2 className="set-card__title">General Information</h2>
        <p className="set-card__desc">
          Update your basic profile details and public avatar.
        </p>
      </div>
      <form className="set-form" onSubmit={handleSubmit}>
        <FormField label="Email Address" htmlFor="settings-email" error={error}>
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
            {loading ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  )
}
