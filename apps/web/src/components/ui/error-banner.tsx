export function ErrorBanner({
  message,
  onClose,
}: {
  message: string
  onClose?: () => void
}) {
  if (!message) return null

  return (
    <div className="error-banner" style={{ margin: 0 }}>
      {message}
      {onClose && (
        <button
          className="error-banner__close"
          onClick={onClose}
          type="button"
          aria-label="Dismiss error"
        >
          &times;
        </button>
      )}
    </div>
  )
}
