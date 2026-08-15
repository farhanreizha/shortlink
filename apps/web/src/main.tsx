import "@fontsource-variable/geist"
import "@fontsource-variable/space-grotesk"
import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { Router } from "wouter"
import { App } from "./app"
import { I18nProvider } from "./lib/i18n"

const root = document.getElementById("root")
if (!root) throw new Error("Root element not found")

const tree = (
  <StrictMode>
    <I18nProvider>
      <Router>
        <App />
      </Router>
    </I18nProvider>
  </StrictMode>
)

// ponytail: prerendered routes carry server content (hydrate); non-prerendered
// routes serve an empty #root (render fresh, nothing to hydrate against)
if (root.hasChildNodes()) {
  hydrateRoot(root, tree)
} else {
  createRoot(root).render(tree)
}
