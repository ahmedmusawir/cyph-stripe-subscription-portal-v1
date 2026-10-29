# Engineering handoff to independent QA
Owner: Claudy · Status: **COMPLETE (E2), pending Director candidate commit** · 27 Oct 2026 · Contract ACCEPTANCE_SPEC v1.1 + RULINGS R-001…R-009
Engineering self-checks below are **not** independent QA. Never copy passwords, token values, `.env` contents, browser storage or raw authenticated traces.

## 1. What was implemented
Public registration journey (C01–C07, C14, C17) with no login; account management (C08–C13, C15) behind the real admin/superadmin login; real `/login` with the designed sign-in presentation; mock services with quotes, consent, idempotent operations and enumerated scenarios. Baseline `b1fbdda` (branch `ffm-abm-001-subscription-portal`, descendant of foundation `1d15918`). **Candidate: uncommitted working tree — pending Director commit**; Q1 must bind the SHA Tony creates. Changed/added paths: see `QAM/QAM_MANIFEST.md` §Paths.

## 2. Setup and walkthrough (repo root)
1. `npm ci` (existing lock) → `npm run build` → `npx next start -p 3001` (or any free port; set `PORTAL_BASE_URL`).
2. Open `http://localhost:3001/` → plan screen. Register 1–N pharmacies → review → "Continue to secure payment" → stand-in outcome buttons → activation → "Refresh status" → email preview → access link.
3. "Already subscribed? Sign in" → real `/login` with an authorized admin/superadmin → `/dashboard` (synthetic two-store account).
4. Demo controls: public strip (registration scenarios, activation outcome, clock +31 min, reset); account strip (scenario, synthetic persona, next add outcome, resolve last addition, clock, reset). Typing hints: code `DEMO10`, NCPDP `0000099` (registered elsewhere), email `existing.owner@demo-pharmacy.example`.
5. Tests: `npx jest`; `npx playwright test` (projects `public`, `gate-m-public` need no credentials; `admin-setup` → `account` → `logout` need the admin pair).

## 3. Access boundary (R-008/R-009)
- **Public, no login:** `/`, `/demo/register/*`, `/demo/stripe` (checkout mode), `/demo/activation`, `/demo/checkout-incomplete`, `/demo/access-link`, `/demo/references/email`, `/login`. `/demo/sign-in` → `/login`.
- **Admin or superadmin (`user_roles`), server-checked in layout AND page:** `/dashboard`, `/demo/stores/{add,confirm,result}`, `/demo/references/owedbook`, `/demo/stripe?mode=portal|card`. Member / role-less / anonymous → `/login`; the redirect body (HTML and RSC) carries no account content.
- Synthetic personas (billing owner / store admin / member) live only inside account management and drive the mock service, never the real session or roles.
- Credentials: exactly one pair, `QA_PORTAL_ADMIN_EMAIL` / `QA_PORTAL_ADMIN_PASSWORD` in ignored, untracked `.env.qa.local` (Director-supplied). Missing pair ⇒ live checks BLOCKED, never PASS. No second real account; member denial is mocked-role evidence.
- **Warning:** the inherited `/api/auth/logout` calls Supabase `signOut()` with default **global** scope, so a logout ends every session of that account (including Tony's browser). Plan logout checks accordingly.

## 4. Per-AC engineering evidence
`../../ACCEPTANCE_LEDGER.md` (claims + paths) and `../../EVIDENCE/E2_ENGINEERING_REPORT.md` (commands, boundaries, Gate M, route/state inventory, gaps). Failed attempts and fixes: report §5 and `../../JOURNAL.md`.

## 5. Build/test results and negatives
Build 0 · tsc 0 (scratch copy; in-repo tsc trips on a stale `.next` owned by unowned PID 40320) · jest 106/106 · Playwright 59/59 · lint NOT CONFIGURED. Negatives: stale/expired quote, missing consent, same-key replay, unknown blocks retry, non-owner payload, forged query/cookie/storage roles, forged success URL, hostile text, anonymous account routes (HTML + RSC). Protected-path diff vs `1d15918` empty. Browser hosts only localhost. Real sign-ins by Engineering: 3; real (global) logouts: 2.

## 6. Screens vs design
Masked screenshots in `../../EVIDENCE/E2/screenshots/` (real identity masked). Public screens compared by Engineer against `_design/approved_v1_0/renders/` (plan, review, pharmacy, activation, mobile plan) — close match; differences: demo strip under the top bar (R-009 demo controls), longer demo-notice copy, "Already subscribed? Sign in" wording. Gaps: no AT walk, no real-device Safari, contrast not re-measured per state; account Gate M predates a one-class pill alignment fix.

## 7. Limits and risks
Mock business mode only; commercial/policy placeholders intentional; no Stripe/email/SSO/DB/deploy. Inherited: lint not configured, npm audit advisories (zod high, postcss-selector-parser moderate), global-scope logout, credential rotation of the historical exposed credential (Director). Brand text configurable in `src/components/portal/brand.ts`.

## 8. Processes, export, next action
Owned: `next start -p 3001` from session scratchpad copy `run-r008/` (PID in `../../STATE.md`). Not owned, untouched: PID 40320 (:3457). `.auth/` deleted. Export: `../../EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_E2_REVIEW_001.zip` (+ `~/Downloads/` copy), indexed and privacy-scanned. **Next: Tony reviews and commits the candidate, creates `qa/ffm-abm-001-subscription-portal`; then Cody starts Q1 at `QAM/QAM_ENTRY.md`.**

## 9. Amendments after Q2 (appended; sections above are the E2 record)
- **REPAIR_001 (R-010)**, committed by the Director as `0d43a4c`: Q2-F01/F02/F03/O04/G06 + R1-N01. Report `../../EVIDENCE/REPAIR_001_ENGINEERING_REPORT.md`.
- **AMENDMENT_001 (R-011, 29 Oct 2026)** — Coach-approved owner-only registration, Director-authorized before final certification. The C02 job-title select is removed; a required, initially unchecked owner declaration ("I confirm that I am the pharmacy owner and am registering this account to manage its subscription and pharmacies.") is enforced in the UI and in the mock service (owner step, deep links, checkout). v1 drafts migrate unaccepted. Me / Someone else copy clarifies that ownership, billing and permission to buy stores stay with the owner. Ownership-transfer copy is clarified with placeholders. ACCEPTANCE_SPEC v1.2 (AC-06 text, new AC-06a); DATA_CONTRACT v1.3; portal-contract v1.2. Report: `../../EVIDENCE/AMENDMENT_001_ENGINEERING_REPORT.md`. **Independent QA must cover AC-06a and re-run the REPAIR_001 retest on the combined candidate.**
- **REPAIR_002 (R-012, 29 Oct 2026)** — QA Lead dispatch after Gate Q FAIL on `24cf075` (CR-F01 blocker, CR-F02 robustness, Q2-O04 residual). An open checkout is closed when the declaration is withdrawn, a v1 draft is restored or the draft changes materially; every move toward payment re-checks the current draft at the service; submitted/unknown payments are held until explicit re-acceptance; paid history untouched. Repeat-N entries materialize only as filled (no count-sized allocation); step 100+ route fixed (R2-N02, self-found); R2-N01 (count change kept a stale open checkout payable) self-found and fixed. Plan Actions column uses the approved divider/spacing. ACCEPTANCE_SPEC v1.3 (AC-05, AC-06a extended); DATA_CONTRACT v1.4. Report: `../../EVIDENCE/REPAIR_002_ENGINEERING_REPORT.md`. **Independent retest required: CR-F01 A/B, CR-F02, the O04 residual and regression on the combined candidate. Cody's combined001 tests that expect the defect (e.g. the 64-push abort) will now observe the repaired behaviour.**
