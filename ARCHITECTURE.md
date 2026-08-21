# Shortlink Architecture

## Overview

```
shortlink/
├── apps/
│   ├── api/          HonoJS + @hono/zod-openapi backend
│   └── web/          React + Vite frontend
├── packages/
│   ├── shared/       Zod schemas + RPC route types
│   └── typescript-config/  Shared TS config base
├── docker-compose.yml
├── turbo.json
└── package.json
```

## API — Layered Architecture

```
apps/api/src/
├── index.ts        Entry: serve(app)
├── app.ts          App factory: create OpenAPIHono, mount middleware + sub-apps, doc()
├── config.ts       Env validation (zod) + prod guards
├── lib/            auth (hash/JWT), mailer, rate-limiter (DB-backed), url-safety
├── middleware/     auth (cookie JWT -> c.set("userId")), error-handler, security-headers
├── routes/         One OpenAPIHono sub-app per resource (auth, shortlink, redirect,
│                   campaign, analytics, notification, referral, qrcode, health)
├── services/       Business logic per resource (auth, shortlink, campaign, click,
│                   analytics, notification, referral)
└── db/             index.ts (Drizzle connection), schema.ts (all tables + indexes)
```

The authoritative route list is the generated OpenAPI spec at `GET /api/doc`.
File trees drift; the spec does not.

### Data flow

```
Request
  -> rate limiter (/register, /login, /shortlinks)
    -> auth middleware (skips public paths)
      -> route handler (thin: validate -> service -> response)
        -> service (business logic)
          -> db (Drizzle ORM)
```

### Key rules

- **Handler tetap di file route** (Hono recommendation: no separate Controller layer)
- Handler hanya: validasi input, panggil service, return response
- Service me-return data atau throw `HTTPException` (dari `hono/http-exception`)
- Semua `HTTPException` diteruskan oleh `error-handler.ts` middleware; error lain -> 500
- Path di `createRoute()` relatif terhadap mount point
- Route baru WAJIB pakai `OpenAPIHono` (bukan `Hono`) agar muncul di `/api/doc`

### Routes mapping

| Method | Final path                 | Sub-app mount     | Route definition | Service                        |
|--------|----------------------------|-------------------|------------------|--------------------------------|
| POST   | /api/auth/register         | /api/auth -> /    | /register        | authService.register           |
| POST   | /api/auth/login            | /api/auth -> /    | /login           | authService.login              |
| POST   | /api/auth/logout           | /api/auth -> /    | /logout          | (cookie clear)                 |
| GET    | /api/auth/me               | /api/auth -> /    | /me              | authService.getMe              |
| PATCH  | /api/auth/me               | /api/auth -> /    | /me              | authService.updateUser         |
| DELETE | /api/auth/me               | /api/auth -> /    | /me              | authService.deleteAccount      |
| POST   | /api/auth/forgot-password  | /api/auth -> /    | /forgot-password | authService.requestPasswordReset |
| POST   | /api/auth/reset-password   | /api/auth -> /    | /reset-password  | authService.resetPassword      |
| GET    | /api/auth/verify-email     | /api/auth -> /    | /verify-email    | authService.verifyEmail        |
| POST   | /api/auth/resend-verification | /api/auth -> / | /resend-verification | authService.resendVerification |
| GET    | /api/shortlinks            | /api/shortlinks   | /                | shortlinkService.list          |
| POST   | /api/shortlinks            | /api/shortlinks   | /                | shortlinkService.create        |
| POST   | /api/shortlinks/bulk-delete | /api/shortlinks  | /bulk-delete     | shortlinkService.bulkRemove    |
| POST   | /api/shortlinks/bulk-update | /api/shortlinks  | /bulk-update     | shortlinkService.bulkUpdate    |
| GET    | /api/shortlinks/{slug}     | /api/shortlinks   | /{slug}          | shortlinkService.getDetail     |
| PATCH  | /api/shortlinks/{slug}     | /api/shortlinks   | /{slug}          | shortlinkService.update        |
| DELETE | /api/shortlinks/{slug}     | /api/shortlinks   | /{slug}          | shortlinkService.remove        |
| GET    | /api/campaigns             | /api/campaigns    | /                | campaignService.list           |
| POST   | /api/campaigns             | /api/campaigns    | /                | campaignService.create         |
| PATCH  | /api/campaigns/{id}        | /api/campaigns    | /{id}            | campaignService.update         |
| DELETE | /api/campaigns/{id}        | /api/campaigns    | /{id}            | campaignService.remove         |
| GET    | /api/analytics/overview    | /api/analytics    | /overview        | analyticsService.overview      |
| GET    | /api/analytics/links/{slug}| /api/analytics    | /links/{slug}    | analyticsService.linkOverview  |
| GET    | /api/notifications         | /api/notifications| /                | notificationService.list       |
| POST   | /api/notifications/read    | /api/notifications| /read            | notificationService.markRead   |
| GET    | /api/referral              | /api/referral     | /                | referralService.getOverview    |
| GET    | /api/qrcode/{slug}         | /api/qrcode       | /{slug}          | shortlinkService.getOwnedIdBySlug |
| GET    | /r/{slug}                  | /r                | /{slug}          | shortlinkService.getBySlug     |
| GET    | /api/health                | /api              | /health          | (DB ping)                      |
| GET    | /api/doc                   | /api              | /doc             | OpenAPI spec                   |

### Query params for GET /api/shortlinks

| Param   | Type    | Default     | Description                    |
|---------|---------|-------------|--------------------------------|
| offset  | number  | 0           | Pagination offset              |
| limit   | number  | 50          | Items per page (max 100)       |
| q       | string  | -           | Search URL (ILIKE)             |
| sortBy  | string  | createdAt   | Sort field (createdAt, visits) |
| order   | string  | desc        | Sort direction (asc, desc)     |

### Error handling

Services throw `HTTPException(status, { message })` from `hono/http-exception`.
`middleware/error-handler.ts` forwards that status and message as-is; any other
thrown error is logged and returned as a 500 `{ message: "Internal server error" }`.

## Web — Component Architecture

```
apps/web/src/
├── main.tsx        Entry: render <App />
├── app.tsx         Root: session check + wouter routes
├── hono-client.ts  Typed hc() RPC client (cookie-based auth, 401 redirect)
├── index.css       Global stylesheet entry (@imports styles/*)
├── hooks/          use-auth, use-shortlinks, use-campaigns, use-analytics,
│                   use-link-analytics, use-notifications, use-referral,
│                   use-toast, use-debounced-value, use-escape-key, loading-screen
├── lib/            i18n (+ i18n/en.ts, i18n/id.ts), csv, date, form, format, seo, slug
├── constants/      Static page/config data (analytics, campaigns, custom-links,
│                   landing, legal, settings, support)
├── styles/         13 plain CSS files; variables.css holds the design tokens
├── pages/          One component per route (auth, dashboard, settings, analytics,
│                   campaigns, custom-links, landing, legal, support, verify-email, ...)
└── components/     auth/, shortlink/, campaign/, analytics/, landing/, settings/, ui/
```

### Key patterns

- **Routing**: wouter (`<Route>`, `<Switch>`, `<Link>`)
- **Auth**: httpOnly cookie (set by API on login/register, validated by auth middleware)
- **API client**: typed `hc()` with custom fetch wrapper
- **Hooks**: logic separated from UI components
- **Modals**: React portal-based (edit + confirm)
- **Toasts**: Context + portal for non-intrusive notifications
- **CSS**: Global stylesheets (no CSS modules), custom properties for theming

## Shared

```
packages/shared/src/
├── index.ts              Zod schemas + inferred types
└── routes.ts             AppRoutes type map (manual, TS 7 cross-workspace limitation)
```

## Security

- JWT in httpOnly cookie (not accessible from JS)
- Rate limiting on register (5/15min), login (10/15min), shortlinks (30/min)
- URL scheme validation on redirect (only http/https)
- Security headers in nginx (CSP, HSTS, X-Frame-Options, etc.)
- JWT secret validated at startup in production mode
- Password policy: min 8 chars, must include lowercase, uppercase, number
