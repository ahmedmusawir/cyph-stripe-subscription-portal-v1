# FFM-ABM-001-SUBSCRIPTION-PORTAL
Version 1.0 · 27 October 2026 · Asia/Dhaka · Architect: JARVIS/Astra · Director: Tony

## The outcome
A working frontend demonstration of registration, account billing and adding pharmacies, using approved design v1.0 and mock business services. Real inherited staff login remains the review gate. No live payments, provisioning, email, SSO or deployment.

## Start here
1. Place this folder at `/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1/agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm` (Director correction 27 Oct 2026: the module home is `agent_docs/ACTIONS/`, not `CURRENT_APP/`; see RULINGS R-007). Do not replace another module or discard a dirty tree. Installed 27 Oct 2026; installation record in `EVIDENCE/INSTALL_RECORD.md`.
2. Open Claudy from the repository root. Read `FFM_ENTRY.md` through this module's `CLAUDE.md`.
3. Shot E1 verifies the current repo, installs only the documentation bridge, and returns one full build plan. Product code waits for that plan's approval.
4. After approval, E2 builds continuously, self-checks and completes the factual QAM handoff. No per-screen approval stops.
5. Tony commits the engineering candidate and establishes `qa/ffm-abm-001-subscription-portal`. Cody starts at `QAM/QAM_ENTRY.md`: Q1 plan, Lead review, Director release, Q2 execution.

Tony approved the design and requested this FFM in chat on 27 October 2026: “you have my blessings on FFM ... go ... run Forrest run”. This approves preparation and the established workflow; it is not an approval of an as-yet-unwritten engineering plan or QA plan. Coach approval is not claimed.

## File map
| Location | Purpose |
|---|---|
| FFM_ENTRY.md | Deterministic launch and resume |
| _project/ | Current brief, data contract, service contract, UI spec, implementation decisions |
| _design/ | Entire received design v1.0, preserved; brand assets |
| _extraction/ | Recon, cleanup, prior brief and data-contract provenance |
| ACCEPTANCE_SPEC.md | Frozen, independently testable requirements |
| RULINGS.md | Approval, FFM/ABM precedence, corrections and future errata |
| playbook/ | Continuous engineering work sequence |
| skills/ | Unchanged historical frontend-first method; explicit adaptations in SKILLS_MANIFEST.md |
| verification/ | Build/mobile gates, handoff/export requirements |
| QAM/ | Complete module-specific independent QA assignment and future records |
| STATE.md, EXECUTION_PLAN.md, JOURNAL.md, ACCEPTANCE_LEDGER.md | Engineering control records |

## Current status
Package authored; engineering plan, build, independent QA, product ride and deployment have NOT occurred. Foundation `1d15918` is Director-reported; E1 resolves its full SHA and current descendants on disk. No repository is cloned or modified by this package's authoring.

## Naming and install
Display/module ID: `FFM-ABM-001-SUBSCRIPTION-PORTAL`. Folder: `cyph_subscription_portal_phase1_ffm_abm` (existing lowercase underscore style, now visibly `_ffm_abm`). Engineering branch: `ffm-abm-001-subscription-portal`. QA branch: `qa/ffm-abm-001-subscription-portal`. Director owns branch creation, commits, pushes and merges; no unconditional pull over local work.

No files need to be filled by Tony before E1. Later real-auth verification needs an authorized staff test identity; the Engineer first checks existing secure setup without printing secrets. Do not reuse an exposed credential from history.

## Completion
Engineering completion is not Gate Q. Module closeout requires independent Lead verdict, required cleanup, an Architect review of the completed FFM, Tony's product ride and Director integration. Deployment/Gate D remains a separate assignment. Commercial placeholders remain intentional FFM content, not unfinished requirements.
