# Acceptance specification — FFM-ABM-001-SUBSCRIPTION-PORTAL
Version 1.3 · 29 October 2026 · Frozen requirement text after package release; amendments recorded in RULINGS. v1.3 adds R-012 (REPAIR_002) text to AC-05 and AC-06a; no criterion is removed or relaxed. v1.2 replaces AC-06 owner-field text and adds AC-06a per R-011 (Coach decision, Director authorization). v1.1 replaced AC-01/02/03/07/25/26/29 access text per Director rulings R-008/R-009.

## Basis and grading
APP_BRIEF v1.1, DATA_CONTRACT v1.1, IMPLEMENTATION_CONTRACT v1.0, received UI_SPEC v1.0 with R-004. Each AC is required for the declared FFM scope. No arbitrary screen/test count replaces behavior. All mock checks run in a locally served app or isolated service tests; real access checks use only the authorized existing shared-dev auth target. Deployment/live billing/SSO are excluded.

Missing required evidence is UNVERIFIED/BLOCKED, not PASS or silently N/A. Failed authorization, real side effect, duplicate financial/store mutation or lost/inconsistent financial state is a blocking defect. Other unmet required behavior must be repaired or receive explicit Director scope/risk disposition and QA Lead verdict. QA Lead sets severity; Engineer/Executor cannot waive an AC. AC-30 contains Director/Architect judgment and is recorded separately from the Lead's tested product verdict.

Every evidence record includes input/precondition, expected result, actual result, method, candidate/HEAD, environment, time and path. Browser screenshots supplement assertions. Q1 independently specifies exact cases, negative controls and coverage reductions.

## AC-01 — Public entry and account-management access
**Requirement:** `/` opens the public plan-selection screen. Registration, owner/pharmacy forms, review, initial mock checkout and its completion/recovery screens work end to end with no login and never redirect to login. Signed-out requests to `/dashboard`, add-store, the OwedBook reference and account-side modes of shared routes redirect to the real `/login`, and no account mock data/control renders (including in the redirect body) before server authorization. Existing `admin` and `superadmin` accounts enter; `member` and role-less accounts stay denied. Forged persona/query/storage/metadata role values cannot grant access.

**Verification:** Anonymous browser journey and direct navigation; real admin login with the one authorized credential; mocked-role automated tests for admin/superadmin allowance and member denial at rule, session, layout, page and login-form layers.

**Evidence:** Redirects and bodies, sanitized real-admin observations, mocked-role test results labelled as mocked; missing admin credential makes the live check BLOCKED.

## AC-02 — Real auth preserved
**Requirement:** Login/logout/session refresh retain baseline behavior apart from the R-008 role rule. No auth signup/reset/MFA or role change is added. Actual logout clears all demo data. "Already subscribed? Sign in" leads to the real `/login`; mock payment/activation/access links never submit credentials or create a session.

**Verification:** Real login/logout/reload plus network assertions and protected-path diff.

**Evidence:** Baseline comparison, login count, redacted network destinations.

## AC-03 — Protected demo personas
**Requirement:** The real signed-in admin and the synthetic owner/store-admin/member personas are explicitly distinguished; the prospective owner is the anonymous public visitor. Nonowner fixtures receive only owner-contact/denied views; financial data and mutations are denied by mock services as well as UI.

**Verification:** Browser persona change plus direct service negative tests.

**Evidence:** Denied result payload and hidden/absent sensitive details.

## AC-04 — Route and state coverage
**Requirement:** All mapped C01–C17 plus supporting states are reachable. Internal links resolve; missing draft/operation context redirects safely. External references are labelled. State controls supplement working journeys.

**Verification:** Route/state inventory against UI_SPEC and actual app.

**Evidence:** Inventory with each state, route, entry path and AC references.

## AC-05 — Plan/count and repeat-N
**Requirement:** Count minimum 1; N pharmacy records required before payment. Decreasing count with entered records asks before discarding; cancel retains records. Exercise 1, 2 and 3 stores; no forced two-store limit. (R-012) No business cap; the only upper bound is the documented technical safe-integer pricing bound. Work and memory scale with the pharmacies entered, never with the requested count: an extreme accepted count (e.g. 1,000,000,000), restored or malformed state, or a far step index causes no count-sized allocation; every step number up to N is reachable.

**Verification:** Service/form/browser tests.

**Evidence:** Count/review consistency and confirm/cancel evidence.

## AC-06 — Owner/pharmacy validation
**Requirement:** Required names/email/mobile, the owner declaration (AC-06a) and pharmacy fields validate. NCPDP seven digits and NPI ten digits remain strings; Other software and other-admin fields required conditionally. Errors retain inputs and focus linked summary. No job-title field exists (R-011).

**Verification:** Form/service positives and negatives.

**Evidence:** Leading-zero, conditional-field and focus observations.

## AC-06a — Owner declaration (R-011)
**Requirement:** Registration is owner-only. C02 shows a required, initially unchecked checkbox labelled exactly "I confirm that I am the pharmacy owner and am registering this account to manage its subscription and pharmacies.", with an accessible label, an inline error and an error-summary link, separate from terms/payment consent. Missing it blocks owner progression, deep links past the owner step and the mock checkout submission (service boundary). An accepted declaration survives Back and reload; drafts saved before R-011 never acquire acceptance; seeded acceptance is a labelled synthetic fixture. Me / Someone else keeps account ownership and billing with the registering owner; Someone else never transfers ownership, billing or permission to buy more stores; one designated admin per store. UI and documents never claim that email or payment proves ownership or delegated authority. (R-012) A pending or replayed checkout never reaches paid/confirmed activation unless the declaration is exactly `true` **now**: withdrawing it or restoring a pre-R-011 draft closes an open checkout (nothing charged, details kept); a submitted/unknown payment is held until explicit re-acceptance; same-key replay, outcomes, unknown resolution and activation refresh re-check the current draft at the service boundary, not only in the UI. Re-acceptance never silently reopens a closed checkout or restores consent; completed payment history is never reversed by later edits.

**Verification:** Service tests, component test, browser journeys (keyboard, 375/1440, light/dark), storage-migration check; (R-012) withdrawal-after-checkout and legacy-over-pending reproductions with reload/direct navigation and replay.

**Evidence:** Missing/accepted/migrated declaration observations and copy review.

## AC-07 — Draft/edit continuity
**Requirement:** Back/edit navigation and same-tab reload preserve synthetic owner/pharmacy/admin data. Quote invalidates after material edits. The public registration draft and the account mock state are separate; reset clears its own namespace, logout clears both, identity change clears account state. No secrets/real business data are persisted.

**Verification:** Browser route, reload and reset tests.

**Evidence:** Before/after draft records, namespaced-storage field inventory.

## AC-08 — Quote and price coherence
**Requirement:** Initial 1/2/3-store fixtures total 9900/14800/19700 cents. DEMO10 changes initial due-now by 1000 only; recurring unchanged. Unknown quote is unavailable, never zero. Add quote uses fixed illustrative 2450 due-now, no real proration.

**Verification:** Independent integer arithmetic against service and UI.

**Evidence:** Expected and observed cents/labels for fixtures.

## AC-09 — Quote freshness and consent
**Requirement:** Initial checkout requires two consents; add requires price-change consent. Expired/error/mismatched-revision quote cannot confirm. Refresh/edit/code change clears relevant consent; busy disables duplicate submit.

**Verification:** Service negative tests with injected clock plus browser.

**Evidence:** Rejected stale quote, cleared checks and no mutation.

## AC-10 — Initial checkout boundary
**Requirement:** Checkout opens a local labelled Stripe stand-in with no editable card fields. Cancel/decline retain draft and inactive state. Browser return or forged success route alone neither authenticates nor confirms payment.

**Verification:** Browser happy/decline/back and route-tamper negatives.

**Evidence:** State transitions and zero billing-network requests.

## AC-11 — Activation separation
**Requirement:** Waiting payment, confirmed/provisioning, ready, delayed, failed payment, failed email and resend states remain distinct. Paid/setup delay never asks to repay; email failure offers simulated resend. No automatic customer login.

**Verification:** Mock transition tests and representative browser states.

**Evidence:** Three-track output with matching financial/setup/email state.

## AC-12 — Owner versus admin email
**Requirement:** Choosing another admin keeps owner access and separately previews nominated-admin invitation. Names/store list match submitted draft. All recipients synthetic; preview actions never send mail.

**Verification:** Browser and service checks.

**Evidence:** Owner/admin previews, labelled local handoffs.

## AC-13 — Abandoned and unknown checkout
**Requirement:** Abandoned/declined is resumable with values retained; expired state clearly requires restart. Unknown payment pauses payment retry and offers safe status handling without declaring no charge.

**Verification:** Browser scenarios and command rejection.

**Evidence:** Draft and operation state before/after.

## AC-14 — Access links
**Requirement:** Expired/used/request/sent/error/valid states work as local previews. No unauthenticated editable destination email; generic request feedback. Valid link leads only to labelled downstream-setup reference.

**Verification:** Browser state actions and absence of live token/send.

**Evidence:** Neutral feedback and local destination.

## AC-15 — Account summary
**Requirement:** Summary, count, prices, next-payment fixture and pharmacy cards reflect current state in both layouts. Invitation pending never means subscription unpaid. Loading/error/retry/empty return usable views.

**Verification:** Browser and view-model tests.

**Evidence:** Summary/list consistency with canonical seed and changed account.

## AC-16 — Add-store entry and recovery
**Requirement:** Owner opens add-store from dashboard or OwedBook reference. Fields/admin retained across back, card-change handoff and failure. Duplicates block without exposing another owner.

**Verification:** Browser journey and service duplicate check.

**Evidence:** Preserved draft and safe duplicate message.

## AC-17 — Add-store payment/idempotency
**Requirement:** Pending/unknown keeps count unchanged and prevents second attempt. Definitive failure leaves count/price unchanged. Success increments coverage/list/recurring exactly once. Same operation key after repeated clicks/refresh cannot duplicate a store. Exercise 1→2 and 2→3.

**Verification:** Service concurrency/replay tests plus browser.

**Evidence:** Operation identities, counts and amounts before/after.

## AC-18 — Paid but provisioning delayed
**Requirement:** Confirmed add with setup attention retains one financial/coverage increment, marks store pending/attention, holds invitation and warns against adding again. Recovery completes same store, not another purchase.

**Verification:** Service transition tests plus browser.

**Evidence:** Paid/setup-attention and recovery sequence.

## AC-19 — Hosted billing/cancel return
**Requirement:** Manage/cancel/resume/card/invoice actions lead to labelled local portal handoff. Return refresh, unchanged, refreshing and launch-error are distinct; closing preview does not invent a billing change. Cancellation affects whole mock account and leaves policy timing unresolved.

**Verification:** Browser handoff/return states.

**Evidence:** No custom cancellation/card/invoice processing; coherent return.

## AC-20 — Policy/brand honesty
**Requirement:** All amounts remain illustrative, brand configurable, terms/support/policies visibly provisional. Proposed add-store restrictions are labelled. No production subscription granularity, grace period, SSO or verification claim inferred from fixtures.

**Verification:** Copy/source review against RULINGS and design.

**Evidence:** Targeted copy inventory and screenshots.

## AC-21 — Visual parity and themes
**Requirement:** Shared top bar/centered content, Saira, flat panels, Mist/Slate tokens and responsive pharmacy table/cards match design. Portal token/Button/Pill adjustments applied centrally; link hover remains readable per R-004. Theme survives navigation/reload.

**Verification:** Visual comparison, computed styles and interactions.

**Evidence:** Representative screenshots and both-theme observations.

## AC-22 — Mobile Gate M
**Requirement:** At 375/768/1440 both themes, controls stay reachable and page has no horizontal overflow. Check both sides of 768/1024 layout boundaries. Drawer opens/closes, Escape and focus-return work. Controls have >=44px interaction targets as required by UI_SPEC.

**Verification:** Browser measurements and interaction assertions during build and QA.

**Evidence:** Widths/targets/focus and menu states; not just screenshots.

## AC-23 — Keyboard and readable states
**Requirement:** Keyboard can complete core forms and billing navigation; meaningful labels, visible focus, errors, status text, busy/disabled states and announcements exist. Contrast verified on actual used surfaces and interactive states, not inferred from style tile alone. Representative 200% zoom retains content/actions.

**Verification:** Keyboard/browser/accessibility inspection; automated checks where installed.

**Evidence:** Measured combinations and focus/order/errors; no blanket compliance claim.

## AC-24 — Mock service architecture
**Requirement:** Components import service facade/types, not fixtures/Stripe/Supabase business clients. Pure types are SDK-free; services enforce quotes, consent, capabilities and transitions. Existing auth imports are preserved documented exceptions. No server-global cross-reviewer state.

**Verification:** Import/source review and service tests.

**Evidence:** Import inventory, boundary and state-isolation evidence.

## AC-25 — No live side effects
**Requirement:** No new billing/provision/email/database APIs or live SDK calls. No schema/user/role writes, SSO cookies/domain rollout, external product edits or deploy. Only authorized existing dev-auth requests occur; account-management URLs remain gated while public registration stays public.

**Verification:** Diff/import/network inspection with target validation.

**Evidence:** Actual allowed destinations and no forbidden changes.

## AC-26 — Foundation regression
**Requirement:** Removed MC routes stay removed; `/` now redirects to the public plan screen (R-009); GET login remains 405; real POST/logout/confirm paths retain baseline behavior. Deploy stubs remain not-configured. Unrelated work/lockfile and provider/session infrastructure preserved.

**Verification:** Existing tests, route probes, protected-file diff.

**Evidence:** Named command results and approved exceptions only.

## AC-27 — Build and meaningful tests
**Requirement:** Clean local production build, generated-type-compatible typecheck and existing/new relevant tests pass. Browser journeys run on actual app. Missing inherited lint configuration is disclosed, not counted as green. No weakened tests or blanket dependency upgrades.

**Verification:** Engineer and independent QA controlled builds/tests.

**Evidence:** Exact commands, CWD, versions, exits, failures and fixes.

## AC-28 — Handoff and privacy
**Requirement:** Factual handoff identifies actual HEAD, changed paths, environment, reproduction, per-AC claims and limits; QAM untouched verdicts remain unexecuted. Export includes index/hashes and excludes secrets/auth state/builds. Docs/design/QAM are not imported or served as app assets.

**Verification:** Artifact/diff/package inspection.

**Evidence:** Handoff, file index, privacy checks and app-artifact exclusion.

## AC-29 — Review controls and reset
**Requirement:** A reviewer can deterministically select required scenarios (registration scenarios on public pages; account scenarios/personas only inside account management), reset fixtures and return to baseline without real data changes. Scenario IDs are enumerated, no arbitrary script/HTML or external URLs accepted. All user-entered text renders as text.

**Verification:** Browser reset plus hostile-string/service-input negatives.

**Evidence:** Reset/state isolation and inert input evidence.

## AC-30 — Director ride and closeout
**Requirement:** Tony can walk registration, add-store success/failure and owner/nonowner billing paths. Record his actual acceptance or concrete findings after independent QA. Architect completes post-FFM review; required cleanup/integration tracked separately.

**Verification:** Director judgment; Architect review; QA Lead cleanup.

**Evidence:** Attributed ride/review/cleanup records, no fabricated approvals.
