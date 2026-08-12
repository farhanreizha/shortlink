import type { ReactNode } from "react"

export function SettingsCard({
  title,
  desc,
  modifier,
  ariaBusy,
  children,
}: {
  title: ReactNode
  desc: ReactNode
  modifier?: string
  ariaBusy?: boolean
  children: ReactNode
}) {
  return (
    <section
      className={`set-card${modifier ? ` ${modifier}` : ""}`}
      {...(ariaBusy ? { "aria-busy": "true" } : undefined)}
    >
      <div className="set-card__header">
        <h2 className="set-card__title">{title}</h2>
        <p className="set-card__desc">{desc}</p>
      </div>
      {children}
    </section>
  )
}
