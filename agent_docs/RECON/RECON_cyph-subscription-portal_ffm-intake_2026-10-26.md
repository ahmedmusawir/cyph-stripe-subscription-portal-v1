# RECON REPORT — Cyber Pharma Subscription Portal — FFM Intake (post-clone)

> **Skill:** stark-recon v1.1 (full 6-phase run + operator recon-focus items 1–8) · **Date:** 2026-10-26 15:03 · **Mode:** read-only ground-truth
> **Repo:** `cyph-stripe-subscription-portal-v1` · **Remote:** `origin https://github.com/ahmedmusawir/cyph-stripe-subscription-portal-v1.git` · **Branch:** `main` @ `b016324` ("26oct2026 - init"), in sync with `origin/main`
> **Working tree at start:** `M package-lock.json` only (operator-side, pre-existing). **Working tree at end:** identical plus this report, today's session file, the RESPONSES mirror and the RECOVERY.md pointer. **Zero changes under `src/`, `public/`, config, deploy files or `supabase/`.** No git mutations. No database reads or writes. No flows run that create users, send email or touch live data.
> **Doctrine:** Disk wins. Every finding labeled EVIDENCE / INFERENCE / CLAIM / GAP / QUESTION.
> **Inherited docs checked against disk:** `RECOVERY.md`, `agent_docs/RECON/RECON_cyber-pharma_phase1_2026-06-28.md`, `agent_docs/STARTER_KIT/STARTER_KIT_HANDBOOK_v1.0.md` (titles only), `docs/*.md` (kit docs), `DEPLOYMENT_CHECKLIST.md`.

---

## ⚡ HEADLINE (read this first)

1. **This repo is the Mission Control FFM, byte-for-byte, under a new name.** `package.json:2` still says `"name": "cyph-mission-control-v1"`. The build route table is the 9 Mission Control screens + 3 kit auth routes + `/` redirect. Nothing Subscription-Portal-shaped exists yet except: the GitHub repo name, the two-line `README.md`, six `STRIPE_*` names in the **untracked** `.env.local`, the `stripe` npm package (installed, **zero imports**), and a read-only `SubscriptionStatus` string union in `src/types/mission-control/status.ts:23`. — EVIDENCE
2. **All verification gates are GREEN on this clone today:** `tsc --noEmit` exit 0 · Jest 2 suites / 8 tests pass · `next build` 15 routes, compiled clean · `npm audit` 5 advisories (4 moderate, 1 high — `zod`, which has zero imports). — EVIDENCE (fresh run, §12)
3. **🔴 The deploy toolchain still targets the LIVE Mission Control service.** `deploy.sh:10-18`, `cloudbuild.yaml:3-7`, `init-app.sh:10-12` and `DEPLOYMENT_CHECKLIST.md` all name project `cyberize-nextjs-staging`, service `cyph-mission-ctrl-prod`, domain `mission-portal.cyberizedev.com`, and the Mission Control Supabase project ref. Running `./deploy.sh` from this repo would **overwrite the live Mission Control deployment** with whatever this repo becomes. Must be retargeted or neutralised before any deploy work. — EVIDENCE
4. **🔴 Inherited `RECOVERY.md` still publishes a working superadmin credential** for the live Mission Control site (its own red block says so, and says "rotate"). It is tracked in this new repo's history from commit 1. Same for the live Supabase project URL in `deploy.sh`/`cloudbuild.yaml` (publishable key, not secret — but paired with the credential). — EVIDENCE (`RECOVERY.md:3-10`)
5. **QUESTION — which Supabase project does this portal target?** `.env.local` (untracked, correct) has the `CyberPharma_Dev_v1` block ACTIVE and a `Nextjs_Stripe_Sub_v1` block COMMENTED OUT. The active block is the Mission Control dev project. No `.env.example` exists to declare intent.
6. **The design system is intact and fully reusable:** Tailwind 3.4.6 (HSL-in-`:root`, class dark mode), Metro Warm tokens with a semantic-four extension (`success/warning/info` + `destructive`), Saira via `next/font`, `next-themes` (dark default, no system), a mobile-first `Shell` (rail ≥md, drawer <md), 15 shadcn primitives, 4 project primitives (`DataTable`, `EmptyState`, `StatusPill`, `StoreCard`). Brand SVGs in `public/`. Keep all of it. — EVIDENCE (§4, §11)
7. **The auth foundation is real and working, but single-role.** Server-resolved identity (`getSuperAdminUser` → `getUserRole()` on `user_roles`), gate in the route-group layout, session refresh in `src/proxy.ts`, cookie-based `@supabase/ssr`. There is **no signup, no password reset UI, no server actions, no admin-client consumer**, and the only role the app honours is `superadmin`. A customer-facing subscription portal needs `admin`/`member` (or new) role paths that this code does not have. — EVIDENCE (§3)
8. **Kit fossils that survived two cleanups:** `GET /api/auth/login` still queries a `posts` table that exists in no SQL on disk (`route.ts:13`); `docs/DATABASE_SETUP.md` points at `docs/setup.sql` which does not exist (file is `supabase/setup.sql`); 11 dependencies have zero imports; `temp/ghl-example.json` (GoHighLevel fossil) and a Playwright `test-results/` stub are tracked. — EVIDENCE (§8, §10)

---

## PREFLIGHT (operator-requested)

| Check | Result | Label |
|---|---|---|
| Working directory | `/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1` (`pwd`) | EVIDENCE |
| Git remote | `origin` → `https://github.com/ahmedmusawir/cyph-stripe-subscription-portal-v1.git` (fetch+push) | EVIDENCE |
| Branch / HEAD | `main` @ `b0163249cc71ad7685b77e8e7a6e27e2c433bf5a` — "26oct2026 - init"; prior commit `1df2a7b` "Initial commit" | EVIDENCE |
| Sync | `git status -sb` → `## main...origin/main` (no ahead/behind); `git fetch --dry-run` printed nothing new | EVIDENCE |
| Working tree | `M package-lock.json` (592-line diff: transitive bumps, e.g. a `0.34.5→0.35.5` and `1.2.4→1.3.4` family; top-level versions unchanged). Installed `node_modules` matches the **modified** lock for next/react/supabase/tailwind/ts. | EVIDENCE |
| "Authorized sync policy" | No file in the repo names a sync policy. The standing rule in `RECOVERY.md` is "Operator handles ALL git — Claude never commits." Honoured: no commit, push, reset, checkout. | GAP + EVIDENCE |
| Tracked files | 290 tracked: `agent_docs` 141 · `src` 77 · `_SKILLS` 31 · `docs` 13 · `public` 6 · root 22 | EVIDENCE (`git ls-files`) |
| Env files tracked? | `.env.local` is **not** tracked (`git ls-files --error-unmatch .env.local` → no match). No `.env.example` / `.env.local.example` on disk. | EVIDENCE / GAP |

---

## Section 0 — Day-0 Ground-Truth Sweep

### S0.1 — Doc-named files vs disk

| Claim source | Claim | On disk? | Label |
|---|---|---|---|
| `RECOVERY.md` (2026-07-10) | "100 paths deleted… client.ts + admin.ts KEPT (zero-consumer)" | `src/utils/supabase/client.ts` and `admin.ts` present; **zero consumers** of either (`grep -rn "supabase/client\|supabase/admin" src/` → only their own headers) | ✅ EVIDENCE, consistent |
| `RECOVERY.md` | "zustand in package.json w/ ZERO imports" | `zustand@4.5.4` in deps; `grep -rn "from 'zustand'" src/` → none | ✅ EVIDENCE |
| `docs/DATABASE_SETUP.md:7,30` | "complete runnable SQL file is at `docs/setup.sql`" | **MISSING** — only `supabase/setup.sql` and `docs/migration_add_profiles.sql` exist | 🔴 EVIDENCE — doc lie |
| `docs/MANUAL_TESTING.md` | "Superadmin Portal — Manual Testing Guide" (kit's superadmin portal) | No `(superadmin)` route group; no superadmin-portal screens on disk | 🔴 EVIDENCE — stale kit doc |
| `agent_docs/README.md` | "CyberBugs Documentation Index… `/factory/`, `/cyberbugs/`" | Neither folder exists; describes an unrelated project | 🔴 EVIDENCE — cross-project fossil |
| `DEPLOYMENT_CHECKLIST.md:63` | "All 9 Mission Control screens work" | 9 MC screens on disk — true for MC, wrong product for this repo | EVIDENCE (product drift) |
| Inherited recon (2026-06-28) | `useAuthStore`, `app-role.ts`, `AppShellPage`, `/api/ghl/hooktest`, posts/jsonsrv cascade | **All gone** (`src/store/` absent; `find src -name "*ghl*"` → none; no `posts` service) — the FIX PHASE 2 cleanup landed | ✅ EVIDENCE (inherited recon is stale, as expected) |

### S0.2 — Claimed exports/shapes vs disk

- `AppRole` enum — EVIDENCE `src/utils/get-user-role.ts:4-8`: `SUPERADMIN | ADMIN | MEMBER`. Co-located with the server-only `getUserRole()` (imports `./supabase/server`). Still not split into a client-safe file (same as the June recon).
- `SuperAdminUser` — EVIDENCE `src/types/mission-control/entities.ts:30-35`: `{ id, email, displayName, isSuperAdmin: true }`. Proof-carrying invariant; matches `session.ts:50-55`.
- Service contracts — EVIDENCE `src/types/mission-control/services.ts`: 7 interfaces, all implemented in `src/services/mission-control/*` and exported from the barrel `index.ts:11-17`. `session.ts` deliberately not in the barrel (server-only).

### S0.3 — Forbidden-zone greps (fresh)

| Grep | Hits | Label |
|---|---|---|
| `: any\b \| as any` in `src/` | **1 product hit:** `src/utils/supabase/server.ts:6` (`cookieStore as any`). 4 hits in `src/__tests__/*` (mock casts — acceptable). | EVIDENCE |
| `dangerouslySetInnerHTML` | none | ✅ EVIDENCE |
| `user_metadata.(is_\|role)` | none. Only read is `user_metadata.full_name` for **display** (`session.ts:44-45`), explicitly commented as non-authz. | ✅ EVIDENCE |
| `app_metadata` | none | ✅ EVIDENCE |

### S0.4 — Routes verified by build (ground truth)

`npm run build` (Next 16.4.3 / Turbopack, after `rm -rf .next`) — EVIDENCE:

```
┌ ƒ /                         (307 → /dashboard; src/app/page.tsx)
├ ○ /_not-found
├ ƒ /api/auth/confirm         ├ ƒ /api/auth/login        ├ ƒ /api/auth/logout
├ ƒ /audit-log  ├ ƒ /dashboard  ├ ○ /icon.png  ├ ƒ /login
├ ƒ /onboarding  ├ ƒ /onboarding/[registrationId]
├ ƒ /owners      ├ ƒ /owners/[ownerId]
├ ƒ /stores      └ ƒ /stores/[storeId]
ƒ Proxy (Middleware)
```
15 entries; one route group `(mission-control)` (`find src/app -maxdepth 1 -type d -name "(*)"`). No `(public)`, `(auth)`, `(portal)` groups. No escape hatches.

### S0.5 — Test runner

EVIDENCE `package.json`: `"test": "jest"`, `jest@30.4.2` installed, `ts-jest`, `jest-environment-jsdom`; `"test:e2e": "playwright test"` scripts exist but **no `playwright.config.*` and no e2e specs on disk** (`find . -name "playwright.config*"` outside node_modules → none). Dead scripts.

### S0.6 — Env names from code (not docs)

`grep -rn "process\.env\." src/` — EVIDENCE: `NEXT_PUBLIC_SUPABASE_URL` (6 sites), `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (5), `SUPABASE_SECRET_KEY` (3 — `admin.ts` + test setup only), `NEXT_PUBLIC_SITE_URL` (3 — cookie `secure` flag in `server.ts:7-8`). Q4-2025 naming (`publishable`/`secret`), not `anon`/`service_role`.

Names present in `.env.local` but **unused by any code**: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_ENABLE_MOOSE_PORTAL`, and all six `STRIPE_*` (see §7). Values were never read or printed by this recon.

### S0.7 — Build route table → see S0.4. Build consumed `.env.local` ("Environments: .env.local") — the Supabase public vars are staged.

---

## Section 1 — Stack Versions (installed, from `node_modules/*/package.json`)

| Package | `package.json` range | **Installed** | Label |
|---|---|---|---|
| next | `^16.2.1` | **16.4.3** (Turbopack) | EVIDENCE |
| react / react-dom | `^19.2.4` | **19.2.4** | EVIDENCE |
| typescript | `^5` | **5.5.4** | EVIDENCE |
| tailwindcss | `^3.4.1` | **3.4.6** → token mechanic **HSL triplets in `:root`/`.dark` + `hsl(var(--x))` in `tailwind.config.ts`** (NOT v4 `@theme`/OKLCH) | EVIDENCE |
| @supabase/ssr | `^0.6.1` | **0.6.1** | EVIDENCE |
| @supabase/supabase-js | `^2.44.0` | **2.106.1** | EVIDENCE |
| stripe | `^22.1.0` | **22.1.0** (0 imports) | EVIDENCE |
| next-themes | `^0.4.6` | 0.4.6 | EVIDENCE |
| zustand | `^4.5.4` | 4.5.4 (0 imports) | EVIDENCE |
| jest | `^30.0.5` | 30.4.2 (`jest-mock` pinned 30.4.1 via `overrides`) | EVIDENCE |
| Node | not pinned (no `.nvmrc`, no `engines`); Dockerfile uses `node:22-alpine`; local `v22.17.0`, npm 11.15.0 | EVIDENCE / GAP |
| ESLint | `"lint": "next lint"` script exists but **no eslint config file** on disk | GAP |

Full `package.json` is in the Designer bundle (`designer-refs/00_stack/package.json`).

---

## Section 2 — Structure vs Docs

`find src -maxdepth 2 -type d` — EVIDENCE:

```
src/app            api/ · login/ · (mission-control)/ · providers/
src/components     common/ · global/ · mission-control/ · ui/
src/lib            utils.ts (cn)
src/mocks          mission-control/store.ts        (353 lines, seeded in-memory DB)
src/services       mission-control/ (7 mock services + session.ts + index.ts barrel)
src/types          mission-control/ (entities · services · status · index) + tailwind-merge.d.ts
src/utils          get-user-role.ts · supabase/{client,server,middleware,admin}.ts
src/__tests__      get-user-role.test.ts · proxy.test.ts · jest.setup.ts
src/proxy.ts       (Next 16 proxy — no middleware.ts) ✅
```
77 files total under `src/`. No `src/store/`, no `src/hooks/`, no `src/actions/`. `components.json:8` says `"css": "app/globals.scss"` (shadcn CLI path is relative to `src` via `baseUrl`; still **.scss**, see §4).

Dependency usage (`grep` for import strings across `src/` + configs) — EVIDENCE:

| USED | UNUSED (zero imports) |
|---|---|
| @radix-ui/{dialog, dropdown-menu, label, slot, toast}, @supabase/{ssr, supabase-js}, @tailwindcss/{typography, aspect-ratio}, @shrutibalasa/tailwind-grid-auto-fit, class-variance-authority, clsx, lucide-react, next-themes, tailwind-merge, tailwindcss-animate, `sass` (needed by `globals.scss`, not imported) | `@heroicons/react`, `@hookform/resolvers`, `react-hook-form`, `zod`, `zustand`, `stripe`, `cmdk`, `@radix-ui/react-{avatar, select, tabs}`, `@playwright/test`, `dotenv`; also `@testing-library/{react, jest-dom, user-event}` (tests are node-env, none import them) |

INFERENCE: this matches the "dep-hygiene queue" the prior RECOVERY.md promised and never ran — except `stripe`, `react-hook-form`, `zod` are plausibly **wanted** by the Subscription Portal. Flag, do not delete (see Cleanup Plan).

---

## Section 3 — Auth Pattern (recon focus #3)

| Concern | Reality on disk | Label |
|---|---|---|
| Session refresh | `src/proxy.ts:4-5` → `updateSession()` in `src/utils/supabase/middleware.ts` creates an SSR client with `getAll/setAll` cookie adapters and calls `supabase.auth.getUser()` (line 37) — refresh only, **no redirects** in proxy. Matcher excludes `_next/static`, `_next/image`, favicon and image extensions. | EVIDENCE |
| Server client | `src/utils/supabase/server.ts` — **legacy `get/set/remove` cookie adapter** (not `getAll/setAll`), `cookieStore as any` (line 6), forces `secure` from `NEXT_PUBLIC_SITE_URL` https prefix, `sameSite: 'lax'`, `httpOnly: false`. Comment says "Supabase needs client access". | EVIDENCE — ⚠️ INFERENCE: mixed adapter styles between `middleware.ts` (new) and `server.ts` (deprecated API) is a latent `@supabase/ssr` upgrade risk; works today. |
| Browser client | `src/utils/supabase/client.ts` — `createBrowserClient`. **Zero consumers.** | EVIDENCE |
| Admin client | `src/utils/supabase/admin.ts` — `createClient(url, SUPABASE_SECRET_KEY)` with `persistSession:false`. **Zero consumers.** Only thing that reads the secret key. | EVIDENCE |
| Identity read | `src/services/mission-control/session.ts:27-56` `getSuperAdminUser()` → `auth.getUser()` → `getUserRole(user.id)` → returns `SuperAdminUser` only when role === `superadmin`, else `null`. | EVIDENCE |
| Role resolve | `src/utils/get-user-role.ts:17-34` — `.from('user_roles').select('role').eq('user_id', …).single()`; `console.error` + `null` on miss. Uses the **cookie-scoped** client, so RLS applies (policy: user reads own row). | EVIDENCE |
| Gate | `src/app/(mission-control)/layout.tsx:15-16` — `if (!user) redirect("/login")`; renders `<Shell user=…>`. Login page inverse: `login/page.tsx:7-8` redirects a super-admin to `/dashboard`. Root `page.tsx` is a `force-dynamic` 307 to `/dashboard`. | EVIDENCE |
| Login | `POST /api/auth/login` (`route.ts:29-71`) — `signInWithPassword`, `revalidatePath('/', 'layout')`, then a **second** `user_roles` query to return `role` in the JSON. Client (`LoginPageContent.tsx:49-54`) rejects `role !== "superadmin"` by calling logout. **`GET /api/auth/login` (route.ts:11-27) queries `supabase.from("posts")` — kit fossil; table exists in no SQL on disk.** | EVIDENCE 🔴 |
| Logout | `POST /api/auth/logout` — `signOut()` + `revalidatePath`. Shell `signOut()` (`Shell.tsx:89-93`) fetches it then `router.push('/login'); router.refresh()`. | EVIDENCE |
| Callback / email confirm | `GET /api/auth/confirm` — `verifyOtp({type, token_hash})`, success → `next` param (default `/`), failure → `/login`. Only email-link handler present; **no `/auth/callback` (PKCE/OAuth) route.** | EVIDENCE / GAP |
| Signup | **None.** No `signUp`, no register page, no invite flow (`grep signUp\|inviteUserByEmail\|admin.createUser` → 0). | GAP |
| Password reset | **None.** No `resetPasswordForEmail`, no `/reset-password` or `/update-password` route. Forgot-password link was removed in FIX PHASE 2 (per `RECOVERY.md`). | GAP |
| Server actions | **None** (`grep "use server"` → 0). All mutations go through route handlers or mock services. | EVIDENCE |
| Role checks elsewhere | Only `superadmin`. `AppRole.ADMIN`/`MEMBER` exist in the enum but nothing branches on them. `MemberRole = 'admin' \| 'user'` in `status.ts:16` is **domain** (per-store) role, a different axis. | EVIDENCE |
| Auth service wrapper | None (`authService` → 0 hits). Kit primitives consumed directly — correct per doctrine. | EVIDENCE |
| Tests | `get-user-role.test.ts` + `proxy.test.ts` — 8 tests, all pass. | EVIDENCE |

**INFERENCE for the Architect:** the auth *plumbing* (SSR cookies, proxy refresh, DB-backed role, server-resolved identity passed to the shell via props) is a sound base for the portal. The *policy* (super-admin-only gate, login-page role rejection, no self-service flows) is Mission Control product logic and will need to be replaced, not extended, for a customer-facing portal.

---

## Section 4 — Design Reality (recon focus #5)

| Axis | Reality | Label |
|---|---|---|
| Token file | `src/app/globals.scss:10-75` — `@layer base { :root {…} .dark {…} }`, HSL triplets. 23 tokens per mode incl. **`--success/--warning/--info` (+ `-foreground`)** beyond stock shadcn; `--radius: 0px` (flat). Comment credits "Metro Warm (Mist = light, Slate = dark)". | EVIDENCE |
| Tailwind wiring | `tailwind.config.ts` — `darkMode: ["class"]`, `content` includes `./src/**/*.{ts,tsx}`, colors mapped `hsl(var(--x))` incl. `success/warning/info`, radius from `--radius`, plugins: typography, aspect-ratio, grid-auto-fit, tailwindcss-animate. Container 2xl=1400px. | EVIDENCE |
| CSS extension | **`.scss`** (`layout.tsx:3` imports `./globals.scss`; `sass@1.77` dep). Sass-only syntax present: `//` comment at line 109 and nested rules in `.strapiMarkdownRichText` (lines 107-132 — a **kit/Strapi fossil**, zero consumers). A plain `.css` designer deliverable would need those two spots converted or the block deleted. | EVIDENCE ⚠️ |
| Legacy heading rules | `globals.scss:81-105` — `h1…h6` hard-coded `text-gray-900…400 dark:text-white`. 6 numbered-color sites in the token file itself; overrides any token-driven heading colour. | EVIDENCE 🟠 |
| Numbered colours in components | 9 sites in 6 files: `ui/dialog.tsx:41` (bg-white/slate-900 overlay panel), `ui/dropdown-menu.tsx:68,86` (slate panel + hover), `ui/toast.tsx:32,80` (bg-white/zinc-900; red-* destructive close), `global/ThemeToggler.tsx:24` (`bg-slate-700 text-white` — hard-coded, breaks on Mist), `common/SpinnerLarge.tsx:8` (gray/blue — logged Rule Zero-B exception), `app/not-found.tsx:11` (`text-blue-500`). `alert-dialog.tsx` is already token-clean. | EVIDENCE |
| Dark mode | class-based; `<html className="dark" suppressHydrationWarning>` + `next-themes` `defaultTheme="dark" enableSystem={false}` (`layout.tsx:23-30`). Toggle offers Light/Dark/**System** — System is offered in the UI but `enableSystem` is false. | EVIDENCE 🟡 |
| Font | `Saira` via `next/font/google`, weights 400/500/600/700, applied on `<body>` (`layout.tsx:8,24`). No `@font-face`, no Google CSS link. | EVIDENCE |
| Theme toggle | `src/components/global/ThemeToggler.tsx` — dropdown, present on **both** rail and mobile top bar (`Shell.tsx:161,170`), outside the drawer. Not on `/login` (login has no shell → **no toggle on the logged-out surface**). | EVIDENCE / 🟡 L20 |
| Shell | `src/components/mission-control/Shell.tsx` — client component; props `{displayName,email}`; fixed 248px rail ≥md; sticky top bar + left `Sheet` drawer <md (w-3/4 per `sheet.tsx`); 5 static nav items; `useTransition` spinner in content slot; brand = `logo-color.svg` + token-coloured wordmark; foot = initials + "Super Admin" + sign-out. | EVIDENCE |
| Loading | `(mission-control)/loading.tsx` → `SpinnerLarge` in content slot. | EVIDENCE |
| shadcn primitives (15) | `alert-dialog, breadcrumb, button, dialog, dropdown-menu, input, label, separator, sheet, skeleton, table, textarea, toast, toaster, use-toast` — all have ≥1 consumer. `sheet.tsx` is **left-side only by design** (comment line 21). `components.json` baseColor `zinc`, `cssVariables: true`. | EVIDENCE |
| Project primitives (4) | `DataTable` (responsive table→stacked cards), `EmptyState`, `StatusPill` (+ tone mappers), `StoreCard`. Token-only. | EVIDENCE |
| `cn()` | `src/lib/utils.ts` — standard `twMerge(clsx())`. `src/types/tailwind-merge.d.ts` shims `twMerge` as `(...string[]) => string` (narrower than the real lib — harmless, odd). | EVIDENCE |
| Brand assets | `public/logo-color.svg` (coral `#F9704F` tile + white drop, 128²), `logo-lockup.svg` (tile + "Cyber Pharma" in Saira, **baked dark text `#1B2024`** — unsafe on dark, code comments say so), `logo-mono.svg` (`currentColor`), `favicon-512.png`, `src/app/icon.png` (512² PNG), `src/app/favicon.ico` (16/32). `public/next.svg`, `vercel.svg` = CRA fossils. Duplicates + `brand_preview.png` in `agent_docs/branding_stuff/`. | EVIDENCE |
| Metadata | `title: "MissionControl — Super Admin"`, description "Cyber Pharma platform operations console (PHI-free)." (`layout.tsx:10-13`). | EVIDENCE (rebrand target) |
| Prior design docs | `agent_docs/CURRENT_APP/super_admin_portal_phase1_ffm/_design/` — `DESIGN_BRIEF.md` (v1.1, Metro Warm locked, token table), `UI_SPEC_MissionControl_v1_1.md`, `COMPONENT_MANIFEST_MissionControl_v1_1.md`, `DESKTOP/_HTML` + `_PNG` (incl. `style_tile_mist.png`, `style_tile_slate.png`), `MOBILE/*.png` (10 screens). The 2026-08-01 security sweep found client/employee names in `DESIGN_BRIEF.md` (4 hits) and `UI_SPEC` (1 hit) and a "Barack Obama" fossil in 5 design HTMLs — **those files are excluded from the Designer bundle**; `COMPONENT_MANIFEST` and the style-tile PNGs are clean and included. | EVIDENCE |
| Q4.7 | Dark-mode real-screen pass — operator-run, not greppable. Prior operator pass on MC was "pristine" (RECOVERY.md). Must be re-run on new portal screens. | CLAIM → gate |

---

## Section 5 — Database & Schema (recon focus #4)

**Code references (disk) vs live facts — strictly separated.**

### 5a. SQL on disk — EVIDENCE
- `supabase/setup.sql` (kit "Pro RBAC" setup): `CREATE TYPE public.app_role ENUM ('superadmin','admin','member')`; `public.user_roles (id, user_id→auth.users, role app_role default 'member', created_at, UNIQUE user_id)` RLS on, policy "Users can read their own role"; `public.profiles (id→auth.users, full_name, email, created_at)` RLS on, read/update own; `handle_new_user()` SECURITY DEFINER trigger `on_auth_user_created` inserts member role + profile (reads `raw_user_meta_data->>'name'`).
- `docs/migration_add_profiles.sql` ("Mark IV"): same `profiles` table but with **superadmin-aware** SELECT/UPDATE policies (subselect on `user_roles`), backfill, and a "smart" `handle_new_user()` that honours `raw_user_meta_data->>'role'` and `->>'full_name'`, `ON CONFLICT DO NOTHING`. **Conflicts with `setup.sql`** (two different trigger bodies; `profiles` created in both). Which one is live is not knowable from disk.
- No `supabase/migrations/` directory, no `config.toml`, no generated `database.types.ts`.

### 5b. Tables the CODE touches — EVIDENCE
- `user_roles` — `get-user-role.ts:23`, `api/auth/login/route.ts:53`.
- `posts` — `api/auth/login/route.ts:13` (GET handler, kit fossil; **not in any SQL on disk**).
- `profiles` — **no code reads it** (only SQL + docs).
- Everything the 9 screens show (owners, stores/businesses, members, pending_registrations, audit entries, subscription status) comes from **`src/mocks/mission-control/store.ts`** — not from Supabase. The type comments cite "Frank schema" column names (`businesses.subscription_status`, `user_businesses.role`, `pending_registrations.*`) as *targets*, not as anything on disk.

### 5c. Live database — GAP (deliberately not verified)
No query was run against any Supabase project (operator constraint: do not change the DB, do not expose credentials; a read-only probe was judged out of scope for recon). Therefore **unverified**: whether `user_roles`/`profiles` exist in the project named by the active `.env.local` block; which trigger body is installed; whether a superadmin row exists; whether any `posts` table exists. `RECOVERY.md` CLAIMS a working superadmin login exists on the Mission Control project — CLAIM, and also the thing to rotate.

### 5d. Supabase configuration surfaces — EVIDENCE
- Env: `.env.local` active block labelled `CyberPharma_Dev_v1`; commented block labelled `Nextjs_Stripe_Sub_v1`; third commented block "FREE SUPABASE" (personal). → **QUESTION (Headline #5).**
- Hard-coded project ref `<mission-control-supabase-ref>.supabase.co` + publishable key in `deploy.sh:17-18`, `cloudbuild.yaml:6-7` (tracked). Also quoted in 4 `agent_docs` files + `RECOVERY.md`.
- `SUPABASE_SECRET_KEY` is mapped to the Cloud Run service via Secret Manager (`cloudbuild.yaml:44-45`) but **no code path uses `admin.ts`** today.

---

## Section 6 — Skills / Security / Env

| Item | Reality | Label |
|---|---|---|
| Skills on disk | `_SKILLS/stark-recon-skill-v1.1/stark-recon/` (this run) · `_SKILLS/stark-repo-security-skill-v1.1/repo-security-audit/` · `_SKILLS/CLOUD_DEPLOYMENT_SKILLS/` (folder + a tracked **.zip** + `_OLD/`) · `agent_docs/.claude/skills/stark-frontend-first/` (auto-discovered by Claude Code this session; its 3 `.ts` templates are compile-safe only because `tsconfig` excludes `agent_docs/**`). No root `.claude/skills/`. | EVIDENCE |
| Launch CWD | repo root (`pwd`). | EVIDENCE |
| `npm audit` | 5 advisories: `zod` **high** (<4.6.6, direct, unused), `tailwindcss` moderate (via `postcss-nested`/`postcss-selector-parser`), `@tailwindcss/typography` moderate (same chain). "fix available via `npm audit fix --force`" = breaking (zod 4, tailwind). | EVIDENCE |
| Secrets in tracked files | Pattern scan (`sb_secret_\|sk_live_\|sk_test_\|whsec_\|eyJhbGciOi`) across all tracked files → 2 hits, both **documentation placeholders** (`sk_test_REAL_S…`, `sk_test_xxx`, `whsec_xxx` inside the Aug-1 security sweep and a deploy-skill walkthrough). No real Stripe or Supabase secret tracked. Publishable key + project URL ARE tracked (deploy files). `.env.local` is gitignored and untracked. | EVIDENCE |
| Credential in docs | `RECOVERY.md:3-10, ~155` — superadmin email + password for the live MC site, with its own "rotate me" banner. Now in **this** repo's history too (both commits). | EVIDENCE 🔴 |
| Pointer files | root `CLAUDE.md` (v3.1, July 2026 — factory doctrine, generic) · `WINDSURF.md` (v2.0, March 2026, Windsurf rules) · no `AGENTS.md`/`GEMINI.md` at root (they exist inside the archived FFM folder). | EVIDENCE |
| Boot / env fail-closed check | None — no `instrumentation.ts`, no env validation. `!` non-null assertions at every `process.env` read. | GAP |

---

## Section 7 — Stripe (recon focus #7)

| Where | What | Label |
|---|---|---|
| `package.json` | `"stripe": "^22.1.0"` → installed 22.1.0. **Zero imports anywhere in `src/`.** | EVIDENCE |
| `.env.local` (untracked) | Names present: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_PRO`, `STRIPE_PRICE_ENTERPRISE`, `STRIPE_WEBHOOK_SECRET`. **None read by code.** Values not inspected. INFERENCE: a 3-tier (Starter/Pro/Enterprise) price model has been provisioned somewhere outside this repo. | EVIDENCE / INFERENCE |
| `src/` | Only `SubscriptionStatus` union (`status.ts:21-29`: `active\|trialing\|past_due\|canceled\|unpaid\|incomplete`) and the read-only "SUB" pill in `StoreDetailPageContent`. No webhook route, no checkout, no customer portal link, no `stripe` client. | EVIDENCE |
| Deploy files | No Stripe secret mapping in `cloudbuild.yaml`; only the Supabase secret. | EVIDENCE |
| Docs | `agent_docs/CYBER_PHARMA_8_PHASE_PLAN_v1_2.md` Phase 7 describes per-store Stripe + webhook mirror + APA promo (CLAIM, strategic). `_SKILLS/.../next-deploy-execute/examples` mention Stripe secret handling patterns. | CLAIM |

**Net:** there is **no Stripe code**. There is a dependency and six env names.

---

## Section 8 — Residue & Scaffolding (recon focus #6)

### 8a. Mission Control product surfaces (the entire app)
- Routes: `src/app/(mission-control)/{dashboard, onboarding, onboarding/[registrationId], owners, owners/[ownerId], stores, stores/[storeId], audit-log}` — 8 `page.tsx` + 8 `*PageContent.tsx` + `layout.tsx` + `loading.tsx`.
- Services: `src/services/mission-control/{missionDashboard, ownerDirectory, storeDirectory, storeMember, supportAction, pendingRegistration, auditLog}Service.ts` + `index.ts` barrel. (`session.ts` is auth — see keep list.)
- Types: `src/types/mission-control/{entities, services, status, index}.ts`.
- Mock: `src/mocks/mission-control/store.ts` (353 lines; `.example` emails; 10 sequential NPI-shaped numbers at lines 87-152 — the Aug-1 sweep noted 3 of them pass the Luhn/80840 check).
- Components: `src/components/mission-control/{Shell, DataTable, EmptyState, StatusPill, StoreCard}.tsx` — **reusable**, but the folder name and `Shell` copy ("Mission Control", "Super Admin", the 5 NAV items) are product-specific.
- Branding strings: `layout.tsx:7,11-12`, `Shell.tsx:105`, `LoginPageContent.tsx:71-74` ("Cyber Pharma v1 / Mission Control"), `LoginPageContent.tsx:115` ("No PHI in this console"), `mocks/store.ts:29` (`MOCK_ACTOR_NAME`), comments in ~25 files citing "MissionControl", "DATA_CONTRACT §x", "UI_SPEC §x", "Frank", "RED list".
- Permissions model: super-admin-only gate (§3). Login rejects every other role client-side.

### 8b. Kit fossils (pre-Mission-Control)
- `GET /api/auth/login` → `from("posts")` (`route.ts:11-27`).
- `globals.scss:107-132` `.strapiMarkdownRichText` block; `:81-105` legacy `h1-h6` colour rules.
- `src/app/not-found.tsx:14` "This is coming from /app"; `text-blue-500`.
- `public/next.svg`, `public/vercel.svg`.
- `next.config.js:5-11` `res.cloudinary.com` remote image pattern (no `next/image` usage of it in `src/`).
- `docs/*.md` (7 files) + `docs/change_logs/v0.2.0…v0.4.1` — the **starter kit's** docs (Pro RBAC kit, "Superadmin Portal", `docs/setup.sql` that doesn't exist).
- `temp/ghl-example.json` — GoHighLevel calendar fixture (2024), tracked.
- `test-results/.last-run.json` — Playwright artefact (`"status": "failed"`), tracked; no Playwright config.
- `scripts/install-gcloud.sh` — mojibake emoji (UTF-8 double-encoded); deploy-time helper.
- `src/types/tailwind-merge.d.ts` — unnecessary module shim.

### 8c. Cross-project fossils
- `agent_docs/README.md` — **CyberBugs** documentation index (unrelated project).
- `agent_docs/CYBER_PHARMA_8_PHASE_PLAN_v1_2.md` — Cyber Pharma main (OwedBook) strategic plan; mentions client/employee names.
- `agent_docs/CURRENT_APP/super_admin_portal_phase1_ffm/` — the complete Mission Control FFM (briefs, data contract, UI spec, playbook, verification, design HTML/PNG) — 100+ files.
- `agent_docs/RECON/`, `RESPONSES/` (28), `SESSIONS/` (10), `STARTER_KIT/`, `SKILL_ISSUES_LEDGER_cloud_deployment.md`, `branding_stuff/` — Mission Control history. Per the Aug-1 sweep these contain client/employee names, a NPPES-resolvable NPI set, the superadmin credential (RECOVERY.md) and the live project ref.
- `RECOVERY.md` (12.6 KB) — MC state machine; its "ON RESUME" blocks point at MC tasks.
- `WINDSURF.md` — alternate-IDE rules, duplicative of `CLAUDE.md`.
- `_SKILLS/CLOUD_DEPLOYMENT_SKILLS/CLOUD_DEPLOYMENT_SKILLS.zip` + `_OLD/` — archive inside the repo.

### 8d. Deployment targets (ALL Mission Control) 🔴
`Dockerfile` (generic, fine) · `cloudbuild.yaml` (service `cyph-mission-ctrl-prod`, SA `sa-cyph-mission-ctrl-runtime`, secret `cyph-mission-ctrl-supabase-secret-key`, URL `mission-portal.cyberizedev.com`, MC Supabase ref) · `deploy.sh` (same) · `init-app.sh` (`APP_NAME="cyph-mission-ctrl"`) · `DEPLOYMENT_CHECKLIST.md` (same + "All 9 Mission Control screens work"). Anyone running `./deploy.sh` here redeploys over the live Mission Control service.

### 8e. Demo/tutorial scaffolding (classic kit cascades)
- `grep posts\|todos\|booking\|jsonplaceholder\|dummyjson` → only the single `posts` fossil above. The June-recon cascades (posts/jsonsrv/booking/ghl) are **gone**. ✅

---

## Section 9 — Packaging & Compile Scope

- `tsconfig.json` `exclude`: `node_modules`, **`agent_docs/**`**, **`_SKILLS/**`** ✅ — the 3 `.ts` templates under `agent_docs/.claude/skills/stark-frontend-first/templates/` do not compile. `include` lists `.next/types/**` and `.next/dev/types/**` (Next 16 style).
- `jest.config.js` `roots: ['<rootDir>/src']` ✅ — agent_docs out of test scope. `testEnvironment: 'node'` (so `jsdom` + testing-library deps are unused).
- No `.ts/.tsx` under `docs/` or `_SKILLS/`.

---

## Section 11 — Nav & Auth-State Patterns

- Nav variants: **one** (`Shell`, authenticated). No marketing/public nav exists — `/` redirects, `/login` is a bare card. For a customer-facing portal with public pricing/signup this is a **GAP**: no logged-out navbar, no auth-state region, no hamburger for a marketing surface (L19/L22).
- Theme toggle on every navbar: yes on both Shell variants; **no** on `/login` (no navbar there). L20 gap for the portal.
- Split hero: none exists — N/A.
- Controls outside the drawer: toggle is outside the Sheet ✅; sign-out is inside the drawer foot (and in the rail foot).

## Section 12 — Verification Predicates (fresh, 2026-10-26)

| Command | Result | Label |
|---|---|---|
| `tsc --noEmit` | exit 0, 0 errors (~4 s) | EVIDENCE |
| `npx jest` | 2 suites, **8/8 pass** (0.9 s) | EVIDENCE |
| `rm -rf .next && npm run build` | ✓ Compiled in 7.0 s; TypeScript 5.2 s; 12 static pages generated; 15 route entries (S0.4) | EVIDENCE |
| `npm audit` | 5 (4 moderate, 1 high) | EVIDENCE |
| `next lint` | not run — no eslint config on disk; would prompt interactively | GAP |
| Numbered-colour grep | 15 sites (6 in `globals.scss`, 9 in components) | EVIDENCE |
| `any` grep | 1 product site | EVIDENCE |
| Live walk / dev server | **not run** (operator constraint: no flows that touch live auth; and the only screens are Mission Control's) | N/A by constraint |
| Baseline evidence available | prior MC gates in `agent_docs/RESPONSES/response_2026-07-10_182815_fix2-cleanup-result.md` (tsc/build/8 tests/live walk 15/15) and `…2026-08-05_181153_navbar-auth-recon.md` — CLAIM (historical), consistent with today's fresh numbers | CLAIM |

## Section 13 — Surprises (the gold)

1. **`GET /api/auth/login` hits a `posts` table** (`route.ts:13`). Two cleanup passes missed it because the POST path is what the app uses. Any unauth `GET /api/auth/login` today returns a 400 with a Postgres error message — a tiny info-leak fossil.
2. **`server.ts` uses the deprecated `get/set/remove` cookie adapter** while `middleware.ts` uses `getAll/setAll`. `@supabase/ssr@0.6.1` still accepts both; the next major will not. Latent upgrade trap (INFERENCE).
3. **Theme toggle offers "System" while `enableSystem={false}`** — selecting it does nothing visible (INFERENCE from `next-themes` semantics; not live-tested).
4. **`ThemeToggler` is hard-coded `bg-slate-700 text-white`** — on the Mist (light) rail it's a dark grey block. A real-screen light-mode pass would flag it. Also the `mr-5` margin assumes a layout it no longer lives in.
5. **`DESIGN_BRIEF.md` says Mission Control "drinks from the same token well as Cyber Pharma main"** (CLAIM). INFERENCE: the Subscription Portal should too — the token block in `globals.scss` is therefore the shared truth, not something to redesign.
6. **`.env.local` has a ready `Nextjs_Stripe_Sub_v1` Supabase block, commented out.** Someone already provisioned a Supabase project for this portal. Code is pointed at the *other* one. (QUESTION #1 below.)
7. **No `.env.example`** — the only authoritative list of env names is this report + `grep process.env`.
8. **`package-lock.json` is dirty** from an `npm install` that bumped transitive deps; `npm ci` in the Dockerfile would use the committed lock, so Docker and local differ until the lock is committed. Low risk; flag for the operator's next commit.
9. **`agent_docs` is the heavier half of the repo** (141 of 290 tracked files) and is entirely another product's memory, including a credential. The Aug-1 sweep's blocking decision ("strip / scrub / separate showcase repo") was never made and has now propagated into this repo.
10. **`sheet.tsx` is left-side only**; `dialog.tsx` panel is hard-coded white/slate while `alert-dialog.tsx` was tokenised — two dialogs, two styles.
11. `cn()` present and standard ✅. `proxy.ts` (not `middleware.ts`) ✅ for Next 16.

---

## BOUNDED CLEANUP PLAN (recon-only — nothing executed)

Legend: **KEEP** untouched · **ADAPT** rename/rebrand/generalise · **REMOVE** safe to delete after approval · **FLAG** risky/ambiguous — operator ruling first. Dependencies listed where deletion order matters.

### A. KEEP — reusable design system + auth foundation

| Path | Why keep | Deps |
|---|---|---|
| `src/app/globals.scss:1-79` (token block + base) | Shared Metro Warm tokens; the Designer's ground truth | `tailwind.config.ts` |
| `tailwind.config.ts`, `postcss.config.js`, `components.json` | Token wiring, semantic-four, plugins | — |
| `src/app/layout.tsx` (structure), `src/app/providers/ThemeProvider.tsx` | Saira + next-themes + Toaster wiring | ADAPT metadata only |
| `src/components/ui/*` (15) | shadcn primitives, all consumed | tokenise 3 files (see ADAPT) |
| `src/components/global/ThemeToggler.tsx` | Working toggle | ADAPT colours |
| `src/components/common/SpinnerLarge.tsx` | Operator-blessed spinner | — |
| `src/components/mission-control/{DataTable, EmptyState, StatusPill, StoreCard}.tsx` | Generic, token-only primitives | ADAPT folder name; `StoreCard`/`StatusPill` mappers are MC-domain → FLAG |
| `src/lib/utils.ts` | `cn()` | — |
| `src/proxy.ts`, `src/utils/supabase/{middleware, server, client, admin}.ts`, `src/utils/get-user-role.ts` | Auth plumbing; `client.ts`/`admin.ts` are zero-consumer **blessed Phase-2 infra** per prior ruling | `admin.ts` ⇐ `SUPABASE_SECRET_KEY` |
| `src/app/api/auth/{login(POST), logout, confirm}/route.ts` | Working login/logout/email-confirm | ADAPT: delete GET fossil in login |
| `src/app/login/*` | Working login screen | ADAPT: copy, role policy |
| `src/__tests__/*`, `jest.config.js` | Green baseline (8 tests) | — |
| `supabase/setup.sql` | Only schema source on disk | FLAG vs `docs/migration_add_profiles.sql` |
| `public/logo-color.svg`, `logo-mono.svg`, `favicon-512.png`, `src/app/icon.png`, `src/app/favicon.ico` | Brand | — |
| `Dockerfile`, `next.config.js` (`output: standalone`, headers) | Generic | ADAPT cloudinary pattern (FLAG) |
| `CLAUDE.md`, `_SKILLS/stark-recon-skill-v1.1`, `_SKILLS/stark-repo-security-skill-v1.1` | Doctrine + tooling | — |
| `tsconfig.json` | Correct excludes | — |

### B. ADAPT — rename / rebrand / generalise

| Path | Change | Deps / order |
|---|---|---|
| `package.json:2` | `name` → `cyph-stripe-subscription-portal-v1` | regenerates lock header; do with the lock commit |
| `src/app/layout.tsx:7,11-12` | metadata title/description → portal | — |
| `src/components/mission-control/Shell.tsx` | brand sub-line, NAV items, foot label "Super Admin", `user` prop shape; move to `components/<portal>/` | every `(mission-control)` page imports it via `layout.tsx` only — single seam |
| `src/app/login/LoginPageContent.tsx:49-54, 71-74, 115` | remove super-admin-only rejection; rebrand copy; drop "No PHI" line | policy depends on the portal's role model (FLAG Q2) |
| `src/app/(mission-control)/layout.tsx` | gate predicate (`getSuperAdminUser` → portal session resolver); route-group rename | all 8 screens live under it |
| `src/services/mission-control/session.ts` | generalise to `getPortalUser()` returning role; keep server-only pattern | `get-user-role.ts` |
| `src/app/api/auth/login/route.ts:11-27` | **delete the GET handler** (`posts` fossil) | — |
| `src/app/globals.scss:81-132` | delete `h1-h6` gray rules + `.strapiMarkdownRichText`; then the file can become `.css` if the Designer ships `.css` (`layout.tsx:3`, `components.json:8`, `sass` dep) | FLAG: Designer deliverable extension decides |
| `src/components/ui/{dialog, dropdown-menu, toast}.tsx`, `global/ThemeToggler.tsx`, `app/not-found.tsx` | replace numbered colours with tokens (9 sites) | — |
| `src/app/not-found.tsx` | rebrand, drop debug line 14 | — |
| `cloudbuild.yaml`, `deploy.sh`, `init-app.sh`, `DEPLOYMENT_CHECKLIST.md` | **retarget** to a new service/SA/secret/domain/Supabase ref — or stub out until deploy phase | 🔴 FLAG — must not run as-is |
| `RECOVERY.md` | reset to this repo's state; strip MC history (after credential rotation) | FLAG (credential) |
| `README.md` | expand with stack + run instructions | — |
| `.env.example` (new) | declare the env names from §S0.6 + `STRIPE_*` with placeholder values | — |

### C. REMOVE — safe, zero-consumer or dead (after approval; one pass, then `rm -rf .next && tsc && jest && build`)

| Path | Evidence |
|---|---|
| `public/next.svg`, `public/vercel.svg` | CRA fossils, no references |
| `temp/ghl-example.json` | GHL fixture, no references |
| `test-results/.last-run.json` + `"test:e2e*"` scripts | no Playwright config/specs |
| `src/types/tailwind-merge.d.ts` | shim narrower than the real types; lib ships its own |
| `docs/` (7 md + 6 change logs + migration sql) | starter-kit docs for a different product; `DATABASE_SETUP.md` points at a missing file. **Except** `migration_add_profiles.sql` → FLAG (may be what's live) |
| `WINDSURF.md` | duplicate doctrine for another IDE (operator call) |
| `agent_docs/README.md` | CyberBugs index |
| `_SKILLS/CLOUD_DEPLOYMENT_SKILLS/CLOUD_DEPLOYMENT_SKILLS.zip`, `_OLD/` | archive-in-repo |
| `scripts/install-gcloud.sh` | one-time machine setup; keep only if deploy skill expects it |
| Dependencies with 0 imports **and** no plausible portal use: `@heroicons/react`, `cmdk`, `@radix-ui/react-{avatar, select, tabs}`, `zustand` (CLAUDE.md prefers Zustand — FLAG), `dotenv`, `@playwright/test`, `@testing-library/*` (unless RTL tests are planned) | §2 table |

### D. FLAG — operator ruling required before anything happens

| Item | Why it's ambiguous / risky |
|---|---|
| 🔴 Superadmin credential in `RECOVERY.md` (and git history of both repos) | Rotation is the only fix; deleting the line is cosmetic. Needed before this repo is shared anywhere. |
| 🔴 Deploy files target live Mission Control | Retarget vs. delete-until-needed. Decide the new service/domain names first. |
| 🔴 `agent_docs/` (141 files, MC memory with names/NPIs/credential) | Strip entirely from this repo · scrub in place · or move to a private archive. Same unresolved Aug-1 decision. Recommendation: **strip**, keep only `agent_docs/{recon, RESPONSES, SESSIONS}` from today forward + a 1-page "lineage" note pointing at the MC repo. |
| Which Supabase project (`CyberPharma_Dev_v1` active vs `Nextjs_Stripe_Sub_v1` commented) | Decides every schema/auth assumption. |
| `supabase/setup.sql` vs `docs/migration_add_profiles.sql` | Two trigger bodies; which is live is unknowable from disk. Decide the canonical schema file. |
| Mission Control screens, services, mocks, types (`(mission-control)/*`, `services/mission-control/*`, `mocks/*`, `types/mission-control/*`) | Delete wholesale vs. keep as scaffolding to morph (owners/stores/members map loosely onto Coach's provisional multi-store model; `SubscriptionStatus` + `StoreDetail.subscriptionStatus` are directly reusable). Deletion is a single-pass cascade: 8 routes → 7 services → 1 mock → 3 type files → `StoreCard`/`StatusPill` mappers → Shell NAV. |
| `stripe`, `react-hook-form`, `@hookform/resolvers`, `zod` | Unused now, likely needed by the portal (checkout/webhooks, forms). Keep or re-add at build time; `zod` carries the one HIGH advisory (fix = v4, breaking). |
| `sass` + `.scss` | Depends on the Designer's deliverable extension (L14). |
| `next.config.js` cloudinary remote pattern | Unknown whether the portal will host images there. |
| `src/utils/supabase/server.ts` cookie adapter | Modernise to `getAll/setAll` now (small, testable) or defer. Touches every server auth read. |
| NPI-shaped numbers in `mocks/store.ts` | If the mock survives, regenerate with non-Luhn-valid or obviously fake NPIs. |
| `package-lock.json` dirty | Commit with the rename, or `git checkout` + `npm ci` to match Docker. Operator's git. |

---

## RECOMMENDATION TO ARCHITECT

**Verified facts the FFM can be written against without re-verification (as of b016324):**
- Next 16.4.3 (Turbopack, `proxy.ts`), React 19.2.4, TS 5.5.4, Tailwind **3.4.6** with HSL `:root`/`.dark` tokens + `success/warning/info` extension, `--radius: 0`, Saira, `next-themes` class mode dark-default, 15 shadcn primitives + 4 project primitives, one `Shell` with rail/drawer. Jest 30 (`roots: src`), 8 green tests. `tsconfig` excludes `agent_docs/**` and `_SKILLS/**`.
- Auth: `@supabase/ssr` cookie sessions; refresh in `proxy.ts`; identity + role resolved **server-side** via `user_roles`; gate = route-group layout; login/logout/confirm route handlers; no signup/reset/callback/server-actions. Env names: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `NEXT_PUBLIC_SITE_URL`.
- Schema on disk: `app_role` enum, `user_roles`, `profiles`, `handle_new_user` trigger, RLS own-row. Nothing subscription-shaped.
- Stripe: dependency only. Six env names reserved (3 price tiers + webhook secret).
- Deployment: Cloud Run via Cloud Build, standalone output — **currently aimed at Mission Control**.

**Doc-vs-disk drift to surface in doctrine:**
- `docs/DATABASE_SETUP.md` → `docs/setup.sql` doesn't exist. `agent_docs/README.md` is CyberBugs. `DEPLOYMENT_CHECKLIST.md` is MC. The June recon's findings (useAuthStore/app-role/ghl/posts cascade) are resolved except the `posts` GET fossil.
- Toggle offers "System" with `enableSystem=false`.

**Authoring implications for the Subscription Portal FFM:**
1. Treat `globals.scss` tokens + `tailwind.config.ts` + `components/ui` + `Shell` pattern as **inherited and locked**; the Designer extends, doesn't replace. Decide `.css` vs `.scss` with the Designer up front.
2. Write the session resolver / gate against a **multi-role** policy (admin/member or portal-specific), replacing the super-admin-only policy; keep the server-resolved-identity-via-props pattern (proved out in the Aug-5 navbar audit).
3. Scope signup, password reset, PKCE callback, and (per QAM) a verification walk for each auth state — none exist today.
4. Decide the Mission Control surface disposition (delete vs morph) before the Components sub-phase; the deletion cascade is listed in §D so it can be one pass.
5. Fix the deploy targets (or fence `deploy.sh` behind a guard) before any CI/deploy skill is invoked.
6. Service layer stays the sole swap point; mock business data goes in `src/mocks/<portal>/` with non-resolvable identifiers.

**Open questions for the Operator (blocking for authoring, not for cleanup):**
- Q1 Which Supabase project is the portal's? (`CyberPharma_Dev_v1` vs `Nextjs_Stripe_Sub_v1`)
- Q2 Role model for the portal (kit `admin/member` vs new roles vs Coach's per-store `admin/user`)?
- Q3 Disposition of `agent_docs/` MC history and the credential rotation — done before or after cleanup?
- Q4 Delete or morph the 9 Mission Control screens?
- Q5 New Cloud Run service/domain names (so deploy files can be retargeted rather than left live-dangerous)?

---

## DESIGNER REFERENCE BUNDLE — index

Packaged in the ZIP under `designer-refs/`. Copies only; nothing moved. Excludes env files, credentials, `node_modules`, the design HTMLs and the two design docs that carry client/employee names.

| Bundle path | Source | Why the Designer needs it |
|---|---|---|
| `00_stack/package.json` | `/package.json` | actual stack + versions (Tailwind 3, not 4) |
| `00_stack/tsconfig.json`, `next.config.js`, `postcss.config.js`, `components.json` | root | aliases, shadcn config (`baseColor zinc`, cssVariables, `.scss` path) |
| `01_theme/globals.scss` | `src/app/globals.scss` | **the token block** (Mist/Slate), legacy heading rules to retire |
| `01_theme/tailwind.config.ts` | root | token→utility mapping, semantic-four, radius, plugins |
| `01_theme/layout.tsx`, `ThemeProvider.tsx`, `ThemeToggler.tsx` | `src/app/layout.tsx`, `src/app/providers/`, `src/components/global/` | font + theme wiring, toggle UI |
| `02_shell/Shell.tsx`, `loading.tsx`, `mission-control-layout.tsx` | `src/components/mission-control/Shell.tsx`, `src/app/(mission-control)/{loading,layout}.tsx` | app shell (rail/drawer/top bar), gate seam |
| `02_shell/SpinnerLarge.tsx` | `src/components/common/` | loading state |
| `03_ui_primitives/*` (15 files) | `src/components/ui/` | shadcn set as customised (flat radius, left Sheet) |
| `03_ui_primitives/utils.ts` | `src/lib/utils.ts` | `cn()` |
| `04_project_primitives/{DataTable,EmptyState,StatusPill,StoreCard}.tsx` | `src/components/mission-control/` | reusable patterns (table→cards, pills, empty) |
| `05_representative_screens/LoginPageContent.tsx`, `DashboardPageContent.tsx`, `StoreDetailPageContent.tsx`, `OnboardingQueuePageContent.tsx`, `not-found.tsx` | `src/app/login/`, `src/app/(mission-control)/…` | how screens compose primitives; KPI tiles, detail header + roster, queue table |
| `06_brand/logo-color.svg`, `logo-lockup.svg`, `logo-mono.svg`, `favicon-512.png`, `icon.png`, `favicon.ico`, `brand_preview.png` | `public/`, `src/app/`, `agent_docs/branding_stuff/` | brand assets (lockup has baked dark text — see §4) |
| `07_prior_design/style_tile_mist.png`, `style_tile_slate.png` | `agent_docs/CURRENT_APP/…/_design/DESKTOP/_PNG/` | the locked style tiles for both modes |
| `07_prior_design/MOBILE/*.png` (10) | `…/_design/MOBILE/` | mobile layout reference (drawer, stacked tables) |
| `07_prior_design/COMPONENT_MANIFEST_MissionControl_v1_1.md`, `_design_README.md` | `…/_design/` | component inventory conventions (name-clean) |
| `08_types_for_reference/status.ts`, `entities.ts`, `services.ts` | `src/types/mission-control/` | status vocabularies incl. `SubscriptionStatus`; the view-model style to keep |
| `09_auth_reference/{proxy.ts, middleware.ts, server.ts, client.ts, admin.ts, get-user-role.ts, session.ts, login-route.ts, logout-route.ts, confirm-route.ts, login-page.tsx}` | `src/` | so the Designer/Architect see the real auth seams (no secrets inside) |
| `10_db_reference/setup.sql`, `migration_add_profiles.sql` | `supabase/`, `docs/` | schema on disk (both, conflicting) |
| `RECON_cyph-subscription-portal_ffm-intake_2026-10-26.md` | this report | — |

**Deliberately excluded:** `.env.local`, anything under `node_modules/`, `deploy.sh`/`cloudbuild.yaml` (contain the live project ref + key), `RECOVERY.md` (credential), `DESIGN_BRIEF.md`/`UI_SPEC_*.md`/`_design/DESKTOP/_HTML/*` (names), `mocks/store.ts` (NPI set), all MC session/response history.

---

*Recon complete. Repo product source byte-for-byte unchanged. No git operations. No database access.*
