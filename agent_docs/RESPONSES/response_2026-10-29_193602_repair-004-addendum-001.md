✅ REPAIR_004 ADDENDUM_001 COMPLETE — FFM-ABM-001-SUBSCRIPTION-PORTAL (R-013 addendum 2) · ready for JARVIS review

R4-N01 is closed in the service, not just hidden on screen, and the completed-legacy display limitation is closed too. **This is an engineering self-check, not QA certification.** Both stay open until Cody retests.

**What was wrong**
- **R4-N01:**
  - The service accepted every checkout outcome on any `pending` record, and a processing payment is also `pending`. Review's "Edit my details instead" therefore closed a payment already submitted on Stripe, and a second payment could follow.
  - The stand-in still showed every outcome button, and the waiting page offered "resume checkout".
  - A same-key replay was accepted while submitted, and "start a new signup" had no guard at all, so it would discard a processing, unknown or even paid record.
- **Completed legacy record:** when its paid details couldn't be proven, Activation showed the *edited* draft as what was paid for. My baseline showed "Confirmed by Stripe · $99.00", with the amount recomputed, and "Edited after payment is set up".

**What changed**
- **A submitted payment can only be resolved by Stripe's answer.** While a payment is processing or unknown, the service refuses, and leaves everything unchanged:
  - every checkout outcome (paid, processing, back, declined, unknown);
  - starting a checkout, same-key replay included;
  - starting a new signup, which also refuses a paid signup.
  - Resuming was already refused.
- **On screen:**
  - **Review** says "You've already submitted a payment" with **See payment status**. There is no "Edit my details instead", and Continue is disabled. An unknown payment is still sent to the "checkout not completed" page first, as before.
  - **The stand-in** says "You've already submitted this payment" and shows no outcome buttons.
  - **The waiting page** now reads "This usually takes a moment. Your payment has been submitted, so please don't pay again." **This deviates from the approved design**, which offered "resume checkout". I recorded the deviation in RULINGS and UI_SPEC.
- **Still works:**
  - an unsubmitted open checkout can be closed, re-quoted and paid with a new key;
  - a genuine payment failure leads to "Try payment again", a fresh quote and a new key;
  - for an unknown payment, "nothing charged" leads to a fresh quote and a new key;
  - REPAIR_003/004 scope binding, restore and spent keys are unchanged. I removed no failure simulation.
- **Completed record with no provable details:**
  - It stays completed, with its history.
  - It shows "Confirmed by Stripe." and "Your pharmacies are set up…" with no names and no amount.
  - A notice says "We can't show what this payment covered… you don't need to pay again", with support and a reference.
  - There's no payment action, and the email previews name no pharmacies for it.

**Before → after**

| Check | Before | After |
|---|---|---|
| R4-N01 observation (REPAIR_004 probe, unchanged) | Review offered the close; clicking it discarded the payment record and showed a fresh $99.00 quote | **Not offered** |
| New engineering tests (12) | 9 failed / 3 passed (the 3 are the recovery paths that must keep working) | **12/12** |
| New browser spec (7) | 3 failed / 4 passed | **7/7** |

On the baseline, the unknown browser case already passed, because Review redirects it. Its real exposure was the unguarded restart at the service, which the engine test caught.

**Other checks**
- Typecheck 0, build 0, Jest 13 suites 233/233.
- Public + Gate M public browser run: **146/146**, including the REPAIR_004 and REPAIR_003 specs.
- Gate M 224 measurements, 0 failures.
- Contrast: 0 text failures. All 1,314 boundary and focus-ring measurements are at least 3:1, and the R3-O03 ring is still 3.33:1.

**Please note**
- **One spec correction:** my first browser test for unknown expected the Review notice, but Review redirects unknown payments to C14. I changed it to assert the redirect and the locked Continue, then reran it on a rebuilt baseline. Both attempts are kept in the package.
- I didn't rerun Cody's REPAIR_003 retest probes. This addendum doesn't touch the code they exercise, and their regression equivalents passed.
- The new notices have no approved design render.
- The demo "Load scenario" and "Reset" controls still replace the whole demo state. They're demo tools, not a customer path.
- An open legacy checkout that can't be matched still offers "Edit my details instead". It's unsubmitted, so that is the existing R-012 behaviour.
- I didn't run the account tests (that engine is untouched, and skipping them kept real sign-ins at 0), Safari or assistive technology.

**Housekeeping**
- 0 real sign-ins.
- My :3109 server was stopped each time after checking its working directory.
- The session's scratch folder was withdrawn mid-task. I copied my results out of it, deleted my own scratch directory, and packaged straight from the module's EVIDENCE folder.
- I didn't touch :3000, :3457, the `codex` process, the repo `.next` or Cody's QA records (the records diff shows only §9 of the engineering handoff).
- **The REPAIR_004 package is unchanged** (`96075846…4464`, both copies).
- No Git actions.
- Privacy scan: 0 hits (planted control 3, clean control 0).

**Still your call (from addendum 2):** `registrationHarness.setActivationPlan` and the `ACTIVATION_PLANS` re-export are unused. I've left them in place. Should I remove them?

**Next:** JARVIS reviews. Then Tony commits, and Cody retests R3-F01, R3-F02, R3-O03, R4-N01 and the regression. I've stopped here.

| Deliverable | Path |
|---|---|
| **Review ZIP** (80 members incl. `FILE_INDEX.json`, 79 indexed; 1,622,198 bytes) | `/home/moose/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_004_ADDENDUM_001_REVIEW.zip` |
| Canonical ZIP (byte-identical) | `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_004_ADDENDUM_001_REVIEW.zip` |
| ZIP SHA-256 | `0e577f7d16020ddf8c0d02c62be5121ca215273359ffb1b31f67f686e540ec40` |
| Engineering report | `…_ffm_abm/EVIDENCE/REPAIR_004_ADDENDUM_001_ENGINEERING_REPORT.md` |
| Evidence (exact diffs, source copies, before/after, data, screenshots, cleanup) | `…_ffm_abm/EVIDENCE/REPAIR_004_ADDENDUM_001/` |
| Ruling | `…_ffm_abm/RULINGS.md` R-013 addendum 2 |
| Response file (this report) | `agent_docs/RESPONSES/response_2026-10-29_193602_repair-004-addendum-001.md` |
| Session file | `agent_docs/SESSIONS/session_2026-10-29.md` |
