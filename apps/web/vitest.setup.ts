import "@testing-library/jest-dom"
import { vi } from "vitest"

// Mock wouter
vi.mock("wouter", () => ({
  useLocation: () => ["/", vi.fn()],
  useRoutes: () => null,
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
  Switch: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Route: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Redirect: ({ to }: { to: string }) => <div data-testid="redirect" data-to={to} />,
}))

// Mock hono client
vi.mock("@/hono-client", () => ({
  client: {
    api: {
      auth: {
        me: { $get: vi.fn() },
        logout: { $post: vi.fn() },
      },
    },
  },
}))

// Mock i18n
vi.mock("@/lib/i18n", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

// Mock notification hook
vi.mock("@/hooks/use-notifications", () => ({
  useNotifications: () => ({
    notifications: [],
    unread: 0,
    markAllRead: vi.fn(),
  }),
}))

// Mock escape key hook
vi.mock("@/hooks/use-escape-key", () => ({
  useEscapeKey: vi.fn(),
}))