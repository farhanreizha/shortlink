import { Waypoints } from "lucide-react"
import { type ReactNode, useEffect, useRef, useState } from "react"
import { Link } from "wouter"

export function Navbar({
  children,
  user,
  onLogout,
  links,
}: {
  children?: ReactNode
  user?: { username: string }
  onLogout?: () => void
  links?: Array<{ label: string; href: string }>
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLElement>(null)

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

  return (
    <nav className="navbar" ref={ref}>
      <div className="navbar__inner">
        <Link className="navbar__logo" href="/">
          <span className="navbar__logo-mark">
            <Waypoints size={18} />
          </span>
          Knot
        </Link>

        {links && (
          <div className="navbar__links">
            {links.map((link) => (
              <Link key={link.href} className="navbar__link" href={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        )}

        <div className="navbar__spacer" />

        {!user && children && (
          <button
            className="navbar__hamburger"
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? "✕" : "☰"}
          </button>
        )}

        <div className={`navbar__menu${open ? " navbar__menu--open" : ""}`}>
          {links?.map((link) => (
            <Link
              key={link.href}
              className="navbar__link navbar__link--mobile"
              href={link.href}
            >
              {link.label}
            </Link>
          ))}
          {children}
          {user && (
            <Link
              className="navbar__link navbar__link--mobile"
              href="/settings"
            >
              Settings
            </Link>
          )}
          {user && onLogout && (
            <button
              className="navbar__logout navbar__logout--mobile"
              type="button"
              onClick={onLogout}
            >
              Logout
            </button>
          )}
        </div>

        {user && (
          <div className="navbar__avatar-container">
            <button
              className="navbar__avatar-btn"
              type="button"
              onClick={() => setOpen(!open)}
            >
              <span className="navbar__avatar-name">{user.username}</span>
              <div className="navbar__avatar-circle">
                {user.username[0]?.toUpperCase()}
              </div>
            </button>

            {open && (
              <div className="navbar__dropdown">
                <Link className="navbar__dropdown-item" href="/settings">
                  Settings
                </Link>
                <div className="navbar__dropdown-divider" />
                {onLogout && (
                  <button
                    className="navbar__dropdown-item navbar__dropdown-item--danger"
                    type="button"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                )}
              </div>
            )}
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
