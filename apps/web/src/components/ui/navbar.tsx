import { type ReactNode, useEffect, useRef, useState } from "react"
import { Link } from "wouter"
import { useI18n } from "../../lib/i18n"
import { LanguageSwitcher } from "./language-switcher"
import { Logo } from "./logo"

export function Navbar({
  children,
  links,
}: {
  children?: ReactNode
  links?: Array<{ label: string; href: string }>
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLElement>(null)
  const { t } = useI18n()

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

        {children && (
          <button
            className="navbar__hamburger"
            type="button"
            onClick={() => setOpen(!open)}
            aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
          >
            {open ? "✕" : "☰"}
          </button>
        )}

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
