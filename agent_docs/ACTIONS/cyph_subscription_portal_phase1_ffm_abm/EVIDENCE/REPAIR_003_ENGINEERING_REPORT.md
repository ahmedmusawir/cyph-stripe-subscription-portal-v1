# REPAIR_003 — Engineering report (RULINGS R-013)

Module FFM-ABM-001-SUBSCRIPTION-PORTAL · 29 October 2026 (Asia/Dhaka) · Engineer: Claudy · Authorized by JARVIS (R-010 route).
**This is an engineering self-check, not QA certification.** Cody's REPAIR_002 RETEST_001 findings R2-F01 and R2-F02 stay open until he retests independently.

## 1. Preflight
- HEAD `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36` on `qa/ffm-abm-001-subscription-portal`. Uncommitted ADDENDUM_001/002 and all of Cody's QAM records and untracked packages were preserved; nothing was reset, overwritten or committed.
- Input: `~/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_RETEST_001_REVIEW.zip`, SHA-256 `a38718e2d5ff19f954a293994b24575da37e2931777b9df33fc285dd1936bd80` (verified), extracted into an empty scratch directory and read as data.
- Unowned servers left alone: `:3000` (PID 970525, repo root; it was PID 916513 earlier today) and `:3457` (PID 40320). A `codex` process (PID 745259, repo root) was also running and was not touched. The repo `.next` was not rebuilt.

## 2. Before repair (base `d6fe678` + addenda, product unchanged)
| Case | Instrument | Result |
|---|---|---|
| R2-F01 service, processing/unknown × count/pharmacy edit | Cody's `repair-boundaries.test.ts`, unchanged apart from its output path | **18 passed / 5 failed**, the same as Cody's run; observations are byte-identical (`before/cody-independent-before.jsonl`) |
| R2-F01 browser, processing/unknown × pharmacy rename | Cody's `submitted-corrected.spec.ts`, unchanged apart from output paths and port | **2 failed**: confirmation enabled; ended `paid`/`confirmed` with "Changed after submission" (`before/cody-browser-before.jsonl`, screenshots) |
| R2-F02 closed key reuse | same Cody file | old key accepted (`oldKeyAccepted: true`) |
| Engineering R-013 suite (new) | `portal-registration.test.ts` "R-013" blocks | **20 failed / 2 passed** (the 2 are the unchanged-behaviour guards: valid replay, payment-failed path) |
| New browser spec | `e2e/public.repair003.spec.ts` | 6 failed, all at the first scope assertion (no scope recorded); the R2-F02 same-page test passes on the baseline because the old service accepted reused keys |

## 3. Root cause
- R2-F01: R-012 closes an *open* checkout on any edit, but deliberately keeps a *submitted* one. Nothing recorded what that submitted payment was for. `checkoutHold` checked only the declaration and completeness of the draft as it is now, so a processing or unknown payment confirmed whatever the draft had become. `touch` also cleared the quote, so Activation then showed the edited count's price.
- R2-F02: `startCheckout` treated an operation key as replayable only while its checkout was `pending`. For a closed record it fell through and opened a new checkout under the old key, and `resumeSignup` forgot the key entirely.

## 4. Repair (R-013)
- **Recorded scope:** `CheckoutRecord.scope` = {storeCount, pharmacies, code?, dueNowCents}, written when a checkout opens and never changed. Seeded checkouts carry their seeded scope.
- **Binding:** `checkoutHold(draft, checkout)` adds `scope_changed`. It compares values (not key order or revision) at every R-012 gate: replay, paid/processing, unknown→paid, and waiting→confirmed. The order is declaration → scope → completeness.
- **Recovery without a second charge:**
  - `restoreSubmittedScope` ("Use the details I paid for") puts the draft back to the scope; the payment then confirms exactly that.
  - For an unknown payment, "nothing charged" stays available, followed by a fresh quote, fresh consent and a new key.
  - A processing payment can still fail.
  - The duplicate-payment conflict is unchanged.
- **Display:** Activation shows the payment's recorded amount and pharmacies.
- **Single-use keys:**
  - `spentCheckoutKeys` collects the key of every checkout that is closed or replaced. It persists through resume and through restart after expiry.
  - `startCheckout` refuses a spent key with `conflict`, state unchanged.
  - Open-checkout replay is unchanged.
  - The review page renews its key once no checkout is open.
- **Storage v3:** a v2 checkout with no scope is bound only when it is provably unedited (open, or submitted with `checkout_pending`). An edited one stays held with "We can't match this payment…", no restore, and support. "Nothing charged" still works.

## 5. Validation (owned scratch build `:3109`, then stopped)
| Check | Result | Evidence |
|---|---|---|
| `next build` (scratch copy of this tree) | exit 0 | `REPAIR_003/after/build-after.log` |
| `tsc --noEmit` | 0 errors | `after/tsc-after.log` |
| Jest, full | 13 suites, **210/210** (was 184 at REPAIR_002 + addenda) | `after/jest-full-after.{log,json}` |
| Jest, R-013 blocks | **22/22** (before: 20 failed / 2 passed) | `after/jest-r013-after.log`, `before/jest-r013-before.*` |
| Component tests (R-013) | 4 new in `portal-checkout-hold.test.tsx`: processing hold → restore → confirm at $99.00; unknown count-edit hold → restore; stand-in hold; storage-v2 rehydrate bound/unbound | in the full Jest run |
| Cody's service file (output path adapted only) | **23/23** (before 18/5) | `after/cody-independent-after.*`, `before/cody-independent-before.*` |
| Cody's browser repro (output paths and port adapted only) | **2/2**: confirmation disabled, payment pending/unknown (before: 2 failed, paid) | `after/cody-browser-after.*`, `before/cody-browser-before.*` |
| New browser spec `e2e/public.repair003.spec.ts` | **7/7**: processing/unknown × name/count edit → held, reload-stable, stand-in held, restore → confirmed $99.00 with the original key; unknown → nothing charged → $148.00 fresh quote → new key; same-page recovery uses a new key; 375/1440 light/dark | `after/pw-repair003-after.log`, `screenshots/repair003-*` |
| Affected regression: public + Gate M public | **131/132**; the 1 failure was my AMENDMENT_001 test pinning storage `version` 2, updated to 3 → that file **5/5** | `after/pw-affected-after.log`, `after/pw-owner-declaration-rerun.log` |
| Gate M (all public measurements in that run) | **204 measurements, 0 failures** | `REPAIR_003/data/gate-m-*.jsonl` |
| Contrast | 0 failures (R-013 holds 12 rows, plus the existing sets) | `REPAIR_003/data/contrast-*.jsonl` |

The affected run included the six activation scenarios (addendum 2), the C14 intro (addendum 1), the R-012 suite, the 21-store journey at $1,079.00, CR-F02 bounds and Gate M public. Three assertions pinned to storage `version: 2` were updated to 3; that was the intended effect of the bump, not a behaviour change.

## 6. Limitations
- The new hold notices have no approved design render (UI_SPEC records them as ours). On C14, "What we saved" still lists the current (edited) draft; the hold underneath names what the payment covers.
- Loading a demo scenario creates a new synthetic state, so it does not carry spent keys. This is deliberate for the demo harness; no customer path does it.
- For an unscoped legacy record that was edited while *processing*, the only path is support or a payment failure. It is reachable only from a sessionStorage blob written by an older build.
- "Use the details I paid for" drops edits made after payment. Adding stores afterwards is the existing account add-store flow and was not exercised here.
- The account project was not rerun. Its engine is untouched, and skipping it avoided any real sign-in. Assistive technology and Safari remain unverified, and zoom was not rerun.
- Cody's QA files were run as adapted copies in scratch, changing output paths (and port) only. His originals and his `/tmp` files were not touched.

## 7. Cleanup
- Owned server `next start -p 3109` (cwd = scratchpad `r006/app`): started twice (baseline, then repaired). Each was stopped by its PID after verifying its cwd; port 3109 is free.
- Deleted scratch copies: `r006/app` (802 MB), `base`, `after`, `pre`, `cur` (symlinks) and the extracted QA input `qa_in`. The `.env.local` in the scratch app held only the three `NEXT_PUBLIC_*` values and was deleted with it.
- **0 real sign-ins, 0 logouts, no saved auth state**; the account project was not run.
- Not touched: `:3000` (PID 970525), `:3457` (PID 40320), `codex` PID 745259, the repo `.next`, Cody's QAM files and his `/tmp` outputs. No Git actions.

## 8. Changed paths (uncommitted; Director-only Git)
- Product (8 files, +200/−20):
  - `src/services/portal/registration.ts`, `registrationService.ts`, `index.ts`
  - `src/types/portal/state.ts`
  - `src/components/portal/activation/ActivationView.tsx`, `activation/CheckoutIncompleteView.tsx`
  - `src/components/portal/handoff/CheckoutStandIn.tsx`
  - `src/components/portal/register/ReviewView.tsx`
- Tests:
  - `src/__tests__/portal-registration.test.ts` (+190)
  - `src/__tests__/portal-checkout-hold.test.tsx` (+90/−1; storage version 2→3)
  - `e2e/public.repair002.spec.ts` (version 2→3)
  - `e2e/public.owner-declaration.spec.ts` (version 2→3)
  - new `e2e/public.repair003.spec.ts`
- Records:
  - RULINGS R-013, ACCEPTANCE_SPEC v1.4, DATA_CONTRACT v1.5, UI_SPEC C05/C06/C14
  - ACCEPTANCE_LEDGER, ENGINEERING_HANDOFF §9
  - STATE, JOURNAL, CHANGELOG, RECOVERY, session file
- Evidence: `EVIDENCE/REPAIR_003/`, this report, and the ZIP.
- Exact diffs:
  - `REPAIR_003/REPAIR_003_incremental.diff` (on top of the addenda)
  - `REPAIR_003/cumulative_vs_d6fe678.diff` (addenda + R-013)
