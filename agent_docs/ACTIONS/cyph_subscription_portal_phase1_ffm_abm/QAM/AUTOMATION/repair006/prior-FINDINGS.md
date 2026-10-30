# REPAIR_005 independent findings — JARVIS adjudication

Exact snapshot/plan identities in execution report. Original R4-F01/F02 pass. No product repair or certification.

## R4-F01 / R4-F02 original retest — PASS
46 original service/predecessor cases,5 corrected original-browser cases and2 explicit actual-fixture resolution branches pass. Nothing-charged clears activation; stale refresh cannot resurrect the checkout. Unknown+failed is retained until authoritative paid/nothing-charged resolution. Recovery needs fresh quote/consent/key. Independent224-cell phase/action oracle passes exact outcomes and refusal identity/deep-state invariants. Current240Jest/66browser regressions pass.

## R5-F01 — Activation rendering still follows stale flags in paid/cleared-terminal cases
Acceptance consistency failure, AC11/R-014 reader precedence; severity for Lead.
Bounded mixed controls keep checkout paid but activation is none,pending,failed. paymentPhase correctly returns paid; UI respectively says no payment, waiting confirmation, or payment failed. Pending shows a Refresh control that the service refuses; failed shows Try payment again even though paid-history service guards refuse resume. Paid+confirmed control passes. No paid record is discarded and no new payment is proven. These are controlled matrix states; no claim that normal current flow creates the conflicting paid flags.
Separately, the actual current unknown→nothing charged result clears activation; early !activation rendering shows generic 'There's no payment to track yet' instead of the declared terminal notice/Continue my signup. Data is correct; notice/path differs. Evidence: paid-reader-observations.jsonl, terminal-reader.json, readers.json/log, screenshots. Browser hard assertions fail3paid conflicts+1terminal notice. Failed mixed cases stop at their first hard assertion; do not claim all were reloaded twice.

## R5-F02 — Resend accepts stale confirmed activation on nonpaid checkout
Service/history consistency failure, R-014 precedence and AC11 three-track coherence; Lead determines severity/applicability.
Bounded checkout states none/unknown/abandoned/expired with activation.confirmed,setup.ready,email.failed: resendAccessEmail returns ok and changes emailState to sent. Authoritative phases are none/unknown/not_charged. The method checks raw activation flags and not checkout phase. Four negative assertions fail. No real email or account action; unknown UI hides resend, so this is direct/stale service-call evidence, not ordinary UI exposure. Evidence: reader-writer-observations.jsonl and oracle-results.json/log.

## R5-O03 — Stale refresh after completed setup returns success
Contract observation for Lead. Normal paid→refresh reaches setup.ready/email.sent. Repeating refresh returns ok/new state identity although deep content is unchanged. R-014 says refresh only for processing or paid while still being set up; the hard refusal/identity expectation fails. No financial/store/email timestamp mutation observed. Distinguish this no-op discrepancy from original resurrection, which is fixed. Evidence: ready-repeat-refresh row and failed assertion.

## Limits/history
Core224 cells match engineering's permissions/phase summaries, but independent effects checks are stronger and extra methods/readers are outside that matrix. Corrected C07 assertions used; superseded attempts retained without rerunning known-invalid checks. No helper/assertion changes for green in this run. Original two-worker OOM log preserved; no exhaustion probe. Tony acceptance retained; Lead/Architect decisions pending.
