# CHANGELOG

## 2026-10-30 04:59 UTC — [CC] Claude Code
- **Added:**
  - `…/QAM/HANDOFFS/CYPH_SUBSCRIPTION_PORTAL_GATE_Q_DECISION_2026-10-30.md` (JARVIS Gate Q decision, installed unchanged)
  - `…/QAM/HANDOFFS/COMMIT_BINDING_RECEIPT_001.md` (PENDING)
  - `…/EVIDENCE/DOCUMENTATION_CLOSEOUT_001.md`, `…/EVIDENCE/CLOSEOUT_001_COMMIT_PATHS.txt`, `…/EVIDENCE/CLOSEOUT_001_PATH_CLASSES.md`
  - `…/EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_DOCUMENTATION_CLOSEOUT_001_REVIEW.zip`
- **Updated:**
  - QAM: `…/QAM/QAM_CERTIFICATION.md`, `QAM_STATE.md`, `QAM_APPROVAL.md`, `REVIEW_START_HERE.md`, `FINDINGS.md`, `AC_EVIDENCE_MATRIX.md`, `QAM_CLEANUP_REPORT.md`, `HANDOFFS/ENGINEERING_HANDOFF.md`
  - Module: `…/ACCEPTANCE_LEDGER.md` (AC-30), `…/STATE.md`, `…/README.md`, `…/FFM_ENTRY.md`, `…/JOURNAL.md`
  - Root: `agent_docs/PROJECT_POINTER.md`, `RECOVERY.md`, session file
- **Reason:** documentation closeout after JARVIS / QA Lead Gate Q PASS for the frozen snapshot (manifest f7181d3c…e9ab); no product change.

## 2026-10-30 03:25 UTC — [CC] Claude Code
- **Updated:** `src/services/portal/{registration,index}.ts`, `src/components/portal/activation/ActivationView.tsx` (R-014 addendum 1: `consistentActivation`; C06 phase first; resend and `readActivation` guarded).
- **Updated:** tests `src/__tests__/portal-registration.test.ts`, `src/__tests__/portal-checkout-hold.test.tsx`, `e2e/public.repair002.spec.ts` (one assertion); **added** `e2e/public.repair006.spec.ts`.
- **Updated:** `…/RULINGS.md` (R-014 addendum 1), `…/ACCEPTANCE_SPEC.md` v1.8, `…/_project/DATA_CONTRACT.md` v1.9, `…/_project/UI_SPEC.md`, `…/ACCEPTANCE_LEDGER.md`, `…/QAM/HANDOFFS/ENGINEERING_HANDOFF.md` §9, `…/STATE.md`, `…/JOURNAL.md`, `RECOVERY.md`, session file.
- **Added:** `…/EVIDENCE/REPAIR_006_ENGINEERING_REPORT.md`, `…/EVIDENCE/REPAIR_006/`, `…/EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_006_REVIEW.zip`.
- **Reason:** JARVIS-authorized REPAIR_006 after Cody's REPAIR_005 RETEST_001 (R5-F01, R5-F02; R5-O03 recorded).

## 2026-10-30 01:34 UTC — [CC] Claude Code
- **Updated:** `src/services/portal/{registration,index}.ts`, `src/components/portal/activation/ActivationView.tsx` (R-014: `paymentPhase` precedence; refresh/resume/nothing-charged rules; C06 rendered from the phase).
- **Updated:** tests `src/__tests__/portal-registration.test.ts` (transition matrix), `src/__tests__/portal-checkout-hold.test.tsx`; **added** `e2e/public.repair005.spec.ts`.
- **Updated:** `…/RULINGS.md` (R-014), `…/ACCEPTANCE_SPEC.md` v1.7, `…/_project/DATA_CONTRACT.md` v1.8, `…/_project/UI_SPEC.md`, `…/ACCEPTANCE_LEDGER.md`, `…/QAM/HANDOFFS/ENGINEERING_HANDOFF.md` §9, `…/STATE.md`, `…/JOURNAL.md`, `RECOVERY.md`, session file.
- **Added:** `…/EVIDENCE/REPAIR_005_ENGINEERING_REPORT.md`, `…/EVIDENCE/REPAIR_005/`, `…/EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_005_REVIEW.zip`.
- **Reason:** JARVIS-authorized REPAIR_005 after Cody's REPAIR_004 RETEST_001 (R4-F01, R4-F02).

## 2026-10-29 13:34 UTC — [CC] Claude Code
- **Updated:**
  - `src/services/portal/{registration,index}.ts`
  - `src/components/portal/{register/ReviewView,handoff/CheckoutStandIn,activation/ActivationView,activation/CheckoutIncompleteView,references/EmailReferenceView,references/EmailPreview}.tsx`
  - What changed (R-013 addendum 2): submitted payments refuse checkout outcomes, replay, restart and new checkouts; Review and the stand-in show a submitted notice; waiting no longer offers "resume checkout"; unprovable completed history is shown as unavailable.
- **Updated:** tests `src/__tests__/portal-registration.test.ts`, `src/__tests__/portal-checkout-hold.test.tsx`; **added** `e2e/public.repair004-addendum.spec.ts`.
- **Updated:**
  - `…/RULINGS.md` (R-013 addendum 2)
  - `…/ACCEPTANCE_SPEC.md` v1.6
  - `…/_project/DATA_CONTRACT.md` v1.7
  - `…/_project/UI_SPEC.md`
  - `…/ACCEPTANCE_LEDGER.md`
  - `…/QAM/HANDOFFS/ENGINEERING_HANDOFF.md` §9
  - `…/STATE.md`, `…/JOURNAL.md`, `RECOVERY.md`, session file
- **Added:** `…/EVIDENCE/REPAIR_004_ADDENDUM_001_ENGINEERING_REPORT.md`, `…/EVIDENCE/REPAIR_004_ADDENDUM_001/`, `…/EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_004_ADDENDUM_001_REVIEW.zip`.
- **Reason:** JARVIS-authorized REPAIR_004 ADDENDUM_001 to close the self-found R4-N01 and the completed-legacy display limitation.

## 2026-10-29 12:50 UTC — [CC] Claude Code
- **Updated:** `src/services/portal/{registration,index}.ts`, `src/components/portal/{Alert,activation/ActivationView,handoff/CheckoutStandIn,references/EmailReferenceView}.tsx`. R-013 addendum 1: legacy binding from retained evidence only; completed display and previews from the paid scope; dark alert focus ring.
- **Updated:** tests `src/__tests__/portal-registration.test.ts`, `src/__tests__/portal-checkout-hold.test.tsx`; **added** `e2e/public.repair004.spec.ts`.
- **Updated:**
  - `…/RULINGS.md` (R-013 addendum 1)
  - `…/ACCEPTANCE_SPEC.md` v1.5 (AC-10, AC-12, AC-13)
  - `…/_project/DATA_CONTRACT.md` v1.6
  - `…/_project/UI_SPEC.md`
  - `…/ACCEPTANCE_LEDGER.md`
  - `…/QAM/HANDOFFS/ENGINEERING_HANDOFF.md` §9
  - `…/STATE.md`, `…/JOURNAL.md`, `RECOVERY.md`, session file
- **Added:** `…/EVIDENCE/REPAIR_004_ENGINEERING_REPORT.md`, `…/EVIDENCE/REPAIR_004/`, `…/EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_004_REVIEW.zip`.
- **Reason:** JARVIS-authorized REPAIR_004 after Cody's REPAIR_003 RETEST_001 (R3-F01, R3-F02, R3-O03).

## 2026-10-29 10:40 UTC — [CC] Claude Code
- **Updated:** `src/services/portal/{registration,registrationService,index}.ts`, `src/types/portal/state.ts`, `src/components/portal/{activation/ActivationView,activation/CheckoutIncompleteView,handoff/CheckoutStandIn,register/ReviewView}.tsx` (R-013: checkout scope binding, single-use checkout keys, storage v3).
- **Updated:** tests `src/__tests__/portal-registration.test.ts`, `src/__tests__/portal-checkout-hold.test.tsx`, `e2e/public.repair002.spec.ts`, `e2e/public.owner-declaration.spec.ts`; **added** `e2e/public.repair003.spec.ts`.
- **Updated:** `…/RULINGS.md` (R-013), `…/ACCEPTANCE_SPEC.md` v1.4 (AC-10, AC-13), `…/_project/DATA_CONTRACT.md` v1.5, `…/_project/UI_SPEC.md` (scope hold), `…/ACCEPTANCE_LEDGER.md`, `…/QAM/HANDOFFS/ENGINEERING_HANDOFF.md` §9, `…/STATE.md`, `…/JOURNAL.md`, `RECOVERY.md`, session file.
- **Added:** `…/EVIDENCE/REPAIR_003_ENGINEERING_REPORT.md`, `…/EVIDENCE/REPAIR_003/`, `…/EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_003_REVIEW.zip`.
- **Reason:** JARVIS-authorized REPAIR_003 after Cody's REPAIR_002 RETEST_001 (R2-F01, R2-F02).

## 2026-10-29 08:45 UTC — [CC] Claude Code
- **Updated:** `src/components/portal/PublicDemoControls.tsx` ("Next activation check" removed); tests `src/__tests__/portal-checkout-hold.test.tsx`, new `e2e/public.activation-scenarios.spec.ts`.
- **Updated:** `…/RULINGS.md` (R-012 addendum 2), `…/_project/IMPLEMENTATION_CONTRACT.md` and `…/_project/UI_SPEC.md` (demo selection), `…/QAM/HANDOFFS/ENGINEERING_HANDOFF.md` §9, `…/EVIDENCE/REPAIR_002_ENGINEERING_REPORT.md` §11, `…/STATE.md`, `…/JOURNAL.md`, `RECOVERY.md`, session file.
- **Added:** `…/EVIDENCE/REPAIR_002/addendum_002/`, `…/EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_ADDENDUM_002_REVIEW.zip`.
- **Reason:** Director observation, QA Lead authorization: simplify the activation demo controls.

## 2026-10-29 07:55 UTC — [CC] Claude Code
- **Updated:** `…/RULINGS.md` (R-012 addendum 1), `…/_project/UI_SPEC.md` (C14 unknown intro), `…/QAM/HANDOFFS/ENGINEERING_HANDOFF.md` §9, `…/EVIDENCE/REPAIR_002_ENGINEERING_REPORT.md` §10, `…/STATE.md`, `…/JOURNAL.md`, `RECOVERY.md`, session file.
- **Added:** `…/EVIDENCE/REPAIR_002/addendum_001/`, `…/EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_ADDENDUM_001_REVIEW.zip`.
- **Reason:** Director manual-review finding — contradictory payment-status wording on C14 unknown state.

## 2026-10-29 07:30 UTC — [CC] Claude Code
- **Updated:** `…/RULINGS.md` — R-012 REPAIR_002 (pending checkout respects current prerequisites; bounded repeat-N work).
- **Updated:** `…/ACCEPTANCE_SPEC.md` v1.3 (AC-05, AC-06a extended), `…/_project/DATA_CONTRACT.md` v1.4, `…/_project/UI_SPEC.md` (C05/C06/C14 hold/closed states), `…/ACCEPTANCE_LEDGER.md`, `…/QAM/HANDOFFS/ENGINEERING_HANDOFF.md` §9.
- **Added:** `…/EVIDENCE/REPAIR_002_ENGINEERING_REPORT.md`, `…/EVIDENCE/REPAIR_002/` — repair evidence.
- **Updated:** `…/STATE.md`, `…/JOURNAL.md`, `RECOVERY.md`, `agent_docs/SESSIONS/session_2026-10-29.md`.
- **Reason:** QA Lead Gate Q FAIL on 24cf075 (CR-F01, CR-F02, Q2-O04 residual).

## 2026-10-29 04:26 UTC — [CC] Claude Code
- **Updated:** `…/RULINGS.md` — R-011 owner-only registration / owner declaration (Coach decision, Director authorization).
- **Updated:** `…/ACCEPTANCE_SPEC.md` v1.2 (AC-06, new AC-06a), `…/_project/DATA_CONTRACT.md` v1.3, `…/_project/UI_SPEC.md` (C02), `…/_project/portal-contract.ts` v1.2, `…/ACCEPTANCE_LEDGER.md`, `…/QAM/HANDOFFS/ENGINEERING_HANDOFF.md` §9 — R-011 amendment.
- **Added:** `…/EVIDENCE/AMENDMENT_001_ENGINEERING_REPORT.md`, `…/EVIDENCE/AMENDMENT_001/` — amendment evidence.
- **Updated:** `…/STATE.md`, `…/JOURNAL.md`, `RECOVERY.md`, `agent_docs/SESSIONS/session_2026-10-29.md`.
- **Reason:** Coach-approved owner-only registration before final QA certification.

## 2026-10-28 10:24 UTC — [CC] Claude Code
- **Updated:** `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/RULINGS.md` — R-010 direct QA Lead → Engineer repair route.
- **Added:** `…/EVIDENCE/REPAIR_001_ENGINEERING_REPORT.md`, `…/EVIDENCE/REPAIR_001/` — REPAIR_001 evidence for Q2-F01/F02/F03/O04/G06 (+ R1-N01).
- **Updated:** `…/STATE.md`, `…/JOURNAL.md`, `RECOVERY.md`, `agent_docs/SESSIONS/session_2026-10-28.md` — repair status.
- **Reason:** QA Lead repair assignment after Q2 (Gate Q FAIL).

## 2026-10-27 07:00 UTC — [CC] Claude Code
- **Updated:** `CLAUDE.md` — added a scoped "Active Module Pointer" section (routing only; all rules unchanged).
- **Added:** `agent_docs/PROJECT_POINTER.md` — active-module pointer for FFM-ABM-001-SUBSCRIPTION-PORTAL (ACTIONS location).
- **Updated:** `RECOVERY.md` — active pointer block for E1.
- **Reason:** E1 documentation bridge authorized by the Director's E1 dispatch (module FFM_ENTRY "Documentation bridge").

## 2026-10-27 08:35 UTC — [CC] Claude Code
- **Updated:** `RECOVERY.md` — R-008 admin-login fix status; temporary-gate standing rule now admin OR superadmin.
- **Updated:** module `RULINGS.md` (R-008), `EXECUTION_PLAN.md`, `ACCEPTANCE_SPEC.md` (AC-01 amendment pointer), `QAM/HANDOFFS/ENGINEERING_HANDOFF.md`, `STATE.md`, `JOURNAL.md`, `EVIDENCE/INSTALL_RECORD.md`, `EVIDENCE/INSTALLED_FILE_MANIFEST.json`.
- **Reason:** Director ruling — existing admins must log in; superadmin retained; members denied.

## 2026-10-27 10:01 UTC — [CC] Claude Code
- **Updated:** module `RULINGS.md` (R-008 verification record, R-009), `_project/APP_BRIEF.md` v1.2, `_project/DATA_CONTRACT.md` v1.2, `_project/IMPLEMENTATION_CONTRACT.md` v1.1, `ACCEPTANCE_SPEC.md` v1.1, `_project/UI_SPEC.md` (sign-in wording), `EXECUTION_PLAN.md`, `README.md`, `SKILLS_MANIFEST.md`, `playbook/04,05`, `verification/BUILD_CHECKLIST.md`, QAM preflight/risks/manifest/state/handoff, ledger/STATE/JOURNAL/RETROSPECTIVE, EVIDENCE (E2 report, stale check, logs), install record + manifest.
- **Updated:** `RECOVERY.md` — E2 status and access standing rule.
- **Reason:** Director R-009 dispatch (public entry; admin/superadmin account management) and E2 completion.
