import type { ReactNode } from "react"

export function FormField({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="form__group">
      <label className="form__label" htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {error && <div className="form__error">{error}</div>}
    </div>
  )
}
