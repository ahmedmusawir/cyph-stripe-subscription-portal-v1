# CLEANUP RESULT — Cyber Pharma Subscription Portal foundation (bounded pass)

> **Date:** 2026-10-26 15:57 · **Repo:** `cyph-stripe-subscription-portal-v1` · **Branch:** `main` @ `b016324` (unchanged — Director-only git; nothing committed)
> **Executed against:** `agent_docs/RECON/RECON_cyph-subscription-portal_ffm-intake_2026-10-26.md` + the Architect's cleanup brief (items 1–7)
> **Skill:** no cleanup skill is installed (`_SKILLS/` has recon, repo-security, cloud-deployment; `agent_docs/.claude/skills` has frontend-first/design/testing). Pass run directly from the recon's KEEP/ADAPT/REMOVE/FLAG tables.
> **Boundaries honoured:** no DB access, no users/email/Stripe, no deploy, no dependency add/upgrade/prune (only the package **name** and two dead `test:e2e*` scripts changed in `package.json`), no signup/reset/SSO/customer-permission code.

---

## 1. Preflight

| Check | Result |
|---|---|
| HEAD | `b016324` — same as recon |
| Pre-existing working tree | `M package-lock.json` (transitive bumps) — **preserved**; only its two `"name"` fields were edited to match `package.json` |
| Recon-era new files | `agent_docs/RECON/RECON_…_2026-10-26.md`, `agent_docs/RESPONSES/response_2026-10-26_150349_…`, `agent_docs/SESSIONS/session_2026-10-26.md` — **preserved** |
| Git ops | none (no add/commit/push/reset/checkout/rebase) |

---

## 2. Changes by brief item

### Item 1 — Inherited deployment entry points disabled
| Path | Change | Why |
|---|---|---|
| `deploy.sh` | **replaced** with a stub: comment banner + `echo "DEPLOYMENT NOT CONFIGURED…" >&2; exit 1` | removed GCP project, service `cyph-mission-ctrl-prod`, domain, Supabase ref + publishable key |
| `init-app.sh` | **replaced** with the same style stub (`exit 1`) | removed APIs/AR/secret/SA setup for `cyph-mission-ctrl` |
| `cloudbuild.yaml` | **replaced**: single `bash` step that prints NOT CONFIGURED and `exit 1` | a submitted build cannot build/push/deploy anything |
| `DEPLOYMENT_CHECKLIST.md` | **rewritten** as a "NOT CONFIGURED" note: what was removed, what remains (Dockerfile, standalone output), what must not be invented | |
| `Dockerfile` | **untouched** (generic, target-agnostic) | |

Verified: `bash -n` OK on both scripts; `./deploy.sh` → exit 1, `./init-app.sh` → exit 1; `cloudbuild.yaml` non-comment content contains no `gcloud`, `run deploy`, project ref or service name.

### Item 2 — Mission Control surfaces removed through the dependency chain
**Deleted (cascade in one pass):**
- Routes: `src/app/(mission-control)/{audit-log, onboarding, onboarding/[registrationId], owners, owners/[ownerId], stores, stores/[storeId]}` (14 files) + `dashboard/DashboardPageContent.tsx`
- Services: `src/services/mission-control/{auditLog, missionDashboard, ownerDirectory, pendingRegistration, storeDirectory, storeMember, supportAction}Service.ts` + `index.ts` barrel
- Mock fixture: `src/mocks/mission-control/store.ts` (incl. the NPI-shaped numbers)
- Types: `src/types/mission-control/{entities, services, status, index}.ts`
- Domain components: `src/components/mission-control/StoreCard.tsx`, `StatusPill.tsx` (domain→tone mappers)

**Kept and relocated:**
| From | To | Note |
|---|---|---|
| `src/app/(mission-control)/` | `src/app/(portal)/` | route group renamed; `layout.tsx` rewritten (same gate, documented as TEMPORARY super-admin-only); `loading.tsx` kept |
| `src/app/(mission-control)/dashboard/page.tsx` | `src/app/(portal)/dashboard/page.tsx` | **new minimal placeholder** (heading + `EmptyState`) |
| `src/components/mission-control/{Shell, DataTable, EmptyState}.tsx` | `src/components/portal/` | Shell: nav reduced to Dashboard, brand sub-line → "Subscription Portal", unused lucide icons dropped; DataTable/EmptyState unchanged |
| generic half of `StatusPill.tsx` | `src/components/portal/Pill.tsx` | `Pill` + `PillTone` only, no domain mappers |
| `src/services/mission-control/session.ts` | `src/services/auth/session.ts` | logic unchanged; header comment now states the temporary gate |
| `SuperAdminUser` (from deleted `entities.ts`) | `src/types/auth.ts` | with TEMPORARY-GATE note |

**Auth plumbing preserved untouched:** `src/proxy.ts`, `src/utils/supabase/{middleware, server, client, admin}.ts`, `src/utils/get-user-role.ts`, `POST /api/auth/login`, `/api/auth/logout`, `/api/auth/confirm`, `src/__tests__/*`.
**Gate:** `(portal)/layout.tsx` still admits only `user_roles.role === 'superadmin'`; `LoginPageContent` still signs out non-super-admins (message reworded, comment marks it temporary). Documented in `layout.tsx`, `session.ts`, `types/auth.ts`, `LoginPageContent.tsx`, `README.md`, `RECOVERY.md`.

### Item 3 — Design system preserved, cleaned
| Path | Change |
|---|---|
| `src/app/globals.scss` | token block + `* { border-border }` / `body` base **unchanged**; header comment rebranded; **removed** the legacy `h1–h6 text-gray-* dark:text-white` layer (lines 81–105) and the `.strapiMarkdownRichText` block (107–132). File stays `.scss`; Tailwind stays 3.4.6 |
| `tailwind.config.ts` | comment only ("MissionControl semantic-four" → "Cyber Pharma semantic-four, shared") |
| `src/components/ui/dialog.tsx:41` | `bg-white dark:bg-slate-900 border-slate-*` → `border-border bg-popover text-popover-foreground` |
| `src/components/ui/dropdown-menu.tsx:68,86` | panel → `border-border bg-popover text-popover-foreground`; item hover/focus → `bg-accent text-accent-foreground` |
| `src/components/ui/toast.tsx:32,80` | default variant → `border-border bg-card text-card-foreground`; destructive close → `destructive` / `destructive-foreground` tokens |
| `src/components/global/ThemeToggler.tsx` | trigger `bg-slate-700 text-white mr-5` → `bg-secondary text-secondary-foreground hover:bg-accent`; **"System" item removed** (provider has `enableSystem={false}`); comment explains |
| `src/components/common/SpinnerLarge.tsx` | **untouched** (approved exception; still the only numbered-colour site in `src/`) |
| `src/components/ui/sheet.tsx`, `breadcrumb.tsx` | comments only (MC references) |
| fonts, brand assets, ThemeProvider, `<html class="dark">`, remaining 13 ui primitives | untouched |

### Item 4 — Fossils
| Path | Change |
|---|---|
| `src/app/api/auth/login/route.ts` | **GET handler removed** (the `posts` query); POST unchanged |
| `src/app/not-found.tsx` | `text-blue-500` → `text-primary`; debug line "This is coming from /app" removed |
| `public/next.svg`, `public/vercel.svg` | deleted |
| `temp/ghl-example.json` (+ dir) | deleted |
| `test-results/.last-run.json` (+ dir) | deleted; the two dead `test:e2e*` scripts that produced it removed from `package.json` (Playwright dep itself **not** touched) |

### Item 5 — Identity, README, RECOVERY
| Path | Change |
|---|---|
| `package.json` | `name` → `cyph-stripe-subscription-portal-v1`; `test:e2e`, `test:e2e:ui` scripts removed; **no dependency/version changes** |
| `package-lock.json` | only the two `"name"` fields (root + `packages[""]`) edited; the pre-existing transitive diff preserved; **not regenerated** |
| `src/app/layout.tsx` | metadata → "Cyber Pharma — Subscription Portal" / "Cyber Pharma subscription portal (foundation)."; font comment |
| `src/app/page.tsx`, `src/app/login/*` | comments/copy rebranded; "Cyber Pharma v1 / Mission Control" → "Cyber Pharma / Subscription Portal"; "No PHI in this console" footer removed |
| `README.md` | rewritten: stack, what exists, temporary gate, run, not-configured list |
| `RECOVERY.md` | **rewritten from scratch** (no inherited history, no credential): state, pending rulings, standing rules, lineage |

### Item 6 — Documentation and pointers
| Path | Change |
|---|---|
| `RECOVERY.md` | credential text gone (file rewritten) |
| `agent_docs/RESPONSES/response_2026-07-03_…`, `…07-10_182815_…`, `…08-01_191842_…`; `agent_docs/SESSIONS/session_2026-07-09.md`, `…07-10.md`, `…08-01.md` | the inherited super-admin email + password **replaced in place with `[REDACTED-2026-10-26]`** (11 substitutions). Values were never printed, copied, or placed in any report/archive |
| `agent_docs/README.md` | deleted (CyberBugs index — unrelated project) |
| `docs/` (6 kit md + 6 change logs) | deleted (starter-kit docs for another product; `DATABASE_SETUP.md` pointed at a non-existent file) |
| `docs/migration_add_profiles.sql` | **moved** to `supabase/migration_add_profiles.sql`; new `supabase/README.md` marks both SQL files **unverified reference, execute nothing** |
| kept | `CLAUDE.md`, `WINDSURF.md`, `_SKILLS/*`, `agent_docs/.claude/skills/*`, `agent_docs/{RECON, RESPONSES, SESSIONS, STARTER_KIT, CURRENT_APP (design refs), branding_stuff, CYBER_PHARMA_8_PHASE_PLAN, SKILL_ISSUES_LEDGER}` — no blanket deletion |

**Not claimed:** the credential has **not** been rotated (operator action) and git history has **not** been sanitized — both commits of this repo and the Mission Control repo still contain it.

### Item 7 — `.env.example`
New file, placeholders only. REQUIRED: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (states the intended shared Cyber Pharma dev Supabase project). OPTIONAL: `NEXT_PUBLIC_SITE_URL` (cookie `secure` flag), `SUPABASE_SECRET_KEY` (only `admin.ts`, no consumers). Stripe variables listed as **not used / not required for the FFM**, commented out. `.env.local` untouched.

---

## 3. Verification (engineering evidence — not QAM certification)

| Check | Command | Result |
|---|---|---|
| TypeScript | `tsc --noEmit` (after a fresh `next build` regenerated `.next/types`) | **exit 0** |
| Unit tests | `npx jest` | **2 suites, 8/8 passed** (unchanged baseline) |
| Production build | `rm -rf .next && npm run build` | ✓ Compiled 5.8 s; TypeScript 3.8 s; route table: `/`, `/_not-found`, `/api/auth/{confirm,login,logout}`, `/dashboard`, `/icon.png`, `/login` + Proxy — **8 routes** (was 15) |
| Dangling references | grep for `onboarding`, `/owners`, `/stores`, `audit-log`, `mocks/`, `*/mission-control`, `StoreCard`, `StatusPill`, `posts` in `src/` | **none** (one stale comment in `breadcrumb.tsx` found and reworded) |
| Removed routes at runtime | `next start` on :3457, unauthenticated `curl` | `/onboarding`, `/owners`, `/stores`, `/audit-log` → **404**; `/` → 307 `/dashboard`; `/dashboard` → 307 `/login` (gate); `/login` → 200; `GET /api/auth/login` → **405** (handler gone) |
| Rendered `/login` HTML | markers | `<html class="dark">` present; "Subscription Portal" present; "Mission Control" count 0; viewport meta present |
| Numbered colours | word-bounded grep across `src/` | only `SpinnerLarge.tsx:8` (approved exception) |
| Deploy stubs | run both scripts; parse `cloudbuild.yaml` | both **exit 1** with the NOT CONFIGURED message; cloudbuild has no live values and a single failing step |
| Credential text | grep of email/password patterns over the working tree (excluding `.git`, `node_modules`, `.next`) | **no hits** |

**Note on the first `tsc` run:** it reported 18 phantom errors from a stale `.next/types/validator.ts` referencing the deleted `(mission-control)` routes — exactly the L25 trap in the recon. Clearing `.next` (the build does this) resolved it; the clean result above is the one that counts.

**Not tested (stated plainly):**
- Authenticated runtime: no sign-in was performed, so the rendered `Shell` (rail, drawer, theme toggle, dashboard placeholder) was **not** visually verified in light/dark or at mobile widths. Evidence for them is the clean build + the unchanged Shell markup + the token-only class changes. An operator pass with a super-admin session is required.
- Theme toggle behaviour after removing "System" — compile-verified only.

**Existing limitations, separate from the passing checks:**
- `npm audit`: still 5 advisories (4 moderate, 1 high — `zod`, unused). Dependency changes were out of scope.
- `next lint`: no ESLint config exists in the repo; the `lint` script would prompt interactively. Not run.
- Jest covers only `get-user-role` and `proxy`; nothing exercises routes or components.

---

## 4. Baseline and working tree after cleanup

- HEAD unchanged: `main` @ `b016324`. **93 working-tree entries**: 35 modified/renamed-as-delete+add, 52 deletions, 9 untracked additions (listed in `git status`); `src/` is now **49 files** (was 77).
- Pre-existing `package-lock.json` diff preserved (plus the two name fields).
- Build artefacts (`.next/`) are gitignored.

---

## 5. Remaining auth and credential limitations

1. **Gate is super-admin-only** by design of this pass. Any non-super-admin Supabase user is signed out at `/login` and bounced from `/dashboard`. Customer authorization is unimplemented and must be specified in the FFM (single swap point: `(portal)/layout.tsx` + `services/auth/session.ts`).
2. **No signup, password reset, PKCE callback or SSO** exist. Deliberately not added.
3. **Credential rotation pending (operator).** Text redacted in current files; history not rewritten.
4. `server.ts` still uses the deprecated `get/set/remove` cookie adapter (recon §3) — untouched, works on `@supabase/ssr@0.6.1`.
5. Which Supabase project the portal targets is still the operator's call; `.env.example` states the intended shared dev project.

---

## 6. Changes affecting the Designer references

The recon's bundle index pointed at pre-cleanup paths. The refreshed bundle (shipped with this report) reflects:

| Recon bundle path | Now |
|---|---|
| `02_shell/Shell.tsx` ← `src/components/mission-control/` | ← `src/components/portal/Shell.tsx` (1 nav item, "Subscription Portal") |
| `02_shell/mission-control-layout.tsx` | `02_shell/portal-layout.tsx` ← `src/app/(portal)/layout.tsx` |
| `04_project_primitives/{DataTable,EmptyState}.tsx` | ← `src/components/portal/` |
| `04_project_primitives/StatusPill.tsx`, `StoreCard.tsx` | **removed**; replaced by `Pill.tsx` (generic) |
| `05_representative_screens/*` (MC screens) | **removed** from the repo; the bundle keeps the retained `LoginPageContent.tsx`, `not-found.tsx`, and the new `dashboard-page.tsx` placeholder. The old MC screen files are **not** shipped again (they no longer exist on disk); the Designer can still consult the previous ZIP for layout patterns |
| `01_theme/globals.scss`, `ThemeToggler.tsx`, `03_ui_primitives/{dialog,dropdown-menu,toast}.tsx` | updated content (legacy blocks removed, tokens instead of slate/zinc/red, no "System") |
| `08_types_for_reference/*` | MC types removed; `auth.ts` shipped instead. `SubscriptionStatus` vocabulary no longer exists in code — the FFM defines it fresh |
| `09_auth_reference/session.ts` | ← `src/services/auth/session.ts`; `login-route.ts` no longer has a GET |
| `10_db_reference/*` | both SQL files now from `supabase/` + its README |
| `07_prior_design/*`, `06_brand/*`, `00_stack/*` | unchanged (`package.json` has the new name) |

---

*Repo left uncommitted for the Director's review. Nothing deployed, no database touched, no credentials printed.*
