import { Bell, HelpCircle } from "lucide-react"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { Link } from "wouter"
import { useEscapeKey } from "../../hooks/use-escape-key"

const NAV_LINKS = [
  { key: "dashboard", label: "Dashboard", href: "/" },
  { key: "analytics", label: "Analytics", href: "/analytics", disabled: true },
  { key: "campaigns", label: "Campaigns", href: "/campaigns", disabled: true },
  {
    key: "custom-links",
    label: "Custom Links",
    href: "/custom-links",
    disabled: true,
  },
]

const FOOTER_LINKS = [
  "Privacy Policy",
  "Terms of Service",
  "API Documentation",
  "Support",
]

export function DashboardShell({
  user,
  onLogout,
  activeNav = "dashboard",
  onCreateNew,
  children,
}: {
  user: { username: string }
  onLogout: () => void
  activeNav?: string
  onCreateNew?: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  useEscapeKey(open, () => setOpen(false))

  function scrollToHero() {
    document
      .getElementById("dash-create")
      ?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <div className="dash-shell animate-fade-in">
      <header className="dash-nav">
        <div className="dash-nav__inner">
          <div className="dash-nav__left">
            <Link className="dash-nav__logo" href="/">
              Knot
            </Link>
            <nav className="dash-nav__links" aria-label="Dashboard navigation">
              {NAV_LINKS.map((link) =>
                link.disabled ? (
                  <span
                    key={link.label}
                    className="dash-nav__link dash-nav__link--disabled"
                    aria-disabled="true"
                  >
                    {link.label}
                  </span>
                ) : (
                  <Link
                    key={link.href}
                    className={`dash-nav__link${activeNav === link.key ? " dash-nav__link--active" : ""}`}
                    href={link.href}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          </div>

          <div className="dash-nav__right">
            <button
              className="dash-nav__icon-btn"
              type="button"
              aria-label="Notifications"
            >
              <Bell size={20} />
            </button>
            <button
              className="dash-nav__icon-btn"
              type="button"
              aria-label="Help"
            >
              <HelpCircle size={20} />
            </button>
            <button
              className="dash-nav__create"
              type="button"
              onClick={onCreateNew ?? scrollToHero}
            >
              Create New
            </button>
            <div className="dash-nav__avatar" ref={ref}>
              <button
                className="dash-nav__avatar-btn"
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Account menu"
                onClick={() => setOpen(!open)}
              >
                {user.username[0]?.toUpperCase()}
              </button>
              {open && (
                <div className="dash-nav__dropdown" role="menu">
                  <Link
                    className="dash-nav__dropdown-item"
                    href="/settings"
                    role="menuitem"
                  >
                    Settings
                  </Link>
                  <div className="dash-nav__dropdown-divider" />
                  <button
                    className="dash-nav__dropdown-item dash-nav__dropdown-item--danger"
                    type="button"
                    role="menuitem"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="dash-main">{children}</main>

      <footer className="dash-footer">
        <div className="dash-footer__inner">
          <Link className="dash-footer__logo" href="/">
            Knot
          </Link>
          <nav className="dash-footer__nav" aria-label="Footer navigation">
            {FOOTER_LINKS.map((label) => (
              <span key={label} className="dash-footer__link">
                {label}
              </span>
            ))}
          </nav>
          <div className="dash-footer__copy">
            &copy; {new Date().getFullYear()} Knot URL Shortener. All rights
            reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
