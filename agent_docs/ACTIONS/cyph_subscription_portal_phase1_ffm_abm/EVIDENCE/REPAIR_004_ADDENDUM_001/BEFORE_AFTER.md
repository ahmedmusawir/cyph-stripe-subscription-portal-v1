# REPAIR_004 addendum 1: before and after (R-013 addendum 2)
"Before" is the REPAIR_004 tree at dispatch (product unchanged). "After" is this addendum. The same instruments ran on both, against owned scratch builds on `:3109`.

| Instrument | Before | After |
|---|---|---|
| R4-N01 observation (REPAIR_004 probe, unchanged) | Review offered "Edit my details instead" on a processing payment; clicking it left checkout `null`, activation `null` and a fresh $99.00 quote | **not offered**; nothing to click |
| Engineering Jest, new (7 engine + 5 component) | **9 failed / 3 passed**.<br>Failures:<br>• every outcome / replay / restart accepted for processing<br>• `restartSignup` accepted for unknown and for paid<br>• `coveredDetails` built from the edited draft<br>• Review offered "Edit my details instead" / no notice<br>• stand-in showed outcomes<br>• C06 "resume checkout"<br>• completed legacy showed "$99.00" and "Edited after payment is set up".<br>The 3 that pass are recovery guards: open checkout close/re-quote, failure recovery, nothing-charged recovery. | **12/12** |
| `e2e/public.repair004-addendum.spec.ts` (7), corrected spec | **3 failed / 4 passed**: processing Review/stand-in/back; completed legacy "$"; screens. The unknown case passes because Review already redirects to C14; its exposure was only `restartSignup` at the service (engine test). The other 3 that pass are the preserved recovery paths. | **7/7** |

Notes:
- **Spec attempt 1:** the unknown case expected the Review notice, but Review redirects an unknown payment to C14. Both logs are kept: `before/pw-addendum-before-attempt1.log` (4 failed / 3 passed) and `after/pw-addendum-after-attempt1.log` (6/1). The spec was corrected to assert the redirect and C14's locked Continue. The corrected spec was rerun on a rebuilt baseline (`before/pw-addendum-before.log`) and on the repaired build (`after/pw-addendum-after.log`).
- The before observation is `before/eng-submitted-review.json`; the after observation is `after/eng-submitted-review.json`.
