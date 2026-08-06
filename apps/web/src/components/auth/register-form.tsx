import type { User } from "@knot/shared"
import { RegisterSchema } from "@knot/shared"
import { useState } from "react"
import { client } from "../../hono-client"
import { clearFieldError } from "../../lib/form"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"
import { PasswordField } from "../ui/password-field"
import { PasswordStrength } from "../ui/password-strength"

export function RegisterForm({ onAuth }: { onAuth: (user: User) => void }) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
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
      setError("Passwords do not match")
      return
    }
    setLoading(true)
    try {
      const res = await client.api.auth.register.$post({
        json: { username, email, password },
      })
      if (!res.ok) {
        const body = (await res.json()) as { message?: string }
        setError(body.message ?? "Registration failed")
        return
      }
      const user = (await res.json()) as User
      onAuth(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <FormField
        label="Username"
        htmlFor="reg-username"
        error={errors.username}
      >
        <input
          id="reg-username"
          className="input"
          placeholder="your-name"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setErrors(clearFieldError("username"))
          }}
        />
      </FormField>
      <FormField label="Email" htmlFor="reg-email" error={errors.email}>
        <input
          id="reg-email"
          type="email"
          className="input"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setErrors(clearFieldError("email"))
          }}
        />
      </FormField>
      <PasswordField
        id="reg-password"
        label="Password"
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
        label="Confirm Password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        placeholder="repeat password"
        showPassword={showPassword}
      />
      <ErrorBanner message={error} />
      <button
        type="submit"
        className="btn btn--primary"
        style={{ width: "100%" }}
        disabled={
          loading || !username || !email || !password || !confirmPassword
        }
      >
        {loading ? "Please wait…" : "Create Account"}
      </button>
    </form>
  )
}
