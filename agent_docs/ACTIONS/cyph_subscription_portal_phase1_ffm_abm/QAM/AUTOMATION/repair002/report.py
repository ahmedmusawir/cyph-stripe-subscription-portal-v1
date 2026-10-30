from pathlib import Path
import json,hashlib,shutil
r=Path('/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1');m=r/'agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm';q=m/'QAM';e=q/'evidence/repair002';a=q/'AUTOMATION/repair002';identity=json.loads((e/'snapshot-identity.json').read_text());mh=identity['manifestSHA256'];ph=hashlib.sha256((q/'QAM_TEST_PLAN.md').read_bytes()).hexdigest();base=identity['base'];assert ph=='f2bdc37679f3f1f56ddd054c82c4cf635f743ca1cb45741a3a89d0f968e91901'
shutil.copyfile(m/'EVIDENCE/REPAIR_002/logs/before-jest-new-attempt1-OOM.log',e/'engineering-two-worker-OOM-original.log')
shutil.copyfile(q/'AUTOMATION/combined001/qa-independent/owner-boundaries.test.ts',a/'prior-defect-demonstration.test.ts')
report=f'''# REPAIR_002 retest001 — independent results for JARVIS

## Identity and outcome
Base HEAD `{base}`; branch qa/ffm-abm-001-subscription-portal. Candidate is the explicitly authorized **uncommitted frozen snapshot**, base plus ADDENDUM_001 and002. It is NOT identified by base SHA alone.

Input manifest SHA-256: `{mh}` (163 files).
Finalized plan SHA-256: `{ph}`.

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
'''
(q/'QAM_EXECUTION_REPORT.md').write_text(report)
(q/'FINDINGS.md').write_text('''# REPAIR_002 retest findings — Lead adjudication required

Candidate: frozen base d6fe678 plus ADDENDUM_001/002; exact identity in snapshot-input-manifest.json (hash in report). No self-certification.

## R2-F01 — Submitted/unknown payment can confirm edited scope (acceptance failure)
Affected AC-05/08/10/11/13 and material-edit consistency requirement in released retest. Proposed blocking financial-state inconsistency; JARVIS decides severity.
1. Prefilled1 pharmacy → quote$99 → separate terms/recurring consent → open checkout.
2. Submit Payment processing, or Return before confirmation (unknown).
3. Edit pharmacy name through normal pharmacy form and wait for review navigation/persisted changed value.
4. Directly return activation/checkout-incomplete. Refresh status / Stripe confirms payment remains enabled.
5. Action succeeds; checkout paid/payment confirmed, quote null, changed pharmacy appears under setup. Original key remains.
Independent service variations also increase count1→2 and enter a second valid pharmacy. Both processing and unknown resolution confirm the2-store draft under the original1-store/$99 operation, without a new quote. This is observed state inconsistency; no real Stripe/payment/provisioning occurs. Engine touch preserves submitted checkout but clears quote/consents; checkoutHold checks only current completeness/declaration. No immutable submitted-scope/price snapshot was observed. Do not treat this finding as a recommendation to charge again for in-flight money.
Evidence: cody-r2-independent-observations.jsonl (4 submitted-scope cases), corrected browser results/JSONL and submitted-processing/unknown screenshots. First uncorrected browser attempts are INVALID for this finding because one selector was absent and the other navigated before save.

## R2-F02 — Closed operation key accepted for a fresh checkout (service contract gap)
Withdraw declaration from open checkout → abandoned/owner_declaration; reaccept explicitly → fresh quote → fresh terms/recurring consent. startCheckout with old operation key returns ok; new key also returns ok when independently applied to same pre-checkout state. Released recovery requirement specifies a new key. Main UI valid recovery DOES use a different key; the failure is service enforcement, not demonstrated double charging. Evidence: independent closed-key-reuse row; hard failed service assertion. Lead sets severity and scope interpretation.

## Prior findings and affected presentation
- CR-F01 original current-UI Continue/Back and legacy-v1 pending bypass: NOT reproduced. Service refusals, unavailable UI actions, reload/deep-link guard and valid recovery pass. Strict missing/false/string true/1/null/job-title substitution checks pass. Processing/unknown declaration holds and reacceptance without material edit pass. Completed checkout/payment history record preserved; nonpayment outcomes remain available. New exceptions above remain open.
- CR-F02 eager allocation/far-index: NOT reproduced in bounded probes. Zero push growth for billion count; entries1, far writes refused. Restored/malformed/numeric boundary tests, reduction/restoration, pharmacy100 and full21-store activation$1,079 pass. No arbitrary business cap added. No RAM-exhaustion test executed.
- Q2-O04 Actions divider/spacing: repaired geometry independently passes mobile top1px/padding20px, desktop left1px/padding32px/width320px, gaps12px. Masked mobile/light and desktop/dark images inspected. New notices both themes/mobile/desktop and actual zoom checked. No pixel-perfect claim or approved render for new holds.
- Q2-F02 load-error persistence/Retry and Q2-F03 repeated/case/whitespace/unknown Stripe modes HTML/RSC: pass current targeted regression.
- Addenda001/002 source bytes match reviewed packages; engineering focused evidence reused with provenance. Necessary C14/activation shared-engine checks folded into85-test run. Tony acceptance is attributed, not certification.

## Instrument/record limits
85 baseline browser tests and184 current Jest pass, while independent23-service set has18 pass/5 fail and corrected browser2 fail. Previous false/invalid helper verdicts are not counted as additional product findings. Two-worker engineering OOM discrepancy preserved. Actual zoom screenshots initially clipped by fullPage capture; direct CDP corrected capture confirms normal reflow. Privacy/egress limits and evidence reuse detailed in report.
''')
rows=[('R2-01 / AC06,06a','PASS original reproductions; R2-F02 exception','current UI Continue/Back;legacy;strict7 values;replay;fresh acceptance/quote/consent; UI new-key passes, service old-key FAIL'),('R2-02 / AC05,08–13','FAIL R2-F01','processing/unknown×count/pharmacy4 service failures;2 corrected normal-browser failures. Valid declaration-only holds/reacceptance,nonpayment/completed history pass'),('R2-03 / AC05','PASS bounded','zero eager pushes;far writes rejected;restored billion malformed counts/MAX;reduce/restore;step100;21 distinct submitted pharmacies$1079 through activation'),('R2-04 / AC21–23','PASS sampled','Actions geometry and images;4 notices375/1440 both themes;keyboard/focus;10 actual200% checks;399 applicable independent contrast measures0shortfalls'),('R2-05 / AC01–03,15,24–27','PASS targeted regression','build/typecheck184Jest;85browser;real admin2signins;roles MOCKED;Retry/transients/Stripe13HTML-RSC+positive controls;auth-confirm invalid cases'),('R2-06 / AC04,20,29','PASS bounded reuse/current','addendum packages/bytes verified; prior engineering9scenario+35affected evidence reused; shared-engine public journeys/activation and C14 independently executed now; no standalone addendum rerun'),('AC07 / storage','PASS current service tests; prior logout reused','namespace/identity unit checks rerun; live logout/refresh combined001 applicability proven unchanged paths, no global logout now'),('AC16–19 / account','PASS affected; unchanged engine reused','keyboard add→confirm→result,current184Jest account price/idempotency/recovery;prior broader account journeys/geometry at24cf075 reused because engine/layout except measured Actions unchanged'),('AC28 / package','VALIDATION asserted by package helper','manifest+plan+attempts+privacy controls+index/hash/integrity+identical delivery'),('AC30 / Director / closeout','DIRECTOR-REPORTED ACCEPTANCE; LEAD/ARCHITECT PENDING','Tony already accepted walkthrough/login/logout/dropdown; no duplicate ride; no certification. Coach confirmations pending')]
(q/'AC_EVIDENCE_MATRIX.md').write_text('# Bounded REPAIR_002 retest coverage\n\nSnapshot manifest '+mh+'; finalized plan '+ph+'. All executed85browser cases individually recorded in evidence/repair002/executed-browser-coverage.json;184current/23independent Jest records include exact assertions. Scope reductions and evidence provenance below; previous matrix preserved in AUTOMATION/repair002/prior-AC_EVIDENCE_MATRIX.md.\n\n| Requirement | Result | Evidence and limits |\n|---|---|---|\n'+'\n'.join('| '+' | '.join(x)+' |' for x in rows)+'\n')
(q/'QAM_CLEANUP_REPORT.md').write_text('''# REPAIR_002 cleanup

Owned server PID990581 port3112 stopped after checking /proc CWD=/tmp/cody-r2-snapshot. Ports3000 PID970525 and3457 PID40320 remained listening. All helper contexts closed; anonymous zoom profile and raw browser error-output directories removed. Public-only scratch .env.local removed. Two real sign-ins, no GLOBAL logout. Credential file untouched; no credential/auth-state copies in scratch/export. No traces/videos. Synthetic failure JSON/screenshots and masked account evidence retained; raw automatic contexts excluded.

Frozen candidate source, physical dependencies and generated build remain in /tmp for review; no active server. Snapshot input163 hashes rechecked without mismatch. No Git mutation/product repair/dependency change/business write/account-role change. Existing repo/QAM work preserved. Export privacy controls/index/hash verification in privacy-validation.json and external receipt. Images separately reviewed; byte scans do not OCR. Later commit binding must compare all manifest bytes and added inputs using read-only helper before any Lead certification decision.
''')
(q/'REVIEW_START_HERE.md').write_text(f'''# JARVIS — REPAIR_002 retest001

Candidate: frozen uncommitted base {base} + ADDENDUM_001/002. Manifest `{mh}`; plan `{ph}`.

Read QAM_EXECUTION_REPORT, FINDINGS and AC_EVIDENCE_MATRIX. Original declaration/allocation cases pass; remaining submitted-payment scope inconsistency R2-F01 and old-key reuse R2-F02 require adjudication. Clean build/typecheck184Jest/85browser pass; independent failures remain. Tony's walkthrough acceptance already reported; no duplicate ride. No certification.

FILE_INDEX.json verifies every indexed member; evidence/repair002 holds snapshot manifest/cumulative diff/current outputs/history; AUTOMATION/repair002 holds exact QA helpers and prior plan/records. Follow-up commit binding helper is read-only. Return to JARVIS; executor stopped after export.
''')
with (q/'QAM_STATE.md').open('a') as f:f.write(f'\n## Current REPAIR_002_RETEST_001 RETURNED — AWAITING JARVIS\nBase {base}; frozen input manifest {mh}; plan {ph}. Independent execution complete with R2-F01 scope inconsistency and R2-F02 old-key enforcement gap; original repairs pass bounded checks. Owned server stopped;0global logouts. Tony walkthrough acceptance Director-reported, no duplicate ride. Lead/Architect certification/closeout pending; later commit bytes must match tested manifest. Canonical HANDOFFS/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_RETEST_001_REVIEW.zip.\n')
(e/'evidence-reuse.md').write_text('''# Applicability and reductions

Current independent results bind only to the frozen manifest. Base d6fe678 and sequential addendum source hashes establish exact current bytes. All184 current Jest and85 selected browser cases were rerun on owned clean3112; engine/route/presentation failures independently investigated. Engineering passing results do not override own findings.

ADDENDUM_001 package f852ff...0019e7 contains its specific copy and component/browser checks; its source bytes are unchanged by addendum002 except the shared test file's approved additive control test. ADDENDUM_002 ce6683...ec195 contains9scenario/35affected tests. Sequential source overlay/cumulative reconstruction matches all5 current paths. Reuse these named scenario checks as ENGINEERING evidence, explicitly allowed by current dispatch; C14 unknown/abandoned/declined and activation journeys also independently exercised within85 current cases. No extra addendum campaign.

Prior combined001 source24cf075/package2360f162...894c2 remains historical. Actual global logout and refresh, full account responsive sweep, and broader unchanged account business journeys are reused only after diff proof for auth/session/storage/account engine and inspection that dashboard changes are localized to Actions geometry, independently measured now. Current mocked roles and account/service tests rerun. Existing full original account geometry is not a fresh all-width PASS claim. Existing actual-zoom method reused but independently executed on current affected surfaces; old results not inherited. No old declaration/allocation PASS reused; prior defect probe retained and new bounded assertion expects repaired behavior. Director walkthrough acceptance attributed separately.
''')
shutil.copyfile('/tmp/cody-r2-report.py',a/'report.py')
print('reports written; current Jest suites',json.loads((e/'cody-r2-jest.json').read_text())['numTotalTestSuites'])
