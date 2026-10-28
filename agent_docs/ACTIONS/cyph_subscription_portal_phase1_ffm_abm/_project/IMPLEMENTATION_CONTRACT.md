# Implementation contract — v1.1
Module: FFM-ABM-001-SUBSCRIPTION-PORTAL · Architect decisions under approved FFM scope · 27 October 2026 · v1.1 applies Director rulings R-008/R-009 (public entry; account management behind real admin/superadmin login)

## 1. Repository and access model
Target `/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1`; foundation `1d15918`; branch `ffm-abm-001-subscription-portal` (Director creates). Preserve unrelated dirt and the inherited lockfile. No automatic pull, reset, checkout, add, commit, push or merge.

Keep `/login`, existing auth endpoints, `src/proxy.ts`, Supabase cookie/session adapters and `user_roles` lookup behavior. The single access predicate is R-008's shared rule (`isPortalStaffRole`: `user_roles.role` is `admin` or `superadmin`), resolved server-side by `getPortalStaffUser()`. Members and role-less users are denied; superadmin is retained provisionally. Do not create, elevate or change accounts or roles.

Two surfaces (R-009):
- **Public registration** — prospective subscribers arrive from marketing. `/` redirects to `/demo/register/plan`. Registration, plan selection, owner/pharmacy forms, review, the initial-checkout stand-in and its completion/recovery screens need **no login** and must not sit under a protected layout. Public navigation shows "Already subscribed? Sign in" → real `/login`. Public **Demo controls** may select registration scenarios only (checkout/activation/access-link outcomes, prefilled drafts, reset); they can never reach account data or personas.
- **Account management** — `/dashboard`, add-store and every account-side mode require a real admin/superadmin session. Protection runs on the server in the account layout **and** in each page (a layout redirect alone still streamed page payload into the signed-out 307 body). Query parameters can only add a requirement, never remove one. Inside the account surface, **Demo controls** select synthetic account scenarios and synthetic personas (billing owner / store admin / member) and reset the demo. Persistent copy distinguishes the real signed-in admin from the simulated customer account.

Actual login submits through the existing auth code; actual Sign out calls existing logout and clears all demo state. Mock payment, activation, access links and "account setup" never create a user, grant a role or sign anyone in. A synthetic persona affects synthetic capability checks only, never the real session or `user_roles`.

## 2. Route contract
| Route | Access | Surface / required behavior |
|---|---|---|
| `/` | public | Redirect to `/demo/register/plan` (replaces the interim foundation redirect to `/dashboard`) |
| `/login` | public | Real login for admin/superadmin, with the designed sign-in visual (default · session expired · error · busy); no signup/reset/MFA implementation; member denied |
| `/demo/register/plan` | public | C01, count >=1; confirm before discarding completed pharmacy records |
| `/demo/register/owner` | public | C02, values retained when going back/editing |
| `/demo/register/pharmacies` | public | C03/C16, dynamic pharmacy index from draft; N records before checkout |
| `/demo/register/review` | public | C04, current quote and two consent controls |
| `/demo/stripe` (checkout mode, default) | public | C05 initial Checkout stand-in; explicit mock outcomes, no editable card fields |
| `/demo/stripe?mode=portal\|card` | admin/superadmin | Customer Portal / change-card stand-in for account management; anonymous → `/login` |
| `/demo/activation` | public | C06; separate payment/setup/email tracks, no login from return |
| `/demo/checkout-incomplete` | public | C14, resumed/declined/expired/unknown state |
| `/demo/access-link` | public | C17 plus inert downstream account-setup boundary |
| `/demo/sign-in` | public | Retired simulated screen; redirects to `/login` |
| `/demo/references/email` | public | C07 variants from the registration draft; owner access versus invited store admin. Account-side invitation previews render inside the protected `/demo/stores/result`, never on this public page |
| `/dashboard` | admin/superadmin | Account & Billing, C12/C13, billing issue, denied/loading/error/return states |
| `/demo/stores/add` | admin/superadmin | C09/C16; synthetic capability check, retained draft |
| `/demo/stores/confirm` | admin/superadmin | C10; ready quote, one consent, operation identity |
| `/demo/stores/result` | admin/superadmin | C11; pending/paid/provisioning/success outcomes from state |
| `/demo/references/owedbook` | admin/superadmin | C08/C15, labelled reference frame and return path |

Reference screens are rendered read-only local views, not changes to another repository. Internal links preserve safe return context through a small enum/map; do not accept arbitrary external return URLs.

## 3. State and services
Use a single portal business-service adapter with domain view models and testable in-memory/store-backed implementation. Components call it; only services import fixtures. Reuse Zustand if useful; a second state library is unnecessary. Preserve inherited real auth as its own existing service, not a second wrapper.

Seed scenarios include one-store owner, two-store owner, prospective owner, nonowner admin/member and every UI_SPEC state. Scope data to one browser tab and keep two separate namespaces in sessionStorage: the **public registration draft** (anonymous) and the **account mock state** (keyed to the signed-in admin; never readable from a public page). No session token or password is stored. Restore on reload; reset clears its namespace; actual logout clears both; identity change clears the account namespace. Avoid hydration flashes and server-wide shared state. Never log the real admin email into screenshot fixtures.

Fixtures are deterministic and typed. Use injected clock/latency/outcomes for reproducible pending, expiry, failure and retry. Scenario controls are a review aid; each primary journey must also work by clicking normal app controls. Do not port the Designer's state-selector HTML as a substitute for functioning forms, validation or services.

One-store add seed gives $99 → $148 and $24.50 illustrative due-now. Adding to a two-store account must produce three distinct stores and $197, not revert to a canned two-store result. Registration values and nominated administrator carry through review, activation and preview emails. Duplicate fixture outcomes keep entered values. Switching scenario deliberately resets the relevant fixture snapshot; normal navigation does not.

Quote expiry and payment success are independent. A Stripe return runs mock refresh; no change/refreshing/failed launch all have working recovery. Pending/unknown operations keep confirmation disabled and expose safe status refresh, not another charge. Successful add and paid/setup-attention share an idempotent financial update, with distinct activation outcomes.

## 4. UI and accessibility
Use received v1.0 tokens, Saira and flat panels. Apply six documented token changes and shared Button/Pill adjustments in this portal only. Use existing primitives first; native selects/checkboxes/radios suffice. New compositions per manifest are allowed, without a new UI library. Keep semantic tokens; no numbered palette escape hatches in new screens. Existing unrelated SpinnerLarge exception is preserved.

The real login carries the designed sign-in presentation (no separate simulated login). Public screens use the public top bar with “Already subscribed? Sign in”; account-management screens use authenticated chrome. The existing left Sheet powers mobile navigation with focus return/Escape. Retain accessible names for icons and real `disabled` behavior where applicable; aria-disabled alone never blocks a click. Field errors retain input, link to controls and focus the summary. Busy state prevents repeated commands.

Gate M during construction: 375px, tablet 768px, desktop 1440px; also inspect 767/768 around menu/table transitions and 1023/1024 around review columns. Both themes; no hidden controls or horizontal overflow. Check 200% zoom and keyboard workflows on representative form, dashboard and dialog/drawer paths. QA Lead chooses the final risk-based coverage matrix, covering all behavior states and each shared layout.

Do not copy review-only implementation prose into customer copy except clearly labelled demo/policy notices already in the approved design. Apply R-004 hover fix. Keep brand text configurable in one place. Do not embed entire HTML, source scripts, QAM or screenshots in production components/public assets.

## 5. Allowed edits after plan approval
`src/app/(portal)/**`, new portal UI under `src/components/portal/**`, `src/services/portal/**`, `src/types/portal/**`, `src/mocks/portal/**`, portal-focused tests, Playwright configuration, application test scripts, `src/app/globals.scss`, shared Button/Pill/ThemeToggler changes required by the design, login presentation files, and brand usage. Update root layout metadata if needed without replacing font/auth providers. Add narrowly scoped ignores for QA credentials/auth state and ordinary generated test outputs; preserve existing patterns.

`package.json` may gain test scripts that use installed tooling. `tsconfig.json` may gain a narrow exclusion for this documentation module so archived TypeScript design/templates are not compiled as application source; preserve other compiler settings. `.dockerignore` may gain `agent_docs/` and QA credential/auth-state exclusions if absent; this is packaging hygiene, not deployment configuration. Confirm no app import brings those excluded files back into compilation/bundles. Do not add/upgrade/prune dependencies or regenerate lockfile routinely. The broken inherited lint command is a recorded baseline limitation: inspect availability, run a working existing linter if present, otherwise report LINT NOT CONFIGURED and rely on build/typecheck/test gates. Do not pretend it passed or introduce a lint-install project. Plan can propose a dependency exception if truly required; it needs explicit approval.

Auth logic (`src/proxy.ts`, `src/utils/supabase/**`, role lookup, auth route behavior, real access predicate), database files, business APIs, Stripe usage, cloud config and OwedBook/MC repositories are protected. No new billing/registration API routes or server-side business mutations. The access predicate is R-008's shared rule; any further auth behavior change requires a separate bounded ruling; layout refactoring cannot weaken it.

Documentation writes: this module's mutable records, the scoped instruction bridge, current response/session records required by actual repo instructions. Do not rewrite historical reports or overwrite unrelated RECOVERY content; update only active pointers if authorized by the repo. Frozen contracts/design/governing snapshots change only through recorded amendments.

## 6. Permitted runtime effects
Local `npm ci` against the existing lock, builds, typechecking, installed tests, local app servers, browser automation and synthetic state mutation. Use port 3001 if free; otherwise record one unused alternative. Never stop an unrelated process. E1 may build/check baseline; E2 self-checks can reuse owned build outputs. No cloud deploy, Stripe request, email delivery, schema write, account creation or permission mutation.

Real auth probes use only the configured shared Cyber Pharma dev Supabase plus the one Director-authorized existing admin identity (`QA_PORTAL_ADMIN_EMAIL`/`QA_PORTAL_ADMIN_PASSWORD` in ignored, untracked `.env.qa.local`). No second real account is required. Expected effects: login/logout/session refresh and existing auth audit activity, read-only role lookup. Record sanitized target/project identity without key values. A missing/unknown target blocks network probes; never switch to the Stripe demo project or production. Previously exposed credential must be rotated or a different authorized identity supplied before use; agents do not rotate it themselves.

## 7. Evidence and handoff
Build/typecheck, existing auth regressions, mock transition/quote/idempotency tests and representative browser journeys must run. The Engineer supplies factual evidence for each AC and a complete QAM handoff in E2. Member/role-less denial is verified by automated mocked-role tests at the rule, session, layout, page and login-form layers and labelled as mocked; no live member account is required (R-009). Anonymous denial and real admin login are browser-verified; without the admin credential the latter is BLOCKED, never a pass.

Final local configuration stays **mock business mode + public registration + real admin/superadmin login for account management**. Do not apply an unrelated “restore live” example from another app. Gate D/deployment excluded. Product ride occurs after engineering and independent QA, before module acceptance/integration; no second mandatory ride is invented.
