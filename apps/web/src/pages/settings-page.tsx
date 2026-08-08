import type { User } from "@knot/shared"
import { Bell, CreditCard, Lock, User as UserIcon } from "lucide-react"
import { useState } from "react"
import { useLocation } from "wouter"
import { BillingForm } from "../components/settings/billing-form"
import { NotificationForm } from "../components/settings/notification-form"
import { ProfileForm } from "../components/settings/profile-form"
import { SecurityForm } from "../components/settings/security-form"
import { ConfirmModal } from "../components/ui/confirm-modal"
import { DashboardShell } from "../components/ui/dashboard-shell"
import { client } from "../hono-client"
import { useToast } from "../hooks/use-toast"

const SETTINGS_NAV = [
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "security", label: "Security", icon: Lock },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "billing", label: "Billing", icon: CreditCard },
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
  const [, navigate] = useLocation()
  const [tab, setTab] = useState<SettingsTab>("profile")
  const [showDelete, setShowDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    try {
      await client.api.auth.me.$delete()
      toast("Account deleted")
      onLogout()
    } catch {
      toast("Failed to delete account", "error")
      setDeleting(false)
    }
  }

  return (
    <DashboardShell
      user={user}
      onLogout={onLogout}
      activeNav=""
      onCreateNew={() => navigate("/")}
    >
      <div className="set-layout">
        <aside className="set-sidebar">
          <h1 className="set-sidebar__title">Settings</h1>
          <nav className="set-nav" aria-label="Settings navigation">
            {SETTINGS_NAV.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`set-nav__item${tab === item.key ? " set-nav__item--active" : ""}`}
                onClick={() => setTab(item.key)}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="set-canvas animate-slide-up">
          {tab === "profile" && <ProfileForm user={user} />}
          {tab === "security" && <SecurityForm />}
          {tab === "notifications" && <NotificationForm user={user} />}
          {tab === "billing" && <BillingForm />}

          {tab === "profile" && (
            <section className="set-card set-card--danger">
              <div className="set-card__header">
                <h2 className="set-card__title">Danger Zone</h2>
                <p className="set-card__desc">
                  Delete your account and all associated links. This action
                  cannot be undone.
                </p>
              </div>
              <div className="set-form__footer">
                <button
                  type="button"
                  className="btn btn--danger"
                  onClick={() => setShowDelete(true)}
                >
                  Delete Account
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      <ConfirmModal
        open={showDelete}
        title="Delete account?"
        message="All your links will be permanently deleted. Are you sure?"
        confirmLabel={deleting ? "Deleting…" : "Delete Account"}
        confirmDisabled={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </DashboardShell>
  )
}
