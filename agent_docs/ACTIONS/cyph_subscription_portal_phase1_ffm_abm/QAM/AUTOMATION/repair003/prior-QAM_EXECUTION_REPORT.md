# REPAIR_002 retest001 — independent results for JARVIS

## Identity and outcome
Base HEAD `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36`; branch qa/ffm-abm-001-subscription-portal. Candidate is the explicitly authorized **uncommitted frozen snapshot**, base plus ADDENDUM_001 and002. It is NOT identified by base SHA alone.

Input manifest SHA-256: `cc3518f797df96edb2f48e6127b869869d0f80c9d6d01b878bdd0c1a0175213a` (163 files).
Finalized plan SHA-256: `f2bdc37679f3f1f56ddd054c82c4cf635f743ca1cb45741a3a89d0f968e91901`.

Execution completed with two remaining findings for Lead adjudication: **R2-F01 submitted-payment scope can change without a coherent original price/scope binding**, and **R2-F02 a closed operation key is accepted for a fresh checkout at the service boundary**. Original declaration bypass and eager-allocation reproductions no longer reproduce in tested cases. Passing baseline suites do not override independent failed probes. No certification or product repair.

## Freeze and approval
Tony's explicit release superseded commit-before-testing; the earlier identity stop has an appended resolution, original preserved. QAM_APPROVAL and additive test-plan binding were recorded before build/tests. Three reviewed packages verified with exact dispatch SHA-256, all index entries, sizes, member sets and ZIP integrity. Source snapshots applied sequentially correspond to current inputs. Only the five expected incremental source/test paths differ from d6fe678. snapshot-cumulative.diff includes the untracked activation-scenario spec; snapshot-input-manifest.json enumerates the full root/source/test/public input closure, including package/lock/config files. No Git mutation.

Inputs copied to `/tmp/cody-r2-snapshot`; tests/build consumed those frozen bytes, never later working edits. Recheck after execution:163 files, zero mismatches. The original snapshot excludes dependencies/generated outputs/secrets; physical existing node_modules copied separately into scratch. Public build config used only NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and NEXT_PUBLIC_SITE_URL, privately read from existing authorized target. No QA credentials in app/build env. No dependency install/change.

## Commands and observed results
CWD explicitly asserted as /tmp/cody-r2-snapshot for build; other commands used that explicit tool CWD. Owned production server3112 ran Next start from that root with metadata-only undici preload. Existing3000/3457 servers untouched.

| Command / check | Actual result | Evidence under evidence/repair002 |
|---|---|---|
| npm run build | PASS, clean production build | cody-r2-build.log |
| npx tsc --noEmit | PASS | cody-r2-tsc.log |
| timeout180s node --max-old-space-size=512 node_modules/jest/bin/jest.js --runInBand --json --outputFile=/tmp/cody-r2-jest.json |184 tests PASS | cody-r2-jest.json/log |
| npx playwright test --config=qa.config.ts |85 PASS, zero retries;4.3m | cody-r2-browser.json/log; executed-browser-coverage.json |
| timeout120s node --max-old-space-size=512 node_modules/jest/bin/jest.js --config=qa-independent.config.cjs --runInBand --json --outputFile=/tmp/cody-r2-independent.json |18 PASS /5 FAIL (4 submitted-scope variants plus old key reuse) | cody-r2-independent.json/log; independent-observations.jsonl |
| npx playwright test --config=qa-extra.config.ts |2 invalid/inconclusive attempts; details below | cody-r2-extra.json/log |
| npx playwright test --config=qa-extra-corrected.config.ts |2 genuine product FAIL, processing and unknown edited-pharmacy cases | cody-r2-extra-corrected.json/log; submitted-corrected-browser.jsonl |
| node /tmp/cody-r2-zoom.cjs |10 actual200% route/theme checks, no overflow;434 raw/399 applicable contrast measures, zero shortfalls | cody-r2-zoom.json; contrast-summary.json; calibrated controls |
| node /tmp/cody-r2-capture.cjs |Anonymous screenshot capture investigation only;4 existing surface/theme samples; direct Chrome capture confirms zoom2 and normal reflow | capture-check.json; capture-metrics.jsonl; selected CDP screenshots |

Extreme probes were inspected before running. Current suite uses guarded push budgets; independent probe accepts billion count under64-push budget, records zero eager pushes and1 entered pharmacy, refuses both far writes. Node heap512MB and process timeouts provide secondary containment. No baseline unguarded OOM call, large actual pharmacy array or browser exhaustion was attempted. Bounds apply to accepted requested count and far writes; arbitrary already enormous hostile allocations were not created.

## Findings reproduced independently
R2-F01: submit1 pharmacy at$99, put payment into processing or unknown, then change pharmacy details or raise count to2 and enter a valid second pharmacy. Current draft is complete, quote is null, same original operation key remains; refreshActivation / resolveUnknownPayment returns success and paid/confirmed for the edited scope. Four service negatives failed. Two normal browser workflows change the pharmacy name after submitting, wait until save persisted, then allow Refresh status/Stripe confirms payment to confirm the edited pharmacy. The activation screen says payment confirmed$99 and names the changed pharmacy. Original scope is not retained as a separate immutable submitted snapshot in these observations. Completeness alone is insufficient; see FINDINGS for exact reproduction/limits.

R2-F02: withdraw declaration, explicitly reaccept, request fresh quote and provide fresh consent; startCheckout accepts both old closed operation key and fresh key. The negative expectation for old key fails. Ordinary UI recovery does generate a different key and passes. This is service-boundary enforcement evidence, not proof of an actual duplicate charge. Lead owns severity/contract disposition.

## Attempt corrections and preserved history
First processing browser attempt used nonexistent outcome-processing testid; corrected to the actual button accessible name. First unknown attempt navigated away immediately after clicking pharmacy Save, aborting the async save; its stored name/quote remained original, so the assertion failure was INVALID as a scope-defect verdict. Corrected helper waits for review URL and asserts the changed persisted name before returning to payment. Both attempts preserved; only corrected observations support R2-F01. No assertion softened, no retry for green, no product change.

Playwright fullPage screenshots at browser zoom captured clipped720px frames despite actual1440 physical window/720CSS viewport. Direct CDP capture produced1440px frames; before/after layout metrics confirm cssVisualViewport.zoom=2 and720CSS width. Initial clipped anonymous images retained as superseded capture artifacts, not product layout failures. Direct frames visually inspected. Both capture methods leave numeric zoom evidence intact.

Engineering OOM discrepancy: original log names PID928982 portal-registration worker AND PID928983 portal-checkout-hold worker, two failed suites/zero tests; the report's single-worker claim is unsupported. Original log retained. No QA OOM reproduction. Absence of effects on all other processes cannot be proven from that log alone. Earlier combined failures and prior approved plan are retained under AUTOMATION/repair002; immutable original archives remain in place.

## Access, privacy and limitations
Two successful real-admin sign-ins: main account worker1, zoom1; in-memory sessions only. Logout blocked in both helpers; metadata confirms zero logout calls. Previous combined001 refresh/global-logout results are reused only for unchanged auth/session/storage paths, with explicit diff evidence. No ceremonial logout. Member/superadmin/role-less tests remain MOCKED, not live account claims.

Server metadata:2 auth-token POSTs,3 intentionally invalid auth-verify POSTs, user/role reads only; no billing/email/provisioning business writes observed. Existing source/import tests and unchanged business integration boundaries support mock-only scope. Metadata excludes host identifiers, query strings, headers and tokens; this is not OS-wide egress proof. Browser local-host assertions retained. Screenshots are anonymous synthetic or mask real staff identity. No traces/videos/auth-state files; raw automatic error contexts excluded from export and removed at cleanup.

Actual zoom uses Chrome settingsPrivate.setDefaultZoom(2), readback2, fixed1440 physical window from1440CSS/DPR1 to720CSS/DPR2, plus direct CDP zoom2 proof. No device-scale emulation passed off as browser zoom. Independent text/control/focus measurement uses computed colors and ancestor alpha compositing; controls21/1/21/21 pass. BODY focus wrap and disabled/faded controls excluded with raw rows retained. Sampled accessibility evidence is not full AT/Safari/universal conformance certification.

## Director acceptance and future binding
Tony has already reported manual walkthrough acceptance including login/logout and copy/dropdown changes. Recorded as Director-reported; no duplicate ride requested and not a substitute for independent failed acceptance checks. Coach confirmations remain pending with no invented answers. JARVIS adjudication/certification and Architect closeout remain ungranted. After Tony commits, run AUTOMATION/repair002/verify-commit-inputs.py against the full commit SHA: every manifest path/hash and absence of extra build inputs must match before binding this evidence. Helper performs reads only and grants no certification.
