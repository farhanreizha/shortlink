import type { User } from "@shortlink/shared"
import { Link } from "wouter"
import { LoginForm } from "../components/auth/login-form"
import { RegisterForm } from "../components/auth/register-form"

export function AuthPage({
  mode,
  onAuth,
}: {
  mode: "login" | "register"
  onAuth: (user: User) => void
}) {
  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h1 className="auth-card__title">
          {mode === "login" ? "Sign In" : "Create Account"}
        </h1>
        {mode === "login" ? (
          <LoginForm onAuth={onAuth} />
        ) : (
          <RegisterForm onAuth={onAuth} />
        )}
        <div className="auth-toggle">
          {mode === "login" ? (
            <>
              Don&apos;t have an account? <Link href="/register">Register</Link>
            </>
          ) : (
            <>
              Already have an account? <Link href="/login">Sign In</Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
