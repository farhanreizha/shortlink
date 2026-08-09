import { Check, Copy } from "lucide-react"
import { useEffect, useState } from "react"
import { useReferral } from "../../hooks/use-referral"
import { useToast } from "../../hooks/use-toast"
import { useI18n } from "../../lib/i18n"

export function ReferralForm() {
  const { t } = useI18n()
  const { toast } = useToast()
  const { referral } = useReferral()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  if (!referral) return null

  const link = `${window.location.origin}/register?ref=${referral.code}`

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      toast(t("ref.copied"))
    } catch {
      toast(t("common.error"), "error")
    }
  }

  const steps = [
    { n: "1", title: t("ref.how1"), desc: t("ref.how1Desc") },
    { n: "2", title: t("ref.how2"), desc: t("ref.how2Desc") },
    { n: "3", title: t("ref.how3"), desc: t("ref.how3Desc") },
  ]

  return (
    <section className="set-card set-card--referral">
      <div className="set-card__header">
        <h2 className="set-card__title">{t("ref.title")}</h2>
        <p className="set-card__desc">{t("ref.desc")}</p>
      </div>

      <div className="ref-link">
        <div className="set-bill__label">{t("ref.yourLink")}</div>
        <div className="ref-link__row">
          <input className="input" readOnly value={link} />
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleCopy}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? t("ref.copied") : t("ref.copy")}
          </button>
        </div>
      </div>

      <div className="ref-stats">
        <div className="ref-stats__item">
          <div className="ref-stats__value">{referral.stats.referred}</div>
          <div className="ref-stats__label">{t("ref.invited")}</div>
        </div>
        <div className="ref-stats__item">
          <div className="ref-stats__value">{referral.stats.rewarded}</div>
          <div className="ref-stats__label">{t("ref.rewarded")}</div>
        </div>
        <div className="ref-stats__item">
          <div className="ref-stats__value">{referral.stats.proMonths}</div>
          <div className="ref-stats__label">{t("ref.proMonths")}</div>
        </div>
      </div>

      {referral.proUntil && (
        <p className="ref-pro">
          {t("ref.proUntil")}:{" "}
          {new Date(referral.proUntil).toLocaleDateString()}
        </p>
      )}

      <div className="set-bill__divider" />

      <div>
        <div className="set-bill__label">{t("ref.how")}</div>
        <ol className="ref-steps">
          {steps.map((step) => (
            <li key={step.n} className="ref-steps__item">
              <span className="ref-steps__num">{step.n}</span>
              <div>
                <div className="ref-steps__title">{step.title}</div>
                <div className="ref-steps__desc">{step.desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="set-bill__divider" />

      <div>
        <div className="set-bill__label">{t("ref.tableTitle")}</div>
        {referral.referredUsers.length === 0 ? (
          <p className="set-form__hint">{t("ref.empty")}</p>
        ) : (
          <table className="set-bill__table">
            <thead>
              <tr>
                <th>{t("ref.colUsername")}</th>
                <th>{t("ref.colJoined")}</th>
                <th>{t("ref.colStatus")}</th>
              </tr>
            </thead>
            <tbody>
              {referral.referredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.username}</td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span
                      className={u.rewarded ? "set-bill__paid" : "ref-status"}
                    >
                      {t(
                        u.rewarded ? "ref.statusRewarded" : "ref.statusPending",
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
