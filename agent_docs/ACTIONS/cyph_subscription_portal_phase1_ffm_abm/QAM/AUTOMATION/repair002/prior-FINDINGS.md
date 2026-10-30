# Combined retest findings — executor observations for JARVIS

## CR-F01 — Required declaration bypass through retained pending checkout (AC-06a)
**FAIL; proposed acceptance blocker.** Fresh registration correctly starts unchecked, strict invalid values reject, review deep links without pending checkout block, and ordinary owner validation works. But a pending checkout survives declaration removal.

Reproduction A (legacy): create accepted synthetic draft → quote → terms/recurring consents → pending checkout; remove declaration and add old businessRole; migrate/reload. Useful details remain, declaration becomes false and quote clears, but checkout remains pending. The stand-in renders Payment succeeds after settling; clicking it records checkout paid and payment confirmed with acceptance still false.

Reproduction B (current UI): enter accepted demo checkout → navigate owner → uncheck declaration → Continue shows error → directly revisit /demo/stripe. After loading settles the paid action is still usable; it reaches activation with false acceptance. This is not limited to forged job-title values or an old draft.

Service probe independently expected resolveCheckout to reject and failed: result.ok=true, pending→paid. Source registration.ts:440+ replays same-key pending checkout before completeness validation; resolveCheckout:481+ checks checkout existence/status but not the declaration. These are source observations supporting the behavioral evidence, not a proposed product repair. No real charge/account creation occurs.

Evidence: cody-combined-legacy-service.json; legacy-browser-settled.json; unchecked-pending.json/png; independent-jest.json; extra-corrected-results.json; unchecked-results.json and retained test sources. Initial premature legacy-browser.json result is invalidated; do not use it as PASS. Lead assigns severity/disposition.

## CR-F02 — Huge accepted count eagerly allocates objects (AC-05 / repeat-N risk)
**Risk demonstrated with a bounded instrument; Lead adjudication.** The numeric pricing guard accepts 1,000,000,000. setStoreCount loops and pushes an empty pharmacy object for every entry. An executor hook intercepted Array.push and threw after 64 allocated entries (65th attempted push), then restored the native function. No huge allocation or RAM exhaustion was attempted. Safe integer pricing does not bound practical memory consumption. UI increments normally one at a time, so the extreme case is a service/hostile state risk, not evidence of a remote server exploit. The complete ordinary 21-store flow passed with21 distinct submitted pharmacies and $1,079.00 at review/checkout/activation. Evidence: allocation.json, independent owner-boundaries test,21journey.json. No new business cap is authorized by this report.

## Original repair findings
- **Q2-F01:** not reproduced on current rendered text/control/focus cases. Independent calibrated settled scan:728 applicable measurements across12 surfaces; zero shortfalls. Current full suite separately measured33 public/account surfaces in both themes. This is sampled contrast evidence, not universal WCAG certification.
- **Q2-F02:** repaired behavior independently observed: error persists after settle/reload/navigation; explicit Retry recovers coherent2 pharmacies/$148; busy/transient coverage included.
- **Q2-F03:** repaired behavior observed for13 mixed/repeated/case/whitespace/unknown account-mode queries using anonymous HTML and RSC bodies, plus4 public positive controls. No account payload markers; retained real admin and mocked role checks labelled separately.
- **Q2-O04:** pharmacy section now lacks outer panel; right-aligned plain count, two-column mobile cards, desktop table, refresh line and pills match tested structure. Remaining visual deviations: mobile plan Actions area lacks the reference's horizontal divider and has tighter spacing/type; demo strip/expanded mock notice and new support-transfer copy change vertical height. No pixel-perfect parity claim. Screenshots and reference included for design/Lead disposition.
- **Q2-O05:** both clock controls expire an active quote and clear consent on refresh; public delta exactly1,860,000ms. Broad inert report not reproduced with active quote. No-active-quote feedback remains a source/copy usability limitation; no new feedback claim.
- **Q2-G06:**21-store full journey passes; final repair keyboard-only account add→confirm→result and mapped transients/auth-confirm now exercised. Huge allocation risk tracked as CR-F02. Role evidence remains controlled where real accounts were not authorized.

## Scope and pending acceptance
No pharmacy-software support restriction or unapproved role change was graded as implementation scope. R-011 declaration amendment only; Me/Someone else does not transfer ownership/billing/purchasing. Support transfer is explanatory copy with no self-service action; inbox/payment is not claimed to verify ownership. Synthetic preaccepted fixtures are demo scenarios, not evidence of fresh default. Director manual walkthrough after Lead review, Director acceptance, certification and Architect closeout remain PENDING. No self-certification.
