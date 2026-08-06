import { type ReactNode } from "react"
import { Modal } from "./modal"

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string | ReactNode
  confirmLabel?: string
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Delete",
  confirmDisabled,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="modal-message">{message}</p>
      <div className="modal-actions">
        <button className="btn btn--ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn btn--danger"
          type="button"
          onClick={onConfirm}
          disabled={confirmDisabled}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
