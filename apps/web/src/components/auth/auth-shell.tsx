import { Waypoints } from "lucide-react"
import type { ReactNode } from "react"
import { Link } from "wouter"
import { Logo } from "../ui/logo"

export function AuthShell({
  brandTitle,
  brandSubtitle,
  title,
  subtitle,
  footer,
  children,
}: {
  brandTitle: string
  brandSubtitle: string
  title: string
  subtitle: string
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="auth-page">
      <aside className="auth-brand animate-fade-in">
        <Link className="auth-brand__logo" href="/">
          <span className="auth-brand__logo-mark">
            <Waypoints size={18} />
          </span>
          Knot
        </Link>
        <div>
          <h2 className="auth-brand__title">{brandTitle}</h2>
          <p className="auth-brand__subtitle">{brandSubtitle}</p>
        </div>
      </aside>

      <main className="auth-main">
        <div className="auth-main__wrap">
          <Logo className="auth-main__logo animate-slide-up" />
          <h1
            className="auth-main__title animate-slide-up"
            style={{ animationDelay: "60ms" }}
          >
            {title}
          </h1>
          <p
            className="auth-main__subtitle animate-slide-up"
            style={{ animationDelay: "120ms" }}
          >
            {subtitle}
          </p>
          <div className="animate-slide-up" style={{ animationDelay: "180ms" }}>
            {children}
          </div>
          {footer && (
            <div
              className="auth-toggle animate-slide-up"
              style={{ animationDelay: "240ms" }}
            >
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
