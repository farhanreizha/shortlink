import { Bell, HelpCircle, Menu, X } from "lucide-react"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { Link } from "wouter"
import { useEscapeKey } from "../../hooks/use-escape-key"
import { useNotifications } from "../../hooks/use-notifications"
import { useI18n } from "../../lib/i18n"
import { NotificationsDropdown } from "./dash-dropdowns"
import { LanguageSwitcher } from "./language-switcher"

const NAV_LINKS = [
  { key: "dashboard", labelKey: "dash.dashboard", href: "/" },
  { key: "analytics", labelKey: "dash.analytics", href: "/analytics" },
  { key: "campaigns", labelKey: "dash.campaigns", href: "/campaigns" },
  { key: "custom-links", labelKey: "dash.customLinks", href: "/custom-links" },
] as const

const FOOTER_LINKS = [
  { key: "dash.privacy", href: "/privacy" },
  { key: "dash.terms", href: "/terms" },
  { key: "dash.apiDocs", href: "/api/docs" },
  { key: "dash.support", href: "/support" },
] as const

export function DashboardShell({
  user,
  onLogout,
  activeNav = "dashboard",
  children,
}: {
  user: { username: string }
  onLogout: () => void
  activeNav?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [bellOpen, setBellOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const bellRef = useRef<HTMLDivElement>(null)
  const { t } = useI18n()
  const { notifications, unread, markAllRead } = useNotifications()

  useEffect(() => {
    if (!open && !menuOpen && !bellOpen) return
    function handleClick(e: MouseEvent) {
      const target = e.target as Node
      const inside = Boolean(
        ref.current?.contains(target) ||
          menuRef.current?.contains(target) ||
          hamburgerRef.current?.contains(target) ||
          bellRef.current?.contains(target),
      )
      if (!inside) {
        setOpen(false)
        setMenuOpen(false)
        setBellOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open, menuOpen, bellOpen])

  useEscapeKey(open, () => setOpen(false))
  useEscapeKey(menuOpen, () => setMenuOpen(false))
  useEscapeKey(bellOpen, () => setBellOpen(false))

  return (
    <div className="dash-shell animate-fade-in">
      <header className="dash-nav">
        <div className="dash-nav__inner">
          <div className="dash-nav__left">
            <Link className="dash-nav__logo" href="/">
              Knot
            </Link>
            <nav className="dash-nav__links" aria-label={t("dash.navAria")}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.key}
                  className={`dash-nav__link${activeNav === link.key ? " dash-nav__link--active" : ""}`}
                  href={link.href}
                >
                  {t(link.labelKey)}
                </Link>
              ))}
            </nav>
          </div>

          <div className="dash-nav__right">
            <LanguageSwitcher />
            <div className="dash-nav__icon" ref={bellRef}>
              <button
                className="dash-nav__icon-btn"
                type="button"
                aria-label={t("dash.notifications")}
                aria-expanded={bellOpen}
                onClick={() => {
                  if (!bellOpen) markAllRead()
                  setBellOpen(!bellOpen)
                }}
              >
                <Bell size={20} />
                {unread > 0 && (
                  <span className="dash-nav__badge">{unread}</span>
                )}
              </button>
              {bellOpen && (
                <NotificationsDropdown notifications={notifications} />
              )}
            </div>
            <div className="dash-nav__icon">
              <Link
                className="dash-nav__icon-btn"
                to="/support"
                aria-label={t("dash.help")}
              >
                <HelpCircle size={20} />
              </Link>
            </div>
            <div className="dash-nav__avatar" ref={ref}>
              <button
                className="dash-nav__avatar-btn"
                type="button"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={t("dash.accountMenu")}
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
                    {t("common.settings")}
                  </Link>
                  <div className="dash-nav__dropdown-divider" />
                  <button
                    className="dash-nav__dropdown-item dash-nav__dropdown-item--danger"
                    type="button"
                    role="menuitem"
                    onClick={onLogout}
                  >
                    {t("common.logout")}
                  </button>
                </div>
              )}
            </div>
            <button
              className="dash-nav__hamburger"
              type="button"
              ref={hamburgerRef}
              aria-expanded={menuOpen}
              aria-label={t("dash.toggleNav")}
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        <div
          className={`dash-nav__mobile${menuOpen ? " dash-nav__mobile--open" : ""}`}
          ref={menuRef}
        >
          <div className="dash-nav__mobile-profile">
            <span className="dash-nav__avatar-btn">
              {user.username[0]?.toUpperCase()}
            </span>
            <span className="dash-nav__mobile-name">{user.username}</span>
          </div>
          <nav
            className="dash-nav__mobile-links"
            aria-label={t("dash.mobileNavAria")}
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                className={`dash-nav__link${activeNav === link.key ? " dash-nav__link--active" : ""}`}
                href={link.href}
                onClick={() => setMenuOpen(false)}
              >
                {t(link.labelKey)}
              </Link>
            ))}
          </nav>
          <div className="dash-nav__mobile-account">
            <Link
              className="dash-nav__dropdown-item"
              href="/settings"
              onClick={() => setMenuOpen(false)}
            >
              {t("common.settings")}
            </Link>
            <div className="dash-nav__dropdown-divider" />
            <button
              className="dash-nav__dropdown-item dash-nav__dropdown-item--danger"
              type="button"
              onClick={() => {
                setMenuOpen(false)
                onLogout()
              }}
            >
              {t("common.logout")}
            </button>
          </div>
        </div>
      </header>

      <main className="dash-main">{children}</main>

      <footer className="dash-footer">
        <div className="dash-footer__inner">
          <Link className="dash-footer__logo" href="/">
            Knot
          </Link>
          <nav
            className="dash-footer__nav"
            aria-label={t("dash.footerNavAria")}
          >
            {FOOTER_LINKS.map((link) =>
              link.href.startsWith("/api") ? (
                <a
                  key={link.key}
                  className="dash-footer__link"
                  href={link.href}
                >
                  {t(link.key)}
                </a>
              ) : (
                <Link
                  key={link.key}
                  className="dash-footer__link"
                  href={link.href}
                >
                  {t(link.key)}
                </Link>
              ),
            )}
          </nav>
          <div className="dash-footer__copy">
            {t("dash.rights", { year: new Date().getFullYear() })}
          </div>
        </div>
      </footer>
    </div>
  )
}
