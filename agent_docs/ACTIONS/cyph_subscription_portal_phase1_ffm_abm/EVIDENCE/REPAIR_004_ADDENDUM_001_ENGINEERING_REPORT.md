# REPAIR_004 ADDENDUM_001: engineering report (RULINGS R-013 addendum 2)

Module FFM-ABM-001-SUBSCRIPTION-PORTAL · 29 October 2026 (Asia/Dhaka) · Engineer: Claudy · Authorized by JARVIS (R-010 route).
**This is an engineering self-check, not QA certification.** R4-N01 and the completed-history change stay open until Cody retests independently.

## 1. Preflight
- **Base:** HEAD `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36`, plus the uncommitted addenda 1/2, REPAIR_003, REPAIR_004 and Cody's QAM records. All of it was preserved; nothing was reset, overwritten or committed.
- **Snapshot:** the pre-addendum tree was snapshotted; per-file hashes are in `REPAIR_004_ADDENDUM_001/data/pre-src-sha256.txt`.
- **REPAIR_004 package:** unchanged. Canonical and Downloads copies are both `96075846…4464`, checked at start and end.
- **Not touched:** `:3000` (PID 970525), `:3457` (PID 40320), `codex` (PID 745259) and the repo `.next`.

## 2. Reproduction (before)
R4-N01 observations from REPAIR_004 were turned into assertions before any product change.

| Path | Before |
|---|---|
| Service: every `resolveCheckout` outcome on a processing payment | accepted; `back` then `resumeSignup` discarded it |
| Service: `startCheckout` replay or new key while submitted | replay accepted (a second key was refused) |
| Service: `restartSignup` while processing, unknown or paid | accepted; the payment record was discarded |
| Review (rendered) during processing | "Your checkout on Stripe is still open" + **Edit my details instead**. The click left checkout `null`, activation `null` and a fresh $99.00 quote (`before/eng-submitted-review.json`). |
| Stand-in during processing | every outcome button shown |
| C06 waiting | "nothing was charged and you can resume checkout" (link to the stand-in) |
| Completed legacy record, no provable scope, draft edited after payment | "Confirmed by Stripe · $99.00" (recomputed from the edited draft) and "Edited after payment is set up in OwedBook." |

**Counts on the baseline:**
- New Jest (7 engine + 5 component): 9 failed / 3 passed.
- New browser spec (7): 3 failed / 4 passed.
- The passes are the preserved recovery paths, plus the unknown-payment browser case. Review already redirects an unknown payment to C14; its exposure was the unguarded `restartSignup` at the service.

## 3. Root cause
- `resolveCheckout` accepted any record whose status was `pending` or `declined`, and a processing payment is also `pending`. So Review's `back`, and every stand-in outcome, applied to a payment already submitted on Stripe.
- `startCheckout`'s same-key replay had the same blind spot.
- `restartSignup` had no guard at all.
- Activation fell back to the draft (and to a recomputed list price) whenever a record had no scope.

## 4. Repair
- **Service (`registration.ts`):**
  - `isSubmitted` is now exported, with its definition unchanged: a checkout that is processing (`pending` with payment `pending`) or `unknown`.
  - For a submitted payment, `resolveCheckout` (all outcomes), `startCheckout` (including replay) and `restartSignup` return `conflict` with state unchanged: "Your payment was already submitted. Check its status instead of paying again."
  - `restartSignup` also refuses a paid signup.
  - Legal exits are unchanged:
    - processing → Refresh: confirmed, or failed under the demo failure plan; failed → resume → fresh quote → new key;
    - unknown → confirmed paid, or nothing charged → resume → fresh quote → new key.
  - An unsubmitted open checkout is unchanged.
- **Screens:**
  - **Review:** a submitted payment shows "You've already submitted a payment" with **See payment status**. There is no "Edit my details instead", and Continue is disabled.
  - **Stand-in:** "You've already submitted this payment" with no outcomes. A scope-changed payment keeps its R-013 hold.
  - **C06 waiting:** "This usually takes a moment. Your payment has been submitted, so please don't pay again." This deviates from the approved render, which offered "resume checkout".
  - **C14:** a processing payment links to activation.
- **Unavailable history:**
  - `coveredDetails` returns null for a paid or submitted record with no provable scope.
  - C06 then shows "Confirmed by Stripe." and "Your pharmacies are set up…" without names or amount, plus "We can't show what this payment covered… you don't need to pay again" with support and reference `demo_act_01`. Completed status and records are unchanged, and there is no payment action.
  - C07 previews name no pharmacies ("your pharmacies") and the plan line omits count and price. The checkout-unfinished preview describes the saved draft.

## 5. Validation (owned scratch build of the final tree, `:3109`, then stopped)
| Check | Result | Evidence |
|---|---|---|
| `tsc --noEmit` (repo) | 0 errors | `after/tsc-after.log` |
| `next build` (scratch copy, byte-identical to the final repo `src/` and `e2e/`) | exit 0 | `after/build-after.log` |
| Jest, full repo | 13 suites, **233/233** (was 221) | `after/jest-full-after.{log,json}` |
| New addendum Jest (12) | **12/12** (before: 9 failed / 3 passed) | in the full run; `before/jest-addendum-before.*` |
| `e2e/public.repair004-addendum.spec.ts` (7) | **7/7** (before: 3 failed / 4 passed):<br>• processing and unknown: Review, reload, direct stand-in, Back, payment unchanged<br>• open-checkout close → new key<br>• payment failed → retry → new key<br>• unknown → nothing charged → new key<br>• completed legacy unavailable history, plus C07<br>• Gate M and contrast | `after/pw-addendum-after.log`, `before/pw-addendum-before.log` |
| R4-N01 observation (REPAIR_004 probe) | `offered: false` (before: `offered: true`, payment discarded) | `after/` and `before/eng-submitted-review.json` |
| Affected regression: public + Gate M public | **146/146**. It includes the REPAIR_004 spec (7/7), REPAIR_003, R-012, the six activation scenarios, the C14 intro, the owner declaration, the 21-store journey and Gate M public. | `after/pw-affected-after.log` |
| Gate M | **224 measurements, 0 failures** | `data/gate-m-*.jsonl` |
| Contrast | text: **0 failures** across 84 + 44 screen rows; boundary/focus-ring: **1,314 measurements, 0 below 3:1**; R3-O03 ring unchanged at dark 3.33 / 4.86 | `data/contrast-*.jsonl`, `data/repair-contrast-public.jsonl`, `data/focus-repair004.jsonl` |

Cody's REPAIR_003 RETEST_001 probes were not rerun here: this addendum doesn't change the code they exercise (binding, scope display, focus), and REPAIR_004 recorded their results. Their regression equivalents (`public.repair004.spec.ts`, R-013 Jest) passed in the runs above.

## 6. Limitations
- The new submitted, unavailable-history and C06 waiting copy have no approved design render. The C06 waiting change deliberately deviates from the received design.
- The demo harness (Load scenario / Reset) still replaces the whole synthetic state. It is an explicit demo tool, not a customer path.
- An open legacy checkout that can't be matched still offers Review's "Edit my details instead" (R-012 behaviour for open, unsubmitted checkouts).
- The C07 store-admin tab still shows its sample admin when no covered admin exists. Activation never links to it then.
- The account project was not run (its engine is untouched, and skipping it kept real sign-ins at 0). Safari and assistive technology were not checked.

## 7. Cleanup
See `REPAIR_004_ADDENDUM_001/CLEANUP_AND_LIMITATIONS.md`.

## 8. Changed paths (uncommitted; Git is Director-only)
- **Product (8 files):**
  - `src/services/portal/registration.ts`, `index.ts`
  - `src/components/portal/register/ReviewView.tsx`
  - `handoff/CheckoutStandIn.tsx`
  - `activation/ActivationView.tsx`, `activation/CheckoutIncompleteView.tsx`
  - `references/EmailReferenceView.tsx`, `references/EmailPreview.tsx`
- **Tests:** `src/__tests__/portal-registration.test.ts` (+7, one non-null assertion), `portal-checkout-hold.test.tsx` (+5); new `e2e/public.repair004-addendum.spec.ts` (7).
- **Records:**
  - RULINGS R-013 addendum 2, ACCEPTANCE_SPEC v1.6, DATA_CONTRACT v1.7, UI_SPEC
  - ACCEPTANCE_LEDGER, ENGINEERING_HANDOFF §9
  - STATE, JOURNAL, CHANGELOG, RECOVERY, session file
- **Exact diffs:**
  - `REPAIR_004_ADDENDUM_001/ADDENDUM_001_incremental.diff` (code, on top of REPAIR_004)
  - `ADDENDUM_001_records_incremental.diff` (records)
  - `cumulative_vs_d6fe678.diff` (code)
