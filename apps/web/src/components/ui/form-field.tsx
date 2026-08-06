import type { ReactNode } from "react"

export function FormField({
  label,
  htmlFor,
  error,
  trailing,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  trailing?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="form__group">
      <div className="form__label-row">
        <label className="form__label" htmlFor={htmlFor}>
          {label}
        </label>
        {trailing}
      </div>
      {children}
      {error && <div className="form__error">{error}</div>}
    </div>
  )
}
