import type { ReactNode } from "react"
import { Footer } from "./footer"
import { Navbar } from "./navbar"

export function StaticPage({ children }: { children: ReactNode }) {
  return (
    <div className="animate-fade-in">
      <Navbar />
      <main className="static-page__main">{children}</main>
      <Footer />
    </div>
  )
}
