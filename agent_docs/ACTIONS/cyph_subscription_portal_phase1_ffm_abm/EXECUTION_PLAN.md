# Engineering plan — E1 output
Owner: Claudy · Status: **APPROVED (Director commit b1fbdda "plan approved"; R-009 resume instruction) — amended for R-008/R-009** · FFM-ABM-001-SUBSCRIPTION-PORTAL v1.0
Authored 27 Oct 2026 (Asia/Dhaka) against HEAD `1d15918dc20d80476d6a3cb017b10179f3ddf783`. Facts: `EVIDENCE/E1_RECON.md`.

## 1. Baseline and protected work
- Repo `/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1`, branch `main`, HEAD == foundation `1d15918…` (full SHA resolved), ahead of origin by 1.
- Protected dirt: 71 ` D` paths under `agent_docs/CURRENT_APP/super_admin_portal_phase1_ffm/` (Director's). E1/E2 neither restore nor commit them.
- Protected files (no edits): `src/proxy.ts`, `src/utils/supabase/**`, `src/utils/get-user-role.ts`, `src/services/auth/session.ts` (logic), `src/app/api/auth/**`, `supabase/**`, `Dockerfile`, `deploy.sh`, `init-app.sh`, `cloudbuild.yaml`, `next.config.js`, `package-lock.json`, `.env.local`, existing tests, frozen module contracts/design/governing files.
- E2 runs on Director-created branch `ffm-abm-001-subscription-portal` @ `b1fbdda` (verified 27 Oct 14:38; B1 resolved).

## 2. Existing primitives reused
- Auth: existing login page/route, logout route, proxy session refresh, `getPortalStaffUser()` gate (was `getSuperAdminUser()`; admin OR superadmin since **R-008**, members denied). No wrapper, no new auth service.
- UI: Button, Input, Label, Textarea, Table, Skeleton, Sheet (left), DropdownMenu, AlertDialog, Toast/Toaster, Separator, Breadcrumb, ThemeToggler, SpinnerLarge, portal DataTable/EmptyState/Pill.
- State: zustand 4.5.4 (installed) with `persist` → namespaced `sessionStorage`.
- Tests: jest 30 + ts-jest (node env; per-file `@jest-environment jsdom` docblock for the few component tests, no config change); @testing-library/react; @playwright/test 1.59.1 with **system Chrome** (`channel: 'chrome'`, `/usr/bin/google-chrome`). No browser download is needed. Fallback, only if channel Chrome fails: `npx playwright install chromium` into the user cache. That fallback is a download, so it is listed as exception X2.
- Validation: **proposal A-1:** plain typed validators in `src/services/portal/validation.ts`, returned through `Result.fieldErrors`. No react-hook-form/zod. Reasons: DATA_CONTRACT requires validation at the service boundary anyway; zod carries the open high advisory; the forms are small. If the Architect prefers the manifest's RHF+zod, both are already installed, so the switch needs no dependency change.

## 3. Route map (R-009; URLs per IMPLEMENTATION_CONTRACT v1.1 §2)
| Group / layout | Routes | Access / shell |
|---|---|---|
| `src/app/page.tsx` | `/` | redirect → `/demo/register/plan` (replaces interim `/` → `/dashboard`) |
| `(public)/layout.tsx` | `/demo/register/{plan,owner,pharmacies,review}`, `/demo/activation`, `/demo/checkout-incomplete`, `/demo/access-link`, `/demo/references/email` | **No login.** Public top bar (brand · `[SUPPORT EMAIL]` · theme · "Already subscribed? Sign in" → `/login`) + public Demo controls (registration scenarios only) |
| `(handoff)/layout.tsx` → `/demo/stripe` | `?mode=checkout` (default) public; `?mode=portal\|card` | Neutral external-surface shell (no protected parent). Page calls `requireAccountUser()` before rendering portal/card mode and only then mounts the account store; anonymous → `/login` |
| `/demo/references/email` page | — | public, registration draft only; account invitation previews are rendered inside protected `/demo/stores/result` |
| `(account)/layout.tsx` | `/dashboard`, `/demo/stores/{add,confirm,result}`, `/demo/references/owedbook` | **Real login**: `getPortalStaffUser` (R-008) → `redirect('/login')`; authenticated top bar + admin/persona strip + account Demo controls |
| each `(account)` page | — | `await requireAccountUser()` first (soft-navigation re-check; no page payload in signed-out 307 body) |
| `/demo/sign-in` | — | redirect → `/login` (simulated sign-in retired; design states realised on real `/login`) |
| `/login` | — | outside both groups; designed sign-in presentation; `?reason=session_expired` (enum) shows the banner |

- `requireAccountUser()` lives in `src/services/auth/session.ts` next to `getPortalStaffUser()` (same predicate; redirect on null).
- `(portal)` group is renamed `(account)`; `/dashboard` keeps its URL.
- Variants that the design selects with `?state=` become **service state**, not query flags. Accepted query params are enum-validated: `mode` (`checkout|portal|card`) and `purpose` on `/demo/stripe`, `variant`/`context` on references, `reason` on `/login`. Unknown values fall back to a safe default. Missing draft/operation context redirects to the journey start with an explanatory Alert.

## 4. Implementation design

### 4.1 Access surfaces and demo state (AC-01/02/03/07/29, R-009)
- **Public:** anonymous. One zustand store persisted to `sessionStorage` key `cyph-portal-demo:v1:public` (registration draft, quote, checkout operation, activation, access-link state, clock offset). Public Demo controls: registration scenarios + Reset only.
- **Account:** the `(account)` layout passes `{ displayName, role, accountKey }`; `accountKey` = first 16 hex of SHA-256(user.id), computed server-side. The email is never passed to client chrome or fixtures. Second store, key `cyph-portal-demo:v1:account:<accountKey>` (billing account, add-store draft, quotes, operations, persona, scenario, next outcome, clock). On mount, other `cyph-portal-demo:v1:account:*` keys are cleared (identity change). Strip: "Signed in as <displayName> · <Admin|Super Admin> (real account) · Demo account: <owner> (synthetic) · Viewing as <persona>". Account Demo controls: scenario, persona, next add outcome, resolve pending operation, clock +31 min, Reset.
- Sign out clears every `cyph-portal-demo:` key, then calls the existing `POST /api/auth/logout`, then `/login`. `/login` clears account keys on mount.
- Hydration: views render a skeleton until the persisted store reports hydrated.

### 4.2 Types — `src/types/portal/contract.ts`
Copy of `portal-contract.ts` v1.1 (SDK-free), plus internal `DemoState`, `ScenarioId` union and `ServiceDeps {now(): number; outcomes}`. `src/types/auth.ts` untouched.

### 4.3 Services — `src/services/portal/`
- `engine.ts`: pure functions `(state, input, deps) → {state, result: Result<T>}` implementing every `PortalServices` + `DemoHarness` method. Capability checks happen first. Denied results carry `ownerContactLabel` only, with no amounts, pharmacies or invoice fields.
- `pricing.ts`: initial recurring = 9900 + 4900·(N−1); DEMO10 = −1000 on initial due-now only; add-store new recurring = current + 4900, due-now fixed 2450. Integer cents with input guards. `taxCents` is left undefined (tax note shown), never 0.
- Quotes: unique id + `draftRevision` + `expiresAt = now + 30 min` (fixture). Any draft edit, count change, code change or consent-relevant change bumps the revision, drops the quote and clears the price consents. Confirm/checkout require a ready quote, the same revision, `now < expiresAt` and all required consents, else `quote_expired`/`conflict`/`validation`.
- Operations: map keyed by `operationKey`. The same key returns the stored op (no second add). Pending/unknown blocks a new key. A definitive failure allows a deliberately new key. `succeeded` and `paid_provisioning`/`attention` share one guarded `applyFinancialChange(op)` (applied flag), so coverage, list and recurring increment exactly once. Attention recovery resolves the same store to active and releases the held invitation.
- Duplicates: an NCPDP matching a fixture-registered pharmacy → `duplicate`, draft kept, no other owner's data in the message.
- Handoffs: `startCheckout` → HandoffView to `/demo/stripe?mode=checkout`. `openBillingPreview(purpose)` → `/demo/stripe?mode=portal&purpose=…`. A return runs `refreshAfterHandoff` (refreshing → unchanged by default, or the outcome chosen on the stand-in: cancel scheduled / canceled / resumed). Visiting a route never changes state; only the explicit outcome buttons do, and they are labelled "Demo outcome".
- `portalService.ts`: client facade binding the engine to the zustand store and default deps, with injected latency (default 400 ms, 0 in tests). `index.ts` exports facade + hooks. Components import only `@/services/portal` and `@/types/portal`.
- `validation.ts`: owner/pharmacy rules per DATA_CONTRACT §5 (trimmed email format, NCPDP `^\d{7}$`, NPI `^\d{10}$`, strings keep leading zeros, conditional Other-software/other-admin fields). Hostile strings are stored verbatim and rendered as React text only; no `dangerouslySetInnerHTML` anywhere.

### 4.4 Fixtures — `src/mocks/portal/`
`fixtures.ts` (DATA_CONTRACT §8 values: Jordan Ellis, Sam Ortiz, Example Main Street/Riverside, `.example` emails, synthetic ids `demo_account_01`…) and `scenarios.ts`. The registry covers: owner one-store/two-store active (default two-store), past_due, cancel_scheduled, canceled, no_pharmacies, account load error, handoff error, store_admin denied, member denied, prospective owner (new), registration prefilled 2-store, checkout abandoned/unknown/declined/expired, activation waiting/provisioning/delayed/email_failed/payment_failed, access link valid/expired/used/error, invalid code, quote unavailable, add-store draft restored, next add outcome (succeeded/failed/unknown/attention). Only `src/services/portal/**` imports fixtures; a test asserts this.

### 4.5 Design system and components
1. `globals.scss`: the six token values + annotated header comment, byte-matched to `tokens/globals.scss`. R-004 link rule: `text-foreground underline underline-offset-4 decoration-1 hover:decoration-2 focus-visible:decoration-2`, no hover colour change.
2. `ui/button.tsx`: outline `border-4` → `border`; default adds `border border-foreground/25`; size default `h-11`, plus uppercase tracked semibold. App-wide, which is intended: the portal is the only app.
3. `portal/Pill.tsx`: TONE map per manifest §4 + `whitespace-nowrap border`; API unchanged.
4. New under `src/components/portal/` (manifest-declared only): `Alert` (manifest names `ui/alert.tsx`; placed at `portal/Alert.tsx` because the contract's allowed-edit list covers `src/components/portal/**`, not new `ui/` files — same API), `FormField`, `ErrorSummary`, `RadioCard`, `Stepper`, `Counter`, `ExternalHandoffPanel`, `PublicTopBar`, `AuthenticatedTopBar` (rework of `Shell.tsx`: rail → top bar, Sheet kept), `ReviewerStrip`/`DemoControls`, `brand.ts` (single "Pharmacy Books" / "Account & Billing" / footer string set), plus screen views grouped by journey (`register/`, `account/`, `stores/`, `handoff/`, `activation/`, `references/`). `ThemeToggler`: 44px target only if Gate M requires it.
5. Screens follow UI_SPEC §5 per C01–C17 + sign-in. Native select/checkbox/radio with `accent-color: hsl(var(--primary))`. Real `disabled` on blocked commands (aria-disabled only as an additional cue). Busy = spinner + `aria-busy` + disabled + gerund label. Error summary takes focus on failed submit and links to fields. `aria-live="polite"` on quote/activation/refresh regions. Placeholders render as visible bracketed text; "Demo · Illustrative pricing" notice on every app screen.
6. No HTML/PNG/scripts from `_design` are imported or copied into `public/`.

### 4.6 Hygiene edits (allowed list, §5 of the contract)
- `.gitignore`: add `/test-results/`, `/playwright-report/`, `/.auth/`, `/blob-report/`. `.env.qa.local` is already covered.
- `.dockerignore` (new): `agent_docs/`, `_SKILLS/`, `.env*` (except `!.env.example`), `.auth/`, `test-results/`, `playwright-report/`, `node_modules`, `.next`, `.git`.
- `package.json` scripts only: `typecheck` (`tsc --noEmit`), `test:e2e` (`playwright test`). `lint` is left as-is and reported LINT NOT CONFIGURED. No dependency or lockfile change.
- `playwright.config.ts` + `e2e/` (root; jest `roots: src` keeps the suites separate). Base URL `http://localhost:3001`; webServer `next start -p 3001` against the owned build.
- tsconfig: **no change** (already excludes `agent_docs/**`).

## 5. Internal order, Gate M and self-checks (continuous, no milestone stops)
1. Types → engine/pricing/validation + **service tests** (written first as the loop condition).
2. Fixtures/scenarios → facade/store/persistence tests.
3. Tokens + Button/Pill/Alert + both top bars + public and account demo strips → **Gate M** on the shells.
4. C12/C13 dashboard states → Gate M. 5. Registration C01–C04 → Gate M. 6. Stripe stand-in, activation, incomplete, access link, sign-in → Gate M. 7. Add-store C09–C11 → Gate M. 8. References C07/C08/C15 → Gate M. 9. Login visual adaptation → Gate M.
10. Final regression: `rm -rf .next` → `npm run build` → `npm run typecheck` → `npx jest` → `npm run test:e2e` → protected-path diff (`git diff --stat 1d15918 -- <protected list>` must be empty) → import inventory (no `@/mocks` outside services, no `stripe`/new Supabase business imports, no `dangerouslySetInnerHTML`) → network destination capture in Playwright (only localhost + the configured Supabase auth host).

**Gate M** (Playwright, Chrome channel): widths 375, 767, 768, 1023, 1024, 1440 × Mist/Slate. Assertions: `scrollWidth <= clientWidth`; primary controls visible and ≥44px; Sheet opens, Escape closes, focus returns to the hamburger; table ↔ card switch at 768; review split at 1024. Plus keyboard paths (registration form, dashboard actions, Sheet) and 200% zoom on dashboard + review. Fixed before moving on. Screenshots supplement assertions; they are not the evidence alone.

**Test inventory (risk-based):**
- Service (jest, node): 1/2/3-store totals 9900/14800/19700 with hard-coded literal expectations; DEMO10 −1000 due-now only; add 2450; unknown quote ≠ 0; stale revision / expired (injected clock) / missing consent rejected with no mutation; non-owner denial payload has no financial keys; same operationKey ×3 → one store; 1→2 and 2→3; pending blocks new key; failure leaves count/price; attention → one increment, held invitation, recovery same store; registration N records required; count reduction reports would-discard; scenario id outside the enum rejected; reset restores baseline; storage namespace and identity-change clear.
- Component (jest + jsdom): ErrorSummary focus + links; Counter min 1 + reduce confirm; consent checkboxes clear on quote refresh; hostile string renders as text.
- Existing: `proxy.test.ts`, `get-user-role.test.ts` unchanged and green.
- Browser (Playwright): **anonymous** (no credentials): `/` → plan; registration 1- and 3-store end to end through checkout stand-in, activation, email preview and access link; abandoned/declined/unknown recovery; reload restores draft; every account route and account-side mode → 307 `/login` with no account content in the body; forged query/storage values grant nothing; `GET /api/auth/login` 405; removed MC routes 404; Gate M on public screens. **Real admin** (needs `.env.qa.local` admin pair): login → `/dashboard`, protected navigation, add-store success/failure/unknown/attention, persona owner vs store-admin vs member, Stripe portal return states, logout clears storage and re-blocks, Gate M on account screens. Without the credential these run as **BLOCKED**, never skipped-green.

## 6. Auth test identity and secrecy (R-009)
- One credential pair only, from ignored, untracked `.env.qa.local`: `QA_PORTAL_ADMIN_EMAIL`, `QA_PORTAL_ADMIN_PASSWORD`. Read only by the Playwright global setup, which signs in once through the real `/login` UI and saves storage state to ignored `.auth/admin.json`, deleted at the end of the run. Never in the Next server env, NEXT_PUBLIC vars, shell args, logs or evidence. Sign-in count recorded. No second real account; member denial is mocked-role tested.
- The inherited exposed credential is not used unless the Director confirms it was rotated.
- Network probes only against the configured shared Cyber Pharma dev Supabase (R-003). Recorded as host ref length / match only, with no key values.

## 7. QAM handoff, export and records
E2 fills `ACCEPTANCE_LEDGER.md` (per-AC claim + evidence path), `QAM/QAM_MANIFEST.md`, `QAM/HANDOFFS/ENGINEERING_HANDOFF.md`, `JOURNAL.md`, `STATE.md`, `RETROSPECTIVE.md`, and `EVIDENCE/E2_*` (command logs, AC-04 route/state inventory, Gate M measurements, protected diff, import/network inventory, safe screenshots with synthetic data only). It exports `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_E2_REVIEW_001.zip` + Downloads copy with FILE_INDEX and a privacy scan validated against a synthetic leak and a clean control. It returns scoped `git add` suggestions for Tony; no Git mutation. The writer slot is released in STATE with owned PIDs/temp paths. QAM verdict fields stay unexecuted.

## 8. Allowed-edit exceptions requiring approval
| ID | Exception | Why |
|---|---|---|
| X1 | `requireAccountUser()` per account page and per account-side mode (calls `getPortalStaffUser`, same redirect) | Closes the soft-navigation gap; additive, predicate unchanged |
| X2 | Fallback only: `npx playwright install chromium` (user cache, ~170 MB, no repo/lock change) | Only if system Chrome fails under Playwright |
| X3 | Rework `src/components/portal/Shell.tsx` (rail → authenticated top bar); rename group `(portal)` → `(account)`; add public group `(public)` | Design requires top bar; URLs unchanged; R-009 boundary |
| A-1 | Service validators instead of RHF+zod | §2 rationale; reversible |

No dependency add/upgrade/prune. No auth logic, DB, Stripe, email, SSO, cloud or deploy change beyond the Director's R-008 access rule.

## 9. Blockers — status at E2 resume (27 Oct 2026)
| ID | Status |
|---|---|
| B1 branch | **Resolved** — branch exists at `b1fbdda` (Director commit). |
| B2 Supabase identity | Director-reported: shared Cyber Pharma dev project (R-003); Tony's admin login succeeded on it (R-008 verification record). Not independently probed by Engineering. |
| B3 identity | **Reduced by R-009** to one admin pair in `.env.qa.local`; open while that file is absent. Dependent live checks are BLOCKED, not passed. |
| B4 PID 40320 | Not stopped (not owned). E2 builds and serves from an owned scratch copy so the repo `.next` it serves is untouched. |

## Approval record
- Plan approval: Director commit `b1fbdda` ("FFM-ABM is ready, plan approved & one shot building begins", 27 Oct 13:14 +0600) and the R-009 dispatch: "Resume E2 after reconciling the following approved requirements. No additional planning approval is required." Accepted: X1–X3, A-1 (no objection recorded). Amendments R-008 (admin-or-superadmin rule) and R-009 (public entry/registration) supersede the plan's original gate wording; §3, §4.1, §5, §6 above are rewritten accordingly.
- Interim R-008 fix (27 Oct 14:20–14:35) is preserved; Tony's manual admin login is a Director-reported verification (RULINGS R-008).
