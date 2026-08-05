import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
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
      return (
        this.props.fallback ?? (
          <div className="main" style={{ textAlign: "center", paddingTop: 80 }}>
            <h1 style={{ marginBottom: 12 }}>Something went wrong</h1>
            <p
              style={{
                color: "var(--color-neutral)",
                marginBottom: 24,
              }}
            >
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}
