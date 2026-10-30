from pathlib import Path
import json,subprocess,hashlib,datetime
r=Path('/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1');q=r/'agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/QAM';e=q/'evidence/combined001';a=q/'AUTOMATION/combined001'
sha='24cf075dc3c6252bc22712b067cbf9a8680f24fa';ph='a3f9a66040d20b34ca1163281e6075d9cbd36629114b52888bdcc0c839e972fc';assert hashlib.sha256((q/'QAM_TEST_PLAN.md').read_bytes()).hexdigest()==ph
report=f'''# Combined independent retest 001 — returned for JARVIS review

Candidate and execution HEAD: `{sha}`. Branch `qa/ffm-abm-001-subscription-portal`. Direct parent REPAIR_001 `0d43a4c343909467487b327e654e0650b21c9336`; parent of repair is original failed candidate `94251beab08dd26d7f56f4b8f2299a1e841892c5`. Finalized delegated plan SHA-256 `{ph}`. Approval in QAM_APPROVAL.md precedes execution. No Git mutation or product repair.

## Assessment for Lead
Independent execution is complete with acceptance failures for adjudication. The three original repair findings are no longer reproduced in their tested cases. **CR-F01: AC-06a is not met for an already pending checkout after declaration removal or legacy migration.** **CR-F02: very large valid counts eagerly allocate pharmacy objects; bounded inspection demonstrates a resource-exhaustion risk.** These observations are not certification or severity adjudication. Tony's manual walkthrough, Director acceptance and Architect closeout remain pending after Lead review.

## Identity and authority
The original identity stop is preserved and its resolution appended in HANDOFFS/COMBINED_RETEST_001_IDENTITY_STOP.md. Complete repair and amendment patches were reconstructed against their base commits in disposable directories: 27 repair paths and 18 amendment paths match the committed results byte-for-byte. The reviewed amendment archive SHA-256 matches `d98fe4ce9378f234b813246135bb10f8f799c1afcea731bc80b80754affb4088`; its Markdown index covers 42 files plus the index, all hashes verified, all 14 included source files match candidate. Raw patch-id differences reflect assembled patch format; reconstruction, not patch-id equality, establishes correspondence. Initial JSON-index assumption was corrected to the actual Markdown index; no package mutation.

RECOVERY.md/session working diffs describe engineering scratch cleanup/server stop and do not conflict with dispatch. Expected QAM changes are preserved. Product/configuration/tests match Git HEAD; scratch source, tests, config and lock bytes were checked against it. No documentation-only execution commit was created. Prior Q2 reports are preserved under AUTOMATION/combined001/history and original Q1/Q2 archives remain untouched.

## Independent execution and results
All commands ran with explicit repository or scratch CWD. Scratch `/tmp/cody-combined-24cf075` was populated from Git candidate; node_modules were physically copied, not symlinked. Existing package-lock/dependencies were used without install or lock mutation. App/build config contained only the three required NEXT_PUBLIC values; QA credentials were loaded only by helpers from the ignored, untracked repository file.

| Command / instrument (scratch CWD unless stated) | Result / evidence under evidence/combined001 |
|---|---|
| `npm run build` (clean production build) | PASS, cody-combined-build.log |
| `npx tsc --noEmit` | PASS, cody-combined-tsc.log |
| `npx jest --runInBand --json --outputFile=/tmp/cody-combined-jest.json` | 12 suites, 156 tests PASS; cody-combined-jest.json/log |
| Owned `next start` on 3110 with metadata-only undici preload | Built target independently; cody-combined-server.log, egress and cleanup records |
| `PORTAL_BASE_URL=http://localhost:3110 npx playwright test --config=qa.config.ts` | 131 PASS, zero skipped/flaky/unexpected, 13.8m; browser.json/log, executed-browser-coverage.json |
| `npx jest --config=qa-independent.config.cjs --runInBand` (owner-boundaries only at that point) | 9 PASS / 1 FAIL: legacy pending checkout; independent-jest.json/log |
| `npx jest --config=qa-independent.config.cjs --runInBand --runTestsByPath qa-independent/arithmetic.test.ts --json --outputFile=/tmp/cody-combined-arithmetic.json` | 9 PASS: independent literal pricing and exact quote-expiry boundaries |
| `npx playwright test --config=qa-extra.config.ts` | 2 locator failures; 1 premature false PASS invalidated. Originals retained |
| `npx playwright test --config=qa-extra-corrected.config.ts` | 2 PASS / 1 product FAIL: uncheck before checkout blocked; complete 21-store journey passed; migrated pending checkout bypass failed |
| `npx playwright test --config=qa-unchecked.config.ts` | 1 product FAIL: normal current UI unchecking after opening checkout still permits paid activation |
| `node /tmp/cody-combined-zoom.cjs`; settled successor | Actual browser zoom 2.0 verified on 12 route/theme combinations; original transition-race metrics preserved; settled 744 raw / 728 applicable measurements, no shortfalls |
| `node /tmp/cody-combined-final.cjs` | Real login200; refresh2 token exchanges; both clock/consent regressions; two-tab isolation; handoff retry; single global logout200; namespace2→0 and protected denial PASS |

Engineering-authored tests were independently executed on the owned clean target. Their prior passing results were not inherited as acceptance. Additional executor-authored service/browser/contrast probes exposed failures outside the current test suite. The complete individual test titles/statuses are in executed-browser-coverage.json and Jest JSON, with configurations/helpers retained for reproducibility.

## Attempts and corrections
No retries were enabled in the main browser run. Initial supplemental exact labels omitted accessible required markers; corrected selectors use owner-declaration ID with a separate exact declaration-copy assertion and compatible State label. The first legacy browser probe used immediate isVisible during checkout loading and falsely passed; that observation is INVALIDATED. Settled probing waits through the transition and asserts denial, producing a real failure. The same behavior was reproduced independently through current UI unchecking. No assertion was weakened to make these product failures pass.

The initial independent contrast pass sampled two destructive button colors during theme transitions. After a documented 400ms theme settling wait, the same 12 surfaces were remeasured. Initial raw data remains; settled results are the applicable measurements. BODY focus rows represent Tab wrapping to no control and are excluded, with raw rows preserved. Controls validate black/white=21, white/white=1 and border/focus=21. Independent settled minimum ratios: text4.5469, meaningful boundary3.0542, focus3.0668. Existing independent Q2 arithmetic helper was rerun against this candidate, not its historical verdict reused.

The previous live-build incident, rejected full-env symlink and failed Q2 helpers remain in historical Q2 reports and original archive; none is rewritten as success. This run built only in its scratch root. No unrelated server was restarted.

## Runtime and privacy limits
Four actual sign-in attempts, all successful: main worker1, zoom instruments2, final session1. Credentials/tokens stayed in helper memory; no storageState files, traces, videos or auth-bearing persistent browser profiles. The Chrome settings profile was anonymous; authenticated zoom used a separate nonpersistent context. Six account screenshots mask real staff identity; one additional screenshot is entirely anonymous synthetic checkout. All seven were visually reviewed. Numeric measurements contain classes/ratios, not account identity.

Source/import/diff review and passing boundary tests show mock fixtures behind portal services, SDK-free types, existing auth-only Supabase importers, no Stripe SDK/business client additions and no raw HTML injection. Browser journey host assertions are local-only. Server undici metadata records Supabase auth/user/role reads plus final logout, without headers, query strings or tokens. Three Supabase POST OTHER records correspond in timing/source to malformed auth-confirm checks; the allowlist omitted verify, so path attribution is source-correlated, not proven by those rows. No live Stripe/email/provisioning/business writes were introduced or observed. This is not OS-wide network capture and does not prove absence of every possible external effect.

Only the authorized real admin was used. Superadmin/member/role-less rules and account-persona payload denial tests are controlled/mocked, not additional real accounts. Actual browser 200% used Chrome settingsPrivate.setDefaultZoom(2) with readback2 and unchanged physical1440 window, CSS720/DPR2 from baseline1440/DPR1. It is not half-width emulation; the separate inherited DPR/viewport tests are geometry evidence only. No Safari, full assistive-technology audit, every87 design variant, or human Director walkthrough claim.

All safe planned categories are addressed; unresolved product failures and limits are grouped in FINDINGS/AC_EVIDENCE_MATRIX. No infrastructure/auth/identity blocker remains. Final package does not wait for Tony's ride.
'''
(q/'QAM_EXECUTION_REPORT.md').write_text(report)
findings='''# Combined retest findings — executor observations for JARVIS

## CR-F01 — Required declaration bypass through retained pending checkout (AC-06a)
**FAIL; proposed acceptance blocker.** Fresh registration correctly starts unchecked, strict invalid values reject, review deep links without pending checkout block, and ordinary owner validation works. But a pending checkout survives declaration removal.

Reproduction A (legacy): create accepted synthetic draft → quote → terms/recurring consents → pending checkout; remove declaration and add old businessRole; migrate/reload. Useful details remain, declaration becomes false and quote clears, but checkout remains pending. The stand-in renders Payment succeeds after settling; clicking it records checkout paid and payment confirmed with acceptance still false.

Reproduction B (current UI): enter accepted demo checkout → navigate owner → uncheck declaration → Continue shows error → directly revisit /demo/stripe. After loading settles the paid action is still usable; it reaches activation with false acceptance. This is not limited to forged job-title values or an old draft.

Service probe independently expected resolveCheckout to reject and failed: result.ok=true, pending→paid. Source registration.ts:440+ replays same-key pending checkout before completeness validation; resolveCheckout:481+ checks checkout existence/status but not the declaration. These are source observations supporting the behavioral evidence, not a proposed product repair. No real charge/account creation occurs.

Evidence: cody-combined-legacy-service.json; legacy-browser-settled.json; unchecked-pending.json/png; independent-jest.json; extra-corrected-results.json; unchecked-results.json and retained test sources. Initial premature legacy-browser.json result is invalidated; do not use it as PASS. Lead assigns severity/disposition.

## CR-F02 — Huge accepted count eagerly allocates objects (AC-05 / repeat-N risk)
**Risk demonstrated with a bounded instrument; Lead adjudication.** The numeric pricing guard accepts 1,000,000,000. setStoreCount loops and pushes an empty pharmacy object for every entry. An executor hook intercepted Array.push and threw after 64 allocated entries (65th attempted push), then restored the native function. No huge allocation or RAM exhaustion was attempted. Safe integer pricing does not bound practical memory consumption. UI increments normally one at a time, so the extreme case is a service/hostile state risk, not evidence of a remote server exploit. The complete ordinary 21-store flow passed with21 distinct submitted pharmacies and $1,079.00 at review/checkout/activation. Evidence: allocation.json, independent owner-boundaries test,21journey.json. No new business cap is authorized by this report.

## Original repair findings
- **Q2-F01:** not reproduced on current rendered text/control/focus cases. Independent calibrated settled scan:728 applicable measurements across12 surfaces; zero shortfalls. Current full suite separately measured33 public/account surfaces in both themes. This is sampled contrast evidence, not universal WCAG certification.
- **Q2-F02:** repaired behavior independently observed: error persists after settle/reload/navigation; explicit Retry recovers coherent2 pharmacies/$148; busy/transient coverage included.
- **Q2-F03:** repaired behavior observed for13 mixed/repeated/case/whitespace/unknown account-mode queries using anonymous HTML and RSC bodies, plus4 public positive controls. No account payload markers; retained real admin and mocked role checks labelled separately.
- **Q2-O04:** pharmacy section now lacks outer panel; right-aligned plain count, two-column mobile cards, desktop table, refresh line and pills match tested structure. Remaining visual deviations: mobile plan Actions area lacks the reference's horizontal divider and has tighter spacing/type; demo strip/expanded mock notice and new support-transfer copy change vertical height. No pixel-perfect parity claim. Screenshots and reference included for design/Lead disposition.
- **Q2-O05:** both clock controls expire an active quote and clear consent on refresh; public delta exactly1,860,000ms. Broad inert report not reproduced with active quote. No-active-quote feedback remains a source/copy usability limitation; no new feedback claim.
- **Q2-G06:**21-store full journey passes; final repair keyboard-only account add→confirm→result and mapped transients/auth-confirm now exercised. Huge allocation risk tracked as CR-F02. Role evidence remains controlled where real accounts were not authorized.

## Scope and pending acceptance
No pharmacy-software support restriction or unapproved role change was graded as implementation scope. R-011 declaration amendment only; Me/Someone else does not transfer ownership/billing/purchasing. Support transfer is explanatory copy with no self-service action; inbox/payment is not claimed to verify ownership. Synthetic preaccepted fixtures are demo scenarios, not evidence of fresh default. Director manual walkthrough after Lead review, Director acceptance, certification and Architect closeout remain PENDING. No self-certification.
'''
(q/'FINDINGS.md').write_text(findings)
rows=[
('T01 / AC-01','PASS observed','public.boundaries/public.repair; anonymous HTML/RSC; real admin; role variants MOCKED'),
('T02 / AC-02','PASS observed','final.json real login/refresh/global logout;4 successful sign-ins total'),
('T03 / AC-03','PASS with role limit','portal-access/account tests; real staff separate from synthetic account personas; nonowner payloads denied; role variants MOCKED'),
('T04 / AC-04','PASS sampled mapped states','131 browser cases; public/account repair contrast states plus loading/launch/save/quote/confirm/refresh; not all87 render variants'),
('T05 / AC-05','PASS ordinary; RISK CR-F02','1/2/3 flows and complete21 review/checkout/activation; huge-count bounded allocation probe'),
('T06 / AC-06','PASS amended scope','required/conditional pharmacy inputs, leading zeros, duplicates; job title removed; Me/Someone else retained'),
('T06a / AC-06a','FAIL CR-F01','fresh unchecked/strict values/copy/focus/persistence PASS; retained pending checkout bypass FAIL, legacy and current UI'),
('T07 / AC-07','PASS observed','back/reload, twoTabIsolation final.json, unit namespace/identity clearing MOCKED, final logout2→0'),
('T08 / AC-08','PASS observed','independent arithmetic9 plus current Jest/browser; literal99/148/197 and DEMO10;21→1079'),
('T09 / AC-09','PASS ordinary; CR-F01 pending exception','exact expiry±1ms independent tests; final both clock controls; separate terms/recurring consent; pending checkout declaration failure'),
('T10 / AC-10','FAIL declaration boundary','normal anonymous checkout/forged-success/no-card/host tests pass; CR-F01 allows false declaration pending checkout completion'),
('T11 / AC-11','PASS ordinary flows','activation waiting/provisioning/delayed/email-failed/payment-failed/ready mapped;21 ready; CR-F01 prerequisite failure remains'),
('T12 / AC-12','PASS observed','submitted owner/admin previews and21 unique names; synthetic local only'),
('T13 / AC-13','PASS ordinary recovery; CR-F01 exception','abandoned/declined/unknown/expired recovery; stale declaration pending checkout exception'),
('T14 / AC-14','PASS observed','used/expired/request-error and neutral resend paths in browser and services'),
('T15 / AC-15','PASS observed','F02 load-error persistence/Retry, counts/prices; Stripe return old summary+refreshing then coherent outcome'),
('T16 / AC-16','PASS tested paths','add draft restoration/duplicates/card handoff; not every reload permutation'),
('T17 / AC-17','PASS observed','same-key replay/sequential increment service tests and browser add flows/double click; declaration exception documented separately'),
('T18 / AC-18','PASS observed','add result attention/invite recovery service and browser; operation/store identity'),
('T19 / AC-19','PASS tested paths','manage/cancel/resume/card/no-change/error/retry; refreshing state and nonowner isolation'),
('T20 / AC-20','PASS copy/source scope','mock notices, no ownership verification claim; support transfer text; no self-service transfer'),
('T21 / AC-21','ADJUDICATE residual visual differences','screenshots+geometry; repaired cards/count/pills/refresh; Actions divider/spacing differs from reference'),
('T22 / AC-22','PASS measured geometry','both themes six responsive widths, 767/768 transition and mobile target assertions; full gate-m JSONL'),
('T23 / AC-23','PASS measured scope / limits','owner error focus and keyboard375/1440 both themes; full account Tab-only workflow;12 actual200% zoom checks;728 applicable independent contrast measures. No full AT audit'),
('T24 / AC-24','PASS source/import tests','portal-boundaries Jest; services contain mock access; types SDK-free; no docs imports'),
('T25 / AC-25','PASS within instrument limits','source/import/complete committed diff review; browser local host assertions; undici metadata. Not OS-wide network proof'),
('T26 / AC-26','PASS observed','7 malformed auth-confirm cases; removed route guards, login method, final refresh/logout; inherited auth-only services'),
('T27 / AC-27','PASS required baseline; supplementary failures','clean build/typecheck;156 current Jest;131 browser; independent18 pass1 fail plus browser bypass failures'),
('T28 / AC-28','PACKAGE VALIDATION','privacy controls, index/per-file SHA256/ZIP integrity and identical delivery asserted by package helper; receipt external'),
('T29 / AC-29','PASS ordinary demo controls; CR-F01/02 limitations','reset/hostile strings/scenarios/clock; load-error fixed; preaccepted scenario explicitly demo'),
('T30 / AC-30','PENDING','Tony manual walkthrough after retest review; Director acceptance/Architect closeout/certification not performed')]
(q/'AC_EVIDENCE_MATRIX.md').write_text('# Combined candidate AC evidence matrix\n\nCandidate '+sha+'; plan '+ph+'. Evidence paths below use evidence/combined001 (cody-combined- prefix unless stated). No inherited automatic PASS. Detailed actual test titles/results: executed-browser-coverage.json and current/independent Jest JSON; precise helpers under AUTOMATION/combined001. Historical matrix preserved under its history directory.\n\n| Test / AC | Executor observation | Coverage / evidence / limit |\n|---|---|---|\n'+'\n'.join('| '+' | '.join(row)+' |' for row in rows)+'\n')
(q/'QAM_CLEANUP_REPORT.md').write_text('''# Combined retest cleanup and retention

Owned Next PID896725/:3110 CWD verified before SIGTERM; port closed. Unrelated PID40320/:3457 remained alive/listening. Browser contexts closed by helpers. Anonymous Chrome settings profile, automatic browser output directories and scratch public-only .env.local removed. No auth-state/traces/videos created; credentials file remains ignored/untracked and untouched for Lead/Director retention decision. Four successful sign-ins, exactly one final inherited GLOBAL logout. Its global API scope can invalidate Tony’s other sessions; those sessions were not inspected. No extra logout was triggered by inherited hooks.

Scratch candidate source/dependencies and sanitized raw QA data remain in /tmp for review/reproduction; no active owned server. No QA credentials or auth state placed in those app/build files. Product/config/test bytes still match candidate; expected QAM/RECOVERY/session working records preserved. No Git mutation, product repair, account/role changes, deployment, merge or certification.

Evidence: cleanup.json, identity-final.txt, scratch-input-verification.json, final.json, network-summary.json. Export excludes credentials/env, node_modules/build outputs, browser profiles/auth state, raw automatic error contexts, Git internals and old nested archives. Retained exports are reviewed text/JSON/helpers plus visually checked synthetic or identity-masked images. Exact-value/JWT scan with positive controls and expanded-archive validation is performed by package.py; privacy-validation.json and receipt record results. Byte scanning cannot OCR; images were separately reviewed.
''')
(q/'REVIEW_START_HERE.md').write_text(f'''# JARVIS: combined retest 001 review

Candidate `{sha}`. Plan SHA-256 `{ph}`.

Read QAM_EXECUTION_REPORT.md, FINDINGS.md and AC_EVIDENCE_MATRIX.md. CR-F01 declaration bypass is an observed acceptance failure; CR-F02 is a bounded demonstrated allocation risk. Baseline build/typecheck/156 Jest/131 browser all pass, which does not override independent failed probes. Original repair cases pass in tested scope; residual visual differences require disposition.

Evidence/combined001 holds identities, all attempts, numeric measurements, masked screenshots and individual test coverage. AUTOMATION/combined001 holds the exact QA helpers, preserved prior plan, and historical Q2 reports. QAM_APPROVAL and plan amendment diff bind this execution; FILE_INDEX.json validates every package member except itself. Director ride and final certification/Architect closeout remain pending. Executor stops for JARVIS adjudication.
''')
with (q/'QAM_STATE.md').open('a') as f:f.write(f'\n## Current: COMBINED_RETEST_001 RETURNED — AWAITING JARVIS\nCandidate/execution HEAD {sha}; plan {ph}. Independent execution complete; CR-F01 acceptance failure, CR-F02 allocation risk, original repairs pass tested scope. Owned server closed; one final global logout. Canonical HANDOFFS/FFM-ABM-001-SUBSCRIPTION-PORTAL_COMBINED_RETEST_001_REVIEW.zip. Director manual walkthrough after Lead review, acceptance/certification/Architect closeout PENDING. No further execution or product/Git mutation authorized by this return. Historical entries above preserved.\n')
with (q/'QAM_APPROVAL.md').open('a') as f:f.write(f'\n### Combined execution return\nExecuted approved additive scope against {sha}, finalized plan {ph} unchanged after binding. Results returned for JARVIS adjudication, not approval/certification. Director walkthrough remains pending.\n')
(e/'evidence-reuse.md').write_text('''# Provenance and reuse

All result evidence in combined001 was collected against24cf075 on owned3110. No original Q1/Q2 or engineering PASS verdict was inherited. Original Q2 candidate94251be reports retained as failure/provenance references; original images are design references, not runtime evidence. Engineering amendment package hash/index/source comparison establishes reviewed commit correspondence, not acceptance. Current engineering test sources copied from candidate and independently executed; helper changes only absolute credential path/config outside product. Original Q2 arithmetic source and Chrome zoom method reused after inspecting current interfaces, then executed afresh. Historical build incidents/helpers remain preserved; main plan history retained. Parent repair0d43a4c is ancestry, not target. Actual target candidate/config/lock/source identity rechecked at end.
''')
(a/'report.py').write_text(Path('/tmp/cody-combined-report.py').read_text())
print('reports written')
