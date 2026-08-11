import type { User } from "@knot/shared"
import { Link } from "wouter"
import { AuthShell } from "../components/auth/auth-shell"
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
    <AuthShell
      key={isLogin ? "login" : "register"}
      brandTitle={isLogin ? t("auth.loginTitle") : t("auth.registerTitle")}
      brandSubtitle={
        isLogin ? t("auth.loginSubtitle") : t("auth.registerSubtitle")
      }
      title={isLogin ? t("auth.welcomeBack") : t("auth.createAccount")}
      subtitle={isLogin ? t("auth.loginSub") : t("auth.registerSub")}
      footer={
        isLogin ? (
          <>
            {t("auth.noAccount")}{" "}
            <Link href="/register">{t("auth.signUp")}</Link>
          </>
        ) : (
          <>
            {t("auth.haveAccount")} <Link href="/login">{t("auth.logIn")}</Link>
          </>
        )
      }
    >
      {isLogin ? (
        <LoginForm onAuth={onAuth} />
      ) : (
        <RegisterForm onAuth={onAuth} />
      )}
    </AuthShell>
  )
}
