import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Router } from "wouter"
import { App } from "./app"
import { I18nProvider } from "./lib/i18n"

const root = document.getElementById("root")
if (!root) throw new Error("Root element not found")

createRoot(root).render(
  <StrictMode>
    <I18nProvider>
      <Router>
        <App />
      </Router>
    </I18nProvider>
  </StrictMode>,
)
