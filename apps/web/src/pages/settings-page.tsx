import type { User } from "@knot/shared"
import { Bell, CreditCard, Gift, Lock, User as UserIcon } from "lucide-react"
import { useState } from "react"
import { BillingForm } from "../components/settings/billing-form"
import { NotificationForm } from "../components/settings/notification-form"
import { ProfileForm } from "../components/settings/profile-form"
import { ReferralForm } from "../components/settings/referral-form"
import { SecurityForm } from "../components/settings/security-form"
import { ConfirmModal } from "../components/ui/confirm-modal"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { client } from "../hono-client"
import { useToast } from "../hooks/use-toast"
import { useI18n } from "../lib/i18n"

const SETTINGS_NAV = [
  { key: "profile", labelKey: "set.profile", icon: UserIcon },
  { key: "security", labelKey: "set.security", icon: Lock },
  { key: "notifications", labelKey: "set.notifications", icon: Bell },
  { key: "billing", labelKey: "set.billing", icon: CreditCard },
  { key: "referral", labelKey: "set.referral", icon: Gift },
] as const

type SettingsTab = (typeof SETTINGS_NAV)[number]["key"]

export function SettingsPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { toast } = useToast()
  const { t } = useI18n()
  const [tab, setTab] = useState<SettingsTab>("profile")
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await client.api.auth.me.$delete()
      toast(t("set.accountDeleted"))
      onLogout()
    } catch {
      toast(t("set.deleteFailed"), "error")
      setDeleting(false)
    }
  }

  return (
    <DashboardShell user={user} onLogout={onLogout} activeNav="">
      <div className="set-layout">
        <aside className="set-sidebar">
          <h1 className="set-sidebar__title">{t("set.title")}</h1>
          <nav className="set-nav" aria-label={t("set.navAria")}>
            {SETTINGS_NAV.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`set-nav__item${tab === item.key ? " set-nav__item--active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                <item.icon size={20} />
                {t(item.labelKey)}
              </button>
            ))}
          </nav>
        </aside>

        <div className="set-canvas animate-slide-up">
          {tab === "profile" && <ProfileForm user={user} />}
          {tab === "security" && <SecurityForm />}
          {tab === "notifications" && <NotificationForm user={user} />}
          {tab === "billing" && <BillingForm />}
          {tab === "referral" && <ReferralForm />}

          {tab === "profile" && (
            <section className="set-card set-card--danger">
              <div className="set-card__header">
                <h2 className="set-card__title">{t("set.dangerZone")}</h2>
                <p className="set-card__desc">{t("set.dangerDesc")}</p>
              </div>
              <div className="set-form__footer">
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => setShowDelete(true)}
                >
                  {t("set.deleteAccount")}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showDelete}
        title={t("set.deleteTitle")}
        message={t("set.deleteMessage")}
        confirmLabel={deleting ? t("set.deleting") : t("set.deleteAccount")}
        confirmDisabled={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </DashboardShell>
  )
}
