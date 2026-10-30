# REPAIR_005 independent retest001 — JARVIS review

## Candidate and assessment
Base HEAD `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36`, branch `qa/ffm-abm-001-subscription-portal`. The candidate is the authorized uncommitted frozen snapshot, including all previous addenda and repairs. The base SHA alone does not identify the tested product.

Input manifest SHA-256: `fb3b8cdfbf390f5ce1b4546537160f3cf0422e014b09dbb584a8fed86fdb014d` (167 files).
Finalized plan SHA-256: `0406422eae266672ce3b78a7e251a6367f430b04e5de438bb07ea7142c7fd28e`.

**Original R4-F01 and R4-F02 cases pass independent retest.** The independent 224-cell R-014 oracle passes all specified transitions and refusal invariants. Further reader/writer probes identify remaining precedence gaps: **R5-F01 activation rendering still uses conflicting flags in paid/cleared-terminal cases**, **R5-F02 resend accepts stale confirmation flags on unresolved/closed/missing checkout records**, plus **R5-O03 redundant refresh of fully completed setup returns success instead of the declared refusal**. These observations require Lead adjudication. No certification or product repair.

## Verification, freeze and authority
Reviewed engineering ZIP SHA-256 `7a78e610e04992aeca96bed6c2b068c4d4c97137b8d265669865817b49a5c1fc`: 100 members,99 indexed; complete member set, CRC, byte sizes and every SHA verified. Archive cumulative patch reconstructed against Git base and every resulting changed/untracked source/test path byte-matched to current inputs. Full current build-input closure copied to `/tmp/cody-r5-snapshot`; manifest and cumulative diff exported. Plan addendum and delegated approval recorded before build/tests. No new Q1/commit prerequisite or Git mutation.

Dependencies physically copied inside scratch from the existing locked installation, without install/change. Build privately allowlists three NEXT_PUBLIC auth/site values. No QA credentials or auth state entered app/build environment. Build asserts scratch CWD and non-symlink dependencies. Owned production server3115 uses this clean build only. All167 frozen inputs rechecked after execution,0 mismatches; later working edits not consumed.

## Execution and actual attempts
Commands ran from `/tmp/cody-r5-snapshot`; absolute browser-instrument scripts use the same frozen server/dependencies. Helpers/configuration and exact prior source are under AUTOMATION/repair005. Evidence names below are under evidence/repair005.

| Command / instrument | Observed result | Evidence |
|---|---|---|
| npm run build |exit0 clean production build|cody-r5-build.log|
| npx tsc --noEmit, before QA helpers added |exit0 product typecheck|cody-r5-tsc.log|
| timeout180s node --max-old-space-size=512 node_modules/jest/bin/jest.js --runInBand --json --outputFile=/tmp/cody-r5-jest.json |13 suites,240 PASS|cody-r5-jest.json/log|
| npx playwright test --config=qa.config.ts |66 PASS,0 skipped/retries/flaky|cody-r5-browser.json/log; executed-browser-coverage.json|
| timeout120s node --max-old-space-size=512 node_modules/jest/bin/jest.js --config=qa-transition.config.cjs --runInBand --json --outputFile=/tmp/cody-r5-original-transitions.json |46 PASS: original predecessor failures, transition controls and predecessor controls|cody-r5-original-transitions.json/log|
| npx playwright test --config=qa-corrected-browser.config.ts |5 PASS: exact failure fixtures, unavailable history, corrected C07 assertions|cody-r5-corrected-browser.json/log|
| npx playwright test --config=qa-fixture-branches.config.ts |2 PASS: exact unknown+failed fixture, paid and nothing-charged resolution/recovery|cody-r5-fixture-branches.json/log|
| timeout120s node --max-old-space-size=512 node_modules/jest/bin/jest.js --config=qa-oracle.config.cjs --runInBand --json --outputFile=/tmp/cody-r5-oracle-results.json |226 PASS/5 FAIL across231 tests:224 oracle cells pass,2 extra controls pass,4 resend negatives and1 ready-refresh negative fail|cody-r5-oracle-results.json/log; oracle.jsonl; reader-writer-observations.jsonl|
| npx playwright test --config=qa-readers.config.ts |1 PASS/4 FAIL: paid+confirmed control passes;3 conflicting paid flags and1 cleared-terminal notice fail|cody-r5-readers.json/log; paid-reader-observations.jsonl; terminal-reader.json|
| node /tmp/cody-r5-zoom.cjs |8 actual200% route/theme checks pass geometry/keyboard;0 sampled contrast shortfalls|cody-r5-zoom.json; independent-contrast.jsonl; contrast-controls/summary|

No runtime assertions were softened or rerun for green. Already corrected C07 helper was selected; superseded full-name expectations and earlier failures are preserved as history, not rerun as product findings. The independent oracle and UI probes are QA-authored; engineering's adapted copies supplied reproduction context only. No product changes or new dependency/tool installation.

## Original failures and valid recovery
The original actual predecessor d6fe678 pure engine produces processing→unknown with activation.pending and processing→failure→unknown with activation.failed. The exact QA engine/dependency source and fixture-generation paths are retained. Current nothing-charged resolution clears activation; stale/repeated refresh refuses, does not resurrect paid status or unresolved activation. Direct activation/reload no longer offers the old Refresh action. Resume→fresh quote/consent/new key works.

The original unknown+failed fixture remains unknown through resume/restart/stale outcomes/replay/new checkout attempts, with refusals preserving input state. UI shows unresolved checkout rather than Try payment again. Both authoritative branches are independently exercised with that exact fixture: paid confirms original$99 and original key; nothing charged clears activation and allows fresh unticked consents plus a different checkout key. Original second-checkout escape now refuses. Stored conflicting flags are retained as history until resolved, per R-014.

Current processing confirmation and genuine failure, ordinary open replay/cancellation, spent-key/fresh-key recovery and paid-history protection pass. Scope/legacy migration/admin display/owner declaration safeguards remain in the current240 Jest and66 selected browsers. Extreme-count guards inspected before run;512MB heap/timeouts; bounded allocation and full21 distinct pharmacies/$1,079 journey pass. No unguarded huge allocation or baseline OOM replay. Original two-worker engineering OOM evidence remains preserved.

## Independent matrix assessment
QA derives expected phases from the R-014 table independently of paymentPhase. Eight checkout labels×four flags×seven actions produce224 separately asserted cases. Hard expectations verify permissions and exact postconditions: checkout/payment status, key and scope, cleared activation for nothing charged, preserved pharmacies/price, spent keys, null checkout/activation/quote and cleared consent on resume/restart, fresh scope/key on new checkout, and setup/email progression on paid refresh. Every refusal must preserve the input object AND deep content.

All224 cells pass:67 allowed/157 refused. These totals are secondary; individual outcomes and postconditions are the verdict evidence. Normalized engineering matrix comparison has0 allowed/phase discrepancies. Additional terminal-resolution repeats pass. The engineering matrix does not cover resendAccessEmail, paid-ready repeated refresh, or full rendered paid-conflict readers; those independent probes expose the remaining observations below. No claim that224 cells prove every possible state.

## Remaining findings
R5-F01: paymentPhase correctly says paid for paid checkout with absent/pending/failed activation, but ActivationView first tests activation existence and then derives heading/tracks/retry/refresh from the raw flag. Bounded controlled records therefore show missing payment, waiting confirmation or payment failure despite the paid checkout; failed also offers Try payment again, pending offers Refresh that the service refuses. The consistent paid+confirmed control passes. These conflicting paid flags are authorized mixed-state controls, not a claim that normal current flows generated them. The actual current nothing-charged path clears activation, causing the early return to show 'There's no payment to track yet' and Go to review, bypassing the R-014 terminal notice/Continue my signup. Checkout records remain unchanged and service paid guards hold; no new charge is demonstrated.

R5-F02: for bounded records with no checkout, unknown, abandoned or expired checkout, retained activation.confirmed/setup.ready/email.failed is enough for resendAccessEmail to return success and mark email sent. The authoritative phase is none/unknown/not_charged. This is a service-side simulated delivery/history inconsistency outside the seven-action matrix. No real email or provisioning occurs. The new unknown UI does not expose the resend button; this is direct service/stale-call evidence, not an observed ordinary UI path.

R5-O03: after a normal paid refresh finishes setup/email, an additional refresh returns ok and a new state object rather than conflict/state identity. Deep JSON is unchanged; no amount/key/status/email timestamp or financial mutation is observed. The failed hard expectation follows R-014's 'paid and still being set up' restriction. Lead should adjudicate this contract-level no-op discrepancy separately from financial failures.

Raw readActivation still exposes retained historical activation flags; callers need paymentPhase to interpret them. That raw getter was inspected and not misrepresented as normalized status. Preview APIs remain inert reference data. No unsupported claim of live duplicate charges, email delivery or account creation.

## Presentation, privacy, reuse and cleanup
Eight actual zoom samples: unknown+failed notice, old closed-with-stale-pending notice, actual cleared terminal, consistent paid setup×both themes. Fixed1440 physical Chrome window gives1440CSS/DPR1 baseline→720CSS/DPR2; setting/readback2 and CDP zoom2. Eight keyboard actions pass, including both new-notice links and paid setup refresh. Resolved-terminal copy gap remains recorded even though its generic link/reflow works. Mobile375/desktop1440/both themes covered in current regression.192 applicable independent contrast measurements/208 raw,0 shortfalls; calibration21/1/21/21; BODYwrap/disabled/faded excluded with raw retained. No universal AT/Safari/accessibility certification.

Manifest comparison to priorR4 snapshot shows six changed/new inputs: new test, existing tests, public ActivationView, registration engine/barrel. Account business/layout/auth/session/role/Stripe query guards/styles/dependency/config bytes unchanged. Prior real-admin/auth/route/Retry/account observations reused with original provenance; current unit boundary/role/account tests rerun. No unnecessary login/logout or unrelated full campaign. Alert focus styling unchanged since independently measured R4.

0 real sign-ins,0 logout,0 credentials used for runtime. No saved auth/traces/videos. Scanner may privately read known values solely for export leak detection without retaining values/hashes. Four selected screenshots visually reviewed, all public/synthetic. No live business/account changes. Source/mock boundary checks pass; this is not OS-wide egress proof. Raw automatic error contexts excluded and deleted.

Owned PID1324100/port3115 stopped after CWD verification. Profile/public-only env/browser outputs removed. Unrelated3000PID970525/3457PID40320 remain listening. Frozen source/dependencies/build retained inactive in/tmp;167input hashes match. All priorQAM/packages/failures preserved. Tony acceptance remains Director-reported;no duplicate ride or certification. Coach confirmations pending without invented answers. Later commit binding must match every manifest path/hash and input membership through read-only helper before Lead certification binding.
