# QAM entry — FFM-ABM-001-SUBSCRIPTION-PORTAL
Version 1.0 · QA Lead: SOL/JARVIS Master · QA Executor: Cody · Engineer: Claudy · Director: Tony

## Read order
1. QAM_STATE.md; ../STATE.md; ../RULINGS.md.
2. ../ACCEPTANCE_SPEC.md and ../_project subject contracts.
3. QAM_MANIFEST.md; HANDOFFS/ENGINEERING_HANDOFF.md.
4. QAM_PREFLIGHT.md; QAM_RISK_REQUIREMENTS.md.
5. GOVERNING/PROVENANCE.md; GOVERNING/QAM_PLAYBOOK.md; GOVERNING/QA_PLAYBOOK.md; relevant GOVERNING/RRM_PLAYBOOK.md sections.
6. Existing recon/plan/approval/execution/findings records before deciding the next phase.

## Phase dispatch
NOT_READY_FOR_Q1: aggregate missing handoff/candidate/environment facts; do not execute a full campaign or invent a ready identity.
READY_FOR_Q1: perform one independent recon and draft the complete plan; export Q1 ZIP and stop for Lead.
AWAITING_LEAD: return existing package; no automatic rerun.
APPROVED_UNRELEASED: report the missing Director release.
RELEASED_Q2: verify exact plan hash, candidate/current HEAD and target, then execute continuously.
STOPPED: resolve named stop, preserve evidence and resume only affected work.
COMPLETE/CERTIFIED: return result/next owner; do not retest or clean again.

## Q1
Read-only product/source; QA writes only in this QAM and owned transient setup. Inspect current repo/branch/full SHAs/diffs, protected paths, handoff, contract, tools, auth target, identities, privacy instrumentation and packaging. Bounded baseline install/build/serve/login probes allowed as PREFLIGHT describes. This is planning, not a full Q2 browser campaign.
Independently derive checks for every AC, risk order, expectations, fixtures/negative controls, route/state/persona/theme/viewport matrix, evidence and cleanup. Return actual recon, draft plan, identities, gaps and support files in one indexed ZIP. Do not ask Tony to construct the package.

## Approval and Q2
QA Lead approves specific plan/candidate/environment, not generic permission to test. Preserve exact decision in QAM_APPROVAL. Director releases Q2. Exact delegated amendments are bookkeeping, not a mandatory new shot; material interpretation changes return to Lead. Complete approved checks continuously, preserve failures, fix only disposable QA helpers in the permitted lane, continue unaffected tests where safe, and export results automatically. No product edits or weakened assertions.

## Identities and writer
Expected QA branch `qa/ffm-abm-001-subscription-portal`; Director establishes it from completed engineering candidate. Record full tested product SHA separately from execution HEAD and later evidence commit. Prove docs-only successors by complete diff; product/config/dependency/test changes require candidate reconsideration. Only Cody writes QA records during QA; Claudy repairs only after explicit writer handoff and bounded Architect instruction.

## Final decisions
Executor reports; Lead adjudicates/certifies and governs required retention/cleanup. Then Architect performs closeout/post-FFM review and Tony's ride/integration is recorded. Gate D remains excluded. Never use the Designer's checks or Engineering tests as independent observations without rerunning required assertions.
