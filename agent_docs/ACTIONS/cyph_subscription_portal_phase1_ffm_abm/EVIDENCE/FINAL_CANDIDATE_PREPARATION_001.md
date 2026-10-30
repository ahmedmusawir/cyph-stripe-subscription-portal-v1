# Final certification candidate preparation 001

Prepared by Cody (Codex) under the Director's final candidate-preparation dispatch; this records engineering-package verification, not independent retest completion or certification. No product edits, tests, login/logout or Git mutations in this preparation.

Base HEAD: d6fe67839961fcbbf801b0bb04d3a2522e7b1f36. Branch qa/ffm-abm-001-subscription-portal. Both addenda remain uncommitted, so a new final candidate SHA does not yet exist; record the full new SHA after Tony's scoped commit.

## Verification
ADDENDUM_001 complete: C14 unknown-payment introduction corrected; confirmed-unpaid wording and locks preserved; associated component/browser tests and focused evidence present. ADDENDUM_002 complete: public Next activation check dropdown removed; Registration scenario → Load retained; scenario progression tests/evidence present. Exactly two product files and three test files differ from base. All working bytes match the sequential reviewed package source snapshots. The cumulative package patch reconstructed from base matches all five files byte-for-byte. No service/engine, dependency, config or unused-export changes. Existing focused results reviewed, not rerun or reclassified as independent acceptance.

Both archives passed integrity, member-set, size and SHA-256 index verification. ADDENDUM_001:34 members/33 indexed, SHA-256 f852ff94664b0e0a664582c213a8334d8b779758e3f8f2c8fbd88a4b1c0019e7. ADDENDUM_002:53 members/52 indexed, SHA-256 ce6683df74a466fd5b8ce2c8ccf57bc59824fdb4f99d3a70ddca9d1e2ceec195. Both Downloads copies already exist and are byte-identical. Package bytes retained unchanged; historical pending-walkthrough wording inside them is superseded only by the attributed update below, not rewritten.

## Director-reported walkthrough and acceptance
Tony reports his manual walkthrough is complete and accepts the result, including login/logout and removal of the activation dropdown. Source: current Director dispatch,29 October2026. This is attributed Director acceptance, not a new QA-observed login/logout or a Lead certificate. No tested post-addendum commit SHA exists yet. Cody's prior stop/failure records remain preserved; JARVIS owns their disposition and certification.

## Pending Coach confirmations
Tony's Coach questions remain PENDING CONFIRMATION. The exact questions and Coach's answers were not supplied in this dispatch or located in the reviewed addendum records; none are invented and no pending proposal is converted to implementation scope. No further product work or unused-export cleanup is authorized by this preparation.

## Exact scoped command for Tony — NOT EXECUTED
The only QAM path included is the engineering-owned handoff. Cody's findings, state, approval, plans, evidence, automation, stop records and ZIPs are excluded. --only restricts the commit to these paths even if unrelated files were already staged. Review any subsequent edits before running.

```bash
cd /home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1
candidate_module=agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm
candidate_paths=(
  src/components/portal/activation/CheckoutIncompleteView.tsx
  src/components/portal/PublicDemoControls.tsx
  src/__tests__/portal-checkout-hold.test.tsx
  e2e/public.repair002.spec.ts
  e2e/public.activation-scenarios.spec.ts
  CHANGELOG.md RECOVERY.md
  "$candidate_module"/{RULINGS.md,STATE.md,JOURNAL.md}
  "$candidate_module"/_project/{IMPLEMENTATION_CONTRACT.md,UI_SPEC.md}
  "$candidate_module"/QAM/HANDOFFS/ENGINEERING_HANDOFF.md
  "$candidate_module"/EVIDENCE/REPAIR_002_ENGINEERING_REPORT.md
  "$candidate_module"/EVIDENCE/REPAIR_002/{addendum_001,addendum_002}
  "$candidate_module"/EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_ADDENDUM_{001,002}_REVIEW.zip
  "$candidate_module"/EVIDENCE/FINAL_CANDIDATE_PREPARATION_001.{md,json}
  agent_docs/SESSIONS/session_2026-10-29.md
  agent_docs/RESPONSES/response_2026-10-29_135500_repair-002-addendum-001.md
  agent_docs/RESPONSES/response_2026-10-29_144500_repair-002-addendum-002.md
)
if [ "$(git rev-parse HEAD)" = "d6fe67839961fcbbf801b0bb04d3a2522e7b1f36" ] &&
   [ "$(git branch --show-current)" = "qa/ffm-abm-001-subscription-portal" ]; then
  git add -- "${candidate_paths[@]}" &&
  git commit --only -m "fix: clarify payment status and simplify activation demo controls" -- "${candidate_paths[@]}"
fi
```
