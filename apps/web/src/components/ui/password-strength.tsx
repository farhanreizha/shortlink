import { type MessageKey, useI18n } from "../../lib/i18n"

function scorePassword(password: string): number {
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  return score
}

const keys: MessageKey[] = [
  "strength.weak",
  "strength.fair",
  "strength.good",
  "strength.strong",
]
const colors = [
  "var(--color-error)",
  "var(--color-warning)",
  "var(--color-success)",
  "var(--color-success)",
]

export function PasswordStrength({ password }: { password: string }) {
  const { t } = useI18n()
  if (!password) return null
  const score = scorePassword(password)
  const width = `${((score + 1) / 5) * 100}%`
  const labelKey = keys[score - 1]

  return (
    <div style={{ marginTop: "var(--space-1)" }}>
      <div
        style={{
          height: 4,
          borderRadius: 2,
          background: "var(--color-border)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width,
            background: colors[score - 1] ?? "var(--color-error)",
            borderRadius: 2,
            transition: "width 0.2s, background 0.2s",
          }}
        />
      </div>
      <div
        style={{
          fontSize: 12,
          color: colors[score - 1] ?? "var(--color-neutral)",
          marginTop: 2,
          fontWeight: 500,
        }}
      >
        {labelKey ? t(labelKey) : ""}
      </div>
    </div>
  )
}
