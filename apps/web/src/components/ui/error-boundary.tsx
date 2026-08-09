import { Component, type ErrorInfo, type ReactNode } from "react"
import { useI18n } from "../../lib/i18n"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

function Fallback() {
  const { t } = useI18n()
  return (
    <div className="main" style={{ textAlign: "center", paddingTop: 80 }}>
      <h1 style={{ marginBottom: 12 }}>{t("eb.title")}</h1>
      <p
        style={{
          color: "var(--color-neutral)",
          marginBottom: 24,
        }}
      >
        {t("eb.desc")}
      </p>
      <button
        className="btn btn--primary"
        type="button"
        onClick={() => window.location.reload()}
      >
        {t("eb.reload")}
      </button>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary:", error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return <Fallback />
    }
    return this.props.children
  }
}
