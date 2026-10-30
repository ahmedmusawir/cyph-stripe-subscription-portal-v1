# Q2 execution report — attempt 001
Executor Cody; 28 October 2026 UTC. Product candidate and execution HEAD 94251beab08dd26d7f56f4b8f2299a1e841892c5; branch qa/ffm-abm-001-subscription-portal. Approved plan hash 42ebdbc6ac88ddf6733416aaa0374be1cc852400a6f1679ca631891ef7ddc24d, unchanged. JARVIS approval/Tony release recorded in QAM_APPROVAL; historical HOLD superseded and preserved verbatim.

## Result for QA Lead
Q2 returned with observed failures and explicit coverage limits; NOT certified. Review FINDINGS and AC_EVIDENCE_MATRIX. Contrast and load-error UI fail; repeated-mode behavior needs contract/severity adjudication. AC-30 pending Director/Architect, not an execution blocker.

## Commands, identities and attempts
CWD for all build/tsc/Jest/Playwright: /tmp/cody-q2-94251be (explicit shell CWD assertion before build). Product copied from clean approved candidate; 192 tracked product/config/test files byte-identical, no Git mutations. node_modules physically copied (not symlink); existing lock retained. Node v22.17.0/npm 11.15.0. App uses only allowlisted existing public auth config, not secret API keys or QA credentials. Existing configured shared-dev auth target retained, no guessed project.
- npm run build: default Turbopack clean build, exit 0. Initial setup command rejected before execution; full env linkage never installed in Q2. Earlier Q1 in-repo build incident remains recorded, not erased by this successful isolation.
- npx tsc --noEmit: exit 0 against fresh generated types.
- npx jest --runInBand --json --outputFile=/tmp/cody-q2-jest.json: 9 suites,106 tests pass, exit 0.
- npx jest --config=qa-jest.config.cjs --runInBand: 9 independent price/boundary checks pass, exit 0.
- npx playwright test --config=qa.config.ts: 57 tests pass, exit 0. Public, account and six-width/two-theme Gate M independently rerun; inherited admin-setup/logout projects excluded. Helpers keep auth only in memory, no retries, no traces/video.
- qa-extra.config.ts: 5 pass/2 fail; qa-corrected.config.ts: 10 pass/2 fail. Not additive unique-case success counts: corrected fixtures and previously unreached scenarios documented.
- qa-recovery.config.ts: 2 pass/2 fail (helper selectors). qa-recovery-corrected: 1 pass/1 helper failure. qa-recovery-final, only T11: 1 pass. Preserve all attempts; never collapse history into an all-green count.
- Standalone zoom/keyboard/query/final helpers: evidence and source retained; corrected instrument attempts explicitly distinguished.
Full exact test names/statuses/durations: executed-browser-coverage.json; commands/config/helper sources in AUTOMATION/q2. Privacy-safe logs record actual failures; raw automatic error-context files excluded and removed.

## Access and side effects
Real admin login independently successful in Q2. Total helper sign-in submissions: 10. One setup expectation timed out at 5 seconds; no invalid-password conclusion. Final HTTP 200, admin dashboard observed. Controlled superadmin/member/role-less tests are MOCKED, no live second identity or role mutation.
Final session test retained original tokens in memory and changed only cookie expiry metadata to stale; existing proxy issued two /auth/v1/token requests and dashboard remained accessible. This establishes refresh traffic, unlike a simple reload; no token/credential values retained.
Exactly one global logout, last authenticated/browser workflow: HTTP 200, two mock namespaces before / zero after, protected dashboard returns login. Tony informed by release; other sessions may be revoked as authorized. No live billing/email/provisioning/business data mutation.
Actual QA server PID 770622 on :3108 preloaded undici diagnostics subscriber. Captures method/category/allowlisted path only, no headers, bodies, query strings, identities or tokens. Runtime: auth token/user/logout and GET user_roles; loopback control observed. Browser hosts restricted to localhost:3108 in tracked journeys. Limits: undici events are not OS-wide socket proof; no attribution of every build-time font request, custom non-undici egress would require other instrumentation. Source/import and unchanged protected-path checks supplement this limit.

## UI/accessibility/clock
Actual Chrome settingsPrivate defaultZoom=2, independently read back; unchanged 1440 window →720 CSS px and DPR1→2. Ten final checks: plan/review/login/dashboard/confirm × light/dark, no overflow, actions visible/scrollable. Auth confined to separate nonpersistent context; persistent settings profile anonymous and deleted. Half-width baseline checks explicitly labelled reflow only, not zoom.
Full public registration→activation Tab/typing/native-select/Space/Enter flow passed with zero mouse actions. Account keyboard activation, error-summary/focus and billing-return checks pass; full account data entry exclusively by Tab remains unverified. Sheet Escape/focus return tested across responsive matrix. Rendered text measurement alpha-composites actual ancestors with 21:1 and1:1 controls; light failures listed individually. Nontext focus/border colors captured; applicability needs Lead judgment. No broad WCAG/AT/Safari certificate.
Clock active-quote checks both work and renew consent; no explicit clock-status display when no quote (source observation). Final pill measured compact/self-start and visually reviewed. Design parity differences disclosed.

## Coverage limits and cleanup
Every T01–T29 has actual execution/source evidence and explicit gaps in AC matrix, not an automatic PASS. All registry IDs reached; this is not proof of every transient variant among 87 design reference states. The results package is complete as an execution record, not a claim all acceptance requirements passed. No unapproved Coach owner-role/software support changes tested as requirements.
Owned server stopped after final logout; browser contexts closed; anonymous zoom profile and automatic error-context folders removed. Existing :3001 PID420447/:3457 PID40320 left running; Q2 did not rebuild their output. No Q2 claim repairs Q1 continuity uncertainty. Scratch build retained /tmp/cody-q2-94251be with only public config; excluded from ZIP. Credential file retained for Lead-owned final cleanup. Product source/config/tests untouched, HEAD/plan hash unchanged. Final retention/certification belongs to Lead.
