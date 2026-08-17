import { CheckCircle2, XCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { Link, useSearch } from "wouter"
import { AuthShell } from "../components/auth/auth-shell"
import { client } from "../hono-client"
import { useI18n } from "../lib/i18n"

export function VerifyEmailPage() {
  const { t } = useI18n()
  const search = useSearch()
  const token = new URLSearchParams(search).get("token")
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  )

  useEffect(() => {
    if (!token) {
      setStatus("error")
      return
    }
    client.api.auth["verify-email"]
      .$get({ query: { token } })
      .then((res) => setStatus(res.ok ? "success" : "error"))
      .catch(() => setStatus("error"))
  }, [token])

  return (
    <AuthShell
      brandTitle={t("auth.loginTitle")}
      brandSubtitle={t("auth.loginSubtitle")}
      title={
        status === "success" ? t("verify.successTitle") : t("verify.errorTitle")
      }
      subtitle={
        status === "loading"
          ? t("common.loading")
          : status === "success"
            ? t("verify.successBody")
            : t("verify.errorBody")
      }
      footer={
        status === "success" ? (
          <Link className="btn btn--primary" href="/dashboard">
            {t("verify.goDashboard")}
          </Link>
        ) : (
          <Link className="btn btn--primary" href="/login">
            {t("verify.goLogin")}
          </Link>
        )
      }
    >
      <div className="verify-status">
        {status === "success" && (
          <CheckCircle2
            size={48}
            className="verify-status__icon verify-status__icon--ok"
          />
        )}
        {status === "error" && (
          <XCircle
            size={48}
            className="verify-status__icon verify-status__icon--err"
          />
        )}
      </div>
    </AuthShell>
  )
}
