import { Link } from "wouter"
import { Navbar } from "../components/ui/navbar"

export function NotFoundPage() {
  return (
    <div className="animate-fade-in">
      <Navbar />
      <main className="main">
        <div className="card" style={{ textAlign: "center" }}>
          <h1 className="main__title" style={{ fontSize: 72 }}>
            404
          </h1>
          <p
            style={{
              marginBottom: "var(--space-6)",
              color: "var(--color-neutral)",
            }}
          >
            Page not found
          </p>
          <Link href="/" className="btn btn--primary">
            Go Home
          </Link>
        </div>
      </main>
    </div>
  )
}
