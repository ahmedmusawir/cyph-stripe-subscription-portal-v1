# Engineering completion manifest
Owner: Claudy · Status: **FILLED at E2 return (27 Oct 2026)** · FFM-ABM-001-SUBSCRIPTION-PORTAL
No QA verdict, plan approval or certificate belongs here. Migration requirement: NONE; real billing/email integration: NONE; external side effects limited to authorized existing dev auth.

- **Repository / branch / baseline / HEAD:** `/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1` · `ffm-abm-001-subscription-portal` · foundation `1d15918dc20d80476d6a3cb017b10179f3ddf783` · HEAD `b1fbdda3264177451598e7b4318049fe32af600d`.
- **Candidate:** pending Director commit of the working tree; no other unrelated dirt (the earlier 71 CURRENT_APP deletions were committed in `b1fbdda`).
- **Plan / contracts:** EXECUTION_PLAN (approved via `b1fbdda` + R-009 dispatch); ACCEPTANCE_SPEC v1.1; APP_BRIEF v1.2; DATA_CONTRACT v1.2; IMPLEMENTATION_CONTRACT v1.1; RULINGS R-001…R-009. Deviations: route groups `(account)`/`(public)`/`(handoff)` (X3); `/demo/sign-in` retired → `/login`; email reference public-only (account invitation preview inside the result page); A-1 service validators.
- **Versions:** Node v22.17.0, npm 11.15.0, next 16.4.3, react 19.2.4, TS 5.5.4, jest 30.4.2, @playwright/test 1.59.1, system Chrome 150. Lockfile unchanged. Port 3001.
- **Commands:** see `../EVIDENCE/E2_ENGINEERING_REPORT.md` §2 and `../EVIDENCE/E2/01–05` (CWD, exits).
- **Mock registry / controls:** `src/types/portal/state.ts` (REGISTRATION_SCENARIOS 18, ACCOUNT_SCENARIOS 9, personas 3, add outcomes 4, activation plans 4); engines `src/services/portal/{registration,account}.ts`; clock via Demo controls (+31 min); reset per namespace; logout clears all.
- **Auth target / identities:** configured shared Cyber Pharma dev Supabase (R-003; ref not printed). One admin pair in ignored+untracked `.env.qa.local`. Member/role-less = mocked roles. Blockers: none for this FFM.
- **Per-AC:** `../ACCEPTANCE_LEDGER.md`. Unverified: AT walk, real-device Safari, per-state contrast, server-side egress capture, account Gate M after final pill fix. Lint not configured; audit advisories inherited.
- **Protected diff / side effects:** empty vs `1d15918`; browser hosts localhost only; 3 real sign-ins, 2 global logouts (Engineering).
- **Processes / temp / privacy:** owned server PID listed in `../STATE.md`; scratch copy `run-r008/` in the Claude session scratchpad (symlinked `.env.local`); `.auth/` deleted; screenshots masked.
- **Export:** `../EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_E2_REVIEW_001.zip` + Downloads copy; receipt in the E2 response. Next owner: Tony (commit) → Cody (Q1).

## Paths
Modified: `.gitignore`, `package.json` (scripts), `CHANGELOG.md`, `RECOVERY.md`, `src/app/globals.scss`, `src/app/page.tsx`, `src/app/login/{page,LoginPageContent}.tsx`, `src/components/global/ThemeToggler.tsx`, `src/components/ui/button.tsx`, `src/components/portal/{Shell,Pill,EmptyState}.tsx`, `src/services/auth/session.ts`, `src/types/auth.ts`. Moved/removed: `src/app/(portal)/*` → `src/app/(account)/*`. Added: `.dockerignore`, `playwright.config.ts`, `e2e/**`, `src/app/{(account),(public),(handoff)}/**`, `src/app/demo/sign-in/page.tsx`, `src/components/portal/**` (new files), `src/services/portal/**`, `src/services/auth/access.ts`, `src/types/portal/**`, `src/mocks/portal/**`, `src/__tests__/{login-form,portal-access,portal-account,portal-boundaries,portal-components,portal-registration,portal-storage}.test.*`; module records under `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/`.
