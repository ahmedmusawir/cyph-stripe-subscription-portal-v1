from pathlib import Path
import json,hashlib,shutil
r=Path('/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1');m=r/'agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm';q=m/'QAM';e=q/'evidence/repair004';a=q/'AUTOMATION/repair004';ident=json.loads((e/'snapshot-identity.json').read_text());base=ident['base'];mh=ident['manifestSHA256'];ph=hashlib.sha256((q/'QAM_TEST_PLAN.md').read_bytes()).hexdigest();assert ph=='2680ff768874f8cbd5c652077c3e987a651ddffa31616f3406c832b0d845b133'
report=f'''# Combined REPAIR_004 + ADDENDUM_001 independent retest001

## Identity and outcome for JARVIS
Base HEAD `{base}` on qa/ffm-abm-001-subscription-portal. Candidate is the explicitly authorized uncommitted frozen snapshot, including the earlier addenda/repairs and combined REPAIR_004/ADDENDUM_001; the base SHA alone does not identify it.

166-input manifest SHA-256 `{mh}`.
Finalized delegated test-plan SHA-256 `{ph}`.

**Original R3-F01, R3-F02 and R3-O03 reproductions pass in tested scope.** Ordinary current-origin R4-N01 Review/stale-control/resume/restart/second-checkout guards also pass. Independent full-transition inspection found two remaining supported-legacy mixed-state exceptions: **R4-F01 stale refresh resurrects a nothing-charged checkout as paid**, and **R4-F02 an unknown checkout with a retained failed-payment flag can be discarded and replaced**. These are observations for Lead adjudication, not certification or a claim of live money movement.

## Verification, freeze and approval
Both reviewed ZIPs validated exact dispatch SHA-256, complete member sets, CRC, size and per-member hashes:REPAIR_004128/127indexed, ADDENDUM80/79indexed. Main cumulative patch reconstructed against Git base; addendum incremental patch applied to that result equals final cumulative patch. All20changed/untracked product/test paths match frozen working bytes. No unrelated product/config/dependency changes. Full cumulative diff, manifest and package-verification included.

Two disposable reconstruction attempts failed before execution: first used strip1 on non-Git diff-ruN paths; second lacked an unchanged base EmailPreview file needed by the addendum. Corrected to strip0 and hydrated unchanged files from Git. Both logs retained, only owned verification directories rebuilt; packages/product untouched. Then plan addendum/approval/manifest identities recorded before build/test. No planning stop, new Q1 or commit prerequisite.

Frozen root `/tmp/cody-r4-snapshot`, physical existing node_modules copied inside, no install/dependency edits. Build privately allowlisted three NEXT_PUBLIC auth/site values; no QA credentials/auth state in app/build env. Explicit scratch CWD used; only owned Next production server3114 built/served. All166input hashes rechecked after execution with0mismatches; subsequent working-tree edits not consumed. No Git mutations or product repairs.

## Commands and results
All test commands CWD=/tmp/cody-r4-snapshot. Exact QA source/config in AUTOMATION/repair004; raw sanitized outputs under evidence/repair004.

| Command / instrument | Observed result | Evidence |
|---|---|---|
| npm run build |exit0 clean production build|cody-r4-build.log|
| npx tsc --noEmit before QA modules added |exit0 product typecheck|cody-r4-tsc.log|
| timeout180s node --max-old-space-size=512 node_modules/jest/bin/jest.js --runInBand --json --outputFile=/tmp/cody-r4-jest.json |13suites233PASS|cody-r4-jest.json/log|
| npx playwright test --config=qa.config.ts |62PASS,0skipped/retries/flaky;6.0m|cody-r4-browser.json/log;executed-browser-coverage.json|
| timeout120s node --max-old-space-size=512 node_modules/jest/bin/jest.js --config=qa-independent.config.cjs --runInBand --testNamePattern='^(?!.*nonpayment outcomes remain available).*' --json --outputFile=/tmp/cody-r4-original-independent.json |44PASS,1explicitly superseded case excluded|cody-r4-original-independent.json/log|
| npx playwright test --config=qa-extra.config.ts |6PASS: original migration/admin/submitted scope probes|cody-r4-extra.json/log|
| timeout120s node --max-old-space-size=512 node_modules/jest/bin/jest.js --config=qa-transition.config.cjs --runInBand --json --outputFile=/tmp/cody-r4-transitions.json |35PASS/2FAIL across37cases|cody-r4-transitions.json/log;transition-observations.jsonl|
| Same Jest config --testNamePattern='discarded legacy unknown' after adding one targeted probe |1FAIL,37notselected; proves second checkout accepted|cody-r4-second-checkout.json/log|
| Same Jest config --runTestsByPath qa-transition/predecessor-controls.test.ts |8PASS actual predecessor/v1/seed controls|cody-r4-predecessor-controls.json/log|
| npx playwright test --config=qa-transition-browser.config.ts |1PASS/4FAIL:2product failures,2invalid C07 name expectations|cody-r4-transition-browser.json/log|
| npx playwright test --config=qa-admin-corrected.config.ts |2PASS; only affected greeting/recipient checks rerun|cody-r4-admin-corrected.json/log|
| node /tmp/cody-r4-zoom.cjs |10actual200% checks,0sampled contrast shortfalls, keyboard actions pass|cody-r4-zoom.json;independent-contrast.jsonl;focus-css/adjacency|
| node /tmp/cody-r4-alert-surfaces.cjs |16controlled production-CSS tone/background/theme samples pass|cody-r4-alert-surfaces.json/log|

Engineering runs of copied QA probes were not inherited as results. Independent original probes copied from Cody's retained QA lane with only output/config adaptation and executed here. One old test expected submitted nonpayment outcomes to remain allowed under pre-addendum semantics. Its original source and evidence remain intact; explicitly excluded as superseded by the current release requiring every resolveCheckout outcome to refuse submitted payments. New independent tests enforce the stricter rule for processing/unknown×all5outcomes with state unchanged. This exclusion is not a PASS and no assertion was weakened to obtain green.

## Original findings and covered controls
R3-F01 actualR011engine edited-open failure now stays unbound and unpayable, no invented scope/price. Actual R011/R012 unedited open/processing/unknown retained-quote controls bind$99; edited R011/R012 submitted records stay unmatched. V1 discounted quote binds$89 before clearing quote and keeps declaration false; seeded old record with absent quote binds only exact deterministic seed. Reload holds and unknown→nothing charged→freshquote/consent/key pass.

R3-F02 original completed-admin case passes. Paid scope keeps names/admin/price; later draft nomination doesn't appear as an invitation claim. Positive covered-admin/sent and failed-email controls pass. C07 owner/new-link omit edited names/count/price for completed missing scope; status/key preserved. Checkout-unfinished explicitly describes saved draft, per contract. No claim that previews send email. Completed no-scope history displays honest unavailable wording without payment prompt.

R3-O03 independent settled focus measurements pass both adjacent surfaces: darkunknownrestore outer3.330077/inner4.859231; lightunknown outer4.492274/inner4.020557. Processing outer3.990427dark/3.598500light. Ten actual zoom combinations cover processing/unknown holds, unmatched, unavailable history and submittedReview×both themes. Fixed1440physical browser baseline1440CSS/DPR1→720CSS/DPR2; Chrome setting/readback2 and CDP zoom2. Four Tab→Enterrestore and two status-link keyboard actions pass. Other surfaces intentionally lack restore.502applicable raw-derived contrast samples/542raw,0shortfalls; BODYwrap/disabled/faded excluded with raw preserved. Calibration21/1/21/21. Additional16controlledCSS samples cover4Alerttones×page/card×themes, minouter3.29694; this bounds shared Alert style reuse but is not fresh signed-in account evidence. No universal WCAG/AT/Safari certification.

Current-origin processing/unknown survive Review,Back,reload,directstand-in,all stale resolveCheckout outcomes,resume/restart,replay/newkey attempts. Count/pharmacy/owner/quote/discount edits keep checkout/activation records. Valid open replay/cancel, processingconfirm/failure, unknownpaid/nothingcharged,freshquote/consent/spent-key recovery and paidhistory pass. Demo Load/Reset intentionally replace synthetic state and were not treated as customer recovery.

Bounded allocation probes inspected before running; heap512MB/process timeouts; no RAM-exhaustion attempt. Current suite and original QA probes retain billion-count/far-index bounds, malformed/restored controls,step100,reduction/restoration and complete21distinct pharmacies/$1,079 activation. Prior two-worker engineering OOM log preserved, not rerun.

## Remaining transition failures and provenance
QA's actual predecessor pure engine atd6fe678(R-012) creates the mixed states through ordinary service calls, not by inventing flags. They are valid historical storev2 payloads. Current migration binds retained original quote/scope correctly; remaining failures occur after migration/current legal recovery.

R4-F01: old processing→unknown retains activation.pending. Current unknown→nothingcharged sets checkout.abandoned but leaves activation.pending. Direct/stale activation refresh then returns success and makes checkout.paid/payment.confirmed under the same key. Both service and browser reproduce. Browser offers Refresh status on direct activation and confirms after click. No new payment occurred; this is contradictory terminal/history state.

R4-F02: old processing→genuinefailed→staleunknown yields checkout.unknown with activation.failed. Current isSubmitted is true, but resumeSignup accepts activation.failed and clears both records. Browser activation's Try payment again reproduces null records/fresh$99quote. Extra service probe confirms a new key opens another checkout. Because the historical precursor includes a genuine failure, this is not proof of actual duplicate financial collection; the violated rule is that a record still classified unknown/submitted must not be discarded/made payable without authoritative resolution. JARVIS decides severity/disposition.

## Corrections and limitations
Two C07 checks initially expected full name Original Admin inside a preview that intentionally greets first name Original. Activation full-name checks had passed; recipient coherence remained unresolved. Corrected only the affected helper to assert the exact first-name greeting, originalmaskedrecipient and absence of replacementmaskedrecipient. Both pass. Original4failed browser record is preserved with2product/2instrument failures distinguished; no product change, soft assertion or retry-for-green.

Actual runtime used0real sign-ins,0logout,0credentials/auth state. Leak scanner may privately read configured values solely to detect export leaks; values/hashes not retained. No traces/videos/raw auth artifacts. Four selected screenshots visually inspected, public synthetic only. App source/mock boundary tests and diff-based reuse support mock-only scope; this is not OS-wide egress capture. Unchanged auth,accountbusiness,protectedroute/querycode and dependency/config inputs justify prior account/admin/Retry/StripeHTML-RSC evidence reuse. Shared Alert change is explicitly bounded by current controlled measurements; no fresh full account campaign implied.

Owned PID1287183/port3114 stopped after CWD check; profile, public-only env and raw browser output/error contexts removed. Existing3000PID970525/3457PID40320remain alive/listening. Frozen source/dependencies/build remain inactive in/tmp for review; allmanifestbytes match. PriorQAMrecords/packages/failures preserved. Tony's manual acceptance stays Director-reported, no duplicate ride; Coach questions pending without invented answers. JARVIS/Architect decisions ungranted. Later commit-to-snapshot helper compares every path/hash and extra inputs before any certification binding, not a prerequisite to this run.
'''
(q/'QAM_EXECUTION_REPORT.md').write_text(report)
(q/'FINDINGS.md').write_text('''# REPAIR_004 combined retest findings — JARVIS adjudication

Exact frozen identity/plan in execution report. No self-certification.

## Original findings
R3-F01 legacy edited-open migration: PASS independently rerun actualR011 fixture; no invented scope/price or paid action. Retained quote/seed, v1, actualR011/R012 edited/unedited and reload/recovery controls pass.
R3-F02 completed-admin display: PASS original browser failure; covered names/admin/price and email-sent conditions correct in tested activation/C07 cases. Missing-scope completed history keeps records/status while omitting edited names/count/amount.
R3-O03 focus: PASS sampled both inner/outer adjacencies, both themes; darkunknownrestore3.330077outer/4.859231inner. Actual200%/keyboard pass; no blanket accessibility certificate.
R4-N01 current-origin Review escape and guarded service paths: PASS ordinary processing/unknown cases. Historical mixed-state residuals below remain open.

## R4-F01 — Stale refresh resurrects a nothing-charged historical checkout
Acceptance failure for AC10/11/13 transition/history consistency; Lead owns severity.
Actual predecessor d6fe678 engine: open→processing→unknown, retaining activation.pending. Current bindLegacyScope binds genuine original quote. Current resolveUnknownPayment(not_charged) makes checkout.abandoned, but activation remains pending. Calling refreshActivation accepts it and makes checkout.paid/payment.confirmed with originalkey. Browser direct /demo/activation offers Refresh status and reproduces. This is reachable after a legitimate current nothing-charged action on supported legacy state, not a forged scope. No real payment occurs; app invents a confirmed outcome contrary to the recorded terminal resolution.
Evidence: transition-observations.jsonl not-charged-stale-refresh; notcharged-stale-fixture.json; stale-refresh-browser.json/png; independent hard failures. refreshActivation checks pending activation/scope but does not require a still-processing checkout.

## R4-F02 — Unknown historical record discarded via retained failed flag, permits new checkout
Acceptance failure under explicit submitted-payment protection; Lead owns severity and historical-state interpretation.
Actual predecessor d6fe678 engine: processing→payment_failed refresh→stale resolveCheckout(unknown). State has checkout.unknown and activation.failed. Current isSubmitted=true. resumeSignup nevertheless accepts because activation.failed satisfies its existing recovery condition; checkout/activation become null. Current browser activation exposes Try payment again; click leaves a fresh$99Review. Independent follow-up startCheckout(newkey) is accepted. restart/start/outcome guards correctly refuse the original unknown state, but this resume path bypasses them.
The genuinefailed precursor means this does not prove actual money is in flight or a live duplicate charge. It proves a record still classified unknown/submitted can be discarded without unknownpaid/nothingcharged resolution, violating the released guard rule. State must not silently select one conflicting historical flag as authority. Evidence: legacy-unknown-failed-resume and legacy-unknown-second-checkout rows; unknown-failed-fixture.json; unknown-resume-browser.json/png.

## Attempt dispositions
- Preflight patch failures: wrong strip level, then missing unchanged base EmailPreview; both confined to disposable verification roots and corrected before execution.
- C07 full-name expectation invalid for first-name greeting;2initial helper failures corrected to exact greeting+maskedrecipient,2PASS. Not product findings.
- One pre-addendum assertion allowed submitted nonpayment outcomes; source/evidence preserved, explicitly superseded/excluded. New10processing/unknown×outcome refusal tests enforce current stronger requirement; no safety assertion weakened.
- Original engineering OOM log names registration and checkout-hold workers; two-worker discrepancy preserved. No OOM attempted.

No new infrastructure/auth/identity blocker. Tony acceptance remains attributed; no duplicate ride/certification. Prior failures/history retained.
''')
rows=[('R4-01 / R3-F01 / AC07,10,13','PASS originals/controls','44originalindependentPASS,1supersededexcluded;actualR011edited-openbrowserPASS;8extraactualpredecessor/v1/seedcontrolsPASS;reload unmatched and unknownrecovery'),('R4-02 / R3-F02 / AC11,12','PASS tested display/history','originaladminbrowserPASS;missing-scopeactivation/C07noeditednames/count/amount,statuspreserved;positiveoriginaladmin/sent and failed-email controlsPASS afterhelpercorrection'),('R4-03 / R3-O03 / AC21–23','PASS sampled','10actual200%route/theme checks;4TabEnterrestore+2statusnavigation;502applicableindependentcontrastsamples0shortfalls;adjacent ratiosrecorded;16controlledAlertCSSsamples'),('R4-04 / R4-N01 / AC10,11,13','PASS normal states; FAIL legacy residuals','35/37fulltransitionPASS;R4-F01staleresurrection,R4-F02unknownfailedresume;targetedsecondcheckout1FAIL;browser2productFAIL;normalReview/Back/guards in62regressionPASS'),('R4-05 / AC05,06,06a,08,09,27','PASS baseline/affected','cleanbuild,typecheck;13suites233Jest;62browser0skip;21distinctstores/$1079,step100,boundedallocation,quote/consent/declaration/scope/spentkeys'),('AC01–03,15–19,24–26','REUSED unaffected account/auth/routes + current unit tests','manifestdiffprovesunchangedauth/accountengine/layout/Stripequeryguards;Alertstylefocusboundedcurrent16fixturechecks;no newrealadminrun;rolesMOCKED'),('AC04,20,29','PASS affected scenarios / prior bounded reuse','Load/Reset harness distinct from customercontrols;activation/copy/statecoverage folded into62tests,not separateaddendumcampaign'),('AC28','PACKAGE VALIDATION','manifest/plan/attempts/index/hash/privacy+archiveCRC+identicalcopy asserted by packagehelper'),('AC30','DIRECTOR ACCEPTANCE RECORDED; LEAD/ARCHITECT PENDING','Tonyreportedacceptance;noduplicateride;Coachconfirmationspending;no certification')]
(q/'AC_EVIDENCE_MATRIX.md').write_text('# Combined REPAIR_004 retest coverage\n\nManifest '+mh+'; finalizedplan '+ph+'. Individual test titles/results: executed-browser-coverage.json and current/original/transition JSON. Earlier matrix preserved under AUTOMATION/repair004/prior-AC_EVIDENCE_MATRIX.md.\n\n| Scope | Result | Evidence / limit |\n|---|---|---|\n'+'\n'.join('| '+' | '.join(x)+' |' for x in rows)+'\n')
(q/'QAM_CLEANUP_REPORT.md').write_text('''# REPAIR_004 owned cleanup

OwnedPID1287183/:3114 stopped after/procCWD check; port closed. UnrelatedPID970525/:3000 andPID40320/:3457 remain listening. All browser contexts closed; anonymous zoom profile, public-only.env.local and raw Playwright output/error contexts removed.0runtimecredentials/sign-ins/logout/auth-state/traces/videos. Scanner may privately load known values for leak validation only. No product/Git/dependency/livebusiness/account mutation.

Frozen166source/test/config/publicinputs rechecked0mismatch. Physicaldependencies/generatedbuild retained inactive in/tmp, excluded from export. Four selected screenshots reviewed, all anonymoussynthetic. Secrets/env/savedauth/rawerrorcontexts/nestedarchives excluded. Index/memberhash/ZIPintegrity/privacypositivecontrols and receipt validate package. Latercommitbinding helper is read-only and cannot certify. OriginalQA/history and two-workerOOM retained.
''')
(q/'REVIEW_START_HERE.md').write_text(f'''# JARVIS — combined REPAIR_004/ADDENDUM_001 retest001

Base {base}; manifest `{mh}`; plan `{ph}`. Originalmigration/admin/focusfindings pass; current-origin submittedguards pass. Legacy residualR4-F01staleresurrection andR4-F02unknownfailedresume/secondcheckout need adjudication. Read report/findings/matrix; exact attempts and source in indexed evidence/repair004 and AUTOMATION/repair004. No certification; Tonyacceptance retained. Latercommit mustmatchmanifest.
''')
(e/'evidence-reuse.md').write_text('''# Applicability

PriorR3manifest61a39c96...bf502/packageef9097bd...3d436; currentdiff-based-reuse.json lists13changed/newinputs. Accountbusinessengine/layout,auth/session/role helpers,sharedStripequeryroute,dependency/config/globaltokens unchanged. Alert darklocalring changed and can affect accountalerts: independent16controlledproductionCSSsamples across4tones/page-card/themes pass, explicitly not signed-in UI evidence. Reuse priorR2/combined realadmin/auth/Retry/StripeHTML-RSC/accountgeometry observations with originalcandidate/provenance. Current233Jest rerunsmockedrole/account/boundary tests. No unnecessarysign-ins/logout or unrelatedaccountcampaign.

Both reviewed engineering packages used forauthority/sourcecorrespondence, not inheritedPASS. OriginalCody44applicable service/6browser probes independentlyexecuted;new37transition+1secondcheckout+8predecessorcases and5browser+2correctedcases expandcoverage.62currentpublicbrowser cases rerun changedengine/holds/history. One explicitlysuperseded oldoutcome-allowance test excluded and replaced by strongerall-outcome refusal coverage; originalsource retained. Newzoom/contrast independentlycollected; previousinstrumentmethod only reused. Tonyacceptance attributed separately. AllhistoricalQAM/ZIPs preserved.
''')
with (q/'QAM_STATE.md').open('a') as f:f.write(f'\n## Current REPAIR_004_RETEST_001 RETURNED — AWAITING JARVIS\nBase {base}; manifest {mh}; plan {ph}. OriginalR3findings pass; R4-N01ordinarypaths pass; legacyR4-F01staleresurrection/R4-F02unknownfailedresume+secondcheckout remain. Ownedresourcesstopped;0signins/logout. Canonical HANDOFFS/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_004_RETEST_001_REVIEW.zip. Tonyacceptance retained;no certification.\n')
shutil.copyfile('/tmp/cody-r4-report.py',a/'report.py');print('reports written')
