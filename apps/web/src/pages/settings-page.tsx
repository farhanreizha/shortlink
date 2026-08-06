import type { User } from "@knot/shared"
import { useState } from "react"
import { AccountForm } from "../components/settings/account-form"
import { ConfirmModal } from "../components/ui/confirm-modal"
import { PageLayout } from "../components/ui/page-layout"
import { client } from "../hono-client"
import { useToast } from "../hooks/use-toast"

export function SettingsPage({
  user,
  onLogout,
}: {
  user: User
  onLogout: () => void
}) {
  const { toast } = useToast()
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
    <PageLayout user={user} onLogout={onLogout}>
      <main className="main">
        <div className="card">
          <h1 className="main__title">Account Settings</h1>
          <AccountForm user={user} />
        </div>

        <div className="card" style={{ marginTop: "var(--space-6)" }}>
          <h2 className="main__title">Danger Zone</h2>
          <p
            style={{
              marginBottom: "var(--space-4)",
              color: "var(--color-neutral)",
            }}
          >
            Delete your account and all associated links. This action cannot be
            undone.
          </p>
          <button
            type="button"
            className="btn btn--danger"
            onClick={() => setShowDelete(true)}
          >
            Delete Account
          </button>
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
      </main>
    </PageLayout>
  )
}
