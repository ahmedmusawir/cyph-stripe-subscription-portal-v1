# REPAIR_002 retest findings — Lead adjudication required

Candidate: frozen base d6fe678 plus ADDENDUM_001/002; exact identity in snapshot-input-manifest.json (hash in report). No self-certification.

## R2-F01 — Submitted/unknown payment can confirm edited scope (acceptance failure)
Affected AC-05/08/10/11/13 and material-edit consistency requirement in released retest. Proposed blocking financial-state inconsistency; JARVIS decides severity.
1. Prefilled1 pharmacy → quote$99 → separate terms/recurring consent → open checkout.
2. Submit Payment processing, or Return before confirmation (unknown).
3. Edit pharmacy name through normal pharmacy form and wait for review navigation/persisted changed value.
4. Directly return activation/checkout-incomplete. Refresh status / Stripe confirms payment remains enabled.
5. Action succeeds; checkout paid/payment confirmed, quote null, changed pharmacy appears under setup. Original key remains.
Independent service variations also increase count1→2 and enter a second valid pharmacy. Both processing and unknown resolution confirm the2-store draft under the original1-store/$99 operation, without a new quote. This is observed state inconsistency; no real Stripe/payment/provisioning occurs. Engine touch preserves submitted checkout but clears quote/consents; checkoutHold checks only current completeness/declaration. No immutable submitted-scope/price snapshot was observed. Do not treat this finding as a recommendation to charge again for in-flight money.
Evidence: cody-r2-independent-observations.jsonl (4 submitted-scope cases), corrected browser results/JSONL and submitted-processing/unknown screenshots. First uncorrected browser attempts are INVALID for this finding because one selector was absent and the other navigated before save.

## R2-F02 — Closed operation key accepted for a fresh checkout (service contract gap)
Withdraw declaration from open checkout → abandoned/owner_declaration; reaccept explicitly → fresh quote → fresh terms/recurring consent. startCheckout with old operation key returns ok; new key also returns ok when independently applied to same pre-checkout state. Released recovery requirement specifies a new key. Main UI valid recovery DOES use a different key; the failure is service enforcement, not demonstrated double charging. Evidence: independent closed-key-reuse row; hard failed service assertion. Lead sets severity and scope interpretation.

## Prior findings and affected presentation
- CR-F01 original current-UI Continue/Back and legacy-v1 pending bypass: NOT reproduced. Service refusals, unavailable UI actions, reload/deep-link guard and valid recovery pass. Strict missing/false/string true/1/null/job-title substitution checks pass. Processing/unknown declaration holds and reacceptance without material edit pass. Completed checkout/payment history record preserved; nonpayment outcomes remain available. New exceptions above remain open.
- CR-F02 eager allocation/far-index: NOT reproduced in bounded probes. Zero push growth for billion count; entries1, far writes refused. Restored/malformed/numeric boundary tests, reduction/restoration, pharmacy100 and full21-store activation$1,079 pass. No arbitrary business cap added. No RAM-exhaustion test executed.
- Q2-O04 Actions divider/spacing: repaired geometry independently passes mobile top1px/padding20px, desktop left1px/padding32px/width320px, gaps12px. Masked mobile/light and desktop/dark images inspected. New notices both themes/mobile/desktop and actual zoom checked. No pixel-perfect claim or approved render for new holds.
- Q2-F02 load-error persistence/Retry and Q2-F03 repeated/case/whitespace/unknown Stripe modes HTML/RSC: pass current targeted regression.
- Addenda001/002 source bytes match reviewed packages; engineering focused evidence reused with provenance. Necessary C14/activation shared-engine checks folded into85-test run. Tony acceptance is attributed, not certification.

## Instrument/record limits
85 baseline browser tests and184 current Jest pass, while independent23-service set has18 pass/5 fail and corrected browser2 fail. Previous false/invalid helper verdicts are not counted as additional product findings. Two-worker engineering OOM discrepancy preserved. Actual zoom screenshots initially clipped by fullPage capture; direct CDP corrected capture confirms normal reflow. Privacy/egress limits and evidence reuse detailed in report.
