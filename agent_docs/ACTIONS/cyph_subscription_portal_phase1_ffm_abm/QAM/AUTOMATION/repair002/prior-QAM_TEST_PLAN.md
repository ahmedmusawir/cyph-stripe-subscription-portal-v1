# Q1 risk-based test plan — v1
Status: DRAFT; NOT EXECUTED; QA Lead approval and Director Q2 release required.
Candidate: 94251beab08dd26d7f56f4b8f2299a1e841892c5
Branch: qa/ffm-abm-001-subscription-portal
Executor: Cody. Contract: ACCEPTANCE_SPEC v1.1, APP_BRIEF/DATA_CONTRACT v1.2, IMPLEMENTATION_CONTRACT v1.1, R-001–R-009.

## Execution rules and evidence
Order: identity/privacy/environment → T01–03/T24–28 access and effects → T08–10/T17–18 financial integrity → remaining journeys → T21–23 UI/accessibility → T30 human judgment. All cases below remain NOT RUN for Q2. Preflight observations do not discharge acceptance cases.
Use a QA-owned isolated candidate build on a free loopback port (proposed 3107); never replace the output of existing servers on 3001/3457. Fresh in-memory Chrome contexts, no storageState, traces, video or credential screenshots. Read credentials only inside local helper, never app/build environment; one existing admin pair only. No live member/superadmin credential required: those rules are mocked evidence. Recheck resolved shared-dev target and credential provenance/rotation before live use. Only authorized auth session activity and synthetic per-tab mutations permitted.
Each result records ID, AC, UTC timestamp, full candidate and execution HEAD, command/CWD/tool versions, inputs/preconditions, expected/actual assertions, attempt/exit, sanitized evidence path and limitations. Screenshots mask real identity before capture. No raw request bodies/headers/cookies retained. Every negative has a positive control; preserve failed attempts and helper corrections.
Q2 stops for candidate/branch drift, unresolved contract, wrong target, missing auth, unsafe evidence, untrusted instrument or unauthorized side effects. Record exact affected tests/owner/resume point; continue unrelated safe checks. Product repairs require writer handoff. Lead adjudicates severity and verdict. No Git mutation/deployment.

## Matrix and reductions
Chromium installed Chrome: public anonymous and real admin; synthetic billing owner/store admin/member only inside protected account surface. Both Mist/light and Slate/dark. Every route/state listed in E2 inventory and UI_SPEC receives reachable-state assertion; enumerate registry 18 public + 9 account + 3 personas + 4 add outcomes + 4 activation outcomes. UI state coverage is not replaced by selectors: normal end-to-end paths also required.
375/768/1440 for each distinct route/layout in both themes; 767/1023/1024 for breakpoint-sensitive drawer/table/review/confirm. All states receive functional checks; equivalent layout outcomes may share geometry proof only when identical component/layout and content length are documented. Longest/error/loading/denied/attention states get separate geometry checks. No reduction for final dashboard pills. Real-device Safari and assistive-technology certification excluded; keyboard/semantics/contrast and true 200% zoom remain required.
Synthetic fixtures: Jordan/Sam and .example recipients, invalid-checksum identifiers 0000000/0000000000 plus unique variants, duplicate 0000099, existing.owner@demo-pharmacy.example; never real customer data. Direct service tests use deterministic clocks and stable keys; expected arithmetic is specified here independently of implementation.

## T01 — AC-01 — Public entry and account-management access
Priority: P0. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
In a fresh anonymous context visit / then complete registration; directly request every protected route with HTML and RSC headers. Repeat with forged role cookies, query, metadata and storage. Assert public navigation never requires login and denied bodies contain no account names, amounts or controls. Run mocked-role checks at predicate/session/layout/page/login layers for admin, superadmin, member and absent role; label these mocked.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T02 — AC-02 — Real auth preserved
Priority: P0. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Use the single authorized admin through real /login, assert dashboard heading and role label, reload and exercise session refresh. Count sign-ins. Run logout only last in Q2 with Director aware of global-session effect; assert both mock namespaces clear and protected routes deny. Never infer auth from mock payment.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T03 — AC-03 — Protected demo personas
Priority: P0. Preconditions: isolated synthetic baseline; real admin session for account UI; mocked roles for denial variants.
With real staff session switch synthetic billing_owner/store_admin/member. Inspect UI and direct service results: both nonowners receive no financial/card/invoice payload and all mutations deny; forged capability input remains denied.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T04 — AC-04 — Route and state coverage
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Enumerate every C01–C17 state in UI_SPEC and all scenario registry values, map route/entry/action/result. Follow every internal link and deep-link missing drafts/operation IDs; assert safe explanatory recovery. Retired /demo/sign-in redirects to real login.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T05 — AC-05 — Plan/count and repeat-N
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Complete normal registration with counts 1,2,3. Reject 0/negative/fractional values. Fill three pharmacies then reduce count: cancel preserves all; confirm removes only surplus; payment cannot start with fewer than N records.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T06 — AC-06 — Owner/pharmacy validation
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Submit empty/malformed owner and pharmacy forms, then valid synthetic records. Verify leading-zero 7-digit NCPDP and 10-digit NPI strings, conditional Other software and other-admin requirements, retained values and error-summary field focus. Job title cannot grant permission.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T07 — AC-07 — Draft/edit continuity
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Back/edit/reload each completed step; inspect only synthetic storage field names and sanitized before/after values. Material edit invalidates quote. Separate tabs and public/account namespaces remain isolated. Reset each namespace independently and exercise identity-change clearing with mocked identity, not a second live user.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T08 — AC-08 — Quote and price coherence
Priority: P0. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Independently compute 9900+4900*(N-1) for N=1,2,3: 9900/14800/19700; DEMO10 due-now 8900/13800/18700 with unchanged recurring. Invalid code has no discount; missing quote is unavailable, never zero. Add due-now is 2450 for 1→2 and 2→3.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T09 — AC-09 — Quote freshness and consent
Priority: P0. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Fetch quote; omit each consent in turn; reject confirmation without mutation. Change code/count/details or refresh quote: old ID/revision and prior consent must fail. Inject just-before/exact/after expiry; then use real demo clock button on review and add-confirm. Busy controls prevent duplicates.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T10 — AC-10 — Initial checkout boundary
Priority: P0. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Walk local checkout paid/declined/back/closed/unknown outcomes. Assert no editable card inputs or Stripe requests; cancel/decline preserve draft and inactivity. Forge success URL and navigate activation directly: neither payment nor session is created.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T11 — AC-11 — Activation separation
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Walk waiting payment→confirmed→provisioning→ready and delayed/payment-failed/email-failed branches; record independent financial/setup/email tracks. Paid delay must not offer repayment; simulated resend changes only delivery track.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T12 — AC-12 — Owner versus admin email
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Compare owner-as-admin with other-admin registration. Preview synthetic recipients and submitted pharmacy names; owner retains access and nominated admin has separate invitation. Assert no outbound mail request.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T13 — AC-13 — Abandoned and unknown checkout
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Abandon/decline then resume and compare values. Expired checkout requires restart. Unknown outcome prevents new payment attempt and avoids claiming no charge; resolve status safely.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T14 — AC-14 — Access links
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Exercise valid/expired/used/request/sent/error access-link states. Request feedback stays generic; no editable unauthenticated destination or live token; valid action reaches labelled local setup reference only.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T15 — AC-15 — Account summary
Priority: P1. Preconditions: isolated synthetic baseline; real admin session for account UI; mocked roles for denial variants.
Check active/loading/error/retry/empty/past-due/cancel-scheduled/canceled dashboard with seed and changed account. Assert list/count/recurring consistency and invitation-pending distinct from unpaid. Recheck final Pill self-start alignment on actual candidate.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T16 — AC-16 — Add-store entry and recovery
Priority: P1. Preconditions: isolated synthetic baseline; real admin session for account UI; mocked roles for denial variants.
Enter add-store via dashboard and OwedBook. Back/reload/change-card return/failure preserve draft/admin choice. Own and elsewhere duplicate identifiers block without revealing another owner.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T17 — AC-17 — Add-store payment/idempotency
Priority: P0. Preconditions: isolated synthetic baseline; real admin session for account UI; mocked roles for denial variants.
For both 1→2 and 2→3 submit twice rapidly, replay same operation key, reload pending and retry unknown. Pending/failed leave counts unchanged; success increments once and recurring increases exactly 4900. Definitive failure permits deliberate new-key retry; unknown does not.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T18 — AC-18 — Paid but provisioning delayed
Priority: P0. Preconditions: isolated synthetic baseline; real admin session for account UI; mocked roles for denial variants.
Choose attention outcome: retain one financial/coverage increment, pending setup and held invitation. Recover same operation/store and verify no additional 2450 payment or extra pharmacy.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T19 — AC-19 — Hosted billing/cancel return
Priority: P1. Preconditions: isolated synthetic baseline; real admin session for account UI; mocked roles for denial variants.
Walk manage/cancel/resume/card/invoice local handoffs. Close without change, refresh, apply explicit outcome and simulate launch error. Assert no invented card/cancellation change; whole-account cancel and unresolved policy timing remain clear.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T20 — AC-20 — Policy/brand honesty
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Inspect rendered policy, pricing, brand and support copy against contracts. Owner-role changes and pharmacy-software support restrictions discussed with Coach are pending proposals, excluded from grading as approved implementation. No commercial/SSO/ownership-verification claim.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T21 — AC-21 — Visual parity and themes
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Compare implemented screenshots and computed styles with approved design at both themes. Check Saira, central tokens, panels, table/cards, hover/focus link readability and theme persistence. Explicitly compare final dashboard Pill at mobile and desktop.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T22 — AC-22 — Mobile Gate M
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Measure scrollWidth/clientWidth and visible interaction targets >=44px at 375/767/768/1023/1024/1440 in both themes. Test drawer open, Escape, focus return; verify table and summary breakpoints. Include final account screens after pill change.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T23 — AC-23 — Keyboard and readable states
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Keyboard-only register→checkout and dashboard→add→billing, invalid summary navigation, modal/drawer focus and Escape. Use actual browser 200% UI zoom (Ctrl++ or browser setting, verify displayed 200% and CSS viewport change), never CSS transform/deviceScaleFactor/half-width substitute. At zoom verify content/actions on review/dashboard/confirm/login. Measure computed foreground/background contrast normal/hover/focus/error/disabled/status on both themes; normal text >=4.5:1, large text >=3:1 and meaningful UI/focus >=3:1; record exceptions for Lead, no blanket WCAG claim.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T24 — AC-24 — Mock service architecture
Priority: P0. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Inventory imports and service boundaries: SDK-free types, no component fixture/business-client imports, pure service enforcement and no server-global state. Test independent tabs and denied capability payloads directly.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T25 — AC-25 — No live side effects
Priority: P0. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Review complete diff and browser destinations plus server egress where instrumented. Allow only localhost and configured shared-dev auth. No business/Stripe/email/provisioning/schema/role writes or external application changes. Stop unexpected egress; browser-only capture cannot prove server absence.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T26 — AC-26 — Foundation regression
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Compare protected foundation files and lockfile; probe removed MC routes 404, GET auth/login 405 and real POST/logout/confirm baseline behavior. Verify disabled deployment scripts. Record inherited lint/audit limitations without upgrade.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T27 — AC-27 — Build and meaningful tests
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Build clean isolated tracked-file copy, no .next/cache, fixed lock; run generated-type-compatible tsc and relevant Jest suites there. Run actual-browser Q2 journeys after approval. Preserve failed build attempts; no in-place build while existing servers use repo output.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T28 — AC-28 — Handoff and privacy
Priority: P0. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Validate evidence scanner with synthetic credential/JWT/cookie leak controls and clean fixture. Record full candidate/execution identities, sanitized timings and actual attempts. Verify explicit ZIP membership/hashes and exclusion of env/auth/build/dependencies; no app imports of QAM/design.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T29 — AC-29 — Review controls and reset
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
Exercise all enumerated scenario controls, each persona/outcome, reset and hostile script/HTML/URL strings. Confirm inert text, no arbitrary scenario execution, no account data in public controls. For Advance 31 minutes compare offset +1860000, visible feedback and quote invalidation immediately, after action and reload; distinguish engine effect from missing UI feedback.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## T30 — AC-30 — Director ride and closeout
Priority: P1. Preconditions: isolated synthetic baseline; anonymous public context or explicitly protected account context as applicable.
After Lead verdict request Director ride of registration, add success/failure, owner/nonowner billing; capture actual findings/acceptance. Architect owns closeout; Lead owns retention/cleanup. No executor approval or invented ride result.
Evidence: sanitized assertions, state/count/amount snapshots where relevant, browser measurements/screenshots for visible behavior; command exit and fixture details for service checks. Reset owned synthetic state after this case; retain failure evidence.

## Cleanup and approval boundary
At Q2 end close owned contexts, stop only recorded owned server PID, remove disposable auth state (none intended), restore intended mock mode and verify product/protected diff. Preserve credential file until Lead-authorized final cleanup and value scan. Scan selected contents and expanded ZIP, index each member with path/source/purpose/size/SHA-256, verify archive and Downloads copy. QA Lead must approve exact plan hash, candidate, target, exclusions and unresolved recon gaps; Director must separately release Q2.

## Combined retest 001 — delegated execution amendment, 29 October 2026
Authority: JARVIS approval and Tony's combined dispatch/resume; candidate 24cf075dc3c6252bc22712b067cbf9a8680f24fa, parent REPAIR_001 0d43a4c343909467487b327e654e0650b21c9336. This section supersedes old job-title requirements only; all other prior required regression retained. ACCEPTANCE_SPEC v1.2 (AC-06/06a), DATA_CONTRACT v1.3, current UI/implementation contracts and R-011 govern.
T06 amended: names/email/mobile plus exact required owner declaration replace job-title selection. Unknown job-title values never confer acceptance or authorization.
T06a: fresh declaration unchecked; exact label; UI/service reject missing,false,string true,1,null; review/checkout deep-link bypass blocked; v1 drafts retain details but no acceptance/stale quote; explicit true survives Back/reload; unchecking blocks; summary accurate; terms/recurring separate; accepted seeds labelled synthetic; Me/Someone else preserves ownership/billing/purchase control; support-transfer copy inert; no ownership proof from inbox/payment. Keyboard/error focus, 375/1440 and both themes/contrast required.
Repair retest: independently validate text/input/focus contrast; load-error stable after settle/reload/navigation then explicit Retry; all repeated/conflicting/case/whitespace/unknown Stripe modes with anonymous HTML/RSC plus positives; approved pharmacy layout/count/refresh/pills; 21-store full registration/review/checkout/activation with literal 107900-cent oracle; safe huge-count analysis without allocating enormous arrays; last-known data during Stripe refreshing, coherent outcome, nonowner payload denial; remaining keyboard/transient/auth-confirm gaps.
Execution: fresh physical-dependency scratch copy and clean default build, typecheck, full current Jest, public/account browser regression. Own target only (proposed :3110), never engineering :3104. Actual Chrome settings zoom=2 with readback and 1440→720 CSS/DPR1→2 proof; no emulation substitution. QA-only helpers may correct instruments with preserved failures, never weaken assertions/product repair. Credentials helper-only, in-memory sessions/count; block incidental global logout, if exercised exactly once last. No Git mutations or deployment.
Evidence reuse: earlier evidence supplies failure/reference provenance only; rerun changed behaviors and required regression, carry no automatic PASS. Preserve failed candidate/repair/amendment history. Return combined indexed/privacy-validated ZIP and identical Downloads copy. QA Lead review pending; Tony's new manual walkthrough after retest review and before certification, then Architect closeout, all pending. No Q1 restart.
