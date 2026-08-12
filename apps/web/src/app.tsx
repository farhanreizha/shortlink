import type { User } from "@knot/shared"
import { lazy, type ReactNode, Suspense, useEffect } from "react"
import { Redirect, Route, Switch, useLocation } from "wouter"
import { DashboardShell } from "./components/ui/dashboard-shell"
import { ErrorBoundary } from "./components/ui/error-boundary"
import { Skeleton } from "./components/ui/skeleton"
import { StaticPage } from "./components/ui/static-page"
import { useAuth } from "./hooks/use-auth"
import { ToastProvider } from "./hooks/use-toast"
import { LandingPage } from "./pages/landing-page"
import { LegalContent } from "./pages/legal-page"
import { NotFoundPage } from "./pages/not-found-page"
import { SupportContent } from "./pages/support-page"
import "./index.css"

const AnalyticsPage = lazy(() =>
  import("./pages/analytics-page").then((m) => ({ default: m.AnalyticsPage })),
)
const AuthPage = lazy(() =>
  import("./pages/auth-page").then((m) => ({ default: m.AuthPage })),
)
const CampaignsPage = lazy(() =>
  import("./pages/campaigns-page").then((m) => ({ default: m.CampaignsPage })),
)
const CustomLinksPage = lazy(() =>
  import("./pages/custom-links-page").then((m) => ({
    default: m.CustomLinksPage,
  })),
)
const DashboardPage = lazy(() =>
  import("./pages/dashboard-page").then((m) => ({ default: m.DashboardPage })),
)
const ForgotPasswordPage = lazy(() =>
  import("./pages/forgot-password-page").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
)
const ResetPasswordPage = lazy(() =>
  import("./pages/reset-password-page").then((m) => ({
    default: m.ResetPasswordPage,
  })),
)
const SettingsPage = lazy(() =>
  import("./pages/settings-page").then((m) => ({ default: m.SettingsPage })),
)

function PublicRoute({
  path,
  user,
  onLogout,
  children,
}: {
  path: string
  user: User | null
  onLogout: () => void
  children: ReactNode
}) {
  return (
    <Route path={path}>
      {user ? (
        <DashboardShell user={user} onLogout={onLogout} activeNav="legal">
          {children}
        </DashboardShell>
      ) : (
        <StaticPage>{children}</StaticPage>
      )}
    </Route>
  )
}

function RouteTransition({ children }: { children: ReactNode }) {
  const [location] = useLocation()
  useEffect(() => {
    if (!location) return
    window.scrollTo(0, 0)
  }, [location])
  return (
    <div key={location} className="animate-fade-in">
      {children}
    </div>
  )
}

function LoadingSkeleton() {
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

export function App() {
  const { loading, user, login, logout } = useAuth()
  const [location] = useLocation()

  if (loading && location !== "/") {
    return <LoadingSkeleton />
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <RouteTransition>
          <Suspense fallback={<LoadingSkeleton />}>
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
              <Route path="/forgot-password">
                {user ? <Redirect to="/" /> : <ForgotPasswordPage />}
              </Route>
              <Route path="/reset-password">
                {user ? <Redirect to="/" /> : <ResetPasswordPage />}
              </Route>
              <Route path="/settings">
                {user ? (
                  <SettingsPage user={user} onLogout={logout} />
                ) : (
                  <Redirect to="/" />
                )}
              </Route>
              <Route path="/custom-links">
                {user ? (
                  <CustomLinksPage user={user} onLogout={logout} />
                ) : (
                  <Redirect to="/" />
                )}
              </Route>
              <Route path="/analytics">
                {user ? (
                  <AnalyticsPage user={user} onLogout={logout} />
                ) : (
                  <Redirect to="/" />
                )}
              </Route>
              <Route path="/campaigns">
                {user ? (
                  <CampaignsPage user={user} onLogout={logout} />
                ) : (
                  <Redirect to="/" />
                )}
              </Route>
              <PublicRoute path="/privacy" user={user} onLogout={logout}>
                <LegalContent prefix="pp" />
              </PublicRoute>
              <PublicRoute path="/terms" user={user} onLogout={logout}>
                <LegalContent prefix="tp" />
              </PublicRoute>
              <PublicRoute path="/support" user={user} onLogout={logout}>
                <SupportContent />
              </PublicRoute>
              <Route path="/:rest*">
                <NotFoundPage />
              </Route>
            </Switch>
          </Suspense>
        </RouteTransition>
      </ToastProvider>
    </ErrorBoundary>
  )
}
