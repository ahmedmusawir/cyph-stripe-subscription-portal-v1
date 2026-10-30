# REPAIR_005: engineering report (RULINGS R-014)

Module FFM-ABM-001-SUBSCRIPTION-PORTAL · 30 October 2026 (Asia/Dhaka) · Engineer: Claudy · Authorized by JARVIS (R-010 route).
**This is an engineering self-check, not QA certification.** R4-F01 and R4-F02 stay open until Cody retests independently.

## 1. Preflight
- **Base:** HEAD `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36`, plus the uncommitted addenda 1/2, REPAIR_003, REPAIR_004, REPAIR_004 ADDENDUM_001 and Cody's QAM records. All preserved; nothing reset, overwritten or committed. Pre-repair hashes: `REPAIR_005/data/pre-src-sha256.txt`.
- **Input:** `~/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_004_RETEST_001_REVIEW.zip`, SHA-256 `8f2dff8c423c46b2f8fb9ab816f1fe18fd4d8694a0869bc1bb85df9e7ce874b3` verified; extracted into an empty scratch directory and read as data (Python with `-I`).
- **Not touched:** `:3000` (PID 970525), `:3457` (PID 40320), `codex` (PID 745259), the repo `.next`. Cody used `:3114`; my owned build ran on `:3109`.

## 2. Reproduction (before)
Cody's probes ran as copies in a scratch build; only output paths and the port were changed (`probes/install.sh`).

| Finding | Instrument | Before |
|---|---|---|
| R4-F01 | `qa-transition/submitted.test.ts` with the actual d6fe678 engine: open → processing → unknown, then current nothing-charged, then stale refresh | refresh accepted → checkout `paid`, payment `confirmed`, original key. Observation byte-identical to Cody's. |
| R4-F01 | `qa-transition-browser/*` on his fixture | Refresh offered on `/demo/activation`; after the click, `paid`/`confirmed` |
| R4-F02 | same Jest file: processing → payment failed → stale unknown, then resume | resume accepted → checkout and activation `null`; a second checkout with a new key then accepted |
| R4-F02 | browser, his fixture | "Try payment again" offered; after the click, a fresh $99.00 Review with the record gone |

Counts: service 43 passed / 3 failed; browser R4 cases failed in both spec files. All five fixtures byte-identical to his.

## 3. Root cause
- `refreshActivation` read only `activation.paymentState`. With `pending` it confirmed whatever checkout was attached, including an `abandoned` one; with `failed` it returned a silent success.
- `resumeSignup` accepted "or activation failed" as a reason to resume, so an `unknown` checkout carrying an old failed flag was discarded without being resolved.
- `resolveUnknownPayment('not_charged')` closed the checkout but left the activation behind, which is what made the R4-F01 record reachable from a legitimate current action.
- The d6fe678 engine had produced both conflicting records (it accepted "unknown" on a processing checkout, and after a failure).

## 4. Repair (R-014)
- **One precedence read, `paymentPhase(state)`:** the checkout record governs; the activation flag counts only where it agrees with it. paid → unknown → processing/open → failed → not charged (table in RULINGS R-014).
- **Writers:**
  - `refreshActivation` advances only a processing payment, or a paid one whose activation is `confirmed` and still being set up. Everything else is refused with `conflict` and the state unchanged (the submitted message for unknown, "This payment was already resolved…" otherwise).
  - `resumeSignup` requires an `abandoned` or `declined` checkout. A genuine failure already leaves the checkout `declined`, so failure recovery is unchanged; a stale failed flag on an unknown checkout no longer counts.
  - `resolveUnknownPayment('not_charged')` clears the activation: terminal, nothing left to refresh.
  - `resolveCheckout`, `startCheckout`, `restartSignup`: unchanged (R-013 addendum 2 already refuses submitted and paid records).
- **Readers:** C06 renders from the phase. Unknown → "We're still checking whether a payment went through" with a link to C14, no Refresh or retry. Not charged → "Nothing was charged for this payment" with "Continue my signup", no Refresh. "Try payment again" only for a recorded failure on a declined checkout.
- **Migration:** inspected, left alone. Conflicting flags are retained as history; rewriting them would be choosing an authority silently, and the readers now apply the same precedence to old and new records. No storage-version bump.

## 5. Validation (owned scratch build of the final tree, `:3109`, then stopped)
| Check | Result | Evidence |
|---|---|---|
| `next build` (scratch copy, byte-identical to the final repo `src/` and `e2e/`) | exit 0 | `after/build-after.log` |
| `tsc --noEmit` (repo) | 0 errors | `after/tsc-after.log` |
| Jest, full repo | 13 suites, **240/240** (was 233) | `after/jest-full-after.{log,json}` |
| Engineering REPAIR_005 Jest (7) | **7/7** (before: 6 failed / 1 passed) | in the full run; `before/jest-r005-before.*` |
| Transition matrix | 32 states × 7 actions = **224 cells**; 67 allowed, 157 refused, every refusal with the state object unchanged | `TRANSITION_MATRIX.md`, `data/transition-matrix.json` |
| Cody `qa-transition/` (46) | **46/46** (before 43/3) | `after/cody-transitions-after.*`, `after/cody-r4-transition-observations.jsonl` |
| Cody `qa-transition-browser/` | R4-F01 and R4-F02 pass in both spec files; `admin-corrected` 5/5. The two `legacy-transitions` covered-admin cases fail on his superseded expectation, before and after. | `after/cody-browser-after.log`, `after/cody-r4-*-browser.json`, screenshots |
| `e2e/public.repair005.spec.ts` (4) | **4/4** (before: 3 failed / 1 passed): R4-F01 reload-stable, recovery with a new key; R4-F02 reload-stable, Review/stand-in submitted, C14 resolves then recovery; paid branch; Gate M + contrast | `after/pw-repair005-after.log`, `screenshots/repair005-*` |
| Affected regression: public + Gate M public | **150/150** (REPAIR_003, REPAIR_004 + addendum, R-012, activation scenarios, C14 intro, owner declaration, 21-store journey, Gate M public) | `after/pw-affected-after.log` |
| Gate M | **232 measurements, 0 failures** | `data/gate-m-*.jsonl` |
| Contrast | text: 0 failures across 136 screen rows; boundary/focus-ring: 1,314 measurements, 0 below 3:1 | `data/contrast-*.jsonl`, `data/repair-contrast-public.jsonl` |

## 6. Limitations
See `REPAIR_005/CLEANUP_AND_LIMITATIONS.md`.

## 7. Changed paths (uncommitted; Git is Director-only)
- **Product (3 files):** `src/services/portal/registration.ts` (`paymentPhase`, `refreshActivation`, `resumeSignup`, `resolveUnknownPayment`), `src/services/portal/index.ts`, `src/components/portal/activation/ActivationView.tsx`.
- **Tests:** `src/__tests__/portal-registration.test.ts` (+4 incl. the matrix), `src/__tests__/portal-checkout-hold.test.tsx` (+3), new `e2e/public.repair005.spec.ts` (4).
- **Records:** RULINGS R-014, ACCEPTANCE_SPEC v1.7, DATA_CONTRACT v1.8, UI_SPEC C06, ACCEPTANCE_LEDGER, ENGINEERING_HANDOFF §9, STATE, JOURNAL, CHANGELOG, RECOVERY, session file.
- **Exact diffs:** `REPAIR_005/REPAIR_005_incremental.diff` (code), `REPAIR_005_records_incremental.diff` (records), `cumulative_vs_d6fe678.diff` (code).
