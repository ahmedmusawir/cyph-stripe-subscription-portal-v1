# REPAIR_006: before and after (R-014 addendum 1)
"Before" is the REPAIR_005 tree at dispatch (product unchanged); "after" is this repair. Same instruments, owned scratch builds on `:3109`.

| Instrument | Before | After |
|---|---|---|
| Cody `qa-oracle/precedence.test.ts` (231) | **226 / 5 failed**, matching his run: 4 × resend accepted on none/unknown/abandoned/expired with a stale confirmed flag (`emailState` failed → sent); 1 × R5-O03 repeat refresh | **230 / 1 failed**: resend refused on all four, state unchanged (`afterEmail: failed`). The 1 is R5-O03, unchanged by design (Lead disposition). |
| Cody `qa-readers/phase-display.spec.ts` (5) | **1 / 4 failed**, matching his run: paid + none → "no payment"; paid + pending → "Waiting…" + Refresh; paid + failed → "Payment didn't go through" + "Try payment again"; nothing-charged → generic "no payment" | **5/5**; terminal reader `hasNothingChargedNotice: true` |
| Cody's reader fixtures (5) | byte-identical to his package | byte-identical |
| Engineering REPAIR_006 Jest (3 engine + 5 component) | **6 failed / 2 passed** (the passes are the valid-resend guards) | **8/8** |
| `e2e/public.repair006.spec.ts` (6) | **5 failed / 1 passed** (valid resend) | **6/6** |

Note: the first after-run of the focused regression was 63/64. The failure was my own R-012 assertion expecting "There's no payment to track yet" for a checkout closed by a withdrawn declaration, which now (correctly, phase first) shows the not-charged notice. I updated that assertion; the rerun was 64/64 (`after/pw-focused-after-run1.log` kept).
