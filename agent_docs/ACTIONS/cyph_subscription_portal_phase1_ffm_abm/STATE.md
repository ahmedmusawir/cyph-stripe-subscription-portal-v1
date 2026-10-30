# Engineering state

## Current — 30 Oct 2026 (Asia/Dhaka): Gate Q PASS for the frozen snapshot; documentation closeout complete; bound to f272617
- **Gate Q:** **PASS** for the identified tested snapshot, with the retained nonblocking observation R5-O03 — **JARVIS / QA Lead** (`QAM/HANDOFFS/CYPH_SUBSCRIPTION_PORTAL_GATE_Q_DECISION_2026-10-30.md`, SHA-256 `0caeaf36…5f1f`, installed unchanged; transcription `QAM/QAM_CERTIFICATION.md`).
- **Accepted candidate:** branch `qa/ffm-abm-001-subscription-portal`, base HEAD `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36` **plus** the uncommitted snapshot through REPAIR_006 (168-input manifest `f7181d3c7c537e27ebc43403c8727a39084aae723ba895cb89acf7622d56e9ab`; finalized plan `9017fa6d39d86091da0a7ef7efac791be33eea4af816d568f1a5f28f6df4d987`). The base HEAD alone is not the accepted candidate. Pre-commit working-tree comparison at closeout: 168/168 match, 0 additional inputs.
- **Dispositions:** R5-F01, R5-F02 CLOSED; earlier required repairs accepted with provenance; R5-O03 ACCEPTED NONBLOCKING, NOT REPAIRED (strict assertion FAILED); C08 outside scope, inert, no live-auth certification.
- **Tony manual acceptance:** recorded (Director-reported). **Documentation closeout:** complete (`EVIDENCE/DOCUMENTATION_CLOSEOUT_001.md`).
- **Commit binding:** **BOUND** — Tony committed `f27261734fd0a3ac96253aa6c55e3b9e911125a8` (parent `d6fe678`); read-only verification 30 Oct 2026: helper match, 0 mismatches, 0 extra inputs, committed set equals the reviewed list (`QAM/HANDOFFS/COMMIT_BINDING_RECEIPT_001.md`). **Push/merge/integration:** Director-owned. **Deployment / Gate D:** NOT DONE.
- **Coach confirmations:** still pending (exact questions/answers not supplied); none invented.
- **No product work is authorized.** New implementation changes return for impact adjudication.
- Everything below (including the "E2_RETURNED" block immediately after this one and every "Next:" line in the repair blocks) is dated history, superseded by this entry.

## Superseded 30 Oct 2026 — E2 state as of 27 Oct 2026 (historical)
As of: 27 October 2026 · Asia/Dhaka
Module: FFM-ABM-001-SUBSCRIPTION-PORTAL v1.0 (installed at `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/`, RULINGS R-007)
State: **E2_RETURNED — engineering handoff complete; candidate pending Director commit**
Foundation: `1d15918dc20d80476d6a3cb017b10179f3ddf783`. Branch `ffm-abm-001-subscription-portal` @ `b1fbdda` (Director). Candidate = current uncommitted working tree.
Contract: ACCEPTANCE_SPEC v1.1; APP_BRIEF v1.2; DATA_CONTRACT v1.2; IMPLEMENTATION_CONTRACT v1.1; RULINGS R-001…R-009.
Writer: Claudy held the E2 slot; **released at E2 return**.
Owned processes: `next start -p 3001` (PID 420447, cwd = Claude session scratchpad `run-r008/`, build of this tree) — left running for the Director's walk; stop on request. Not owned: PID 40320 (:3457). `.auth/` deleted; scratch copy holds a symlink to `.env.local` only.
QAM: QAM/QAM_STATE.md — NOT_READY_FOR_Q1 until the Director commits the candidate and creates `qa/ffm-abm-001-subscription-portal`.
Latest package: `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_E2_REVIEW_001.zip` (+ Downloads copy).
Next: Tony reviews + commits (scoped `git add` list in the E2 response) → Cody Q1 at QAM/QAM_ENTRY.md.
Completed, do not repeat: E1; R-008 fix; R-009 reconciliation; E2 build + self-checks + handoff.
Safe resume point: if findings come back, start from QAM/FINDINGS.md under an explicit writer handoff.

## History
# Engineering state
As of: 27 October 2026 · Asia/Dhaka
Module: FFM-ABM-001-SUBSCRIPTION-PORTAL v1.0 (installed at `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/`, RULINGS R-007)
State: **E2 PAUSED — R-008 focused admin-login fix returned; awaiting Tony's manual admin login confirmation** (E1 plan returned earlier; branch `ffm-abm-001-subscription-portal` now exists at `b1fbdda`, Director commit)
Foundation: `1d15918dc20d80476d6a3cb017b10179f3ddf783` (resolved in E1; HEAD == foundation).
Current branch/HEAD at E1: `main` @ `1d15918…`, ahead of origin/main by 1. Unrelated dirt: 71 ` D` paths under `agent_docs/CURRENT_APP/super_admin_portal_phase1_ffm/` (Director-side; preserved).
Engineering branch: ffm-abm-001-subscription-portal — **not yet created** (E2 waits; blocker B1). QA branch: qa/ffm-abm-001-subscription-portal.
Writer: Claudy held the E1 documentation slot (module records, bridge, session/response records); **released at E1 return**. No product file written.
Contract: ACCEPTANCE_SPEC v1.0, subject contracts and RULINGS (R-001…R-007).
Engineering plan: `EXECUTION_PLAN.md`, authored E1, **NOT APPROVED**. Proposed exceptions X1–X3, amendment A-1. Blockers B1–B4.
Candidate: NOT BUILT.
QAM: QAM/QAM_STATE.md — NOT_READY_FOR_Q1.
Latest package: `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_E1_REVIEW_001.zip` (+ Downloads copy).
Owned processes/temp paths: none running. Scratch build copy and extract live in the Claude session scratchpad (outside the repo). PID 40320 on :3457 is NOT owned by this E1 (blocker B4).
Next: Architect review → Director approval (record exact instruction in EXECUTION_PLAN approval record) + B1–B4 resolutions → E2 continuous build from plan §5 step 1.
Completed, do not repeat: foundation cleanup (Director commit), Designer v1.0 review, Tony design approval and FFM release, E1 package verification/install/bridge/plan.
Safe resume point: if E2 is approved, re-verify branch/HEAD/dirt against this file, then start plan §5 step 1.

## R-008 checkpoint (27 Oct 2026)
- Director paused broader E2 for a focused fix: admin OR superadmin may enter; member denied (RULINGS R-008).
- Product files changed (uncommitted, branch `ffm-abm-001-subscription-portal` @ `b1fbdda`): see RULINGS R-008 Implementation. tsc 0; jest 4 suites / 40 tests.
- Owned process: `next start -p 3001` from the session scratchpad copy `run-r008/` (not the repo `.next`). Not owned: PID 368139 `next dev` :3000 (started 13:23, Tony's), PID 40320 :3457.
- Next: Tony logs in with his admin account at http://localhost:3001/login and confirms; then E2 resumes from plan §5 step 1.
- Tony confirmed the real admin login works (27 Oct). My :3001 server is stopped. No owned processes remain. E2 is still paused until the Director says to resume.

## REPAIR_001 — 28 Oct 2026 (RULINGS R-010; direct QA Lead → Engineer route)
- Base: failed Q2 candidate `94251be` on `qa/ffm-abm-001-subscription-portal`. Repairs Q2-F01, F02, F03, O04, G06 + self-found R1-N01 (refreshing state unreachable). Uncommitted, pending Director commit.
- Engineering self-checks: build 0 · tsc 0 · jest 11 suites 143/143 · Playwright 126/126 (logout excluded) · Gate M 136 + 84, 0 failures · contrast 33 screens × 2 themes, 0 failures. Not QA certification.
- Report: `EVIDENCE/REPAIR_001_ENGINEERING_REPORT.md` · ZIP: `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_001_REVIEW.zip`.
- Owned process left running: `next start -p 3103` (scratchpad `r001/app`); stale E2 server :3001 PID 420447 still running; :3457 PID 40320 untouched.
- Next: Tony commits → Cody retests repairs + regression → JARVIS adjudicates.

## AMENDMENT_001 — 29 Oct 2026 (RULINGS R-011; Coach decision, Director authorization)
- Base `0d43a4c` (REPAIR_001 committed). Owner-only registration: job-title select removed; required unchecked owner declaration enforced in UI and mock service; v1 drafts migrate unaccepted; Me/Someone-else and ownership-transfer copy clarified. Uncommitted, pending Director commit.
- Self-checks: build 0 · tsc 0 · jest 156/156 · Playwright 131/131 · Gate M 220/0 · contrast 0 failures. Not QA certification.
- Report `EVIDENCE/AMENDMENT_001_ENGINEERING_REPORT.md` · ZIP `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_AMENDMENT_001_REVIEW.zip`. Owned server :3104 running.
- Next: Tony commits → independent QA on the combined candidate (AC-06a + REPAIR_001 retest) → JARVIS.

## REPAIR_002 — 29 Oct 2026 (RULINGS R-012; QA Lead dispatch after Gate Q FAIL on 24cf075)
- Base `24cf075` (AMENDMENT_001 committed). CR-F01: an open checkout is closed when the declaration is withdrawn, a v1 draft is restored or the draft changes materially; replay/outcomes/unknown/activation re-check the current draft at the service; submitted payments held; paid history untouched. CR-F02: no count-sized allocation; steps fill in order. Self-found R2-N01 (count change left an open checkout payable) and R2-N02 (step 100+ route). Q2-O04 residual Actions divider. Uncommitted, pending Director commit.
- Self-checks: build 0 · tsc 0 · jest 13 suites 180/180 · Playwright 148/148 (public 100, Gate M public 13, account 35) · Gate M 236/0 · contrast 0 failures. Not QA certification.
- Report `EVIDENCE/REPAIR_002_ENGINEERING_REPORT.md` · ZIP `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_REVIEW.zip`.
- Next: JARVIS reviews → Tony commits → Cody retests → Tony walkthrough → JARVIS certification decision.
- **REPAIR_002 addendum 1 (29 Oct 2026 13:47–13:55):** Director committed REPAIR_002 as `d6fe678`. Manual-review finding fixed: C14 unknown-payment introduction ("We're checking your payment status. Please don't pay again yet."). jest 183/183 · focused Playwright 6/6 · Gate M 12/0 · contrast 0. Uncommitted on `d6fe678`, pending Director commit. Package `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_ADDENDUM_001_REVIEW.zip`.
- **REPAIR_002 addendum 2 (29 Oct 2026 14:20–14:45):** "Next activation check" was removed from the public demo bar; Load is the single selector for named activation states. This was a usability finding, not an engine failure. Checks: tsc 0, focused Jest 76/76, Playwright 9/9 focused + 35/35 affected, Gate M 180/0, contrast 0 failures. Uncommitted on `d6fe678` together with ADDENDUM_001. Package: `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_ADDENDUM_002_REVIEW.zip`.

## Final candidate preparation — Director dispatch,29 October2026
Both addenda verified against d6fe678; no further product work. Tony reports completed manual walkthrough and acceptance, including login/logout and activation-dropdown removal. Coach questions remain pending confirmations; exact questions/answers not supplied. JARVIS certification is not granted by this preparation. Next: Tony scoped commit of both addenda/engineering records, record full candidate SHA, then Lead disposition. Prior walkthrough-pending entries remain historical. Verification and exact unexecuted commit command: EVIDENCE/FINAL_CANDIDATE_PREPARATION_001.md/.json. Cody records preserved.

## REPAIR_006 — 30 Oct 2026 (RULINGS R-014 addendum 1; JARVIS dispatch after Cody's REPAIR_005 RETEST_001)
- **R5-F01:** C06 reads the phase before the activation record; paid with missing/conflicting activation shows "Payment confirmed" + setup/email status unavailable, no Refresh/retry/resend; the actual nothing-charged path shows its terminal notice. **R5-F02:** resend requires paid + agreeing activation + setup ready; others refused unchanged. **R5-O03:** recorded per Lead, not repaired.
- **Checks:** build 0, tsc 0, Jest 248/248. Cody's oracle 230/1 (1 = R5-O03; before 226/5), readers 5/5 (before 1/4). New Jest 8/8, new spec 6/6. Full public + Gate M public 156/156; Gate M 236/0; contrast 0.
- **State:** uncommitted on `d6fe678` with everything since (preserved). 0 real sign-ins. Owned :3109 stopped; scratch deleted. Package: `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_006_REVIEW.zip`.
- **Next:** JARVIS reviews → Tony commits → Cody retests R5-F01/R5-F02.

## REPAIR_005 — 30 Oct 2026 (RULINGS R-014; JARVIS dispatch after Cody's REPAIR_004 RETEST_001)
- **R4-F01/R4-F02:** one precedence read, `paymentPhase`: the checkout record governs, a stale activation flag never confirms a closed checkout, discards an unknown one or reverses a paid one. Refresh advances only processing/paid-setting-up; resume needs an abandoned/declined checkout; nothing-charged clears the activation. C06 renders from the phase. No storage bump; old flags retained.
- **Checks:** build 0, tsc 0, Jest 240/240. Cody's service probes 46/46 (before 43/3); both R4 browser cases pass (before both failed). New Jest 7/7 (before 6 failed / 1 passed); new spec 4/4 (before 3 failed / 1 passed). Matrix 224 cells, 67 allowed, 157 refusals unchanged. Affected regression: see report.
- **State:** uncommitted on `d6fe678` with everything since (preserved). 0 real sign-ins. Owned :3109 stopped; scratch deleted. Package: `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_005_REVIEW.zip`.
- **Next:** JARVIS reviews → Tony commits → Cody retests R4-F01/R4-F02 and the matrix independently.

## REPAIR_004 ADDENDUM_001 — 29 Oct 2026 (RULINGS R-013 addendum 2; JARVIS dispatch closing R4-N01)
- **R4-N01 closed (engineering self-check):** a submitted payment (processing/unknown) refuses every checkout outcome, replay, restart and new checkout at the service, with state unchanged. Review shows "You've already submitted a payment" with no "Edit my details instead" and Continue disabled. The stand-in shows no outcomes. C06 waiting no longer offers "resume checkout" (a deviation from the approved render).
- **Unavailable history:** a completed record with no provable scope keeps its status; it shows no edited names or amount and has no payment action.
- **Preserved:** failure recovery, nothing-charged recovery, open-checkout close/re-quote, R-013 binding, restore and spent keys.
- **Checks:** tsc 0, build 0, Jest 233/233. New Jest 12/12 (before 9 failed / 3 passed); new spec 7/7 (before 3 failed / 4 passed). Public + Gate M public 146/146. Gate M 224/0; contrast 0 failures.
- **State:** uncommitted on `d6fe678` with addenda 1/2, REPAIR_003 and REPAIR_004 (preserved; the REPAIR_004 ZIP is unchanged). 0 real sign-ins. Owned :3109 stopped; scratch deleted. Package: `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_004_ADDENDUM_001_REVIEW.zip`.
- **Next:** JARVIS reviews → Tony commits → Cody retests R3-F01/R3-F02/R3-O03/R4-N01 independently.

## REPAIR_004 — 29 Oct 2026 (RULINGS R-013 addendum 1; JARVIS dispatch after Cody's REPAIR_003 RETEST_001)
- **R3-F01:** stored v2 checkouts bind a scope only from retained evidence: the quote they opened with, for the same revision and count, or an unchanged demo seed. Unproven records are held with "We can't match this payment… don't pay again". The R-011 open-edited case no longer confirms.
- **R3-F02:** completed activation and the C07 previews name only the admin and pharmacies the payment covered (`coveredDetails`).
- **R3-O03:** dark-only lighter focus ring inside alerts; the restore ring measures 3.33 outer / 4.86 inner (was 2.99 / 4.37).
- **Checks:** build 0, tsc 0, Jest 221/221. Cody's probes: service 45/45 (before 44/1), browser 6/6 (before 2 failed), 200% focus 0 shortfalls (before 2). New spec 7/7 (before 5 failed). Public + Gate M public 139/139 on the final tree. Gate M 212/0; contrast 0 failures.
- **Self-found, not repaired:** R4-N01. Review's "Edit my details instead" can close a processing payment, and a second checkout can then follow. JARVIS decides.
- **State:** uncommitted on `d6fe678` with addenda 1/2 and REPAIR_003 (preserved). 0 real sign-ins. Owned :3109 stopped; scratch copies deleted. Package: `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_004_REVIEW.zip`.
- **Next:** JARVIS reviews (including R4-N01) → Tony commits → Cody retests R3-F01/R3-F02/R3-O03 independently.

## REPAIR_003 — 29 Oct 2026 (RULINGS R-013; JARVIS dispatch after Cody's REPAIR_002 RETEST_001)
- R2-F01: checkouts now record the scope they were quoted for; a processing or unknown payment can confirm only that scope. "Use the details I paid for" restores it; for unknown, "nothing charged" leads to a fresh quote and a new key. Nothing is charged again. R2-F02: keys of closed or replaced checkouts are spent and refused at `startCheckout`; open-checkout replay is unchanged; the review page renews its key. Public storage is now v3.
- Checks: build 0, tsc 0, Jest 13 suites 210/210 (R-013 block 22/22; before: 20 failed). Cody's service file 23/23 (before 18/5); Cody's browser repro 2/2 (before 2 failed). New spec 7/7. Public + Gate M public 131/132, then 1 test updated for storage v3 → that file 5/5. Gate M 204/0, contrast 0 failures.
- Uncommitted on `d6fe678` together with addenda 1 and 2 (preserved). 0 real sign-ins. Owned :3109 stopped; scratch app copies deleted. Package: `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_003_REVIEW.zip`.
- Next: JARVIS reviews → Tony commits → Cody retests R2-F01/R2-F02 independently. The FINAL_CANDIDATE_PREPARATION_001 commit scope predates this repair and no longer covers the candidate.
