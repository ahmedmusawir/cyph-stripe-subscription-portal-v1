# Skills and execution-method manifest
Version 1.0 · 27 October 2026

## Reused method
`skills/stark-frontend-first/` is copied **byte-for-byte** from the supplied successful `cyber_pharma_v1_phase1_ffm_v2_bundle.zip`. SKILL.md version: 1.0-cp1, 2026-06-03. No personal/global skill is created, installed or changed by this pack. Source hashes are included in FILE_INDEX.json.

The module's `FFM_ENTRY.md` and `playbook/` are the executable project-specific adaptation. Read this manifest before historical skill files. Its general types → services → mocks → components → verification method is reused. The following historical instructions are superseded for this module by Tony's FFM-ABM scope and RULINGS R-002:

| Historical instruction/example | This module's binding adaptation |
|---|---|
| Stop for each subphase/operator gate | E1 plan approval once; E2 internal checks continuously |
| Create new auth wrapper / build roles | Preserve existing auth/session service and real superadmin gate |
| Admin/member/superadmin fixture scope | Synthetic customer personas behind real staff gate; DATA_CONTRACT owns shapes |
| Deploy to Cloud Run during verification | Explicitly excluded; deployment scripts remain disabled |
| Every component requires tests | Risk-based service and workflow tests, not implementation-mirroring tests |
| Grep requires zero Supabase imports anywhere in app | No new business-client imports; preserve documented existing auth wiring |
| Delete auth/admin routes on pattern match | No unreviewed deletions; preserve foundation routes; flag a real conflict |
| Update RECOVERY wholesale | Follow actual repo instructions; only scoped active pointers, preserve unrelated records |
| Data contract §5 assumed service signatures | Current DATA_CONTRACT and portal-contract.ts govern |
| Historical success/retrospective gate | Engineering handoff, independent QAM, Director ride and closeout remain separate |

Do not execute historical project-specific steps that conflict with this table. This is an explicit module adaptation, not a hidden edit of the original skill. Generic claim that a later live backend needs zero component changes is an architectural aim, not integration certification.

## Activation
Supported method: explicit read from the repository root through module CLAUDE.md/AGENTS.md → FFM_ENTRY.md. Auto-discovery/installed .claude skill behavior: NOT VERIFIED. E1 checks actual launch CWD, records loaded paths and uses the stable explicit-file fallback. Existing repo recon/design/testing skills may be reused only after inspecting their scope; do not install a new skill registry or let an inherited skill expand this assignment.

Required tools: existing Node/npm, Git read-only, repository test tools and browser driver. Required output: E1 plan, E2 code/self-checks/factual QAM handoff. Skill activation proof on Tony's machine is an E1 obligation, not claimed by package authoring.
