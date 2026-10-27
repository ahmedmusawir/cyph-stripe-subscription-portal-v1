# Implementation contract — v1.0
Module: FFM-ABM-001-SUBSCRIPTION-PORTAL · Architect decisions under approved FFM scope · 27 October 2026

## 1. Repository and access harness
Target `/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1`; foundation `1d15918`; branch `ffm-abm-001-subscription-portal` (Director creates). If the repo remains on main, E1 may inspect/install documentation but E2 waits for the designated branch. Preserve unrelated dirt and the inherited lockfile. No automatic pull, reset, checkout, add, commit, push or merge.

Keep `/login`, existing auth endpoints, `src/proxy.ts`, Supabase cookie/session adapters and `user_roles` lookup behavior. Preserve the superadmin server gate in `(portal)/layout.tsx`; adapt its visual shell only. All new demo routes below live in that protected route group. Direct URLs, reloads and query parameters must not bypass the server gate. A real authenticated non-superadmin remains denied; do not create or elevate accounts.

Inside the gate, a compact **Demo controls** panel selects synthetic scenarios/personas and resets the demo. Persistent copy distinguishes the real staff reviewer from the simulated customer. Default landing `/dashboard` = Account & Billing, two-store owner fixture. “Preview registration” switches to a synthetic prospective owner in a public-style shell while the outer server gate remains enforced. “Public” in UI_SPEC means future customer presentation, not public deployment in this FFM.

Actual login submits through the existing auth code; actual Sign out calls existing logout and clears demo state. `/demo/sign-in` is a labelled simulated screen only. Never submit fake persona credentials to Supabase. An ordinary member/admin fixture affects synthetic capability checks, never the real reviewer session or `user_roles`. Persona selection/query tampering cannot produce live account access because no live billing path exists.

## 2. Route contract
| Route | Surface / required behavior |
|---|---|
| `/` | Preserve redirect to `/dashboard`, then existing auth gate |
| `/login` | Real staff login, visual adaptation; no public signup/reset/MFA implementation |
| `/dashboard` | Account & Billing, C12/C13, billing issue, denied/loading/error/return states |
| `/demo/register/plan` | C01, count >=1; confirm before discarding completed pharmacy records |
| `/demo/register/owner` | C02, values retained when going back/editing |
| `/demo/register/pharmacies` | C03/C16, dynamic pharmacy index from draft; N records before checkout |
| `/demo/register/review` | C04, current quote and two consent controls |
| `/demo/stripe` | C05 and hosted-portal stand-in; explicit mock outcomes, no editable card fields |
| `/demo/activation` | C06; separate payment/setup/email tracks, no login from return |
| `/demo/checkout-incomplete` | C14, resumed/declined/expired/unknown state |
| `/demo/access-link` | C17 plus inert downstream account-setup boundary |
| `/demo/sign-in` | Simulated customer sign-in/session-expiry reference |
| `/demo/stores/add` | C09/C16; synthetic capability check, retained draft |
| `/demo/stores/confirm` | C10; ready quote, one consent, operation identity |
| `/demo/stores/result` | C11; pending/paid/provisioning/success outcomes from state |
| `/demo/references/email` | C07 variants; owner access versus invited store admin |
| `/demo/references/owedbook` | C08/C15, labelled reference frame and return path |

Route slugs may be amended in E1 only with an explicit map and Architect acceptance; never hide missing screens by calling them external. Reference screens are rendered read-only local views, not changes to another repository. Internal links preserve safe return context through a small enum/map; do not accept arbitrary external return URLs.

## 3. State and services
Use a single portal business-service adapter with domain view models and testable in-memory/store-backed implementation. Components call it; only services import fixtures. Reuse Zustand if useful; a second state library is unnecessary. Preserve inherited real auth as its own existing service, not a second wrapper.

Seed scenarios include one-store owner, two-store owner, prospective owner, nonowner admin/member and every UI_SPEC state. Scope data to one reviewer tab; use namespaced sessionStorage for synthetic drafts/account/operations, no session token or password. Restore on reload, clear on reset/logout/identity change; avoid hydration flashes and server-wide shared state. Never log the real staff email into screenshot fixtures.

Fixtures are deterministic and typed. Use injected clock/latency/outcomes for reproducible pending, expiry, failure and retry. Scenario controls are a review aid; each primary journey must also work by clicking normal app controls. Do not port the Designer's state-selector HTML as a substitute for functioning forms, validation or services.

One-store add seed gives $99 → $148 and $24.50 illustrative due-now. Adding to a two-store account must produce three distinct stores and $197, not revert to a canned two-store result. Registration values and nominated administrator carry through review, activation and preview emails. Duplicate fixture outcomes keep entered values. Switching scenario deliberately resets the relevant fixture snapshot; normal navigation does not.

Quote expiry and payment success are independent. A Stripe return runs mock refresh; no change/refreshing/failed launch all have working recovery. Pending/unknown operations keep confirmation disabled and expose safe status refresh, not another charge. Successful add and paid/setup-attention share an idempotent financial update, with distinct activation outcomes.

## 4. UI and accessibility
Use received v1.0 tokens, Saira and flat panels. Apply six documented token changes and shared Button/Pill adjustments in this portal only. Use existing primitives first; native selects/checkboxes/radios suffice. New compositions per manifest are allowed, without a new UI library. Keep semantic tokens; no numbered palette escape hatches in new screens. Existing unrelated SpinnerLarge exception is preserved.

Actual login can carry a concise “Staff preview access” note; the designed simulated login lives separately. Simulated public screens use the public top bar; the owner dashboard uses authenticated chrome. The existing left Sheet powers mobile navigation with focus return/Escape. Retain accessible names for icons and real `disabled` behavior where applicable; aria-disabled alone never blocks a click. Field errors retain input, link to controls and focus the summary. Busy state prevents repeated commands.

Gate M during construction: 375px, tablet 768px, desktop 1440px; also inspect 767/768 around menu/table transitions and 1023/1024 around review columns. Both themes; no hidden controls or horizontal overflow. Check 200% zoom and keyboard workflows on representative form, dashboard and dialog/drawer paths. QA Lead chooses the final risk-based coverage matrix, covering all behavior states and each shared layout.

Do not copy review-only implementation prose into customer copy except clearly labelled demo/policy notices already in the approved design. Apply R-004 hover fix. Keep brand text configurable in one place. Do not embed entire HTML, source scripts, QAM or screenshots in production components/public assets.

## 5. Allowed edits after plan approval
`src/app/(portal)/**`, new portal UI under `src/components/portal/**`, `src/services/portal/**`, `src/types/portal/**`, `src/mocks/portal/**`, portal-focused tests, Playwright configuration, application test scripts, `src/app/globals.scss`, shared Button/Pill/ThemeToggler changes required by the design, login presentation files, and brand usage. Update root layout metadata if needed without replacing font/auth providers. Add narrowly scoped ignores for QA credentials/auth state and ordinary generated test outputs; preserve existing patterns.

`package.json` may gain test scripts that use installed tooling. `tsconfig.json` may gain a narrow exclusion for this documentation module so archived TypeScript design/templates are not compiled as application source; preserve other compiler settings. `.dockerignore` may gain `agent_docs/` and QA credential/auth-state exclusions if absent; this is packaging hygiene, not deployment configuration. Confirm no app import brings those excluded files back into compilation/bundles. Do not add/upgrade/prune dependencies or regenerate lockfile routinely. The broken inherited lint command is a recorded baseline limitation: inspect availability, run a working existing linter if present, otherwise report LINT NOT CONFIGURED and rely on build/typecheck/test gates. Do not pretend it passed or introduce a lint-install project. Plan can propose a dependency exception if truly required; it needs explicit approval.

Auth logic (`src/proxy.ts`, `src/utils/supabase/**`, role lookup, auth route behavior, real access predicate), database files, business APIs, Stripe usage, cloud config and OwedBook/MC repositories are protected. No new billing/registration API routes or server-side business mutations. Any necessary auth behavior change requires a separate bounded ruling; layout refactoring cannot weaken the predicate.

Documentation writes: this module's mutable records, the scoped instruction bridge, current response/session records required by actual repo instructions. Do not rewrite historical reports or overwrite unrelated RECOVERY content; update only active pointers if authorized by the repo. Frozen contracts/design/governing snapshots change only through recorded amendments.

## 6. Permitted runtime effects
Local `npm ci` against the existing lock, builds, typechecking, installed tests, local app servers, browser automation and synthetic state mutation. Use port 3001 if free; otherwise record one unused alternative. Never stop an unrelated process. E1 may build/check baseline; E2 self-checks can reuse owned build outputs. No cloud deploy, Stripe request, email delivery, schema write, account creation or permission mutation.

Real auth probes use only the configured shared Cyber Pharma dev Supabase plus Director-authorized existing reviewer/negative-test identities. Expected effects: login/logout/session refresh and existing auth audit activity, read-only role lookup. Record sanitized target/project identity without key values. A missing/unknown target blocks network probes; never switch to the Stripe demo project or production. Previously exposed credential must be rotated or a different authorized identity supplied before use; agents do not rotate it themselves.

## 7. Evidence and handoff
Build/typecheck, existing auth regressions, mock transition/quote/idempotency tests and representative browser journeys must run. The Engineer supplies factual evidence for each AC and a complete QAM handoff in E2. Negative auth without an available non-superadmin identity is BLOCKED/UNVERIFIED, not a pass; it can be resolved before Q2 without changing product scope.

Final local configuration stays **mock business mode + real restricted staff auth**. Do not apply an unrelated “restore live” example from another app. Gate D/deployment excluded. Product ride occurs after engineering and independent QA, before module acceptance/integration; no second mandatory ride is invented.
