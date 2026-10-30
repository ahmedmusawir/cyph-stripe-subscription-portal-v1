# REPAIR_002 independent retest — candidate-input stop

Recorded 2026-10-29T07:50:00.006423+00:00. Required/current HEAD `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36`, direct parent `24cf075dc3c6252bc22712b067cbf9a8680f24fa`, branch qa/ffm-abm-001-subscription-portal all match dispatch.

Reviewed Downloads archive SHA-256 `1c8a54658e2b9b79c61f68f8ad1633191fb0f692e2b9ebf111b3f7b0fd9a70f2` verified; repository copy identical. 81 members /80 indexed; archive integrity and every index hash pass. All14 reviewed source files match committed HEAD. Complete committed product/test path set matches reviewed source set. Patch reconstruction results are retained in evidence/repair002/package-verification.json.

Initial git status had only expected QAM changes. During read-only verification additional product/test edits appeared:
- `e2e/public.repair002.spec.ts`
- `src/components/portal/activation/CheckoutIncompleteView.tsx`
- `src/__tests__/portal-checkout-hold.test.tsx`

The working changes concern a C14 payment-state introduction and associated tests; they are not QAM records and are not included in the reviewed candidate. See uncommitted-product-at-stop.diff. Their author is not inferred. No changes discarded, stashed, staged or committed.

Dispatch says approval applies only when committed product/test bytes match the reviewed package and forbids execution against uncommitted product edits. Candidate-input gate is therefore STOPPED. No plan addendum was finalized, no build/server/test/auth/logout executed, no product/Git mutation. Earlier approved plan and failed results remain unchanged. No results ZIP is represented as a completed retest.

Resume requirement: Director/Engineer resolves concurrent uncommitted product/test work. Either restore the released candidate inputs themselves, or commit and obtain a matching amended candidate/package approval. Cody will reverify identity/input correspondence before binding the bounded addendum. No new Q1 is required. This stop is not a planning approval request.

Engineering OOM record reconciliation: supplied before-jest-new-attempt1-OOM.log names two OOM workers, PIDs928982 and928983, failing portal-registration.test.ts and portal-checkout-hold.test.tsx. It does not support the engineering report's single-worker wording. The record says two suites failed with zero tests; no OOM was reproduced by QA. Claims about no other process effects cannot be established from that log alone. This documentation discrepancy is recorded, not a demand for another product repair.

Tony's final walkthrough, acceptance and certification remain pending. No certification granted.

## RESOLVED — explicit snapshot release
Lead/Director explicitly authorize uncommitted content-hashed candidate. Base d6fe67839961fcbbf801b0bb04d3a2522e7b1f36, manifest cc3518f797df96edb2f48e6127b869869d0f80c9d6d01b878bdd0c1a0175213a, plan f2bdc37679f3f1f56ddd054c82c4cf635f743ca1cb45741a3a89d0f968e91901. Three reviewed package indexes verified and all source bytes match base plus addenda. Prior stop preserved; no Git mutation.
