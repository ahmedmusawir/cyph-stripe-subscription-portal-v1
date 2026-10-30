✅ REPAIR_002 ADDENDUM 1 COMPLETE — C14 unknown-payment wording (R-012 addendum 1)

The unknown-payment state of the saved-signup page now opens with "Your details are saved. We're checking your payment status. Please don't pay again yet." It no longer says "Payment wasn't completed". The payment lock and recovery behaviour are unchanged. **This is not QA certification.**

| Item | Result |
|---|---|
| Base | You committed REPAIR_002 as `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36`; `src` and `e2e` were clean before this change |
| Change | 1 product file (`CheckoutIncompleteView.tsx`), unknown state only. I used straight apostrophes to match the page's existing copy. The contradiction came from the received design, which used the same introduction for every state; that design copy is kept as history. |
| Unchanged | Abandoned and declined keep "Your details for N pharmacies are saved. Payment wasn't completed, so your account isn't active yet." Continue and Review stay disabled while payment is unknown. "Stripe confirms nothing charged" still leads to the resumable page, and the R-012 holds are unchanged. |
| Checks | Build 0, typecheck 0. Jest 183/183, including 3 new component checks. Focused browser check 6/6: unknown, abandoned and declined at 375 and 1440 px, light and dark, plus the existing unknown and abandoned journeys. Gate M 12/0, contrast 0 failures. No full retest, as the QA Lead allowed. |
| Records | RULINGS R-012 addendum 1, UI_SPEC C14, REPAIR_002 report §10, engineering handoff §9, STATE, JOURNAL, CHANGELOG, RECOVERY. The committed REPAIR_002 ZIP is unchanged. |
| Account and processes | 0 real sign-ins. My server :3107 is stopped and the `r004` scratch copy is deleted. :3000 and :3457 were not touched. No Git actions. Privacy scan 0 hits (planted control 3, clean control 0). |

**What you need to do:** commit the addendum on top of `d6fe678`. Then record the new SHA as the candidate before final certification. Suggested scope:
```
git add src/components/portal/activation/CheckoutIncompleteView.tsx src/__tests__/portal-checkout-hold.test.tsx e2e/public.repair002.spec.ts CHANGELOG.md RECOVERY.md \
  agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/{RULINGS.md,STATE.md,JOURNAL.md,_project/UI_SPEC.md,QAM/HANDOFFS/ENGINEERING_HANDOFF.md,EVIDENCE/REPAIR_002_ENGINEERING_REPORT.md,EVIDENCE/REPAIR_002/addendum_001,EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_ADDENDUM_001_REVIEW.zip} \
  agent_docs/SESSIONS/session_2026-10-29.md agent_docs/RESPONSES/response_2026-10-29_135500_repair-002-addendum-001.md
```
I've stopped here.

| Deliverable | Path |
|---|---|
| **Addendum ZIP** (34 members incl. `FILE_INDEX.json`, 33 indexed; 1,078,994 bytes) | `/home/moose/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_ADDENDUM_001_REVIEW.zip` (identical canonical copy in module `EVIDENCE/`) |
| ZIP SHA-256 | `f852ff94664b0e0a664582c213a8334d8b779758e3f8f2c8fbd88a4b1c0019e7` |
| Record | `…_ffm_abm/EVIDENCE/REPAIR_002_ENGINEERING_REPORT.md` §10 · evidence `…/EVIDENCE/REPAIR_002/addendum_001/` |
| Ruling | `…_ffm_abm/RULINGS.md` R-012 addendum 1 |
| Response file (this report) | `agent_docs/RESPONSES/response_2026-10-29_135500_repair-002-addendum-001.md` |
| Session file | `agent_docs/SESSIONS/session_2026-10-29.md` |
