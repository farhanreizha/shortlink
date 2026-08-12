import type { ReactNode } from "react"
import { useI18n } from "../../lib/i18n"

export function ModalActions({
  onCancel,
  cancelDisabled,
  children,
}: {
  onCancel?: () => void
  cancelDisabled?: boolean
  children: ReactNode
}) {
  const { t } = useI18n()
  return (
    <div className="modal-actions">
      {onCancel && (
        <button
          className="btn btn--ghost"
          type="button"
          onClick={onCancel}
          disabled={cancelDisabled}
        >
          {t("common.cancel")}
        </button>
      )}
      {children}
    </div>
  )
}
