✅ REPAIR_002 ADDENDUM 2 COMPLETE — activation demo controls simplified (R-012 addendum 2)

"Next activation check" is gone from the public demo bar. **Registration scenario → Load** is now the only way to pick a named activation state. Each state appears as named and stays that way until a customer action. **This is not QA certification.**

**Why Tony saw nothing happen.** I reproduced it on an owned build of the current candidate, trying every option on every activation state. This is a demo-usability problem; I found no engine failure.
- The option only took effect on the *next* "Refresh status", so picking it changed nothing on screen.
- Email failed, payment failed and ready have no Refresh status, so on those screens the option did nothing at all.
- Loading any scenario resets the option to "ready". That is the reset Tony saw.
- Every Refresh result matched the engine's rules.
- On the unchanged build, the six scenarios already loaded and progressed correctly. That's why the fix is only the removal; the engine is untouched.

**Each named state after the change:**

| Scenario loaded | Shown | Customer action | Next |
|---|---|---|---|
| Waiting for payment | Waiting for payment confirmation | Refresh status (twice) | Setting up → You're in |
| Provisioning | Payment confirmed. Setting up… | Refresh status | You're in |
| Delayed setup | Paid — setup is taking longer | Refresh status | You're in |
| Email failure | You're set up — the access email didn't send | Resend access email | You're in ("Sent again") |
| Payment failure | Payment didn't go through | Try payment again | Review: fresh quote, consent unticked, no open checkout, so no second payment |
| Ready | You're in. Check your email. | Resend access email | "Sent again"; no Refresh status |

Every state stayed exactly as loaded after a 2.5-second wait and a reload.

**Checks**
- Typecheck 0. Focused Jest 76/76, including a new component test for the demo controls.
- New browser spec 9/9:
  - control absent, and no customer actions inside the demo strip
  - the 6 scenarios
  - keyboard only: Tab → open controls → arrow-select → Load → Tab → Refresh
  - mobile 375 and desktop 1440, light and dark
- Affected existing tests 35/35: activation contrast, R-012 holds, 21-store journey, Gate M public.
- Gate M 180/0, contrast 0 failures.

**Preserved**
- Payment, owner-declaration and R-012 safeguards; the unknown-payment honesty and duplicate-payment lock; completed history.
- ADDENDUM_001, still uncommitted, and its ZIP.
- Earlier ZIPs unchanged (REPAIR_002 `1c8a5465…`, ADDENDUM_001 `f852ff94…`).
- Cody's candidate `d6fe678`, his build and his records.

**Housekeeping:** 0 real sign-ins. My :3108 server is stopped and its scratch copy deleted; I didn't touch :3000 or :3457. No Git actions. Privacy scan: 0 hits (planted control 3, clean control 0).

**Your call:** two things are now unused: `registrationHarness.setActivationPlan` and the `ACTIVATION_PLANS` re-export. I left them in place; should I remove them? The engine's plan logic itself is still in use.

**Next:** JARVIS reviews. Then Tony commits ADDENDUM_001 and ADDENDUM_002 together, and that commit's SHA is recorded as the candidate. QA includes the scenario check in the addendum verification. I've stopped here.

| Deliverable | Path |
|---|---|
| **Addendum 2 ZIP** (53 members incl. `FILE_INDEX.json`, 52 indexed; 1,057,328 bytes) | `/home/moose/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_ADDENDUM_002_REVIEW.zip` |
| Canonical ZIP (byte-identical) | `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_ADDENDUM_002_REVIEW.zip` |
| ZIP SHA-256 | `ce6683df74a466fd5b8ce2c8ccf57bc59824fdb4f99d3a70ddca9d1e2ceec195` |
| Record and scenario table | `…_ffm_abm/EVIDENCE/REPAIR_002_ENGINEERING_REPORT.md` §11 · `…/EVIDENCE/REPAIR_002/addendum_002/SCENARIO_RESULTS.md` |
| Ruling | `…_ffm_abm/RULINGS.md` R-012 addendum 2 |
| Response file (this report) | `agent_docs/RESPONSES/response_2026-10-29_144500_repair-002-addendum-002.md` |
| Session file | `agent_docs/SESSIONS/session_2026-10-29.md` |
