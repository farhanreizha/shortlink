import type { ReactNode } from "react"
import { Link } from "wouter"
import { Navbar } from "./navbar"

export function PageLayout({
  children,
  user,
  onLogout,
}: {
  children: ReactNode
  user?: { username: string }
  onLogout?: () => void
}) {
  return (
    <div className="animate-fade-in">
      <Navbar user={user} onLogout={onLogout}>
        <Link className="navbar__link" href="/">
          My Links
        </Link>
      </Navbar>
      <main className="main">{children}</main>
    </div>
  )
}
