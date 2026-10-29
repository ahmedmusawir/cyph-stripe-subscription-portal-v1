# Engineering journal
27 October 2026 — Architect assembled v1.0 against supplied recon/cleanup, Director foundation receipt and approved design. No product build or QA run performed during package authoring.

Engineer appends meaningful checkpoints: time, identity, work, command/result evidence, failure/fix, next action. Preserve failed attempts; no transcript dump. Record actual duration and Director touches rather than promising a shot-count outcome.

## 27 Oct 2026 12:36–13:2x — E1 (Claudy, Claude Code Opus 5.5, CWD repo root)
- Verified archive SHA-256 = Director value; extracted to an isolated scratch dir; 391/391 FILE_INDEX entries match (size + hash), no unindexed files except the index, no unsafe paths.
- Repo: main @ 1d15918 (full SHA resolved), HEAD == foundation, ahead 1; 71 Director-side ` D` paths in old CURRENT_APP module; ACTIONS/ empty. CURRENT_APP absent, so no copy to reconcile.
- Installed via `cp -a` to `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/`; re-verified 391/391 before edits.
- Baseline: tsc 0; jest 8/8; `next lint` exit 1 (removed in Next 16, eslint absent → LINT NOT CONFIGURED); next build on a git-archive copy exit 0, 8 routes (a copy because PID 40320 serves the repo `.next`); npm audit 3 advisories.
- Failed attempt kept: first `diff -rq` of skills exited 1. Cause: the repo copy `agent_docs/.claude/skills/stark-frontend-first/references/ANTI_PATTERNS.md` differs from the module copy. Recorded; no edit.
- Edits: R-007, entry repoint (CLAUDE/AGENTS/GEMINI/README), STATE, this journal, EXECUTION_PLAN, EVIDENCE/E1_RECON, INSTALL_RECORD, INSTALLED_FILE_MANIFEST; repo bridge PROJECT_POINTER + root CLAUDE.md pointer.
- Director touches: one dispatch. Next: plan approval + B1–B4.

## 27 Oct 2026 14:20–14:35 — R-008 focused admin-login fix (Claudy, CWD repo root)
- Director paused broader E2: admin OR superadmin may enter, member denied. Branch `ffm-abm-001-subscription-portal` @ `b1fbdda` (Director commit), tree clean at start; no E2 product work existed.
- Cause found in three places: login form role check (`!== "superadmin"` → logout), `getSuperAdminUser()` in the `(portal)` layout, and the `/login` page redirect. Shell label hard-coded "Super Admin".
- Fix: shared pure predicate `isPortalStaffRole` (`services/auth/access.ts`); `getPortalStaffUser`; `PortalStaffUser {role}`; Shell role label. tsc 0; jest 36/36.
- Mutation check: predicate reverted to superadmin-only → 5 tests fail; member admitted → 6 fail; restored → green.
- Found while smoke-testing (pre-existing): signed-out `/dashboard` 307 body contained the dashboard RSC payload, because the page renders in parallel with the layout. Added a page guard; HTML and `RSC: 1` bodies now carry 0 occurrences. jest 40/40.
- Mistake kept: `pkill -f run-r008` matched my own shell and killed it (exit 144). No other process was affected; my :3001 server was then stopped by PID after a cwd check.
- Real browser login NOT tested: `.env.qa.local` absent. Next: Tony's manual admin login.

## 27 Oct 2026 14:38–16:01 — E2 under R-009 (Claudy, CWD repo root)
- Director dispatch: record Tony's manual admin login as Director-reported (done in R-008), R-009 entry/access model, reconcile active contracts, resume E2 without further plan approval. Branch/HEAD verified `b1fbdda`.
- Reconciled (replaced, not annotated): APP_BRIEF v1.2, DATA_CONTRACT v1.2, IMPLEMENTATION_CONTRACT v1.1, ACCEPTANCE_SPEC v1.1 (AC-01/02/03/07/25/26/29), EXECUTION_PLAN §3/§4.1/§5/§6/§9, README, SKILLS_MANIFEST, playbook 04/05, `_project/UI_SPEC.md` sign-in wording, QAM preflight/risks/manifest/handoff, BUILD_CHECKLIST.
- Built: types → engines (registration, account) + 52 engine tests first → stores/facade → tokens/kit deltas → shells → 9 public + 6 account views → pages → Playwright (public, Gate M, admin setup, account, logout).
- Gate M findings fixed: brand link 33px; stand-in outcome buttons overflow 375 by 5px; mobile stretched counter/pills; consent ticked before quote silently cleared (race); empty activation amount for seeded scenarios. Test bugs fixed: RSC `_rsc` hop, hidden `<option>` matched by text, static `<title>` counted as payload.
- Removed a fake-credential e2e test (would have sent a synthetic login to the real auth target); replaced by mocked unit tests.
- Real auth: `.env.qa.local` appeared 14:44 (Director). 3 real sign-ins, 2 global logouts. Discovered inherited logout = Supabase global scope.
- Final: build 0, tsc 0, jest 106/106, Playwright 59/59; Gate M 136 + 84 measurements, 0 failures.

### 28 Oct 2026 — REPAIR_001 (Claudy)
- Reproduced every Q2 finding on an owned `git archive` build of 94251be before changing code. F03 also failed for case/whitespace variants (`mode=Portal`, `mode=%20portal`).
- F02 root cause: a superseded/second load consumed the one-shot failure; the sequence guard then threw that error away. The old engine test asserted the buggy behaviour.
- While proving transient states, found R1-N01: the "refreshing" banner after a Stripe return never rendered (skeleton until done). Fixed with a synchronous last-known read.
- Instrument lessons: theme set after load measures colour transitions; Playwright restarts the worker after each failure, so a worker-scoped real sign-in multiplies (≈22 sign-ins this repair). Error-context snapshots carry the real display name and must be deleted.
