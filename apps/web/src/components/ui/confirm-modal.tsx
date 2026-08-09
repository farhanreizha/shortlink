import type { ReactNode } from "react"
import { useI18n } from "../../lib/i18n"
import { Modal } from "./modal"

interface ConfirmModalProps {
  open: boolean
  title: string
  message: ReactNode
  confirmLabel?: string
  confirmDisabled?: boolean
  onConfirm: () => void
  onCancel: () => void
  children?: ReactNode
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  confirmDisabled,
  onConfirm,
  onCancel,
  children,
}: ConfirmModalProps) {
  const { t } = useI18n()
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="modal-message">{message}</p>
      {children}
      <div className="modal-actions">
        <button className="btn btn--ghost" type="button" onClick={onCancel}>
          {t("common.cancel")}
        </button>
        <button
          className="btn btn--danger"
          type="button"
          onClick={onConfirm}
          disabled={confirmDisabled}
        >
          {confirmLabel ?? t("common.delete")}
        </button>
      </div>
    </Modal>
  )
}
