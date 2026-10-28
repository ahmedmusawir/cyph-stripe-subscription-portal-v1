# Installation record — E1
27 Oct 2026 · Claudy · CWD `/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1`

- **Source:** `/home/moose/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_v1_0.zip`, SHA-256 `5c0ad43a4682d85b7b357cad50d3299df9b6c33d30f94d81e62cde35be97372e` (matches the Director value). The archive stays in Downloads as provenance and is not copied into the repo; nested ZIPs are excluded by EXPORT_CONTRACT.
- **Destination:** `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/` (RULINGS R-007). `agent_docs/ACTIONS/` was empty. `agent_docs/CURRENT_APP/` was absent, so there was no existing copy to reconcile and nothing was overwritten or deleted.
- **Method:** extract to an isolated scratch dir → verify 391/391 FILE_INDEX entries (size + SHA-256) → `cp -a` → re-verify 391/391 at the destination → then edit.
- **`FILE_INDEX.json` is unchanged.** It describes the delivered bytes. Files modified after install no longer match their FILE_INDEX hash. That is expected and is not reported as a match.
- **Current hashes:** `EVIDENCE/INSTALLED_FILE_MANIFEST.json`, which labels every file `original_unchanged` / `modified_after_install` / `added_after_install` / `original_index`.

## Files changed after install (E1)
| File | Change | Reason |
|---|---|---|
| `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` | Root path → `agent_docs/ACTIONS/…` + R-007 note | Active entry path (Director correction) |
| `README.md` | "Start here" step 1 path → ACTIONS + R-007 / install-record note | Installation instruction |
| `RULINGS.md` | Appended R-007 | Record the relocation |
| `STATE.md` | Rewritten to E1_PLAN_RETURNED | Mutable control record |
| `JOURNAL.md` | Appended E1 checkpoint | Mutable control record |
| `EXECUTION_PLAN.md` | Template replaced with the E1 plan | E1 deliverable |

## Files added after install (E1)
`EVIDENCE/E1_RECON.md`, `EVIDENCE/INSTALL_RECORD.md`, `EVIDENCE/INSTALLED_FILE_MANIFEST.json`, and the E1 review ZIP `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_E1_REVIEW_001.zip`. The ZIP is created after the manifest, so the manifest does not list it; its hash is in the external receipt.

## Deliberately unchanged (historical/frozen; mention CURRENT_APP as history or convention)
`QAM/GOVERNING/*` (FFM_PLAYBOOK, HANDOFF_PACKAGE_PLAYBOOK…), `_extraction/*`, `_design/**`, `skills/**`, `_project/**`, `ACCEPTANCE_SPEC.md`, all QAM records.

## Repository bridge (outside the module)
`agent_docs/PROJECT_POINTER.md` (new) and root `CLAUDE.md` (+6-line scoped "Active Module Pointer" section; nothing else changed). `WINDSURF.md` unchanged. No root AGENTS.md/GEMINI.md was created. No personal/global skills were touched.

## Files changed after install (R-008, 27 Oct 2026)
| File | Change | Reason |
|---|---|---|
| `RULINGS.md` | Appended R-008 | Director access ruling |
| `EXECUTION_PLAN.md` | Auth references → `getPortalStaffUser`; B3/X1 wording; interim-change note | Active plan |
| `ACCEPTANCE_SPEC.md` | R-008 amendment pointer under AC-01 (frozen text unchanged) | Director asked for the rule in the ACs |
| `QAM/HANDOFFS/ENGINEERING_HANDOFF.md` | Interim access rule for QA | QA handoff instructions |
| `STATE.md`, `JOURNAL.md`, this file, `EVIDENCE/INSTALLED_FILE_MANIFEST.json` | Checkpoint / regenerated | Mutable records |

## Files changed after install (R-009 + E2, 27 Oct 2026) — document versions
| File | Version / change |
|---|---|
| `_project/APP_BRIEF.md` | v1.1 → **v1.2**: entry from marketing; access model (R-008/R-009) replaces the staff-only harness |
| `_project/DATA_CONTRACT.md` | v1.1 → **v1.2**: gate description; public/account namespaces |
| `_project/IMPLEMENTATION_CONTRACT.md` | v1.0 → **v1.1**: §1 access model and §2 route/access table rewritten; storage, login, identities, final configuration |
| `ACCEPTANCE_SPEC.md` | v1.0 → **v1.1**: AC-01 replaced; AC-02/03/07/25/26/29 text updated; the R-008 pointer was folded into AC-01 |
| `_project/UI_SPEC.md` | 1.0 + R-009 wording ("Already subscribed? Sign in"; sign-in on real `/login`). The received `_design/` copy is unchanged |
| `EXECUTION_PLAN.md` | approved; §3/§4.1/§5/§6/§9 and the approval record rewritten for R-009 |
| `RULINGS.md` | R-008 verification record (Director-reported manual login); **R-009** |
| `README.md`, `SKILLS_MANIFEST.md`, `playbook/04-MOCKS.md`, `playbook/05-COMPONENTS.md`, `verification/BUILD_CHECKLIST.md` | access wording |
| `QAM/QAM_PREFLIGHT.md`, `QAM/QAM_RISK_REQUIREMENTS.md`, `QAM/QAM_MANIFEST.md`, `QAM/QAM_STATE.md`, `QAM/HANDOFFS/ENGINEERING_HANDOFF.md` | R-009 identities/risks; manifest and handoff filled |
| `ACCEPTANCE_LEDGER.md`, `STATE.md`, `JOURNAL.md`, `RETROSPECTIVE.md` | E2 records |
| Added: `EVIDENCE/E2_ENGINEERING_REPORT.md`, `EVIDENCE/E2_STALE_INSTRUCTION_CHECK.md`, `EVIDENCE/E2/**` (logs, Gate M jsonl, masked screenshots) | E2 evidence |
