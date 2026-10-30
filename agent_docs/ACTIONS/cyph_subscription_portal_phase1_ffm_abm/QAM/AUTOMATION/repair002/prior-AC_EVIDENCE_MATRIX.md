# Combined candidate AC evidence matrix

Candidate 24cf075dc3c6252bc22712b067cbf9a8680f24fa; plan a3f9a66040d20b34ca1163281e6075d9cbd36629114b52888bdcc0c839e972fc. Evidence paths below use evidence/combined001 (cody-combined- prefix unless stated). No inherited automatic PASS. Detailed actual test titles/results: executed-browser-coverage.json and current/independent Jest JSON; precise helpers under AUTOMATION/combined001. Historical matrix preserved under its history directory.

| Test / AC | Executor observation | Coverage / evidence / limit |
|---|---|---|
| T01 / AC-01 | PASS observed | public.boundaries/public.repair; anonymous HTML/RSC; real admin; role variants MOCKED |
| T02 / AC-02 | PASS observed | final.json real login/refresh/global logout;4 successful sign-ins total |
| T03 / AC-03 | PASS with role limit | portal-access/account tests; real staff separate from synthetic account personas; nonowner payloads denied; role variants MOCKED |
| T04 / AC-04 | PASS sampled mapped states | 131 browser cases; public/account repair contrast states plus loading/launch/save/quote/confirm/refresh; not all87 render variants |
| T05 / AC-05 | PASS ordinary; RISK CR-F02 | 1/2/3 flows and complete21 review/checkout/activation; huge-count bounded allocation probe |
| T06 / AC-06 | PASS amended scope | required/conditional pharmacy inputs, leading zeros, duplicates; job title removed; Me/Someone else retained |
| T06a / AC-06a | FAIL CR-F01 | fresh unchecked/strict values/copy/focus/persistence PASS; retained pending checkout bypass FAIL, legacy and current UI |
| T07 / AC-07 | PASS observed | back/reload, twoTabIsolation final.json, unit namespace/identity clearing MOCKED, final logout2→0 |
| T08 / AC-08 | PASS observed | independent arithmetic9 plus current Jest/browser; literal99/148/197 and DEMO10;21→1079 |
| T09 / AC-09 | PASS ordinary; CR-F01 pending exception | exact expiry±1ms independent tests; final both clock controls; separate terms/recurring consent; pending checkout declaration failure |
| T10 / AC-10 | FAIL declaration boundary | normal anonymous checkout/forged-success/no-card/host tests pass; CR-F01 allows false declaration pending checkout completion |
| T11 / AC-11 | PASS ordinary flows | activation waiting/provisioning/delayed/email-failed/payment-failed/ready mapped;21 ready; CR-F01 prerequisite failure remains |
| T12 / AC-12 | PASS observed | submitted owner/admin previews and21 unique names; synthetic local only |
| T13 / AC-13 | PASS ordinary recovery; CR-F01 exception | abandoned/declined/unknown/expired recovery; stale declaration pending checkout exception |
| T14 / AC-14 | PASS observed | used/expired/request-error and neutral resend paths in browser and services |
| T15 / AC-15 | PASS observed | F02 load-error persistence/Retry, counts/prices; Stripe return old summary+refreshing then coherent outcome |
| T16 / AC-16 | PASS tested paths | add draft restoration/duplicates/card handoff; not every reload permutation |
| T17 / AC-17 | PASS observed | same-key replay/sequential increment service tests and browser add flows/double click; declaration exception documented separately |
| T18 / AC-18 | PASS observed | add result attention/invite recovery service and browser; operation/store identity |
| T19 / AC-19 | PASS tested paths | manage/cancel/resume/card/no-change/error/retry; refreshing state and nonowner isolation |
| T20 / AC-20 | PASS copy/source scope | mock notices, no ownership verification claim; support transfer text; no self-service transfer |
| T21 / AC-21 | ADJUDICATE residual visual differences | screenshots+geometry; repaired cards/count/pills/refresh; Actions divider/spacing differs from reference |
| T22 / AC-22 | PASS measured geometry | both themes six responsive widths, 767/768 transition and mobile target assertions; full gate-m JSONL |
| T23 / AC-23 | PASS measured scope / limits | owner error focus and keyboard375/1440 both themes; full account Tab-only workflow;12 actual200% zoom checks;728 applicable independent contrast measures. No full AT audit |
| T24 / AC-24 | PASS source/import tests | portal-boundaries Jest; services contain mock access; types SDK-free; no docs imports |
| T25 / AC-25 | PASS within instrument limits | source/import/complete committed diff review; browser local host assertions; undici metadata. Not OS-wide network proof |
| T26 / AC-26 | PASS observed | 7 malformed auth-confirm cases; removed route guards, login method, final refresh/logout; inherited auth-only services |
| T27 / AC-27 | PASS required baseline; supplementary failures | clean build/typecheck;156 current Jest;131 browser; independent18 pass1 fail plus browser bypass failures |
| T28 / AC-28 | PACKAGE VALIDATION | privacy controls, index/per-file SHA256/ZIP integrity and identical delivery asserted by package helper; receipt external |
| T29 / AC-29 | PASS ordinary demo controls; CR-F01/02 limitations | reset/hostile strings/scenarios/clock; load-error fixed; preaccepted scenario explicitly demo |
| T30 / AC-30 | PENDING | Tony manual walkthrough after retest review; Director acceptance/Architect closeout/certification not performed |
