# REPAIR_006: engineering report (RULINGS R-014 addendum 1)

Module FFM-ABM-001-SUBSCRIPTION-PORTAL · 30 October 2026 (Asia/Dhaka) · Engineer: Claudy · Authorized by JARVIS (R-010 route).
**This is an engineering self-check, not QA certification.** R5-F01 and R5-F02 stay open until Cody retests independently.

## 1. Preflight
- **Base:** HEAD `d6fe678` + all uncommitted repairs through REPAIR_005 and Cody's QAM records; preserved, nothing committed. Pre-repair hashes: `REPAIR_006/data/pre-src-sha256.txt`.
- **Input:** `~/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_005_RETEST_001_REVIEW.zip`, SHA-256 `1d3154c4e51f021773941a45eb170f67a13f5da5fd7cdfa977543036763893dd` verified; extracted into an empty scratch directory, read as data.
- **Not touched:** `:3000` (PID 970525), `:3457` (PID 40320), `codex` (PID 745259), the repo `.next`. Cody used `:3115`; mine ran on `:3109`.

## 2. Reproduction (before)
Cody's `qa-oracle` and `qa-readers` probes ran unchanged apart from output paths and the port (`probes/install.sh`):
- oracle 226 passed / 5 failed (his run: 226/5); readers 1 passed / 4 failed (his run: the same four).
- R5-F02 observations: resend `ok: true`, email `failed → sent` on none, unknown, abandoned and expired checkouts.
- R5-F01: paid + none/pending/failed rendered "no payment" / "Waiting…" + Refresh / "Payment didn't go through" + "Try payment again"; the actual nothing-charged path rendered "There's no payment to track yet".

## 3. Root cause
- C06 returned early on `!activation` before reading the payment phase (REPAIR_005 placed the phase check after it), and the paid branch then rendered from the raw flag.
- `resendAccessEmail` checked only the activation flags, never the checkout.

## 4. Repair
- **`consistentActivation(state)`:** the activation counts only where it agrees with the phase (processing ↔ pending, failed ↔ failed, paid ↔ confirmed).
- **C06:** phase first. unknown → existing notice; not charged → terminal notice + "Continue my signup"; **paid without an agreeing activation → "Payment confirmed" + "We can't show setup or access-email status here"** (amount if recorded, support, reference), no tracks, Refresh, retry or resend; none/open → "There's no payment to track yet"; otherwise the existing tracks.
- **`resendAccessEmail`:** paid phase + agreeing activation + setup `ready`; everything else `conflict` with state unchanged. Valid resend unchanged.
- **`readActivation`:** same agreement rule; paid without one answers that setup/email status isn't available.
- **R5-O03:** recorded, not repaired (Lead: nonblocking idempotent no-op; no history/financial mutation).
- Inspected paths and why the rest are unchanged: `REPAIR_006/INSPECTED_PATHS.md`.

## 5. Validation (owned scratch build of the final tree, `:3109`, then stopped)
| Check | Result | Evidence |
|---|---|---|
| `next build` (clean scratch copy, byte-identical to repo `src/`, `e2e/`) | exit 0 | `after/build-after.log` |
| `tsc --noEmit` (repo) | 0 errors | `after/tsc-after.log` |
| Jest, full repo | 13 suites, **248/248** (was 240), incl. the REPAIR_005 224-cell matrix | `after/jest-full-after.*` |
| New REPAIR_006 Jest (8) | **8/8** (before 6 failed / 2 passed): resend refused across 6 checkout records × 4 activation flags + paid with absent/pending/failed + paid still setting up, all unchanged; valid resend from sent and failed; readers; actual nothing-charged | in the full run; `before/jest-r006-before.*` |
| Cody oracle (231) | **230/1** (the 1 = R5-O03, by design; before 226/5) | `after/cody-oracle-after.*`, `after/cody-r5-reader-writer-observations.jsonl` |
| Cody readers (5) | **5/5** (before 1/4) | `after/cody-readers-after.log`, `after/cody-r5-*` |
| `e2e/public.repair006.spec.ts` (6) | **6/6** (before 5 failed / 1 passed): paid × absent/pending/failed (reload-stable; Review redirects to activation); actual nothing-charged → terminal notice → C14 → fresh quote → new key; valid resend from email-failed and from sent; Gate M + contrast | `after/pw-repair006-after.log`, `screenshots/repair006-*` |
| Focused regression (REPAIR_002–006 specs, activation scenarios, owner declaration) | **64/64** (run 1: 63/64, my R-012 assertion; see BEFORE_AFTER) | `after/pw-focused-after*.log` |
| Full public + Gate M public | **156/156** | `after/pw-affected-after.log` |
| Gate M | **236 measurements, 0 failures** | `data/gate-m-*.jsonl` |
| Contrast | 0 text failures across 140 screen rows; 1,314 boundary/ring, 0 below 3:1 | `data/contrast-*.jsonl`, `data/repair-contrast-public.jsonl` |

## 6. Limitations
See `REPAIR_006/CLEANUP_AND_LIMITATIONS.md`.

## 7. Changed paths (uncommitted; Git is Director-only)
- **Product (3):** `src/services/portal/registration.ts` (`consistentActivation`, `readActivation`, `resendAccessEmail`), `src/services/portal/index.ts`, `src/components/portal/activation/ActivationView.tsx`.
- **Tests:** `src/__tests__/portal-registration.test.ts` (+3), `src/__tests__/portal-checkout-hold.test.tsx` (+5), `e2e/public.repair002.spec.ts` (one R-012 assertion updated), new `e2e/public.repair006.spec.ts` (6).
- **Records:** RULINGS R-014 addendum 1, ACCEPTANCE_SPEC v1.8, DATA_CONTRACT v1.9, UI_SPEC C06, ACCEPTANCE_LEDGER, ENGINEERING_HANDOFF §9, STATE, JOURNAL, CHANGELOG, RECOVERY, session file.
- **Exact diffs:** `REPAIR_006/REPAIR_006_incremental.diff`, `REPAIR_006_records_incremental.diff`, `cumulative_vs_d6fe678.diff`.
