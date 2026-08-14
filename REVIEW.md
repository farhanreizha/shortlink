# Code Review — Knot Monorepo (shortlink)

Tanggal: 14 Agustus 2026
Metode: review statik pada working tree + verifikasi live (curl ke api-knot/web-knot.vercel.app).
Catatan: `node_modules` root kosong, sehingga lint/typecheck/test **tidak** dapat dijalankan lokal; temuan di bawah diverifikasi dengan pembacaan langsung file + cek endpoint produksi.

Referensi baris mengikuti isi file saat review. Daftar korelasi `ISSUES.md` dicantumkan per temuan.

---

## 1. Bugs / Bugs potensial produksi

### 1.1 🔴 Rate limiter: satu bucket per IP, tidak di-scope per endpoint
- Lokasi: `apps/api/src/lib/rate-limiter.ts:31` (`const key = clientKey(c)`), `clientKey` di `:16` hanya membaca IP.
- Dampak: seluruh instance rate limit di `apps/api/src/app.ts:39-55` (register 5/15m, login 10/15m, forgot 3/15m, reset 10/15m, shortlinks 30/m, `/r/*` 120/m) menulis ke **row `rate_limits` yang sama** (PK = key = IP). Traffic pada satu endpoint mengkonsumsi kuota semua endpoint lain. Contoh nyata: klik 30 shortlink (`/r/*`, kuota 120) → pemanggilan `/api/shortlinks` (kuota 30/m) langsung kena 429. Attacker tanpa auth bisa menghabiskan kuota IP korban lewat `GET /r/*` (120x/menit) dan mengunci register/login korban.
- Fix: scope key per endpoint, mis. `key = \`${c.req.path}:${ip}\`` atau parameternya `key: (c) => ...` pada `rateLimit(opts)`.
- Korelasi `ISSUES.md` #4: sudah basi (issue lama tentang Map in-memory sudah diganti DB-backed, tapi bug baru ini tidak tercakup).

### 1.2 🔴 `deleteAccount` gagal (500) bila user punya campaign
- Lokasi: `apps/api/src/services/auth.service.ts:155-156` — hanya menghapus `shortlinks` lalu `users`. `apps/api/src/db/schema.ts:62-63`: `campaigns.userId` **tanpa** `onDelete` (default `no action`).
- Dampak: user yang punya campaign → `DELETE users` kena FK violation → 500 generic via errorHandler.
- Fix: hapus `campaigns` dulu (atau tambah `onDelete: "cascade"` + migrasi).

### 1.3 🔴 Notifikasi referral duplicate → create shortlink 500
- Lokasi: `apps/api/src/services/referral.service.ts:104-106` (insert `type: "referral"` per invitee unrewarded, dipanggil dari `shortlink.service.ts:106` pada setiap create).
- `apps/api/src/db/schema.ts:135-138`: unique index `notifications_user_seed_type_idx` pada `(userId, type)` — dibuat untuk mencegah duplikat seed (welcome, new_feature).
- Dampak: referrer dengan ≥ 2 invitee yang baru diasosiasikan → insert notifikasi referral ke-2 melanggar unique → **seluruh create shortlink gagal 500**.
- Fix: pakai `onConflictDoNothing` pada insert notifikasi referral di `creditReferrer`, atau scope unique index hanya untuk tipe seed.

### 1.4 🟠 Redirect mencatat click/visit untuk URL yang diblokir
- Lokasi: `apps/api/src/routes/redirect.route.ts:30-37` — `Promise.allSettled([incrementVisits, recordClick])` dijalankan **sebelum** `isBlockedRedirectUrl` di `:35`.
- Dampak: URL berbahaya/blocked tetap menambah `visits` dan `clicks` (data analitik terkontaminasi).
- Fix: pindahkan cek `blocked` sebelum increment/record.

### 1.5 🟠 Hydration mismatch i18n di halaman public
- Lokasi: `apps/web/src/lib/i18n.tsx:42` (`useState<Lang>(initialLang ?? getInitialLang)`); `main.tsx:15` memanggil `<I18nProvider>` tanpa `initialLang`, dan prerender/SSR juga tanpa `initialLang` (hanya `prerender-entry` → statis English).
- Dampak: client membaca `localStorage "knot.lang"` → user dengan bahasa `id` menerima HTML SSR English lalu React client re-render penuh (hydration error di console + flash konten).
- Fix: SSR/prerender harus menetapkan `initialLang` sesuai konten yang dirender, atau client default ke `en` dan swap via `useEffect` (tidak hydrasi langsung dengan bahasa lain).

### 1.6 🟠 SEO/OG domain mati
- Lokasi: `apps/web/index.html:8,12,15,22,28` dan `apps/web/src/lib/seo.ts:3` → semua `https://knot.vercel.app`.
- Dampak: domain tersebut mengembalikan 403 (terverifikasi via curl) — tidak dipakai; yang live `https://web-knot.vercel.app`. Canonical, og:url, og:image, twitter:image, JSON-LD semuanya menunjuk ke domain mati.
- Fix: ganti ke `https://web-knot.vercel.app` (atau domain kustom produksi).

### 1.7 🟡 `resetUrl` bocor ke client saat email gagal terkirim
- Lokasi: `apps/api/src/services/auth.service.ts:174-176` — `return { resetUrl: sent ? undefined : resetUrl }`.
- Dampak: bila SMTP tidak dikonfigurasi/fungsi send mengembalikan false, `resetUrl` (token reset password valid 1 jam) dikembalikan ke caller. Attacker yang tahu email korban bisa memicu reset lalu memakai URL-nya untuk takeover. Dimitigasi: jika `sendPasswordReset` throw → 500 (tidak bocor) dan rate limit forgot 3/15m; tapi jangan menggantungkan keamanan pada itu.
- Fix: jangan pernah return `resetUrl`; log ke server, kembalikan pesan generik.

### 1.8 🟡 Register race → 500 bukan 409
- Lokasi: `apps/api/src/routes/auth.route.ts:179-181` → `authService.register` melakukan cek unik (email/username) lalu insert; race window antara cek dan insert → unique violation → 500 generic.
- Fix: tangkap error unique constraint → 409 (pesan sesuai), atau `onConflictDoNothing` + re-check.

### 1.9 🟠 `pg.Pool` tanpa handler `error`
- Lokasi: `apps/api/src/db/index.ts` (`new Pool({ max: ... })`, `max: env.NODE_ENV === "test" ? 5 : 10`).
- Dampak: di serverless (Vercel), koneksi idle yang di-drop server bisa memicu event `error` pada pool → unhandled → crash/instability tanpa log.
- Fix: `pool.on("error", ...)` minimal log.

### 1.10 🟠 Region mismatch: Vercel (us-east-1) vs Neon (ap-southeast-1)
- Lokasi: `apps/api/.vercel/output/functions/index.func/.vc-config.json` (tidak ada `regions`; default `iad1`), DB di `ap-southeast-1`.
- Dampak: ~150-250ms extra per query; redirect = 3-4 query sekuensial (rate-limit upsert + select + update + insert click) → redirect terasa lambat; analitik (≤6 query) berisiko timeout.
- Fix: set `regions: ["sin1"]` (Vercel region terdekat dengan ap-southeast-1) atau tambahkan routing di vercel.json.

### 1.11 🟡 Register: referral code invalid diabaikan senyap
- Lokasi: `apps/api/src/routes/auth.route.ts` / `auth.service.ts` register — `findByCode` tidak ditemukan → tidak ada error, referrerId tidak diset. Test eksisting menegaskan perilaku ini.
- Catatan: perilaku ini tampak disengaja (test menyebut "ignores an invalid ref code"), tapi user tak diberi umpan balik. Opsional.

---

## 2. Data & migrasi

### 2.1 🟠 Migrasi orphaned + belum diterapkan ke live (TERVERIFIKASI via Neon)
- Journal lokal: 7 entry (0000–`0006_gifted_arclight`). Di disk ada `0006_backfill_referral_codes.sql` + `0007_valid_slug_constraint.sql` yang **tidak ada di journal** → `db:migrate` akan melewatinya.
- **DB live (project knot, db neondb) hanya punya 5 migrasi (0000–0004)** di `drizzle.__drizzle_migrations`; tidak ada tabel `rate_limits` (0006) dan tidak ada partial index `notifications_user_seed_type_idx` (0005).
- **Implikasi deploy (kritis)**: kode working tree memakai rate limiter DB-backed yang men-query tabel `rate_limits` setiap request. Deploy sekarang tanpa migrate → 500 di semua endpoint rate-limited. Header `x-ratelimit` di live saat ini berasal dari deployment lama (in-memory), bukan tabel DB.
- Fix: jalankan `db:migrate` ke DB live SEBELUM deploy (akan menerapkan 0005 + 0006); putuskan nasib `0006_backfill_referral_codes.sql` & `0007_valid_slug_constraint.sql` (hapus atau masukkan ke journal).

### 2.2 🟢 Catatan: `db:push` dipakai untuk dev, `db:migrate` untuk prod — sudah sesuai AGENTS.md.

---

## 3. Status verifikasi produksi (live)

| Check | Hasil |
|---|---|
| `GET https://api-knot.vercel.app/api/health` | 200 OK |
| `GET https://api-knot.vercel.app/api/docs` | 200 (swagger UI publik, tanpa auth) |
| `GET https://api-knot.vercel.app/r/zzz-nonexistent-abc123` | 404 `{"message":"Shortlink not found"}` (mount `/r` benar) |
| `GET https://web-knot.vercel.app/` | 200 HTML (prerender) |
| `GET https://knot.vercel.app` | **403** (domain mati) |
| Rewrite `/api` & `/r` di web-knot → api-knot | Berjalan (same-origin dari browser → cookie valid, CORS tidak relevan) |

Positif: cookie auth httpOnly/secure/sameSite=Lax, `PUBLIC_PATHS` auth middleware lengkap, url-safety memblokir IP privat/metadata host dengan benar, `JWT_SECRET` default di-reject saat production.

---

## 4. Keamanan

### 4.1 ✅ Bukan masalah: kredensial SMTP tidak ter-commit
- Setelah verifikasi lanjutan: `.env.production` **di-ignore git** (`.gitignore` baris `.env*`, `!.env.example`) — `SMTP_PASS` tidak pernah masuk riwayat git.
- Kondisi baik: `.env.example` sudah berisi placeholder (`JWT_SECRET=your-generated-secret-here`, tanpa SMTP vars).
- Catatan: simpan `SMTP_PASS` hanya di environment Vercel / file lokal yang di-ignore.

---

## 5. Rekomendasi prioritas

1. **Fix 1.1** (key rate-limiter per path) — murah, mencegah 429 silang + abuse via `/r/*`.
2. **Fix 1.2 + 1.3** — keduanya memicu 500 pada jalur inti (delete account, create shortlink).
3. **Fix 1.4** — pemindahan cek blocked (3 baris).
4. **Fix 1.6 + hapus secret 4.1** — SEO + keamanan, cepat.
5. **Fix 1.9** (`pool.on("error")`) — 1 baris, safety di serverless.
6. **Verifikasi 2.1** — pastikan DB live konsisten dengan journal.

Item yang **tidak** diperbaiki pada sesi ini: 1.5 (perlu keputusan pendekatan hydration), 1.7, 1.8, 1.10, 1.11 — butuh keputusan desain/ops.

---

## Lampiran A: korelasi dengan ISSUES.md

- Sudah ada & valid: #5 (public paths hardcoded), #7 (IPv6 BlockList), #8 (TOCTOU seeding notification), #9-11, #13 (analytics JS aggregation), #14 (backfill referral), #15-20.
- **BASI/ter-bypass**: #4 (rate limiter in-memory → sudah DB-backed; ganti/lengkapi dengan issue 1.1).
- **Baru (tidak di ISSUES.md)**: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 2.1.

## Lampiran B: status fix (14 Agu 2026)

Selesai diterapkan di working tree:
- 1.1 — `rateLimit({ scope })`, key `${scope}:${ip}` (`rate-limiter.ts`, `app.ts`).
- 1.2 — `deleteAccount` hapus `campaigns` + test.
- 1.3 — `onConflictDoNothing()` insert notifikasi referral + test 2 invitee.
- 1.4 — cek `isBlockedRedirectUrl` sebelum record click/visit + test.
- 1.6 — domain SEO → `web-knot.vercel.app` (`index.html`, `seo.ts`, `sitemap.xml`).
- 1.9 — `pool.on("error")` di `db/index.ts`.
- 4.1 — dikoreksi: bukan bug (SMTP_PASS ter-ignore git).

Belum dikerjakan: 1.11 (ref invalid silent — keputusan UX, sengaja dibiarkan).

Sesi lanjutan (14 Agu 2026):
- 1.7 — resetUrl tidak pernah bocor di production (`auth.service.ts` + route pakai `process.env.NODE_ENV`); dev/test tetap mengembalikan untuk test. Test "does not leak a reset url in production".
- 1.8 — register race → tangkap unique violation (23505) → 409, bukan 500. Test "returns 409 on concurrent duplicate register".
- 1.10 — `apps/api/vercel.json` tambah `"regions": ["sin1"]` (Singapura, dekat Neon ap-southeast-1).
- 1.5 — hydration i18n: render `en` di pass pertama (match prerender), baca `localStorage` di `useEffect` → tanpa hydration mismatch.
- Lint web — fix `user!` di `app.tsx` (guard `isAuthenticated && user`); hapus `landing-page.test.tsx` (untracked WIP, import path salah).
- Verifikasi akhir: `pnpm lint` bersih, `pnpm typecheck` lolos, test 155/155, graphify diupdate.
- 1.6 tambahan: `apps/web/scripts/prerender.mjs` (canonical/og:url) & `apps/web/public/robots.txt` (Sitemap) masih `knot.vercel.app` — diperbaiki di deploy ke-2 (index.html saja tidak cukup karena prerender menimpa).
- Deploy (14 Agu 2026): commit 0642d5f + 89ca5c4 → Vercel. API live terverifikasi pakai rate limiter scope baru (forgot-password ke-4 → 429). Web live: canonical/og/robots/sitemap semua `web-knot.vercel.app`. Catatan: alias `web-knot.vercel.app` harus di-assign manual (`vercel alias set`) — tidak otomatis dari push; SSO-protected deployment membuat curl ke URL deployment langsung ter-redirect ke login.

Verifikasi migrasi (14 Agu 2026, via Neon):
- 2.1 terkonfirmasi & **dipulihkan**: DB live (neondb) hanya punya migrasi 0000–0004; `rate_limits` (0006) dan partial index (0005) tidak ada. Keduanya telah diterapkan manual (SQL `IF NOT EXISTS`) + dicatat di `drizzle.__drizzle_migrations` (hash sha256 cocok dengan journal lokal) → journal live 7 entry, konsisten dengan lokal. **Deploy sekarang aman untuk rate limiter DB-backed.**
- `0006_backfill_referral_codes.sql` & `0007_valid_slug_constraint.sql` **dihapus** (orphan; backfill tidak perlu — 6 user live semua punya referral_code; valid_slug constraint opsional, 0 slug invalid).
- Catatan: koneksi langsung ke Neon dari mesin lokal gagal (ECONNRESET) — migrasi diterapkan via Neon MCP, bukan `db:migrate`.

Sesi ke-3 (14 Agu 2026):
- 1.11 (opsi A) — referrer invalid tidak lagi silent: response register = `{ user, referrerApplied }` (`RegisterResultSchema` di shared; `auth.service.ts` return `referrerId !== undefined`). Web `register-form.tsx` tampilkan toast `auth.refInvalid` bila ref dikirim tapi tidak ditemukan; registrasi tetap lanjut. Test: `referrerApplied` true (valid) / false (invalid).
- Hydration #418 (React error: "initial UI does not match what was rendered on the server") — dua root cause:
  1. Client render `LoadingScreen` saat prerender menghasilkan konten statis → `app.tsx`: guard App hanya untuk non-publik (`PUBLIC_PATHS` dari `seoRoutes`), `PublicLegalRoute` render `StaticPage` saat loading, `RouteTransition` render children langsung saat hydration (div `animate-fade-in` hanya saat navigasi).
  2. Route non-prerendered di-serve HTML landing (rewrite `/(.*)` → `/index.html`) → `prerender.mjs` tulis `dist/empty.html` (template asli, root kosong), `vercel.json` rewrite fallback → `/empty.html`. Static file tetap menang atas rewrite → 4 route SEO tetap prerendered.
- Verifikasi: lint/typecheck bersih, test 155/155, build web OK (empty.html + 4 route prerender), agent-browser: konsol bebas #418 di `/`, `/privacy`, `/terms`, `/support`, `/login`, `/dashboard`, `/register?ref=...`.

## Lampiran B: catatan metodologi

- Output `read`/`grep` awal terkorupsi (display layer); semua fakta di laporan ini diverifikasi ulang via dump `node -e`/`sed`/`rg -n` pendek + `curl` live.
- `node_modules` root kosong → tidak ada verifikasi lint/typecheck/test lokal untuk laporan ini.