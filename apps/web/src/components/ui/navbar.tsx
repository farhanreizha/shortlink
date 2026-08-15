import { type ReactNode, useEffect, useRef, useState } from "react"
import { Link } from "wouter"
import { useI18n } from "../../lib/i18n"
import { LanguageSwitcher } from "./language-switcher"
import { Logo } from "./logo"

export function Navbar({
  children,
  links,
  user,
  onLogout,
}: {
  children?: ReactNode
  links?: Array<{ label: string; href: string }>
  user?: { username: string } | null
  onLogout?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [avatarOpen, setAvatarOpen] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const { t } = useI18n()

  useEffect(() => {
    if (!open && !avatarOpen) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setAvatarOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open, avatarOpen])

  return (
    <nav className="navbar" ref={ref}>
      <div className="navbar__inner">
        <Logo
          onClick={() => {
            if (window.location.pathname === "/") {
              window.scrollTo({ top: 0, behavior: "smooth" })
              history.replaceState(null, "", "/")
            }
          }}
        />

        {links && (
          <div className="navbar__links">
            {links.map((link) =>
              link.href.startsWith("#") ? (
                <a key={link.href} className="navbar__link" href={link.href}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} className="navbar__link" href={link.href}>
                  {link.label}
                </Link>
              ),
            )}
          </div>
        )}

        <div className="navbar__spacer" />

        <LanguageSwitcher />

        {(children || user) && (
          <button
            className="navbar__hamburger"
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
          >
            {open ? "✕" : "☰"}
          </button>
        )}

        {user ? (
          <div className="navbar__avatar-container">
            <button
              className="navbar__avatar-btn"
              type="button"
              aria-haspopup="menu"
              aria-expanded={avatarOpen}
              aria-label={t("dash.accountMenu")}
              onClick={() => setAvatarOpen(!avatarOpen)}
            >
              <span className="navbar__avatar-circle">
                {user.username[0]?.toUpperCase()}
              </span>
            </button>
            {avatarOpen && (
              <div className="navbar__dropdown" role="menu">
                <div className="navbar__dropdown-header">{user.username}</div>
                <Link
                  className="navbar__dropdown-item"
                  href="/dashboard"
                  role="menuitem"
                >
                  {t("nav.dashboard")}
                </Link>
                <Link
                  className="navbar__dropdown-item"
                  href="/settings"
                  role="menuitem"
                >
                  {t("common.settings")}
                </Link>
                <div className="navbar__dropdown-divider" />
                <button
                  className="navbar__dropdown-item navbar__dropdown-item--danger"
                  type="button"
                  role="menuitem"
                  onClick={onLogout}
                >
                  {t("common.logout")}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`navbar__menu${open ? " navbar__menu--open" : ""}`}>
            {links?.map((link) =>
              link.href.startsWith("#") ? (
                <a
                  key={link.href}
                  className="navbar__link navbar__link--mobile"
                  href={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  className="navbar__link navbar__link--mobile"
                  href={link.href}
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ),
            )}
            {children}
          </div>
        )}

        {user && (
          <div
            className={`navbar__menu navbar__menu--account${open ? " navbar__menu--open" : ""}`}
          >
            <span className="navbar__username-mobile">{user.username}</span>
            <Link
              className="navbar__link navbar__link--mobile"
              href="/dashboard"
              onClick={() => setOpen(false)}
            >
              {t("nav.dashboard")}
            </Link>
            <Link
              className="navbar__link navbar__link--mobile"
              href="/settings"
              onClick={() => setOpen(false)}
            >
              {t("common.settings")}
            </Link>
            <button
              className="navbar__logout--mobile"
              type="button"
              onClick={() => {
                setOpen(false)
                onLogout?.()
              }}
            >
              {t("common.logout")}
            </button>
          </div>
        )}
      </div>

      {open && (
        <button
          className="navbar__overlay"
          type="button"
          onClick={() => setOpen(false)}
        />
      )}
    </nav>
  )
}
