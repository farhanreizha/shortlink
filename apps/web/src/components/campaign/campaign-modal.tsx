import type { Campaign, CampaignSummary } from "@knot/shared"
import { useState } from "react"
import { useToast } from "../../hooks/use-toast"
import { ErrorBanner } from "../ui/error-banner"
import { FormField } from "../ui/form-field"
import { Modal } from "../ui/modal"

export function CampaignModal({
  campaign,
  onSave,
  onClose,
}: {
  campaign: CampaignSummary | null
  onSave: (input: {
    name: string
    description: string
    status: "active" | "archived"
  }) => Promise<Campaign | null>
  onClose: () => void
}) {
  const { toast } = useToast()
  const [name, setName] = useState(campaign?.name ?? "")
  const [description, setDescription] = useState(campaign?.description ?? "")
  const [status, setStatus] = useState<"active" | "archived">(
    campaign?.status ?? "active",
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const canSubmit = name.trim().length > 0 && !submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    setSubmitting(true)
    setError("")
    const saved = await onSave({
      name: name.trim(),
      description: description.trim(),
      status,
    })
    setSubmitting(false)
    if (saved) {
      toast(campaign ? "Campaign updated" : "Campaign created")
      onClose()
    } else {
      setError("Failed to save campaign")
      toast("Failed to save campaign", "error")
    }
  }

  return (
    <Modal
      open
      title={campaign ? "Edit Campaign" : "Create Campaign"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="cm-form">
        <FormField label="Name" htmlFor="campaign-name">
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Summer Sale"
          />
        </FormField>
        <FormField label="Description" htmlFor="campaign-desc">
          <textarea
            className="input cm-form__desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this campaign about?"
          />
        </FormField>
        <FormField label="Status" htmlFor="campaign-status">
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value as "active" | "archived")}
          >
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </FormField>
        {error && <ErrorBanner message={error} />}
        <div className="cm-form__actions">
          <button type="button" className="btn btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={!canSubmit}
          >
            {submitting
              ? "Saving…"
              : campaign
                ? "Save Changes"
                : "Create Campaign"}
          </button>
        </div>
      </form>
    </Modal>
  )
}
