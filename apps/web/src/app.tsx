import { Redirect, Route, Switch } from "wouter"
import { ErrorBoundary } from "./components/ui/error-boundary"
import { Skeleton } from "./components/ui/skeleton"
import { useAuth } from "./hooks/use-auth"
import { ToastProvider } from "./hooks/use-toast"
import { AnalyticsPage } from "./pages/analytics-page"
import { AuthPage } from "./pages/auth-page"
import { CampaignsPage } from "./pages/campaigns-page"
import { CustomLinksPage } from "./pages/custom-links-page"
import { DashboardPage } from "./pages/dashboard-page"
import { LandingPage } from "./pages/landing-page"
import { NotFoundPage } from "./pages/not-found-page"
import { SettingsPage } from "./pages/settings-page"
import "./index.css"

export function App() {
  const { loading, user, login, logout } = useAuth()

  if (loading) {
    return (
      <div className="main animate-fade-in">
        <div className="card">
          <Skeleton
            style={{ height: 24, width: 200, marginBottom: "var(--space-6)" }}
          />
          <Skeleton style={{ height: 44, marginBottom: "var(--space-3)" }} />
          <div style={{ display: "flex", gap: "var(--space-3)" }}>
            <Skeleton className="skeleton--button" style={{ width: 200 }} />
            <Skeleton className="skeleton--button" />
          </div>
        </div>
        <Skeleton
          style={{
            height: 24,
            width: 180,
            margin: "var(--space-10) 0 var(--space-6)",
          }}
        />
        {[1, 2, 3].map((i) => (
          <Skeleton
            key={i}
            style={{
              height: 88,
              marginBottom: "var(--space-3)",
              borderRadius: "var(--radius-lg)",
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <Switch>
          <Route path="/">
            {user ? (
              <DashboardPage user={user} onLogout={logout} />
            ) : (
              <LandingPage />
            )}
          </Route>
          <Route path="/login">
            {user ? (
              <Redirect to="/" />
            ) : (
              <AuthPage mode="login" onAuth={login} />
            )}
          </Route>
          <Route path="/register">
            {user ? (
              <Redirect to="/" />
            ) : (
              <AuthPage mode="register" onAuth={login} />
            )}
          </Route>
          <Route path="/settings">
            {user ? (
              <SettingsPage user={user} onLogout={logout} />
            ) : (
              <Redirect to="/login" />
            )}
          </Route>
          <Route path="/custom-links">
            {user ? (
              <CustomLinksPage user={user} onLogout={logout} />
            ) : (
              <Redirect to="/login" />
            )}
          </Route>
          <Route path="/analytics">
            {user ? (
              <AnalyticsPage user={user} onLogout={logout} />
            ) : (
              <Redirect to="/login" />
            )}
          </Route>
          <Route path="/campaigns">
            {user ? (
              <CampaignsPage user={user} onLogout={logout} />
            ) : (
              <Redirect to="/login" />
            )}
          </Route>
          <Route path="/:rest*">
            <NotFoundPage />
          </Route>
        </Switch>
      </ToastProvider>
    </ErrorBoundary>
  )
}
