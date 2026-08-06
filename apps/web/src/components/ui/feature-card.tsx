import type { ReactNode } from "react"

export function FeatureCard({
  icon,
  title,
  description,
  tag,
  delay = 0,
}: {
  icon: ReactNode
  title: string
  description: string
  tag?: string
  delay?: number
}) {
  return (
    <div
      className="card feature-card animate-slide-up"
      style={{
        animationDelay: `${delay}s`,
        textAlign: "center",
        padding: "var(--space-8)",
      }}
    >
      <div className="feature-card__icon">{icon}</div>
      <h3 className="feature-card__title">{title}</h3>
      {tag && <span className="feature-card__tag">{tag}</span>}
      <p className="feature-card__desc">{description}</p>
    </div>
  )
}
