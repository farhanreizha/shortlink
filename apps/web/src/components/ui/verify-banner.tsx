import { Mail } from "lucide-react"
import { useState } from "react"
import { client } from "../../hono-client"
import { useI18n } from "../../lib/i18n"

export function VerifyBanner() {
  const { t } = useI18n()
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleResend() {
    setLoading(true)
    try {
      await client.api.auth["resend-verification"].$post({})
      setSent(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="verify-banner" role="status">
      <Mail size={16} />
      <span>{t("verify.banner")}</span>
      <button
        className="btn btn--ghost btn--sm"
        type="button"
        onClick={handleResend}
        disabled={loading || sent}
      >
        {sent ? t("verify.sent") : t("verify.resend")}
      </button>
    </div>
  )
}
