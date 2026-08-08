import type { User } from "@knot/shared"
import { DashboardShell } from "../components/ui/dashboard-shell"

export function PlaceholderPage({
  user,
  onLogout,
  title,
  activeNav,
}: {
  user: User
  onLogout: () => void
  title: string
  activeNav: string
}) {
  return (
    <DashboardShell user={user} onLogout={onLogout} activeNav={activeNav}>
      <div className="empty-state" style={{ marginTop: "var(--space-16)" }}>
        <div className="empty-state__title">{title}</div>
        <div className="empty-state__text">Coming soon</div>
      </div>
    </DashboardShell>
  )
}
