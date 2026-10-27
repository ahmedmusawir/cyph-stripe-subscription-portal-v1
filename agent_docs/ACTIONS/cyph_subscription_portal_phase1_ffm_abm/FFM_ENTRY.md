# FFM entry — FFM-ABM-001-SUBSCRIPTION-PORTAL
Version 1.0 · 27 October 2026 · Asia/Dhaka

## Read order
1. Repository root instructions and recovery pointer (never copy credential values); this module's `STATE.md` and `RULINGS.md`.
2. `_project/APP_BRIEF.md`, `_project/DATA_CONTRACT.md`, `_project/IMPLEMENTATION_CONTRACT.md`, `_project/portal-contract.ts`.
3. `_project/UI_SPEC.md`, `_design/approved_v1_0/COMPONENT_MANIFEST.md`, approved tokens and relevant HTML/PNG examples.
4. `ACCEPTANCE_SPEC.md`, `SKILLS_MANIFEST.md`, `playbook/00-OVERVIEW.md`, `verification/PHASE_GATES.md`.
5. `QAM/QAM_PREFLIGHT.md`, `QAM/QAM_RISK_REQUIREMENTS.md`, `QAM/QAM_MANIFEST.md`, `QAM/HANDOFFS/ENGINEERING_HANDOFF.md`.
6. `_extraction/README.md` and the current recon/cleanup; refresh only changed facts during E1.

## Dispatch
- Initial state: E1, planning. Verify repo/branch/HEAD/dirty paths, foundation ancestry, actual package versions, existing primitives, auth gate, available tests and ignored credentials. Write one complete `EXECUTION_PLAN.md`, facts in `EVIDENCE/E1_RECON.md`, update STATE and return the plan. Stop for Architect review/Director approval before product changes.
- E2: read the recorded plan approval, acquire the sole engineering writer slot, implement all accepted scope, verify, fix in-scope failures and finish the factual handoff without routine milestone stops.
- Resumption: compare actual tree/HEAD to STATE. Resume the last unfinished action; do not restart approved planning, cleanup or completed QA.
- QA assignment: route to QAM; do not continue Engineering under a QA label.

## Documentation bridge (E1 authorized)
Install this package without overwriting an existing divergent copy. Add a scoped active-module pointer to the existing root instruction file(s), preserving all unrelated rules. Prefer `agent_docs/PROJECT_POINTER.md`; root CLAUDE/AGENTS must actually reference it. If that pointer is in use, preserve it and reconcile the active entry instead of blindly replacing. Pointer identifies this exact module and `FFM_ENTRY.md`, and routes QA separately. Record the actual launch CWD and read sequence as activation evidence; no automatic-discovery claim from file existence alone. Do not install or modify personal/global skills.

## Authority
Tony owns all target-repo Git mutations and deployments. E1 allows module installation, bridge and planning records only. E2 authority comes from the approved plan, within the concrete write/effect scope in `_project/IMPLEMENTATION_CONTRACT.md`. Declared local builds, tests, mock mutations, owned processes and bounded authorized auth probes need no repeated permission.

Internal gates are evidence checks, not “say go” stops. Gate M applies while building each screen. A contract conflict, unknown target, missing real-auth identity or unexpected drift blocks only dependent work; aggregate safe remaining work before returning.

## Subject precedence
User decisions recorded in RULINGS govern this adaptation. APP_BRIEF owns scope, DATA_CONTRACT/portal-contract own data and transitions, UI_SPEC plus recorded errata own visual behavior, ACCEPTANCE_SPEC owns grading; managers only route. QAM/QA playbooks own independent QA. Disk establishes implementation facts. A real unresolved conflict is not resolved by silently choosing the easiest document.
