# REPAIR_005: before and after (R-014)
"Before" is the tree at dispatch (REPAIR_004 + addendum 1, product unchanged). "After" is this repair. The same instruments ran on both, against owned scratch builds on `:3109`.

| Instrument | Before | After |
|---|---|---|
| Cody `qa-transition/` (Jest, 46 tests, with the actual d6fe678/R-011 predecessor engines) | **43 passed / 3 failed**: stale refresh → `paid`/`confirmed` on an abandoned checkout; resume discarded the unknown+failed record; a second checkout then opened. Observations byte-identical to Cody's (`before/cody-r4-transition-observations.jsonl`). | **46/46**: refresh refused (`abandoned` kept); resume refused (`unknown`/`failed` kept); second checkout refused |
| Cody `qa-transition-browser/` (10 = 2 spec files × 5) | R4-F01 and R4-F02 **fail in both files** (Refresh offered → `paid`; "Try payment again" offered → record discarded). The two `legacy-transitions` covered-admin cases fail on Cody's superseded full-name expectation, which his `admin-corrected` file replaces; identical before and after, not a product finding. | R4-F01 and R4-F02 **pass in both files** (`refreshOffered: false`, `retryOffered: false`, records unchanged). `admin-corrected` 5/5. |
| Cody's fixtures | 5 of 5 byte-identical to his package | 4 of 5 identical. `notcharged-stale` now stores `activation: null`: the current nothing-charged step clears it. The browser test on it still passes. |
| Engineering REPAIR_005 Jest (4 engine incl. the matrix + 3 component) | **6 failed / 1 passed** (the pass is the "genuine failure/processing still show their controls" guard). One engine test fails on the baseline for a missing export (`paymentPhase`) as well as the behaviour. | **7/7**; matrix 224 cells, 67 allowed, 157 refused with state unchanged |
| `e2e/public.repair005.spec.ts` (4) | **3 failed / 1 passed** (the pass is the unknown → "Stripe confirms payment" branch, which must keep working) | **4/4** |

The R4-N01 style observation from REPAIR_004 is not repeated here; its assertions live in `public.repair004-addendum.spec.ts`, which ran in the affected regression.
