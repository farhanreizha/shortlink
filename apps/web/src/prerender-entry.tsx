import type { ReactNode } from "react"
import { renderToString } from "react-dom/server"
import { Router } from "wouter"
import { StaticPage } from "./components/ui/static-page"
import { I18nProvider } from "./lib/i18n"
import { seoRoutes } from "./lib/seo"
import { LandingPage } from "./pages/landing-page"
import { LegalContent } from "./pages/legal-page"
import { SupportContent } from "./pages/support-page"

function render(path: string, content: ReactNode): string {
  return renderToString(
    <I18nProvider initialLang="en">
      <Router ssrPath={path} ssrSearch="">
        {content}
      </Router>
    </I18nProvider>,
  )
}

export function renderRoute(path: string): string {
  switch (path) {
    case "/privacy":
      return render(
        path,
        <StaticPage>
          <LegalContent prefix="pp" />
        </StaticPage>,
      )
    case "/terms":
      return render(
        path,
        <StaticPage>
          <LegalContent prefix="tp" />
        </StaticPage>,
      )
    case "/support":
      return render(
        path,
        <StaticPage>
          <SupportContent />
        </StaticPage>,
      )
    default:
      return render("/", <LandingPage />)
  }
}

export { seoRoutes }
