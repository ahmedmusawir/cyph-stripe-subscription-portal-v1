# Recovery State — cyph-stripe-subscription-portal-v1

Last action (2026-10-27): **E1 COMPLETE for FFM-ABM-001-SUBSCRIPTION-PORTAL.** Module installed at
  `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/` (pointer: `agent_docs/PROJECT_POINTER.md`).
  Plan: that folder's `EXECUTION_PLAN.md` · facts: `EVIDENCE/E1_RECON.md` · state: `STATE.md`
  · review ZIP: `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_E1_REVIEW_001.zip` (+ `~/Downloads/` copy)
  · Session: `agent_docs/SESSIONS/session_2026-10-27.md`
Pending: Architect review + Director approval of the plan (X1–X3, A-1); blockers B1 branch, B2 Supabase
  project identity, B3 reviewer identity, B4 PID 40320 on :3457. Credential rotation remains a Director action.
Next step: on approval, E2 builds continuously from plan §5 step 1 on branch `ffm-abm-001-subscription-portal`.

Previous (2026-10-26): bounded cleanup complete, committed by the Director as `1d15918`. Report:
  `agent_docs/RESPONSES/response_2026-10-26_155736_cleanup-result.md`.

## Standing rules
- Director-only git: Claude never commits, pushes, resets, switches branches or rewrites history.
- Plan Mode + session file + RESPONSES mirror for every substantive artifact (CLAUDE.md v3.1).
- Temporary gate: `(portal)/layout.tsx` is super-admin-only until the FFM specifies customer auth.
- Deployment stubs exit 1 on purpose. Do not resurrect Mission Control cloud values.
- `supabase/*.sql` is unverified reference. Execute nothing without separate approval.

## Lineage
Cloned 2026-10-26 from the Mission Control FFM repo (`cyph-mission-control-v1`). Its design
system (tokens, shell, primitives, brand) and auth plumbing were kept; its screens, services,
mocks, types, deploy wiring and docs were removed. Mission Control history remains under
`agent_docs/` (SESSIONS / RESPONSES / CURRENT_APP / RECON) pending the disposition ruling.
