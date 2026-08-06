import type { User } from "@knot/shared"
import { Waypoints } from "lucide-react"
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
  const isLogin = mode === "login"

  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <Link className="auth-brand__logo" href="/">
          <span className="auth-brand__logo-mark">
            <Waypoints size={18} />
          </span>
          Knot
        </Link>
        <div>
          <h2 className="auth-brand__title">
            {isLogin
              ? "Secure, simplified redirect infrastructure."
              : "Infrastructure-level reliability."}
          </h2>
          <p className="auth-brand__subtitle">
            {isLogin
              ? "Manage your links with absolute reliability and speed. Experience the new standard in URL management."
              : "Join Knot to manage, redirect, and optimize your global links with absolute precision and minimal latency."}
          </p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-main__wrap">
          <Link className="auth-main__logo" href="/">
            <span className="auth-main__logo-mark">
              <Waypoints size={18} />
            </span>
            Knot
          </Link>
          <h1 className="auth-main__title">
            {isLogin ? "Welcome back" : "Create your account"}
          </h1>
          <p className="auth-main__subtitle">
            {isLogin
              ? "Please enter your details to sign in."
              : "Start managing your links with Knot today."}
          </p>
          {isLogin ? (
            <LoginForm onAuth={onAuth} />
          ) : (
            <RegisterForm onAuth={onAuth} />
          )}
          <div className="auth-toggle">
            {isLogin ? (
              <>
                Don&apos;t have an account?{" "}
                <Link href="/register">Sign up</Link>
              </>
            ) : (
              <>
                Already have an account? <Link href="/login">Log in</Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
