# REPAIR_004: before and after (R-013 addendum 1)
"Before" is `d6fe678` plus addenda 1/2 plus REPAIR_003, with the product unchanged (a snapshot of the working tree at dispatch). "After" is this repair. The same instruments ran on both, against owned scratch builds on `:3109`.

| Instrument | Before | After |
|---|---|---|
| Cody `qa-independent/` (Jest, 45 tests: `migration-recovery.test.ts` + `original-boundaries.test.ts`, with the actual R-011/R-012 predecessor engines) | **44 passed / 1 failed**, the same as Cody's run. "genuine r011 v2 open checkout edited after quote must not invent scope" fails: it binds `storeCount 2 / dueNowCents 14800` and `paidOK: true`. Observations are byte-identical to Cody's. | **45/45**. The R-011 case has no bound scope and `paidOK: false`. |
| Cody `qa-extra/` (browser, 6) | **2 failed / 4 passed**, the same as Cody's run:<br>• R-011 fixture: paid available → `confirmed`, 2 stores at $148.<br>• Completed admin: "a separate store invitation went to Replacement Admin". | **6/6**:<br>• R-011 fixture: `paidAvailable: false`, no scope.<br>• Completed admin: no claim, no preview. |
| Cody `cody-r3-focus.cjs` (real 200% zoom, dark unknown hold) | 2 focus shortfalls at **2.9942:1** (restore ring vs warning tint); keyboard restore OK | **0 shortfalls**; ring `hsl(12 93% 68%)`; keyboard restore OK |
| Fixtures produced by Cody's Jest file | byte-identical to the four fixtures in his package | byte-identical (they come from the predecessor engines, so they are unchanged by the repair) |
| Engineering REPAIR_004 Jest (8 engine + 3 component, plus 1 updated R-013 assertion) | **9 failed / 3 passed**. The 3 that pass are guards: an unedited open checkout still binds, an edited seed stays unbound, closed-checkout previews follow the draft. | **12/12** |
| `e2e/public.repair004.spec.ts` (7) | **5 failed / 2 passed**:<br>• R-011 hold missing; stand-in screen not held.<br>• Admin claim and preview from the draft; control showed Replacement.<br>• Dark ring outer 2.9942. | **7/7** (see note) |

Notes:
- **Before-run attempt 1:** my focus test computed the inner ratio as NaN, because the luminance helper included alpha. It was fixed before the recorded before run (`before/pw-repair004-before-attempt1.log` kept).
- **After-run attempt 1** of the full regression: 138/139. The one failure was my R3-F02 control assertion: it expected "sam ortiz", but the preview greets "Sam," with the masked `s•••@` address. I corrected the assertion (the product was unchanged), then reran on a rebuild of the final tree (`after/regression-run1/` kept).
- **Before-run note:** the engineering test "storage v1: the quote proves the scope before migration drops it" calls `migrateRegistration` alone. Before the repair that function dropped the quote without binding, and the facade's later bind would have used `listPrice` (the same 9900 in this case).
- **R4-N01 observation** (`before/eng-submitted-review.json`, `after/eng-submitted-review.json`, `after/eng-submitted-back.log`): reproduced both before and after. It is not repaired: the code path (`resolveCheckout`, ReviewView) is untouched by this diff.
