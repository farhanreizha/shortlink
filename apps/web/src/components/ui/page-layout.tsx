import type { ReactNode } from "react"
import { Link } from "wouter"
import { Navbar } from "./navbar"

export function PageLayout({
  children,
  user,
  onLogout,
  navLinks,
}: {
  children: ReactNode
  user?: { username: string }
  onLogout?: () => void
  navLinks?: ReactNode
}) {
  return (
    <div className="animate-fade-in">
      <Navbar user={user} onLogout={onLogout}>
        {navLinks ?? (
          <Link className="navbar__link" href="/">
            My Links
          </Link>
        )}
      </Navbar>
      <main className="main">{children}</main>
    </div>
  )
}
