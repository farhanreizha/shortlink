import type { ReactNode } from "react"

export function SubmitButton({
  loading,
  loadingLabel,
  disabled,
  block = false,
  children,
}: {
  loading: boolean
  loadingLabel: string
  disabled?: boolean
  block?: boolean
  children: ReactNode
}) {
  return (
    <button
      type="submit"
      className="btn btn--primary"
      disabled={disabled || loading}
      style={block ? { width: "100%" } : undefined}
    >
      {loading ? loadingLabel : children}
    </button>
  )
}
