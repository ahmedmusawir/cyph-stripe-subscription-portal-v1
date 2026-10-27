# Recovery State — cyph-stripe-subscription-portal-v1

Last action (2026-10-26): **BOUNDED CLEANUP COMPLETE** — Mission Control surfaces removed,
  minimal Subscription Portal foundation left buildable. Report:
  `agent_docs/RESPONSES/response_2026-10-26_155736_cleanup-result.md` · bundle ZIP `~/Downloads/cyph-subscription-portal_cleanup_2026-10-26.zip`
  · Recon it executed: `agent_docs/RECON/RECON_cyph-subscription-portal_ffm-intake_2026-10-26.md`
  · Session: `agent_docs/SESSIONS/session_2026-10-26.md`
Pending: Director's git review/commit of the cleanup (uncommitted). Operator rulings still open:
  Supabase project for the portal · customer role model · agent_docs history disposition ·
  cloud target names. Credential rotation for the inherited Mission Control super-admin login is
  an OPERATOR action — not done by this repo; its text was redacted from current files only
  (git history NOT sanitized).
Next step: Designer works from the reference bundle → Architect authors the portal FFM
  (APP_BRIEF / DATA_CONTRACT / UI_SPEC) against the recon → Plan Mode build.

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
