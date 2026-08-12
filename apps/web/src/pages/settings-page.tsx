import type { User } from "@knot/shared"
import { Bell, CreditCard, Gift, Lock, User as UserIcon } from "lucide-react"
import { useState } from "react"
import { BillingForm } from "../components/settings/billing-form"
import { NotificationForm } from "../components/settings/notification-form"
import { ProfileForm } from "../components/settings/profile-form"
import { ReferralForm } from "../components/settings/referral-form"
import { SecurityForm } from "../components/settings/security-form"
import { SettingsCard } from "../components/settings/settings-card"
import { ConfirmModal } from "../components/ui/confirm-modal"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { FormField } from "../components/ui/form-field"
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
  const [deletePassword, setDeletePassword] = useState("")
  const [deleteError, setDeleteError] = useState("")

  async function handleDelete() {
    setDeleting(true)
    setDeleteError("")
    const res = await client.api.auth.me.$delete({
      json: { password: deletePassword },
    })
    if (!res.ok) {
      const body = (await res.json()) as { message?: string }
      setDeleteError(body.message ?? t("set.deleteFailed"))
      setDeleting(false)
      return
    }
    toast(t("set.accountDeleted"))
    onLogout()
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
            <SettingsCard
              modifier="set-card--danger"
              title={t("set.dangerZone")}
              desc={t("set.dangerDesc")}
            >
              <div className="set-form__footer">
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => setShowDelete(true)}
                >
                  {t("set.deleteAccount")}
                </button>
              </div>
            </SettingsCard>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showDelete}
        title={t("set.deleteTitle")}
        message={t("set.deleteMessage")}
        confirmLabel={deleting ? t("set.deleting") : t("set.deleteAccount")}
        confirmDisabled={deleting || !deletePassword}
        onConfirm={handleDelete}
        onCancel={() => {
          setShowDelete(false)
          setDeletePassword("")
          setDeleteError("")
        }}
      >
        <FormField
          label={t("set.deletePassword")}
          htmlFor="del-password"
          error={deleteError}
        >
          <input
            id="del-password"
            className="input"
            type="password"
            placeholder={t("set.deletePasswordHint")}
            value={deletePassword}
            onChange={(e) => {
              setDeletePassword(e.target.value)
              setDeleteError("")
            }}
          />
        </FormField>
      </ConfirmModal>
    </DashboardShell>
  )
}
