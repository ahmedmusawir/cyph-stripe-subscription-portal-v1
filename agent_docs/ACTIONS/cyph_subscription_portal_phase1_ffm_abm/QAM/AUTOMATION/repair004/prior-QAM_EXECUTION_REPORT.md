# REPAIR_003 retest001 — returned for JARVIS review

## Identity and result
Base HEAD `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36`, branch qa/ffm-abm-001-subscription-portal. Candidate is the frozen uncommitted tree including addenda001/002 and REPAIR_003, NOT the base SHA alone.

164-input manifest SHA-256 `61a39c96c5162cc36e027d852affeca76fcc82617c631121c3c0870af63bf502`.
Finalized delegated plan SHA-256 `4432895ed0dfc8dcf2b90a9e43b0d1b5de2245d87035b27f83a8586488279597`.

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
