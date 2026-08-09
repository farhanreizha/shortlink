import { Link } from "wouter"
import { Navbar } from "../components/ui/navbar"
import { useI18n } from "../lib/i18n"

export function NotFoundPage() {
  const { t } = useI18n()
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
            {t("common.pageNotFound")}
          </p>
          <Link href="/" className="btn btn--primary">
            {t("common.goHome")}
          </Link>
        </div>
      </main>
    </div>
  )
}
