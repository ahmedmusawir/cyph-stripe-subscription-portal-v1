from pathlib import Path
import json,hashlib,shutil
r=Path('/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1');m=r/'agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm';q=m/'QAM';e=q/'evidence/repair003';a=q/'AUTOMATION/repair003';ident=json.loads((e/'snapshot-identity.json').read_text());mh=ident['manifestSHA256'];base=ident['base'];ph=hashlib.sha256((q/'QAM_TEST_PLAN.md').read_bytes()).hexdigest();assert ph=='4432895ed0dfc8dcf2b90a9e43b0d1b5de2245d87035b27f83a8586488279597'
# Independent numeric cross-check of measured focus adjacency using recorded CSS colors.
def lum(c):
 v=[x/255 for x in c];return sum((x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4)*w for x,w in zip(v,[.2126,.7152,.0722]))
def ratio(a,b):
 x,y=lum(a),lum(b);return (max(x,y)+.05)/(min(x,y)+.05)
ring=[249,112,78];outer=[.1*w+.9*c for w,c in zip([247,179,34],[59,66,78])];(e/'focus-adjacency-validation.json').write_text(json.dumps({'ringRGB':ring,'outerCompositedRGB':outer,'innerOffsetRGB':[47,53,65],'outerRatio':ratio(ring,outer),'innerRatio':ratio(ring,[47,53,65]),'disposition':'outer below3; inner passes3; Lead applicability review, not rounded PASS'},indent=2))
report=f'''# REPAIR_003 retest001 — returned for JARVIS review

## Identity and result
Base HEAD `{base}`, branch qa/ffm-abm-001-subscription-portal. Candidate is the frozen uncommitted tree including addenda001/002 and REPAIR_003, NOT the base SHA alone.

164-input manifest SHA-256 `{mh}`.
Finalized delegated plan SHA-256 `{ph}`.

Original R2-F01 and R2-F02 reproductions now pass independent retest. Remaining findings: **R3-F01 legacy-v2 edited open checkout is rebound to invented scope/price**, **R3-F02 completed activation claims an invitation to an admin added only by a later draft edit**. **R3-O03** records a borderline outer focus-ring contrast shortfall for Lead applicability review. No self-certification; JARVIS determines acceptance/severity.

## Package, freeze and authority
Current dispatch authorizes uncommitted candidate; no commit prerequisite/new Q1. Reviewed ZIP SHA-2565487998dbb98f4c8aa3b9e03db187b0586b08b3432cbedced8c1f01646bebe62 verified:79members/78indexed, complete member set, CRC, sizes and every SHA. This archive contains no source/ tree; the cumulative product/test patch was reconstructed against Git base and all15 resulting files compared byte-for-byte to working inputs. Full changed/untracked source set equals reviewed patch paths. Snapshot copies complete tracked build inputs plus required untracked source/test files; manifest includes package/lock/config/public/source/test bytes. Cumulative diff and package-verification retained. Approved plan appended and hash recorded before build/test.

Snapshot `/tmp/cody-r3-snapshot`; existing dependencies copied physically inside it, no install/change. Build configuration privately allowlists only3NEXT_PUBLIC auth/site values; no credentials/auth state supplied to app/build. Owned server3113 built only from snapshot. Rechecked all164 frozen files after run:0mismatches. Later working-tree edits are not consumed. No Git mutations or product repairs.

## Commands, attempts and independent results
All execution CWD=/tmp/cody-r3-snapshot unless absolute helper command. Build asserts explicit CWD and physical node_modules. Exact helpers/configs included in AUTOMATION/repair003; outputs in evidence/repair003.

| Command/instrument | Result | Evidence |
|---|---|---|
| npm run build |exit0,clean production build|cody-r3-build.log|
| npx tsc --noEmit (first attempt) |exit2,disposable predecessor helper imports misplaced; no product error established|cody-r3-tsc.log|
| npx tsc --noEmit --project qa-typecheck.json |exit0,original product compiler config with QA-only directories excluded|cody-r3-tsc-corrected.log;qa-typecheck.json|
| timeout180s node --max-old-space-size=512 node_modules/jest/bin/jest.js --runInBand --json --outputFile=/tmp/cody-r3-jest.json |13suites210PASS|cody-r3-jest.json/log|
| npx playwright test --config=qa.config.ts |48PASS,zero retries;4.4m public focused regression|cody-r3-browser.json/log;executed-browser-coverage.json|
| timeout120s node --max-old-space-size=512 node_modules/jest/bin/jest.js --config=qa-independent.config.cjs --runInBand --json --outputFile=/tmp/cody-r3-independent.json |44PASS/1FAIL; original23/23PASS, expanded21/22|cody-r3-independent.json/log;original-observations.jsonl;independent-observations.jsonl|
| npx playwright test --config=qa-extra.config.ts |4PASS/2FAIL;original2browser probesPASS,unmatched legacy2PASS,new migration/admin casesFAIL|cody-r3-extra.json/log;legacy-browser.json;admin-display.json|
| node /tmp/cody-r3-zoom.cjs |6actual200% checks,all reflow/keyboard restore checks pass;2raw focus shortfall observations of1control|cody-r3-zoom.json;independent-contrast.jsonl|
| node /tmp/cody-r3-focus.cjs |targeted settled check reproduces focus shortfall, no retry-for-green|focus.json,focus-css.json,focus-contrast.jsonl|

The current engineering-authored suite was independently run; engineering's adapted copies of Cody probes were NOT used as replacement evidence. Original QA service/browser helper sources were copied from retained repair002 QA lane, changing only output paths/config target. The original5service failures now pass; both original browser cases now leave edited submitted payments held.

## Scope and recovery checks
Processing/unknown×name,count,discount,admin edits: scope unchanged; advancing call refuses without state mutation; duplicate checkout denied; restore returns original pharmacies/code, original$99,original key; confirmation succeeds. Withdrawal remains false through restore, explicit reacceptance required. Unknown→nothing charged→fresh$148quote/consent/newkey current browser case passes. Processing→failed→resume/fresh quote/newkey service case passes. Original key refused after resume,replacement,JSON reload and restart path, including3repeated attempts each; valid pending same-operation replay preserves exact state. Same-page Review recovery browser generates a new key. Completed checkout scope/activation record remains unchanged after later edits; its presentation defect is separately reported.

Bounded allocation/21-store checks retained: inspected guarded extreme-count calls first;512MB heap and process timeouts; no deliberate memory exhaustion. Original QA billion-count/far-index checks pass; current browser restored/malformed count,step100,reduction/restoration and full21 distinct pharmacies/$1,079 activation pass. No new purchasing cap. Prior engineering two-worker OOM preserved; not reproduced.

## Migration provenance and findings
QA copied pure engine/dependency files directly from actual commits24cf075(R-011) andd6fe678(R-012). These predecessor engines generated synthetic fixtures via normal service calls. They were not hand-labelled as 'edited'. Shared mock fixtures/types used by those functions are compatible; predecessor service source retained, provenance hashes in legacy fixture report. Public persisted storagev2 existed across both releases, so only testing d6fe678 is insufficient.

R-012 unedited processing/unknown fixtures retain checkout_pending and bind original$99/pharmacies correctly. R-012 material edits leave draft editing; migration holds them unbound, reload stays held, no restore/confirm; unknown nothing-charged remains available. v1 migration refuses inferred declaration; explicit reacceptance works with original price. These positive/negative controls passed.

R-011 open checkout differs: setStoreCount/savePharmacy clear quote and mark editing but leave checkout pending. New bindLegacyScope unconditionally treats isOpenCheckout as bindable, so it records the edited2-store draft at recalculated$148 even though original checkout was1-store/$99. Browser v2→v3 migration renders paid action and reaches confirmed2stores/$148. This disproves the broader 'open means unedited' assumption for actual supported storagev2 history. No real payment occurred.

Completed admin display: current engine creates/pays1store with adminAssignment owner and advances to ready; savePharmacy later changes draft nomination to Replacement Admin. Checkout.scope still says owner, activation history unchanged. Browser activation nevertheless states a separate store invitation went to Replacement Admin. ActivationView obtains names/amount from paid scope but nomination from current draft. The diagnostic replacementPreview=false used a case-sensitive string against uppercase innerText and is NOT evidence of absence; screenshot also shows the new-admin preview. Primary failing assertion is the false sent-invitation claim.

## Presentation and contrast
New holds/restore tested at375/1440,both themes in current suite. Actual browser zoom uses Chrome settingsPrivate2/readback2; fixed1440physical window yields720CSS/DPR2 from1440CSS/DPR1; CDP cssVisualViewport.zoom2 corroborates. Six combinations:processing/unknown/unmatched×light/dark. Four applicable Tab→Enter restores pass; unmatched intentionally has no restore and disabled refresh. Direct Chrome screenshots capture actual viewport, not device-scale emulation.

Independent colors/ancestor alpha measurement calibrated21/1/21/21.248applicable measurements across6surfaces;2focus observations identify the same unknown/dark restore button. Ratio2.9941945 against outer warning-on-card surface, below3; settled350ms focus check repeats it. RingRGB249,112,78; outerRGB77.8,77.3,73.6; inner offsetRGB47,53,65 yields3.5926251. Text/meaningful-input samples pass. Lead must assess adjacent inner-offset separation; no rounded PASS or universal WCAG verdict. BODY tab-wrap/disabled/faded excluded with raw data retained. No Safari/full AT claim.

## Corrections, privacy and cleanup
First typecheck inadvertently included QA predecessor copies placed beside tests, whose relative pricing/validation/format imports could not resolve. Preserved failed log and copies; moved full predecessor modules into separate QA directories and used original compiler settings excluding disposable QA directories. No product/config byte changed; corrected typecheck exit0. No browser assertion weakening/retry-for-green. Focus diagnostic is investigation of an observed shortfall, which remains recorded.

0real sign-ins,0logout,0credentials used for runtime. No auth state/traces/videos. No live billing/email/provisioning/account changes. Source/mock boundary suite passes; unchanged account/auth/route evidence reused with explicit manifest diff. This is not OS-wide network capture. Public server preload produced no outbound undici auth/business events; no inference of universal egress absence. Private package scanner may read configured secret values in memory solely for leak detection, without logging values/hashes. Five selected screenshots visually inspected, all synthetic/public. Raw automatic browser error contexts removed/excluded.

Owned PID1037975/port3113 stopped after CWD verification. Anonymous profile/public-only config/helper output directories removed. Unrelated3000PID970525/3457PID40320remain listening. Frozen source/dependencies/generated build retained in/tmp for review, inactive. Prior QAM/evidence/packages preserved. Tony's accepted walkthrough remains attributed; no duplicate ride. Coach confirmations pending, no invented answers. JARVIS/Architect decisions remain ungranted. Later commit binding requires every manifest byte and input membership to match via read-only helper; not a prerequisite to this retest.
'''
(q/'QAM_EXECUTION_REPORT.md').write_text(report)
(q/'FINDINGS.md').write_text('''# REPAIR_003 independent findings — JARVIS adjudication

Snapshot identity and exact plan in execution report. No product repair or certification.

## Original R2-F01 — original cases PASS, migration exception remains
Independent original processing/unknown×pharmacy/count service negatives all pass; original two normal-browser cases hold rather than confirming edited scope. Recorded scope stays unchanged; restore-original and typed original values/current engineering assertions pass. New scope/discount/admin/withdrawal controls also pass. R3-F01 below is a distinct supported-legacy migration failure, not a claim that the repaired current-origin cases still fail.

## Original R2-F02 — PASS tested paths
Original closed-key service failure passes. Old keys refused after resume, reload, replacement and restart; fresh keys work; valid same-operation replay returns identical state; repeated3attempts refused; same-page Review recovery browser passes. No actual duplicate charge or real business write.

## R3-F01 — Legacy v2 open checkout rebound to edited scope/price
Acceptance failure, AC10/13 migration binding; severity for Lead. Actual24cf075 engine: open1store/$99checkout → count2 → enter second valid pharmacy. It retains status pending, marks draft editing and clears quote. That exact synthetic persistedv2 state is loaded into current candidate. bindLegacyScope treats any open checkout as unedited and fabricates scope from edited draft/listPrice:2stores/$148. Paid action becomes available; browser reaches confirmed2stores/$148. Service expects no invented scope and fails; browser assertion independently fails. Not a fabricated state flag and not a real payment.
Evidence: qa-independent/migration-recovery.test.ts with actual predecessor source; cody-r3-independent-observations.jsonl; legacy-open-edited-fixture.json; legacy-browser.json/png. Correct R-012 unedited and edited/missing-scope controls also pass, so failure is not generic hydration failure. Storagev2 spans R-011 and R-012; R-012's stronger invalidation invariant cannot be assumed for all oldv2 data.

## R3-F02 — Completed activation misstates nominated-admin invitation
Acceptance failure, AC11/12 and explicit display coherence check; severity for Lead. Current paid/ready1store scope adminAssignment owner remains unchanged after draft admin becomes Replacement Admin. UI says a separate store invitation went to Replacement Admin, although that person is absent from the paid scope. It also renders that admin's preview (visible screenshot; case-sensitive diagnostic boolean does not detect uppercase text). ActivationView selects admin from draft.pharmacies while paid names/amount use checkout.scope. Engine history object preservation passes; display consistency fails. No email actually sent.
Evidence: completed-admin-fixture.json, admin-display.json/png, extra browser hard assertion.

## R3-O03 — Borderline outer focus-ring contrast on dark unknown hold
Restore button ring vs outer warning-on-card background measures2.9941945:1 (<3), two repeated focus samples;350ms settled diagnostic reproduces. Independent numeric cross-check uses recorded CSS ringRGB249,112,78 over warning alpha surfaceRGB77.8,77.3,73.6. Inner ring-offset contrast3.5926251:1 passes. Record as threshold observation requiring Lead adjacency/applicability adjudication, not universal accessibility failure or rounded PASS. Keyboard restore and actual200% reflow pass. Contrast helper controls validated; raw/focused CSS/screenshot preserved.

## Retained history and limits
Original two-worker engineering OOM log retained: PIDs928982/928983, registration and checkout-hold workers; single-worker wording remains unsupported. No OOM attempted by QA. Earlier repair failures remain in immutable prior packages/prior reports. Current typecheck helper-path failure preserved, corrected without product edits. No real login/logout or unrelated account campaign. Tony manual acceptance remains recorded; Lead certificate/Architect closeout not granted.
''')
rows=[('R3-01 / originalR2-F01 / AC10,13','PASS originals; FAIL migration/display exceptions','original23service file includes4scope negatives;2original browser cases pass;expanded processing/unknown×name/count/code/admin refuses unchanged state,scope retained,restore$99/originalkey succeeds'),('R3-02 / originalR2-F02 / AC09,10,13','PASS tested paths','old key refused after resume/replacement/reload/restart3repeats;freshkey/validreplay;unknown nothingcharged→fresh148quote/consent/key browser;processingfailed→freshrecovery service'),('R3-03 / migration / AC07,10,13','FAIL R3-F01','actualR011/R012 engines;v1declaration andR012unedited binding pass;R012edited unmatched reload passes;R011edited open v2 invents2store/$148 scope'),('Completed history/admin / AC11,12','DATA PASS; DISPLAY FAIL R3-F02','scope/activation record unchanged;UI incorrectly claims new-admin invitation from currentdraft'),('R3-04 / AC05,27','PASS baseline','cleanbuild/typecheckcorrected;13suites210Jest;48focusedbrowser;21store/$1079,step100,malformed/bounded count;original44pass1fail expanded service total45'),('R3-05 / AC21–23','PASS reflow/keyboard; ADJUDICATE focus','375/1440both themes;6actualzoom2checks;4TabEnterrestore;248contrast measurements2samples sameborderlinefocuscontrol'),('R3-06 / AC01–03,15–19,24–26','REUSED unchanged account/auth/routes; current unit boundaries PASS','priorR2snapshotmanifest diff13changed/new paths allpublicregistration;accountengine/layout/auth/Stripequerygate/styles unchanged;prior85browser/2realadmin and originalRetry/HTML-RSC evidence applicable,not rerun'),('AC04,06,06a,08,09,20,29','PASS affected regression; findings above constrain acceptance','registration/quote/consent/declaration/activation/scenarios/hold paths in48cases;current service suite and previousunchangedcopyscope reuse'),('AC28','PACKAGE CHECKS asserted by helper','inputmanifest/plan,attempts,privacypositivecontrols,FILE_INDEXhashes,ZIPCRC/identicalcopy'),('AC30','DIRECTOR ACCEPTANCE RECORDED; LEAD/ARCHITECT PENDING','no duplicate full ride,no certification;Coach questionspending')]
(q/'AC_EVIDENCE_MATRIX.md').write_text('# Focused REPAIR_003 coverage\n\nManifest '+mh+'; plan '+ph+'. Current exact test titles/statuses in executed-browser-coverage.json and Jest JSON; historical matrix preserved under AUTOMATION/repair003/prior-AC_EVIDENCE_MATRIX.md.\n\n| Scope / AC | Result | Evidence / limit |\n|---|---|---|\n'+'\n'.join('| '+' | '.join(x)+' |' for x in rows)+'\n')
(q/'QAM_CLEANUP_REPORT.md').write_text('''# REPAIR_003 owned-resource cleanup

Owned PID1037975/:3113 CWD verified before SIGTERM; port closed. Unrelated PID970525/:3000 and PID40320/:3457 alive/listening. All browser contexts closed; anonymous zoom profile, raw Playwright output/error contexts and public-only scratch.env.local removed. No real sign-ins/logouts, no auth-state files/traces/videos or credential use in runtime. Leak scanner uses secret values privately only for export validation. Frozen source/dependencies/generated build remain inactive in/tmp;164input hashes match manifest after execution. No product/Git/dependency/account mutation.

Five selected public/synthetic images visually inspected; export excludes secrets/auth/env/dependencies/generated outputs/raw automatic error contexts and nested oldZIPs. Preserve prior failures and two-worker OOM log. FILE_INDEX and privacy-validation plus external receipt establish exported checks. Later commit-to-input verification helper reads only and cannot certify.
''')
(q/'REVIEW_START_HERE.md').write_text(f'''# JARVIS — REPAIR_003 retest001

Base {base}; frozen manifest `{mh}`; plan `{ph}`. Original R2-F01/R2-F02 repros pass. R3-F01 legacy-v2 invented scope and R3-F02 completed-admin display fail; R3-O03 focus contrast requires applicability review. Read report, findings, AC matrix and indexed evidence/repair003. No self-certification; Tony walkthrough acceptance already recorded. Later commit must match tested manifest.
''')
(e/'evidence-reuse.md').write_text('''# Diff-based applicability

Prior tested R2 manifestcc3518f7...5213a, base d6fe678+addenda, packagea38718e2...6bd80. Current manifest diff-based-reuse.json lists13 changed/new files: registration engine/store/types, public registration/activation views and tests only. Existing account business engine/layout, auth/session/role/storage helpers, protected layouts, shared Stripe query route, CSS/tokens,dependency/config bytes unchanged. Thus prior real-admin/auth/role/Retry/StripeHTML-RSC/accountlayout evidence is applicable; it is labelled REUSED, not fresh live PASS. New current210Jest also reruns mocked role/account/boundary tests. No unnecessary login/logout/account campaign.

Original Cody probes copied directly from QA repair002 with only output/config adaptation and executed on new frozen target; engineering-adapted copies remain engineering evidence only. Current48browser regression chosen for changed public engine/holds/recovery, including both addenda/21stores. New independent45service tests plus6extra browser cases expand migration/history. Actualzoom method reused, results collected anew. Prior OOM/failures retained, no automatic inherited acceptance. Tony manual acceptance is reported source, not independent product test.
''')
with (q/'QAM_STATE.md').open('a') as f:f.write(f'\n## Current REPAIR_003_RETEST_001 RETURNED — AWAITING JARVIS\nBase {base}; manifest {mh}; plan {ph}. Original2findings pass reproductions; R3-F01legacy migration/R3-F02admin display remain; R3-O03focusadjacency review. Owned resources stopped;0signins/logouts. Canonical HANDOFFS/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_003_RETEST_001_REVIEW.zip. Tony acceptance retained; no certification.\n')
(e/'legacy-fixture-provenance.json').write_text(json.dumps({'r011Commit':'24cf075dc3c6252bc22712b067cbf9a8680f24fa','r012Commit':base,'mechanism':'git show exact src/services/portal modules into QA-only predecessor dirs; calls use ordinary engine transitions; serialized synthetic storage fixture','sources':[{'path':str(p.relative_to(a)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in (a/'qa-predecessors').rglob('*.ts')]},indent=2))
shutil.copyfile('/tmp/cody-r3-report.py',a/'report.py');print('reports written')
