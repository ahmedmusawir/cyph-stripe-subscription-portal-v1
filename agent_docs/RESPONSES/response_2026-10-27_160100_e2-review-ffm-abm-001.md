✅ E2 COMPLETE — FFM-ABM-001-SUBSCRIPTION-PORTAL (R-009) · engineering handoff ready for QAM

**Bottom line:** the app is built under the new entry and access model.
- `/` opens the public plan screen. Registration runs end to end with no login.
- `/dashboard`, add-store and every account-side mode need a real admin or superadmin login (the R-008 rule, checked on the server in the layout and in each page).
- Members stay denied.

Final gates:
- build 0
- typecheck 0
- jest 106/106
- Playwright 59/59
- Gate M: 220 measurements, 0 failures

The candidate is the uncommitted working tree on `ffm-abm-001-subscription-portal` @ `b1fbdda`, waiting for your commit.

**1. Records**
- Tony's admin login is recorded in RULINGS R-008 as **Director-reported manual verification**, explicitly not an Engineer-executed test.
- **R-009** records the entry and access model, quoting your dispatch. It lists the four retired requirements as retired.
- **Active contracts were reconciled by replacing the conflicting text, not by adding pointers next to it:**
  - APP_BRIEF v1.2, DATA_CONTRACT v1.2, IMPLEMENTATION_CONTRACT v1.1 (access model and route/access table rewritten), ACCEPTANCE_SPEC v1.1 (AC-01 replaced; AC-02/03/07/25/26/29 updated)
  - `_project/UI_SPEC` sign-in wording, EXECUTION_PLAN, README, SKILLS_MANIFEST, playbooks, BUILD_CHECKLIST
  - QAM preflight, risks, manifest, state and handoff
- Design bytes, FILE_INDEX and E1 evidence are preserved as history. Versions are recorded in INSTALL_RECORD, and the installed-file hashes are refreshed (409 files; 24 modified, 17 added, 0 missing).
- **Stale-instruction check** (`EVIDENCE/E2_STALE_INSTRUCTION_CHECK.md`): every hit in the active documents now states the new rule. One leftover phrase in the plan ("reviewer harness") was fixed.

**2. What was built**

Routes and access:

| Surface | Routes | Access |
|---|---|---|
| Public | `/` → `/demo/register/{plan,owner,pharmacies,review}`, `/demo/stripe` (checkout), `/demo/activation`, `/demo/checkout-incomplete`, `/demo/access-link`, `/demo/references/email`, `/login` | none; "Already subscribed? Sign in" → real `/login` |
| Account | `/dashboard`, `/demo/stores/{add,confirm,result}`, `/demo/references/owedbook`, `/demo/stripe?mode=portal\|card` | admin or superadmin, server-checked in layout **and** page |
| Retired | `/demo/sign-in` | → `/login`; the designed sign-in states are on the real login |

Other build points:
- **Mock engines:**
  - Pricing in integer cents: 9900 + 4900·(N−1).
  - DEMO10 takes 1000 off due-now only. Adding a store costs 2450 due now.
  - Quotes carry a revision and an expiry on an injected clock. Consent is required.
  - Operation keys make retries idempotent. Unknown or pending payment blocks a retry. Paid-but-attention adds exactly one store.
  - Personas are enforced in the service: a non-owner gets a denied payload with the owner's name only.
- **Mock payment never creates a user, grants a role or signs anyone in.**
- **Storage:** public draft and account state live in separate per-tab namespaces. The account key is an opaque hash, never the email. Logout clears both; an identity change clears account state. There is no server-global state.
- **Design:** tokens match the design file byte for byte, plus the R-004 link rule. Button and Pill deltas are applied centrally. Top bars, Sheet, Alert, form fields, error summary, radio cards, stepper, counter and the handoff panel are built.

**3. Verification**

| Check | Result |
|---|---|
| Build / typecheck | 0 / 0 (owned scratch copy; `src` byte-identical) |
| Jest | 9 suites, **106/106**. Pricing tests use hard-coded literal cents; also idempotency, expiry, persona denial, scenario enums, storage namespaces, import boundaries, mocked admin/superadmin/member/role-less at every auth layer |
| Playwright | **59/59** — public 29 · Gate M public 13 · real admin setup 1 · account 15 · logout 1 |
| Anonymous registration | 1-store and 3-store runs end to end, through activation, email preview, access link and the downstream-setup boundary. Never sent to login. `/dashboard` stays blocked afterwards |
| Anonymous account routes (8) | page load → 307 `/login`. RSC request → redirect to `/login` only. No account content in either body |
| Forged role values (cookies / query / storage / metadata) | grant nothing |
| Real admin login (from `.env.qa.local`) | ✓ → `/dashboard`. Protected navigation, add store 2→3 ($197.00), 1→2 failure (plan unchanged), unknown payment (retry blocked), paid-but-attention, store-admin and member personas denied, Stripe portal return and launch error, reload/reset |
| Logout | clears all demo state; account management blocked again |
| Gate M | public **136** + account **84** measurements, **0 failures**. Six widths × two themes, ≥44px targets, no overflow, Sheet Escape and focus return, review layout split at 1024, table↔card switch at 768, keyboard run, 200% zoom proxy |
| Protected paths vs `1d15918` | empty diff |
| Browser request hosts | `localhost:3001` only |

Defects Gate M caught, all fixed:
- the brand link was a 33px target
- a 5px horizontal overflow at 375
- the counter and pills stretched full width on mobile
- **a consent race**: ticking the boxes before the quote arrived was silently undone. The boxes now stay disabled until a current price exists.
- the activation payment track showed an empty amount

**Not tested / gaps:**
- No assistive-technology walk, and no real-device Safari.
- Contrast not re-measured per state.
- Server-side traffic to the Supabase auth host was not captured.
- Account Gate M ran just before a final one-class pill alignment fix. Public suites were rerun after it: 42/42.
- Lint is not configured (inherited).
- npm audit advisories are inherited.

**4. Real-account effects and a warning**
- Engineering performed **3 real sign-ins and 2 logouts** with the `.env.qa.local` admin account. The file was ignored and untracked; its values were never printed, and screenshots mask the real identity.
- ⚠️ **The inherited logout route calls Supabase `signOut()` with its default GLOBAL scope.** Each logout ends **every** session of that account, including any browser where you were signed in. I verified that default in the installed package. The route is protected, so I didn't change it.
- I also removed a test that would have sent fake credentials to the real auth project; mocked unit tests cover that case.

**5. Processes**
- **Mine, still running:** `next start -p 3001` (PID 420447), serving a build of this tree from my session scratchpad, so you can walk it at http://localhost:3001/. I'll stop it on request.
- **PID 40320** (:3457) is untouched.
- `.auth/` is deleted. No Git mutations, no deployment.

**6. What you need to do:** review, then commit and create `qa/ffm-abm-001-subscription-portal`. Suggested scope:
```
git add .gitignore .dockerignore package.json playwright.config.ts e2e src CHANGELOG.md RECOVERY.md \
  agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm agent_docs/SESSIONS/session_2026-10-27.md \
  agent_docs/RESPONSES/response_2026-10-27_160100_e2-review-ffm-abm-001.md
```
`git add src` also records the removal of the old `src/app/(portal)` files, which moved to `(account)`. After that, Cody starts Q1 at `QAM/QAM_ENTRY.md`.

| Deliverable | Path |
|---|---|
| **E2 review ZIP** (149 members, 825,912 bytes) | `/home/moose/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_E2_REVIEW_001.zip` (identical copy in module `EVIDENCE/`) |
| ZIP SHA-256 | `cd17e6a822dd656b5ffdbe4d099b5ffb6aac125058d6abbbe7c66cb23e014cde` |
| Privacy scan | planted-leak control 3 hits / clean control 0. Package: 0 credential literals; 1 reviewed false positive (a variable name in `e2e/helpers.ts`) |
| Response file (this report) | `agent_docs/RESPONSES/response_2026-10-27_160100_e2-review-ffm-abm-001.md` (outside the ZIP because it carries the ZIP receipt) |
| Session file | `agent_docs/SESSIONS/session_2026-10-27.md` |
| Engineering report | `…_ffm_abm/EVIDENCE/E2_ENGINEERING_REPORT.md` (+ logs, Gate M data, masked screenshots in `EVIDENCE/E2/`) |
| Rulings | `…_ffm_abm/RULINGS.md` R-008 verification record, R-009 |
| Stale-instruction check | `…_ffm_abm/EVIDENCE/E2_STALE_INSTRUCTION_CHECK.md` |
| QA handoff | `…_ffm_abm/QAM/HANDOFFS/ENGINEERING_HANDOFF.md` · `QAM/QAM_MANIFEST.md` · `ACCEPTANCE_LEDGER.md` |
| Recovery | `RECOVERY.md` |
