import type { User } from "@knot/shared"
import { Waypoints } from "lucide-react"
import { Link } from "wouter"
import { LoginForm } from "../components/auth/login-form"
import { RegisterForm } from "../components/auth/register-form"
import { useI18n } from "../lib/i18n"

export function AuthPage({
  mode,
  onAuth,
}: {
  mode: "login" | "register"
  onAuth: (user: User) => void
}) {
  const { t } = useI18n()
  const isLogin = mode === "login"

  return (
    <div className="auth-page">
      <aside className="auth-brand animate-fade-in">
        <Link className="auth-brand__logo" href="/">
          <span className="auth-brand__logo-mark">
            <Waypoints size={18} />
          </span>
          Knot
        </Link>
        <div>
          <h2 className="auth-brand__title">
            {isLogin ? t("auth.loginTitle") : t("auth.registerTitle")}
          </h2>
          <p className="auth-brand__subtitle">
            {isLogin ? t("auth.loginSubtitle") : t("auth.registerSubtitle")}
          </p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-main__wrap">
          <Link className="auth-main__logo animate-slide-up" href="/">
            <span className="auth-main__logo-mark">
              <Waypoints size={18} />
            </span>
            Knot
          </Link>
          <h1
            className="auth-main__title animate-slide-up"
            style={{ animationDelay: "60ms" }}
          >
            {isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
          </h1>
          <p
            className="auth-main__subtitle animate-slide-up"
            style={{ animationDelay: "120ms" }}
          >
            {isLogin ? t("auth.loginSub") : t("auth.registerSub")}
          </p>
          <div className="animate-slide-up" style={{ animationDelay: "180ms" }}>
            {isLogin ? (
              <LoginForm onAuth={onAuth} />
            ) : (
              <RegisterForm onAuth={onAuth} />
            )}
          </div>
          <div
            className="auth-toggle animate-slide-up"
            style={{ animationDelay: "240ms" }}
          >
            {isLogin ? (
              <>
                {t("auth.noAccount")}{" "}
                <Link href="/register">{t("auth.signUp")}</Link>
              </>
            ) : (
              <>
                {t("auth.haveAccount")}{" "}
                <Link href="/login">{t("auth.logIn")}</Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
