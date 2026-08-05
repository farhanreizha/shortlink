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
├── index.ts                  Entry: serve(app)
├── app.ts                    App factory: create OpenAPIHono, mount middleware + sub-apps, doc()
├── config.ts                 Env validation (zod) + prod guards
├── lib/
│   ├── auth.ts               hashPassword(), verifyPassword(), signToken(), verifyToken()
│   ├── errors.ts             AppError, NotFoundError, UnauthorizedError, ConflictError
│   └── rate-limiter.ts       In-memory per-IP rate limiter with TTL cleanup
├── middleware/
│   ├── auth.ts               Auth guard (httpOnly cookie JWT -> c.set("userId"))
│   └── error-handler.ts      Global onError(): catch AppError -> HTTPException
├── routes/
│   ├── auth.route.ts         Sub-app: POST /register, POST /login, POST /logout, GET /me, PATCH /me, DELETE /me
│   ├── shortlink.route.ts    Sub-app: GET /, POST /, GET /{slug}, PATCH /{slug}, DELETE /{slug}
│   ├── redirect.route.ts     Sub-app: GET /{slug} (with URL scheme validation)
│   └── health.route.ts       GET /health
├── services/
│   ├── auth.service.ts       register(), login(), getMe(), updateUser(), deleteAccount()
│   └── shortlink.service.ts  list() (paginated+searchable), create(), getBySlug(), getDetail(), update(), remove(), incrementVisits()
└── db/
    ├── index.ts              Drizzle connection
    └── schema.ts             Drizzle schema (users, shortlinks with index on user_id)
```

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
- Service me-return data atau throw `AppError`
- Semua `AppError` di-catch oleh `error-handler.ts` middleware
- Path di `createRoute()` relatif terhadap mount point

### Routes mapping

| Method | Final path                 | Sub-app mount     | Route definition | Service                        |
|--------|----------------------------|-------------------|------------------|--------------------------------|
| POST   | /api/auth/register         | /api/auth -> /    | /register        | authService.register           |
| POST   | /api/auth/login            | /api/auth -> /    | /login           | authService.login              |
| POST   | /api/auth/logout           | /api/auth -> /    | /logout          | (cookie clear)                 |
| GET    | /api/auth/me               | /api/auth -> /    | /me              | authService.getMe              |
| PATCH  | /api/auth/me               | /api/auth -> /    | /me              | authService.updateUser         |
| DELETE | /api/auth/me               | /api/auth -> /    | /me              | authService.deleteAccount      |
| GET    | /api/shortlinks            | /api/shortlinks   | /                | shortlinkService.list          |
| POST   | /api/shortlinks            | /api/shortlinks   | /                | shortlinkService.create        |
| GET    | /api/shortlinks/{slug}     | /api/shortlinks   | /{slug}          | shortlinkService.getDetail     |
| PATCH  | /api/shortlinks/{slug}     | /api/shortlinks   | /{slug}          | shortlinkService.update        |
| DELETE | /api/shortlinks/{slug}     | /api/shortlinks   | /{slug}          | shortlinkService.remove        |
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

### Error classes

| Class               | Status | Usage                    |
|---------------------|--------|--------------------------|
| `AppError`          | -      | Base class               |
| `NotFoundError`     | 404    | Resource not found       |
| `UnauthorizedError` | 401    | Invalid/missing token    |
| `ConflictError`     | 409    | Duplicate slug/email     |

## Web — Component Architecture

```
apps/web/src/
├── main.tsx                  Entry: render <App />
├── app.tsx                   Root: session check + wouter routes
├── hono-client.ts            Typed hc() RPC client (cookie-based auth, 401 redirect)
├── index.css                 Global styles
├── hooks/
│   ├── use-auth.ts           login(), logout(), user state (cookie-based)
│   ├── use-shortlinks.ts     list() with query, create(), remove(), update()
│   └── use-toast.tsx         Toast notification context + portal
├── lib/
│   └── storage.ts            Removed (migrated to httpOnly cookies)
├── pages/
│   ├── auth-page.tsx         Login/register toggle + forms
│   ├── dashboard-page.tsx    Navbar + search + create form + link list
│   ├── settings-page.tsx     Change password, update email, delete account
│   ├── landing-page.tsx      Public landing page
│   └── not-found-page.tsx    404 page
└── components/
    ├── auth/
    │   ├── login-form.tsx
    │   └── register-form.tsx
    ├── shortlink/
    │   ├── create-form.tsx
    │   ├── edit-modal.tsx
    │   └── link-card.tsx
    └── ui/
        ├── confirm-modal.tsx
        ├── error-banner.tsx
        ├── error-boundary.tsx
        ├── feature-card.tsx
        ├── form-field.tsx
        ├── footer.tsx
        ├── navbar.tsx
        ├── password-field.tsx
        ├── password-strength.tsx
        └── skeleton.tsx
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
