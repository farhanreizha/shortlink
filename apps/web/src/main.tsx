import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Router } from "wouter"
import { App } from "./app"

const root = document.getElementById("root")
if (!root) throw new Error("Root element not found")

createRoot(root).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
)
