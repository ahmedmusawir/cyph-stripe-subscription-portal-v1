# Build and handoff checklist
Owner: Engineer; QA independently verifies applicable claims.

- [ ] Exact repo/baseline/branch and unrelated work recorded; approved plan identity known.
- [ ] Public registration works without login; account management behind the real admin/superadmin gate (R-008/R-009); demo/customer personas never used as production authorization.
- [ ] All mapped routes/states and reference boundaries implemented.
- [ ] Typed services enforce capabilities, quote freshness, consent and idempotent operation outcomes.
- [ ] Initial 1/2/3-store and add 1→2/2→3 paths stay consistent; drafts survive edit/reload.
- [ ] No live Stripe/email/business DB/SSO actions; only permitted dev-auth requests.
- [ ] Received design + R-004 corrections applied; both themes, mobile Gate M, keyboard and zoom checked.
- [ ] Build, typecheck, baseline and relevant new tests have actual command/result evidence; lint limitation explicit.
- [ ] Actual auth walk performed or named blocker; no exposed credential reused.
- [ ] ACCEPTANCE_LEDGER filled with evidence; QAM_MANIFEST and ENGINEERING_HANDOFF complete.
- [ ] Source/changed-path identity captured; candidate clearly pending Director commit until it exists.
- [ ] Export safe and indexed; authoring/design files excluded from application imports/public assets.
- [ ] Owned processes/state declared, writer released, STATE/retrospective updated.
- [ ] No independent PASS, approval or certificate filled by Engineering.

Tony's later ride: can you register and understand the Stripe boundary, add a pharmacy with success/failure, and tell owner versus nonowner access apart? Record actual response after QA. No invented sign-off.
