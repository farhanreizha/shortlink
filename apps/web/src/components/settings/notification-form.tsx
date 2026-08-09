import type { User } from "@knot/shared"
import { useState } from "react"
import { client } from "../../hono-client"
import { useToast } from "../../hooks/use-toast"
import { type MessageKey, useI18n } from "../../lib/i18n"
import { ErrorBanner } from "../ui/error-banner"

type FlatPrefs = {
  linkClicks: boolean
  campaignReports: boolean
  accountUpdates: boolean
  mobileAlerts: boolean
}

const PREF_ITEMS: {
  key: keyof FlatPrefs
  labelKey: MessageKey
  descKey: MessageKey
}[] = [
  {
    key: "linkClicks",
    labelKey: "nf.linkClicks",
    descKey: "nf.linkClicksDesc",
  },
  {
    key: "campaignReports",
    labelKey: "nf.campaignReports",
    descKey: "nf.campaignReportsDesc",
  },
  {
    key: "accountUpdates",
    labelKey: "nf.accountUpdates",
    descKey: "nf.accountUpdatesDesc",
  },
  {
    key: "mobileAlerts",
    labelKey: "nf.mobileAlerts",
    descKey: "nf.mobileAlertsDesc",
  },
]

function flatten(prefs: User["notificationPrefs"]): FlatPrefs {
  return {
    linkClicks: prefs.email.linkClicks,
    campaignReports: prefs.email.campaignReports,
    accountUpdates: prefs.email.accountUpdates,
    mobileAlerts: prefs.push.mobileAlerts,
  }
}

function nest(prefs: FlatPrefs): User["notificationPrefs"] {
  return {
    email: {
      linkClicks: prefs.linkClicks,
      campaignReports: prefs.campaignReports,
      accountUpdates: prefs.accountUpdates,
    },
    push: { mobileAlerts: prefs.mobileAlerts },
  }
}

export function NotificationForm({ user }: { user: User }) {
  const { toast } = useToast()
  const { t } = useI18n()
  const [prefs, setPrefs] = useState(flatten(user.notificationPrefs))
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function toggle(key: keyof FlatPrefs) {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    setError("")
    setLoading(true)
    try {
      const res = await client.api.auth.me.$patch({
        json: { notificationPrefs: nest(next) },
      })
      if (!res.ok) {
        setPrefs(prefs)
        const body = (await res.json()) as { message?: string }
        setError(body.message ?? t("pf.updateFailed"))
        return
      }
      toast(t("nf.saved"))
    } catch {
      setPrefs(prefs)
      setError(t("common.error"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="set-card set-card--notifications">
      <div className="set-card__header">
        <h2 className="set-card__title">{t("nf.title")}</h2>
        <p className="set-card__desc">{t("nf.desc")}</p>
      </div>
      <div className="set-form">
        <ErrorBanner message={error} onClose={() => setError("")} />
        <div className="set-prefs">
          {PREF_ITEMS.map((item) => (
            <div className="set-pref" key={item.key}>
              <div>
                <div className="set-pref__label">{t(item.labelKey)}</div>
                <div className="set-pref__desc">{t(item.descKey)}</div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={prefs[item.key]}
                aria-label={t(item.labelKey)}
                disabled={loading}
                className={`set-switch${prefs[item.key] ? " set-switch--on" : ""}`}
                onClick={() => toggle(item.key)}
              >
                <span className="set-switch__knob" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
