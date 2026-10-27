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
