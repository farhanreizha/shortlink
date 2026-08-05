# UI Registry

Visual consistency reference for all UI components.

## Baseline — Established 2026-07-30

Baseline established via `/imprint audit` — design system tokens and component patterns.

| Property | Token / Value |
|---|---|
| **Surface background** | `var(--color-surface)` |
| **Surface muted** | `var(--color-surface-muted)` |
| **Standard border** | `1px solid var(--color-border)` |
| **Error border** | `1px solid var(--color-error)` |
| **Card border radius** | `var(--radius-lg)` (12px) |
| **Button / input border radius** | `var(--radius-md)` (8px) |
| **Small border radius** | `var(--radius-sm)` (4px) |
| **Full rounded** | `50%` |
| **Text — primary** | `var(--color-text-primary)` |
| **Text — secondary** | `var(--color-text-secondary)` |
| **Text — muted** | `var(--color-neutral)` |
| **Text — brand** | `var(--color-primary)` |
| **Text — white** | `#fff` |
| **Text — error** | `var(--color-error)` |
| **Button primary bg** | `var(--color-primary)` |
| **Button primary hover** | `var(--color-primary-hover)` |
| **Button ghost text** | `var(--color-primary)` |
| **Button ghost hover bg** | `var(--color-primary-muted)` |
| **Input bg** | `var(--color-surface)` |
| **Input focus ring** | `0 0 0 4px rgba(0, 82, 255, 0.1)` |
| **Error banner bg** | `var(--color-error-muted)` |
| **Card shadow** | `var(--shadow-card)` |
| **Modal shadow** | `var(--shadow-modal)` |
| **Modal overlay** | `rgba(5, 15, 26, 0.4)` |
| **Navbar overlay** | `rgba(5, 15, 26, 0.3)` |

**Font stack:** `var(--font-display)` for UI, `var(--font-mono)` for code/monospace.

---

### Navbar

File: `apps/web/src/components/ui/navbar.tsx`
Last updated: 2026-07-30

| Property | Class / Token |
|---|---|
| Background | `var(--color-surface)` |
| Border | `1px solid var(--color-border)` (bottom only) |
| Border radius | `var(--radius-sm)` for logout button |
| Text — logo | `var(--color-primary)`, 700 weight, 20px |
| Text — nav link | `var(--color-text-secondary)`, 500 weight, 15px |
| Text — avatar name | `var(--color-text-secondary)`, 500 weight, 14px |
| Text — logout | `var(--color-primary)`, 500 weight, 14px |
| Spacing | `0 var(--space-6)` padding, `var(--space-8)` gap in menu |
| Hover state | Link → `var(--color-primary)`, Logout → `var(--color-primary-muted)` bg |
| Shadow | none |
| Accent usage | Logo + logout text + avatar circle use `var(--color-primary)` |

**Pattern notes:**
- Avatar circle: 32×32px, `var(--color-primary)` bg, `#fff` text, 700 weight, 50% radius
- Spacer (`flex: 1`) is rendered internally, not passed from children
- `user` prop triggers avatar render + desktop/mobile logout buttons
- Two logout buttons: `.navbar__logout--desktop` (≥768px) and `.navbar__logout--mobile` (<768px)
- Toggle button hidden on desktop, shown on mobile with `<Menu>`/`<X>` icons
- Overlay backdrop: `rgba(5, 15, 26, 0.3)` on mobile when menu open
- Responsive breakpoint: 768px

---

### EditModal

File: `apps/web/src/components/shortlink/edit-modal.tsx`
Last updated: 2026-07-30

| Property | Class / Token |
|---|---|
| Overlay | `modal-overlay animate-fade-in`, `rgba(5, 15, 26, 0.4)` |
| Card | `modal-card animate-scale-in`, `var(--color-surface)` bg, `var(--radius-lg)` radius, `var(--shadow-modal)` |
| Title | `modal-title`, 18px, 700 weight |
| Buttons | `btn btn--ghost` (Cancel), `btn btn--primary` (Save) |
| Actions | `modal-actions` flex row, `var(--space-3)` gap, justify-end |
| Inputs | `input`, `input--mono` for slug |
| Form spacing | `var(--space-4)` gap via `.form` |
| Escape key | Closes modal |

**Pattern notes:**
- Same portal pattern as `ConfirmModal` — mounts to `document.body`
- Form resets via `key` prop on parent (`LinkCard` toggles key on open)
- No-op change detection: skips save if nothing changed
- `EditButton` exported separately as a ghost icon button with `Pencil` from lucide-react

### Toast

File: `apps/web/src/hooks/use-toast.tsx`
Last updated: 2026-07-30

| Property | Class / Token |
|---|---|
| Container | `toast-container` — fixed top-right, z-index 200, `var(--space-4)` offset |
| Toast card | `toast toast--success` / `toast toast--error`, `var(--space-3)` padding, `var(--radius-md)`, `var(--shadow-modal)` |
| Text | 14px, 500 weight, white |
| Success bg | `#059669` |
| Error bg | `var(--color-error)` |

**Pattern notes:**
- Portal-based via `use-toast.tsx` (provider pattern with context)
- Auto-dismiss after 3 seconds
- Animation: `animate-slide-up`
- Pointer events: container has `pointer-events: none`, individual toasts have `pointer-events: auto`
- No manual close button (auto-dismiss only)

### PasswordStrength

File: `apps/web/src/components/ui/password-strength.tsx`
Last updated: 2026-07-30

| Property | Class / Token |
|---|---|
| Track bg | `var(--color-border)` |
| Fill | Dynamic color: error / `#f59e0b` / `#10b981` / `#059669` |
| Label text | 12px, 500 weight, color matches fill |
| Height | 4px, 2px radius |
| Transition | `width 0.2s, background 0.2s` |
| Spacing | `var(--space-1)` top margin |

**Pattern notes:**
- 4 criteria: length ≥ 8, lowercase, uppercase, number
- Score 0 → hidden, 1 → red/Weak, 2 → amber/Fair, 3 → green/Good, 4 → green/Strong
- Inline styles only (no CSS module needed for this small component)
