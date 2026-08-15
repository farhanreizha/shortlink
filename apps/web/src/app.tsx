import type { User } from "@knot/shared"
import { lazy, type ReactNode, Suspense, useEffect, useRef } from "react"
import { Redirect, Route, Switch, useLocation } from "wouter"
import { ErrorBoundary } from "./components/ui/error-boundary"
import { StaticPage } from "./components/ui/static-page"
import { LoadingScreen } from "./hooks/loading-screen"
import { useAuth, useAuthGuard } from "./hooks/use-auth"
import { ToastProvider } from "./hooks/use-toast"
import { SITE, seoRoutes } from "./lib/seo"
import { LandingPage } from "./pages/landing-page"
import { LegalContent } from "./pages/legal-page"
import { NotFoundPage } from "./pages/not-found-page"
import { SupportContent } from "./pages/support-page"
import "./index.css"

const DashboardShell = lazy(() =>
  import("./components/ui/dashboard-shell").then((m) => ({
    default: m.DashboardShell,
  })),
)

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

const PUBLIC_PATHS = new Set(seoRoutes.map((r) => r.path))

function RouteTransition({ children }: { children: ReactNode }) {
  const [location] = useLocation()
  const initialLocation = useRef(location)
  useEffect(() => {
    if (!location) return
    window.scrollTo(0, 0)
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) canonical.setAttribute("href", `${SITE.domain}${location}`)
  }, [location])
  // ponytail: on first render (hydration) render children directly so the DOM
  // matches the prerendered HTML; only wrap in a keyed div once navigating
  if (location === initialLocation.current) return <>{children}</>
  return (
    <div key={location} className="animate-fade-in">
      {children}
    </div>
  )
}

export function App() {
  const { loading, user, login, logout } = useAuth()
  const [location] = useLocation()

  if (loading && !PUBLIC_PATHS.has(location)) {
    return <LoadingScreen />
  }

  return (
    <ErrorBoundary>
      <ToastProvider>
        <RouteTransition>
          <Suspense fallback={<LoadingScreen />}>
            <Switch>
              <Route path="/">
                <LandingPage user={user} onLogout={logout} />
              </Route>
              <Route path="/dashboard">
                {user ? (
                  <DashboardPage user={user} onLogout={logout} />
                ) : (
                  <Redirect to="/" />
                )}
              </Route>
              <Route path="/login">
                {user ? (
                  <Redirect to="/dashboard" />
                ) : (
                  <AuthPage mode="login" onAuth={login} />
                )}
              </Route>
              <Route path="/register">
                {user ? (
                  <Redirect to="/dashboard" />
                ) : (
                  <AuthPage mode="register" onAuth={login} />
                )}
              </Route>
              <Route path="/forgot-password">
                {user ? <Redirect to="/dashboard" /> : <ForgotPasswordPage />}
              </Route>
              <Route path="/reset-password">
                {user ? <Redirect to="/dashboard" /> : <ResetPasswordPage />}
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
              <PublicLegalRoute path="/privacy" user={user} onLogout={logout}>
                <LegalContent prefix="pp" />
              </PublicLegalRoute>
              <PublicLegalRoute path="/terms" user={user} onLogout={logout}>
                <LegalContent prefix="tp" />
              </PublicLegalRoute>
              <PublicLegalRoute path="/support" user={user} onLogout={logout}>
                <SupportContent />
              </PublicLegalRoute>
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

function PublicLegalRoute({
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
  const { isAuthenticated, loading } = useAuthGuard()
  if (loading) return <StaticPage>{children}</StaticPage>
  return (
    <Route path={path}>
      {isAuthenticated && user ? (
        <DashboardShell user={user} onLogout={onLogout} activeNav="legal">
          {children}
        </DashboardShell>
      ) : (
        <StaticPage>{children}</StaticPage>
      )}
    </Route>
  )
}
