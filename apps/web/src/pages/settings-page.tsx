import type { User } from "@knot/shared"
import { useState } from "react"
import { BillingForm } from "../components/settings/billing-form"
import { DeleteAccountCard } from "../components/settings/delete-account-card"
import { NotificationForm } from "../components/settings/notification-form"
import { ProfileForm } from "../components/settings/profile-form"
import { ReferralForm } from "../components/settings/referral-form"
import { SecurityForm } from "../components/settings/security-form"
import { SettingsNav } from "../components/settings/settings-nav"
import { DashboardShell } from "../components/ui/dashboard-shell"
import type { SettingsTab } from "../constants/settings"

export function SettingsPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const [tab, setTab] = useState<SettingsTab>("profile")

  return (
    <DashboardShell user={user} onLogout={onLogout} activeNav="">
      <div className="set-layout">
        <SettingsNav tab={tab} onSelect={setTab} />

        <div className="set-canvas animate-slide-up">
          {tab === "profile" && <ProfileForm user={user} />}
          {tab === "security" && <SecurityForm />}
          {tab === "notifications" && <NotificationForm user={user} />}
          {tab === "billing" && <BillingForm />}
          {tab === "referral" && <ReferralForm />}

          {tab === "profile" && <DeleteAccountCard onDeleted={onLogout} />}
        </div>
      </div>
    </DashboardShell>
  )
}
