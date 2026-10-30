# REPAIR_004: engineering report (RULINGS R-013 addendum 1)

Module FFM-ABM-001-SUBSCRIPTION-PORTAL · 29 October 2026 (Asia/Dhaka) · Engineer: Claudy · Authorized by JARVIS (R-010 route).
**This is an engineering self-check, not QA certification.** Running Cody's probes here is engineering evidence. R3-F01, R3-F02 and R3-O03 stay open until Cody retests independently.

## 1. Preflight
- **Base:** HEAD `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36` on `qa/ffm-abm-001-subscription-portal`, plus the uncommitted addenda 1/2, REPAIR_003, and Cody's QAM records and packages. All of it was preserved: nothing was reset, overwritten or committed. The pre-repair tree was snapshotted to scratch; per-file hashes are in `REPAIR_004/data/pre-src-sha256.txt`.
- **Input:** `~/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_003_RETEST_001_REVIEW.zip`. SHA-256 `ef9097bdf7f6c8dbfa481025133295cce63cbe9005ab53e9a21ea46c95f3d436` was verified. The ZIP was extracted into an empty scratch directory and read as data only; Python ran with `-I`.
- **Not touched:**
  - the servers on `:3000` (PID 970525) and `:3457` (PID 40320)
  - the `codex` process (PID 745259)
  - the repo `.next`
- **Port:** Cody used `:3113`; my owned build ran on `:3109`.

## 2. Reproduction (before repair)
Cody's probes ran as copies in a scratch build. Only these were changed: output paths, the scratch `node_modules` require path, the Chrome profile path and the port.

| Finding | Instrument | Before |
|---|---|---|
| R3-F01 | `qa-independent/migration-recovery.test.ts`, which uses the actual R-011 predecessor engine | 44 passed / 1 failed, as in Cody's run. The R-011 open checkout, edited 1 → 2 stores, was bound to `{storeCount 2, dueNowCents 14800}` and `paid` was accepted. Observations and all four fixtures are byte-identical to Cody's. |
| R3-F01 | `qa-extra/migration-display.spec.ts` | "paid" available → `confirmed`, 2 stores, $148 |
| R3-F02 | same spec, completed-admin fixture | "a separate store invitation went to Replacement Admin" (`claimsReplacementInvitation: true`) |
| R3-O03 | `cody-r3-focus.cjs` at real 200% zoom, dark | 2 shortfalls at 2.9942:1. Restore ring `rgb(249,112,78)` against the warning tint over the card; inner offset 4.3691:1. |

## 3. Root causes
- **R3-F01:** REPAIR_003's `bindLegacyScope` treated any *open* stored checkout as unedited and built the scope from the current draft. A missing quote fell back to `listPrice`.
  - That assumption holds for R-012, which closes an open checkout on any edit.
  - It does not hold for R-011. R-011 kept the checkout `pending`, dropped the quote, cleared consent and bumped the revision.
- **R3-F02:**
  - ActivationView took names and amount from the paid scope but the nominated admin from `draft.pharmacies`.
  - `accessEmailPreviews` and the C07 page read the draft throughout.
- **R3-O03:** a 2px `--ring` sits outside a 2px page-colour offset. In dark, a 10% tint over a card (`bg-warning/10` on `bg-card`) is light enough that the ring/tint ratio drops just under 3:1.
  - warning on card: 2.994
  - success on card: 2.967
  - info on card: 3.035
  - destructive on card: 3.073
  - All tones over the page background are ≥3.54, and every light-theme case is ≥3.43.

## 4. Repair
- **R3-F01, evidence-only binding** (`registration.ts` `bindLegacyScope`):
  - A stored checkout gets a scope only if:
    - (a) the quote it opened with is still held, with the same id, draft revision and count; that quote's `dueNowCents` is the price, or
    - (b) the record still matches its deterministic demo seed: the seed's checkout key, plus a value match with the seed scope.
  - No open-checkout shortcut, no `listPrice` fallback, and the rule is status-independent.
  - `migrateRegistration` (v1) binds before it drops the quote. The declaration is still not assumed.
  - An unproven record stays unbound and is held at every gate. There is no restore, no confirmation, no second checkout while it is pending or unknown, and no "after you paid" copy. Unknown → nothing charged still works.
  - The stand-in shows the existing unmatched notice (`ScopeHold` without a scope): "We can't match this payment to your current details. Please don't pay again. Contact [SUPPORT EMAIL] with reference demo_ck_01."
- **R3-F02, one read of what was paid for:**
  - New `coveredDetails(state)` returns the recorded scope of a live or completed checkout, otherwise the draft.
  - `accessEmailPreviews` and the C07 page (preview, plan line, admin note) use it.
  - ActivationView names a nominated admin only if that admin is in the paid scope. Both the claim and the preview button still require the recorded email outcome `sent`.
  - Payment history is unchanged.
- **R3-O03, local contrast:** `Alert` sets a dark-only `--ring: 12 93% 68%` for itself and its contents.
  - Calculated: outer ≥3.31 on every tone over card and page; inner offset ≥4.85.
  - Measured on the restore button: dark 3.33 outer / 4.86 inner (was 2.99 / 4.37); light unchanged at 4.49 / 4.02.
  - Keyboard order and Enter behaviour are unchanged, and the global token is unchanged.
  - Applicability: WCAG 1.4.11 asks for 3:1 against adjacent colours. The inner side passed already; the outer side was 0.006 short. I applied it as a threshold observation, not as a claim that the old page failed universally.

## 5. Validation (owned scratch build of the final tree, `:3109`, then stopped)
| Check | Result | Evidence |
|---|---|---|
| `next build` (scratch copy, byte-identical to the final repo `src/` and `e2e/`) | exit 0 | `REPAIR_004/after/build-after.log` |
| `tsc --noEmit` (scratch and repo) | 0 errors | `after/tsc-after.log` |
| Jest, full repo | 13 suites, **221/221** (was 210) | `after/jest-full-after.{log,json}` |
| Engineering REPAIR_004 Jest (12, including 1 updated R-013 assertion) | **12/12** (before: 9 failed / 3 passed) | in the full run; `before/jest-r004-before.*` |
| Cody `qa-independent/` (45) | **45/45** (before: 44/1) | `after/cody-independent-after.*`, `after/cody-r3-independent-observations.jsonl` |
| Cody `qa-extra/` browser (6) | **6/6** (before: 2 failed) | `after/cody-extra-after.log`, `after/cody-r3-legacy-browser.json`, `after/cody-r3-admin-display.json` |
| Cody `cody-r3-focus.cjs` (real 200% zoom, dark) | **0 shortfalls**; keyboard restore OK (before: 2 at 2.9942) | `after/cody-r3-focus*.json`, screenshot |
| `e2e/public.repair004.spec.ts` (7) | **7/7** (before: 5 failed / 2 passed):<br>• R-011 hold across reloads<br>• unedited open legacy pays $99.00<br>• legacy unknown → nothing charged → $148.00 with a new key<br>• completed admin, plus its control<br>• focus: dark 3.3301 / 4.8592, light 4.4923 / 4.0206<br>• Gate M and contrast | `after/pw-affected-after.log`, `data/focus-repair004.jsonl`, `screenshots/repair004-*` |
| Affected regression: public + Gate M public, final tree | **139/139** (run 1 was 138/139: my control assertion, corrected, product unchanged) | `after/pw-affected-after.log`, `after/regression-run1/` |
| Gate M (all public measurements in that run) | **212 measurements, 0 failures** | `data/gate-m-*.jsonl` |
| Contrast | text: **0 failures** across 72 + 44 screen rows; boundary/focus-ring: **1,316 measurements, 0 below 3:1** | `data/contrast-*.jsonl`, `data/repair-contrast-public.jsonl` |

The affected run covered:
- the R-013 suite (`public.repair003`) and the R-012 suite;
- the six activation scenarios and the C14 intro;
- the owner declaration;
- the 21-store journey and CR-F02 bounds;
- Gate M public.

## 6. Self-found, not repaired: R4-N01 (for JARVIS)
- While a payment is processing (`checkout.status 'pending'`, `activation.paymentState 'pending'`), Review shows "Your checkout on Stripe is still open" with **Edit my details instead**.
- That button calls `resolveCheckout('back')`, which the service accepts for any `pending` checkout, and then `resumeSignup`. The processing record is discarded (checkout `null`, activation `null`), the page shows a fresh $99.00 quote, and a second checkout can open.
- It is reproduced at the service (`after/eng-submitted-back.log`: `backOk: true, secondCheckoutOk: true`) and in the browser (`before|after/eng-submitted-review.json`, screenshot).
- It predates REPAIR_004 and this diff does not touch it.
- A minimal fix would refuse `back`/`declined`/`unknown` in `resolveCheckout` for a submitted checkout, and show Review's "still open" alert only for an open one. I did not apply it; it needs authorization.

## 7. Limitations
- The unmatched and covered-admin states have no approved design render (UI_SPEC records them as ours).
- The seed-match path depends on the current seed fixtures. A v2 seeded record from a build whose seed details differed would be held, not bound.
- `coveredDetails` falls back to the draft when a completed record has no scope: a legacy paid record edited after payment. In that case Activation shows no admin invitation claim, but its names and amount still come from the draft, as before.
- The C07 store-admin tab still shows its sample admin when the covered scope nominates none. That is existing reference behaviour, and Activation links to that tab only for a covered admin.
- The focus-ring change was checked on alerts only. Other tinted surfaces were not swept.
- The account project was not run (its engine is untouched, and skipping it kept real sign-ins at 0). Safari and assistive technology were not checked. Zoom was checked only through Cody's 200% probe.
- Cody's QA files were run as adapted copies in scratch. His originals and his `/tmp` paths were not touched.

## 8. Cleanup
See `REPAIR_004/CLEANUP_AND_LIMITATIONS.md`.

## 9. Changed paths (uncommitted; Git is Director-only)
- **Product (6 files):**
  - `src/services/portal/registration.ts` (`bindLegacyScope`, `migrateRegistration`, `coveredDetails`, `accessEmailPreviews`)
  - `src/services/portal/index.ts`
  - `src/components/portal/activation/ActivationView.tsx`
  - `src/components/portal/handoff/CheckoutStandIn.tsx`
  - `src/components/portal/references/EmailReferenceView.tsx`
  - `src/components/portal/Alert.tsx`
- **Tests:**
  - `src/__tests__/portal-registration.test.ts`: one R-013 assertion updated, plus 8 tests
  - `src/__tests__/portal-checkout-hold.test.tsx`: 3 tests
  - new `e2e/public.repair004.spec.ts` (7)
- **Records:**
  - RULINGS R-013 addendum 1, ACCEPTANCE_SPEC v1.5, DATA_CONTRACT v1.6, UI_SPEC
  - ACCEPTANCE_LEDGER, ENGINEERING_HANDOFF §9
  - STATE, JOURNAL, CHANGELOG, RECOVERY, session file
- **Exact diffs:**
  - `REPAIR_004/REPAIR_004_incremental.diff` (code, on top of REPAIR_003)
  - `REPAIR_004/REPAIR_004_records_incremental.diff` (records)
  - `REPAIR_004/cumulative_vs_d6fe678.diff` (addenda + REPAIR_003 + REPAIR_004, code)
