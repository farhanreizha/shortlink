import { Eye, EyeOff } from "lucide-react"
import type { ChangeEvent, ReactNode } from "react"
import { useI18n } from "../../lib/i18n"
import { FormField } from "./form-field"

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  showPassword,
  onToggle,
  showToggle = false,
  error,
  trailing,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showPassword: boolean
  onToggle?: () => void
  showToggle?: boolean
  error?: string
  trailing?: ReactNode
}) {
  const { t } = useI18n()
  return (
    <FormField label={label} htmlFor={id} error={error} trailing={trailing}>
      <div className="input-wrap">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          className="input input--password"
          placeholder={placeholder ?? t("auth.minChars")}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
        />
        {showToggle && onToggle && (
          <button
            type="button"
            className="input-eye"
            onClick={onToggle}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
    </FormField>
  )
}
