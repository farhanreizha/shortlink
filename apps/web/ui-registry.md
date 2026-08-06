# UI Registry

Baseline established 2026-07-30 via `/imprint audit`.

## Design System Baseline

| Property | Token |
|---|---|
| Card background | `--color-surface` |
| Card border | `1px solid var(--color-border)` |
| Card radius | `var(--radius-lg)` (12px) |
| Button primary bg | `--color-primary` |
| Button primary text | `var(--color-white)` |
| Button ghost bg | `transparent` |
| Button ghost text | `var(--color-primary)` |
| Button danger bg | `--color-error` |
| Button danger text | `var(--color-white)` |
| Text primary | `--color-text-primary` |
| Text secondary | `--color-text-secondary` |
| Text muted | `--color-neutral` |
| Input bg | `--color-surface` |
| Input border | `1px solid var(--color-border)` |
| Input radius | `var(--radius-md)` (8px) |
| Modal overlay | `var(--color-overlay)` |
| Modal card bg | `--color-surface` |
| Modal card radius | `var(--radius-lg)` |
| Modal card shadow | `var(--shadow-modal)` |
| Toast success bg | `var(--color-success)` |
| Toast error bg | `var(--color-error)` |
| Chip radius | `var(--radius-sm)` (4px) |
| Skeleton chip radius | `var(--radius-sm)` (4px) |
| Focus ring | `color-mix(in srgb, var(--color-primary) 10%, transparent)` |

---

### Navbar

File: `components/ui/navbar.tsx`
Last updated: 2026-07-30

| Property | Class/Value |
|---|---|
| Background | `--color-surface` |
| Border bottom | `1px solid var(--color-border)` |
| Height | 60px |
| Logo size | 20px, 700 weight |
| Link text | `--color-text-secondary`, 15px, 500 |
| Link hover bg | `var(--color-primary-muted)` |
| Avatar circle bg | `var(--color-primary)` |
| Avatar circle text | `var(--color-white)` |
| Avatar circle size | 32x32, 14px |
| Avatar name text | `--color-text-secondary`, 14px, 600 |
| Dropdown bg | `--color-surface` |
| Dropdown border | `1px solid var(--color-border)` |
| Dropdown radius | `var(--radius-md)` |
| Dropdown shadow | `var(--shadow-modal)` |
| Dropdown item text | `--color-text-secondary`, 14px, 500 |
| Dropdown item hover bg | `var(--color-primary-muted)` |
| Dropdown item danger text | `var(--color-error)` |
| Dropdown item danger hover bg | `var(--color-error-muted)` |
| Dropdown divider | `1px solid var(--color-border)` |

**Pattern notes:**
- Avatar is a `<button>` that toggles dropdown (≥768px) or mobile menu (<768px)
- Mobile menu is an overlay below the navbar with centered column layout
- Settings + Logout in dropdown on desktop; in mobile menu on mobile
- Click-outside closes via `mousedown` listener

---

### PageLayout

File: `components/ui/page-layout.tsx`
Last updated: 2026-07-30

| Property | Class/Value |
|---|---|
| Wrapper | `animate-fade-in` |
| Navbar | Default `Navbar` with `onLogout` and default "My Links" link |
| Content area | `.main` |

**Pattern notes:**
- Shared layout for authenticated pages (dashboard, settings)
- Default nav link is "My Links" (`/`) — override via `navLinks` prop
- Eliminates duplicate `Navbar` + `main` markup per page

---

### ConfirmModal

File: `components/ui/confirm-modal.tsx`
Last updated: 2026-07-30

| Property | Class/Value |
|---|---|
| Overlay bg | `var(--color-overlay)` |
| Card bg | `--color-surface` |
| Card radius | `var(--radius-lg)` |
| Card shadow | `var(--shadow-modal)` |
| Card padding | `var(--space-6)` |
| Title | 18px, 700 weight |
| Message text | `--color-text-secondary`, 15px |
| Actions gap | `var(--space-3)` |
| Confirm btn | `btn btn--danger` |
| Cancel btn | `btn btn--ghost` |

**Pattern notes:**
- Rendered via `createPortal` to `document.body`
- Scroll lock via `document.body.style.overflow` on open/close
- Escape key via shared `useEscapeKey` hook
- `confirmDisabled` prop prevents double-click on delete actions

---

### EditModal

File: `components/shortlink/edit-modal.tsx`
Last updated: 2026-07-30

| Property | Class/Value |
|---|---|
| Overlay bg | `var(--color-overlay)` |
| Card bg | `--color-surface` |
| Card radius | `var(--radius-lg)` |
| Card shadow | `var(--shadow-modal)` |
| Card padding | `var(--space-6)` |
| Title | 18px, 700 weight |
| Submit btn | `btn btn--primary` |
| Cancel btn | `btn btn--ghost` |

**Pattern notes:**
- Uses `useEscapeKey` hook + scroll lock on open/close
- Form fields use `FormField` with `.input` + `.input--mono`
- Loading state via `loading` prop on submit button

---

### PasswordStrength

File: `components/ui/password-strength.tsx`
Last updated: 2026-07-30

| Property | Class/Value |
|---|---|
| Bar height | 4px |
| Bar radius | 2px |
| Bar track bg | `var(--color-border)` |
| Weak color | `var(--color-error)` |
| Fair color | `var(--color-warning)` |
| Good/Strong color | `var(--color-success)` |
| Label size | 12px, 500 weight |

**Pattern notes:**
- Semi-hidden when password is empty (returns null)
- Color and label fallback to error/neutral when score is 0
- Uses all CSS variables (no hardcoded colors)

---

### LinkCardMenu

File: `components/shortlink/link-card-menu.tsx`
Last updated: 2026-08-06

| Property | Class/Value |
|---|---|
| Trigger btn | `btn btn--ghost` + `MoreVertical` icon |
| Dropdown bg | `--color-surface` |
| Dropdown border | `1px solid var(--color-border)` |
| Dropdown radius | `var(--radius-md)` |
| Dropdown shadow | `var(--shadow-modal)` |
| Dropdown padding | `var(--space-1)` |
| Item text | `--color-text-secondary`, 14px, 500 |
| Item hover bg | `var(--color-primary-muted)` |
| Item danger text | `var(--color-error)` |
| Item danger hover bg | `var(--color-error-muted)` |

**Pattern notes:**
- Kebab trigger with `aria-haspopup="menu"` + `aria-expanded`
- Click-outside closes via `mousedown` listener (same as Navbar)
- Escape key via shared `useEscapeKey` hook
- Closes after item click
- Same visual tokens as `navbar__dropdown` (surface bg, border, radius-md, shadow-modal)
