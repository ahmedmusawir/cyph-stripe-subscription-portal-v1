# Recovery State — cyph-stripe-subscription-portal-v1

Last action (2026-10-29 10:26): **AMENDMENT_001 COMPLETE (engineering), RULINGS R-011** — owner-only registration: job-title
  select removed, required owner declaration (UI + mock service), v1 drafts migrate unaccepted, admin/ownership copy clarified.
  Uncommitted on `qa/ffm-abm-001-subscription-portal` @ 0d43a4c (REPAIR_001 committed). build 0 · tsc 0 · jest 156/156 ·
  Playwright 131/131 · Gate M 220/0. Report: module `EVIDENCE/AMENDMENT_001_ENGINEERING_REPORT.md` · ZIP:
  `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_AMENDMENT_001_REVIEW.zip` (+ `~/Downloads/`) · Session: `session_2026-10-29.md`.
Pending: Tony commits. Owned server :3104 stopped (no owned servers running); scratch copy r002 retained until asked. REPAIR_001 scratch deleted.
Next step: independent QA on the combined candidate (AC-06a + REPAIR_001 retest) → JARVIS adjudicates.

Previous (2026-10-28 16:24): **REPAIR_001 COMPLETE (engineering) for FFM-ABM-001-SUBSCRIPTION-PORTAL** under RULINGS R-010
  (direct QA Lead → Engineer route). Repaired Q2-F01 contrast, F02 load-error/retry, F03 Stripe `mode` classification,
  O04 approved pharmacies section/cards/refresh line, G06 20-store cap; self-found R1-N01 (refreshing state). Uncommitted on
  `qa/ffm-abm-001-subscription-portal` @ 94251be. build 0 · tsc 0 · jest 143/143 · Playwright 126/126 · Gate M 220/0.
  Report: module `EVIDENCE/REPAIR_001_ENGINEERING_REPORT.md` · ZIP: `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_001_REVIEW.zip`
  (+ `~/Downloads/` copy) · Session: `agent_docs/SESSIONS/session_2026-10-28.md`.
Pending: Tony reviews + commits the repaired candidate. All owned servers stopped (16:3x: :3103, :3001);
  PID 40320 (:3457) untouched. Scratch copies retained in session scratchpad r001/.
Next step: Cody independently retests repairs + regression → JARVIS adjudicates. Engineering does not self-certify.

Previous (2026-10-27 16:01): **E2 COMPLETE for FFM-ABM-001-SUBSCRIPTION-PORTAL (R-009).** Public registration from `/`
  (no login); account management behind real admin/superadmin login. Uncommitted on branch `ffm-abm-001-subscription-portal`
  @ b1fbdda. build 0 · tsc 0 · jest 106/106 · Playwright 59/59 · Gate M 220 measurements, 0 failures.
  Report: `agent_docs/RESPONSES/response_2026-10-27_160100_e2-review-ffm-abm-001.md` · ZIP:
  `~/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_E2_REVIEW_001.zip` · module STATE/handoff in `agent_docs/ACTIONS/…_ffm_abm/`.
Pending: Tony reviews + commits the candidate, creates `qa/ffm-abm-001-subscription-portal`; owned demo server on :3001 still running.
Next step: Cody Q1 at the module's `QAM/QAM_ENTRY.md`.

R-008 (14:20–14:35): admin-or-superadmin rule; Tony's manual admin login recorded as Director-reported verification.
Earlier today: E1 COMPLETE for FFM-ABM-001-SUBSCRIPTION-PORTAL. Module installed at
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
- Access (R-008/R-009): registration public; `(account)` admits user_roles admin OR superadmin (layout + every page); member denied — until customer auth is ruled.
- Deployment stubs exit 1 on purpose. Do not resurrect Mission Control cloud values.
- `supabase/*.sql` is unverified reference. Execute nothing without separate approval.

## Lineage
Cloned 2026-10-26 from the Mission Control FFM repo (`cyph-mission-control-v1`). Its design
system (tokens, shell, primitives, brand) and auth plumbing were kept; its screens, services,
mocks, types, deploy wiring and docs were removed. Mission Control history remains under
`agent_docs/` (SESSIONS / RESPONSES / CURRENT_APP / RECON) pending the disposition ruling.
