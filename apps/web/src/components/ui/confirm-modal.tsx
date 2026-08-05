import { type ReactNode, useEffect } from "react"
import { createPortal } from "react-dom"
import { useEscapeKey } from "../../hooks/use-escape-key"

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
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  useEscapeKey(open, onCancel)

  if (!open) return null

  return createPortal(
    // biome-ignore lint/a11y/noStaticElementInteractions: backdrop click dismisses modal
    <div
      className="modal-overlay animate-fade-in"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="modal-card animate-scale-in"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={() => {}}
      >
        <h3 className="modal-title">{title}</h3>
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
      </div>
    </div>,
    document.body,
  )
}
