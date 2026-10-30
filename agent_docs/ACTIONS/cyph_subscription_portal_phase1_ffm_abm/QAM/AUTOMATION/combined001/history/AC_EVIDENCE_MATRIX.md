# Q2 AC evidence matrix
Candidate 94251beab08dd26d7f56f4b8f2299a1e841892c5; execution HEAD same. Executor observations, not Lead verdict. All T01–T29 addressed; partial/unverified subcases remain explicit. Filenames below under evidence/q2 (cody-q2- prefix where applicable).

| Test/AC | Observation | Evidence / limitations |
|---|---|---|
| T01 / AC-01 | FAIL / adjudicate | Repeated mode downgrade; normal anonymous HTML/RSC guards and real admin pass; controlled role tests mocked. Evidence: browser.json; query-boundaries.json; jest.json |
| T02 / AC-02 | PASS observed | Real login, stale-expiry refresh with two token exchanges, one final global logout and cleared namespaces. Evidence: final.json; egress.jsonl |
| T03 / AC-03 | PASS observed | Real staff/synthetic persona separation; UI denial and service payload denials. Evidence: browser.json; jest.json |
| T04 / AC-04 | PARTIAL / FAIL | All 18 public + 9 account registry states exercised; load-error retry view fails; not all 87 design variants individually asserted. Evidence: extra*.jsonl; executed-browser-coverage.json |
| T05 / AC-05 | PASS bounded | Normal 1/2/3-store registration, count reduction cancel/confirm and service invalid counts; >20 cap needs interpretation. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T06 / AC-06 | PASS observed | Leading zero, required/conditional, duplicates, summary focus via browser and service tests. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T07 / AC-07 | PASS observed | Reload/back/reset, two public tabs, namespace/identity clearing (identity switching mocked), final logout. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T08 / AC-08 | PASS observed | Literal arithmetic oracles 9900/14800/19700; DEMO10 8900/13800/18700; add 2450; invalid/unavailable covered. Evidence: independent-jest.json; browser.json |
| T09 / AC-09 | PASS observed | Expired/stale quote and consent; independent exact millisecond boundaries and both clock buttons. Evidence: independent-jest.json; extra*.jsonl |
| T10 / AC-10 | PASS observed | Anonymous checkout/forged success negatives/no card fields or live billing traffic. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T11 / AC-11 | PASS observed | Activation scenarios plus delayed recovery and email resend; service tracks asserted. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T12 / AC-12 | PASS observed | Submitted owner/admin previews in browser and service tests; synthetic local-only. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T13 / AC-13 | PASS observed | Abandoned/declined/unknown, not-charged and paid resolution; expired state seeded. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T14 / AC-14 | PASS observed | Valid/used/expired seeds; error→retry→neutral sent and no editable destination. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T15 / AC-15 | FAIL / partial | Counts/list/changed summary pass; load-error UI retry scenario fails. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T16 / AC-16 | PASS bounded | Add entry/draft retention/duplicates/change-card local return covered; every possible handoff reload permutation not asserted. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T17 / AC-17 | PASS observed | 1→2/2→3; browser double-click/failure/unknown; service same-key replay and sequential increments. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T18 / AC-18 | PASS observed | Browser attention/held invitation; service recovery same operation/store identity. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T19 / AC-19 | PASS bounded | Manage/cancel/resume/card/error/no-change and returns; full canceled portal outcome service/scenario coverage, not each browser action permutation. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T20 / AC-20 | PASS source/copy scope | Mock notices, provisional policy/brand inspected; Coach proposals not graded as approved scope. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T21 / AC-21 | ADJUDICATE | Final pills measured; visual parity differences and contrast findings; representative screenshots compared. Evidence: screenshots/; extra-account.jsonl; FINDINGS Q2-O04 |
| T22 / AC-22 | PASS measured matrix | 220 baseline geometry rows across both themes/six widths plus supplementary states; inline-link exemption inherited and disclosed. Evidence: gate-m-public.jsonl; gate-m-account.jsonl |
| T23 / AC-23 | FAIL / partial | Actual zoom 10 route/theme checks and full public keyboard flow pass; light text contrast fails; account keyboard/error/billing checked, not full account Tab-only data-entry workflow. Evidence: zoom-workflows-corrected.json; keyboard-corrected.json; contrast-shortfalls.json |
| T24 / AC-24 | PASS observed | Import/boundary tests, SDK-free types, namespaces; candidate source review. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T25 / AC-25 | PASS within instrument limits | Source/import/protected diff + browser hosts + actual server undici metadata; not complete OS-level egress proof. Evidence: egress.jsonl; protected-diff.txt; jest.json |
| T26 / AC-26 | PARTIAL | Removed routes/GET login 405/protected diff/logout/refresh tested; auth-confirm malformed-link runtime not independently exercised. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T27 / AC-27 | PASS observed | Clean default build/typecheck; 106 existing +9 independent Jest; 57 baseline browser; supplementary failures retained. Evidence: build.log; tsc.log; runner-summary.json; jest.json |
| T28 / AC-28 | PASS package checks | Identity, helpers, logs, masked screenshots, value scan/controls/index/archive verification; no self-certification. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T29 / AC-29 | FAIL / partial | Registry/reset/hostile strings and quote clock work; load-error scenario unreliable; no-clock-state feedback observation. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
| T30 / AC-30 | PENDING | Director ride and Architect closeout after Lead assessment. Evidence: executed-browser-coverage.json; jest.json; extra-results.json |
