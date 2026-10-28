# E2 engineering report — FFM-ABM-001-SUBSCRIPTION-PORTAL
Engineer: Claudy (Claude Code, Opus 5.5) · 27 Oct 2026 14:38–16:01 Asia/Dhaka · CWD repo root.
These are **Engineering claims and self-checks, not independent QA.** EVIDENCE = observed by command here; GAP = not verified.

## 1. Identity
| Fact | Value |
|---|---|
| Branch / HEAD | `ffm-abm-001-subscription-portal` @ `b1fbdda3264177451598e7b4318049fe32af600d` (Director commit "plan approved") |
| Foundation | `1d15918…` (ancestor) |
| Candidate | **Uncommitted working tree** — pending Director commit. No candidate SHA exists yet. |
| Rulings applied | R-008 (admin OR superadmin), R-009 (public entry; account management behind real login) |
| Toolchain | Node v22.17.0 · npm 11.15.0 · next 16.4.3 · react 19.2.4 · TS 5.5.4 · zustand 4.5.4 · jest 30.4.2 · @playwright/test 1.59.1 with system Google Chrome 150 (`channel: "chrome"`; no browser download, X2 not used) |
| Lockfile | unchanged; no dependency added/removed |

## 2. Commands and results (logs in `EVIDENCE/E2/`)
| # | Command (CWD) | Exit | Result |
|---|---|---|---|
| 01 | `next build` in owned scratch copy of this tree (`src` byte-identical, checked by `diff -r`) | 0 | 22 routes + Proxy |
| 02 | `tsc --noEmit` in the scratch copy (fresh `.next` types) | 0 | clean |
| 03 | `npx jest` (repo) | 0 | 9 suites, **106/106** |
| 04 | `npx playwright test` (repo → owned server :3001) — all projects | 0 | **59 passed**: public 29, gate-m-public 13, admin-setup 1, account 15, logout 1 |
| 05 | after a cosmetic Dashboard pill fix: rebuild + tsc + jest + public & gate-m-public | 0 | build 0 · tsc 0 · 106/106 · 42 passed |
| — | `npm run lint` | — | **LINT NOT CONFIGURED** (inherited: `next lint` removed in Next 16, eslint absent). Not counted green. |
| — | In-repo `tsc` | — | Fails only on stale `.next/types/validator.ts` naming the old `(portal)` group; that `.next` is served by unowned PID 40320 and was **not** deleted. Clean in scratch (row 02). |

Why a scratch copy: PID 40320 (`next-server` on :3457, not owned) serves the repo `.next/`; building in place would replace files under it (B4). The scratch copy symlinks `.env.local` (no secret copied).

## 3. Real authentication (R-009: one admin credential)
- `.env.qa.local`: present (created by Director 14:44), keys `QA_PORTAL_ADMIN_EMAIL` (email-shaped) and `QA_PORTAL_ADMIN_PASSWORD` (non-empty); **ignored** (`.gitignore:28 .env*.local`) and **untracked**. Values never printed, logged, screenshotted or copied.
- Real sign-ins performed by Engineering through the real `/login` UI: **3** (account runs at ~15:20 and ~15:30, and the final run). Each saved state went to ignored `.auth/admin.json`, **deleted** after each run.
- Real logouts: **2** (the final-run logout check plus one earlier run). **The inherited logout route calls Supabase `signOut()` with its default GLOBAL scope** (verified in installed `@supabase/auth-js`: `signOut(options = { scope: 'global' })`), so each one ended **every** session of that admin account, including any browser where Tony was signed in. The route is protected/unchanged; flagged for the Director.
- Director-reported (not Engineering): Tony's manual admin login after R-008.
- Member/role-less denial: **mocked-role tests only** (rule, session, layout, every account page, login page, login form). No live member account was used or needed (R-009).

## 4. Boundaries observed
| Check | Result |
|---|---|
| Anonymous `/` | 307 → `/demo/register/plan` |
| Anonymous registration, 1 and 3 stores, through checkout stand-in → activation → email preview → access link → downstream-setup boundary | passes; never redirected to login; afterwards `/dashboard` still → `/login` |
| Anonymous account routes (`/dashboard`, `/demo/stores/{add,confirm,result}`, `/demo/references/owedbook`, `/demo/stripe?mode=portal`, `…&purpose=cancel`, `?mode=card`) | document request **307 → /login**; RSC request → `NEXT_REDIRECT;replace;/login;307`; neither body contains account markers (names, amounts, section headings, demo controls). Static `<title>` metadata is the only route-specific text. |
| Public routes (10) | 200 anonymous |
| Forged cookies (`role`, `sb-access-token`, `user_roles`), query (`?role=admin`, `?persona=…&staff=1`), sessionStorage account namespace, localStorage `role` | all still → `/login`; `/login` clears account namespaces |
| `GET /api/auth/login` · removed MC routes `/onboarding /owners /stores /audit-log` · `/demo/sign-in` | 405 · 404 · 307 → `/login` |
| Browser request hosts during public and account journeys | only `localhost:3001` (GAP: server-side egress to the Supabase auth host is not captured by the browser and was not separately inspected) |
| Protected paths vs `1d15918` (`src/proxy.ts`, `src/utils/supabase/**`, `src/utils/get-user-role.ts`, `src/app/api/**`, `supabase/**`, Dockerfile, deploy/init/cloudbuild, `next.config.js`, `package-lock.json`, `tsconfig.json`, `jest.config.js`) | **empty diff** |
| `src/services/auth/session.ts` | changed only under R-008/R-009: shared predicate, `requireAccountUser()`, `accountKeyFor()` |
| Import inventory (jest `portal-boundaries`) | fixtures imported only by `src/services/portal/**`; components/pages never import engines; no Stripe SDK; no `dangerouslySetInnerHTML`; Supabase imports only in the 6 pre-existing auth files; no `agent_docs`/design/QAM imports; no role-string literals outside the shared rule |

## 5. Gate M (measured, not screenshots)
- Public: **136 measurements, 0 failures**. Widths 375/767/768/1023/1024/1440 × light/dark on plan, owner, pharmacy 2/2, review (3 stores), activation ready + delayed, checkout-incomplete unknown, access-link expired, email reference, login, Stripe checkout stand-in. Also 720/640 px as a 200%-zoom proxy for review and plan. Checks: `scrollWidth ≤ clientWidth`; every visible button/input/select/control link is ≥ 44 px (inline sentence links exempt); mobile Sheet opens, Escape closes, focus returns to the hamburger; menu hidden ≥ 768; review summary beside the form at 1024, stacked at 1023.
- Account (real admin session): **84 measurements, 0 failures**. Dashboard active/past-due/no-pharmacies, add-store (draft restored), OwedBook reference, portal stand-in, confirm. Pharmacy table hidden at 767, visible at 768.
- Keyboard: plan → owner completed by keyboard only. Error summaries take focus and link to their fields (jest + browser).
- Found and fixed during the gate: brand link 33 px → 44 px; demo-outcome buttons overflowed 375 px by 5 px (labels now wrap); counter and two pills stretched full width on mobile; consent boxes could be ticked before the quote arrived and were then silently cleared (now disabled until a current quote exists, with an explanation); activation payment track showed an empty amount for seeded scenarios.
- GAP: the final Dashboard pill alignment fix (`self-start`) was re-verified on public screens only. The account Gate M numbers come from the run just before that one-class change.
- GAP: no assistive-technology walk; no real-device Safari; contrast taken from the Designer's measured tokens (not re-measured per state).

## 6. Route and state inventory (AC-04)
| Board | Route (access) | States reachable by normal controls (+ Demo controls) |
|---|---|---|
| C01 plan | `/demo/register/plan` (public) | 1, 2, N stores; reduce-confirm; price unavailable (scenario) |
| C02 owner | `/demo/register/owner` (public) | empty, filled/back, errors, existing email (`existing.owner@demo-pharmacy.example`), saving |
| C03/C16 pharmacy | `/demo/register/pharmacies?store=n` (public) | n of N, single, other admin, software Other, errors, duplicate (`0000099`), in-draft duplicate |
| C04 review | `/demo/register/review` (public) | 1/2/3 stores, code applying/applied/invalid, quote unavailable, quote expired (clock +31 min), consent missing, leaving |
| C05 checkout | `/demo/stripe` (public) | leaving, preview, declined; outcomes paid / processing / back / closed / unknown / declined |
| C06 activation | `/demo/activation` (public) | waiting payment, provisioning, delayed, email failed, resent, payment failed, ready |
| C07 email | `/demo/references/email?variant=` (public) | owner, store_admin, checkout_unfinished, expired_resend |
| C14 incomplete | `/demo/checkout-incomplete` (public) | resumable, payment unknown, declined, expired |
| C17 access link | `/demo/access-link` (public) | valid → downstream setup boundary, expired, used, sending, request sent, error |
| Sign-in | `/login` (real) | default, session expired (`?reason=session_expired`), error, busy; member denied |
| C12/C13/C15 | `/dashboard` (admin/superadmin) | active, past due, cancel scheduled, canceled, unchanged, refreshing, updated, handoff error, no pharmacies, denied (store admin / member), loading, error |
| Portal stand-in | `/demo/stripe?mode=portal&purpose=` (admin/superadmin) | no change, cancellation scheduled, canceled, resumed, card updated |
| C09 add store | `/demo/stores/add` (admin/superadmin) | other admin, me admin, draft restored, software Other, errors, duplicate (own store / elsewhere), busy, paused (proposed rule), non-owner |
| C10 confirm | `/demo/stores/confirm` (admin/superadmin) | quote loading/ready/expired/error, consent missing, confirming, payment failed, pending/unknown, change card (`?mode=card` round trip) |
| C11 result | `/demo/stores/result` (admin/superadmin) | added + invited, added owner-admin, invitation accepted, provisioning attention |
| C08/C15 OwedBook | `/demo/references/owedbook` (admin/superadmin) | owner, non-owner, owner past due, member past due |

## 7. Not done / limits
- No live Stripe, email, SSO, provisioning, DB, role changes or deployment. Commercial values stay placeholders.
- Lint not configured (inherited). npm audit advisories unchanged (zod high, postcss-selector-parser moderate) — no dependency work in scope.
- Real member identity not used (not required by R-009); member denial is mocked-role evidence only.
- The owned server on :3001 (PID recorded in STATE) is left running for the Director's walk.
