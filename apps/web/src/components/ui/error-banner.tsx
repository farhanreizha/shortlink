import { useI18n } from "../../lib/i18n"

export function ErrorBanner({
  message,
  onClose,
}: {
  message: string
  onClose?: () => void
}) {
  const { t } = useI18n()
  if (!message) return null

  return (
    <div className="error-banner" style={{ margin: 0 }}>
      {message}
      {onClose && (
        <button
          className="error-banner__close"
          onClick={onClose}
          type="button"
          aria-label={t("common.dismissError")}
        >
          &times;
        </button>
      )}
    </div>
  )
}
