# Engineering acceptance ledger
Owner: Engineer. These are claims, not independent verdicts. Contract: ACCEPTANCE_SPEC v1.1 (R-008/R-009). Evidence root: `EVIDENCE/E2_ENGINEERING_REPORT.md` (ER) and `EVIDENCE/E2/` logs; tests named by file.

| AC | Engineering claim | Evidence | Independent disposition |
|---|---|---|---|
| AC-01 | MET (mocked member) — public entry/registration work anonymously; account routes and account-side modes → /login with no payload; admin & superadmin admitted; member/role-less denied (mocked roles); forged values grant nothing | ER §3–4; `e2e/public.boundaries.spec.ts`, `public.journeys.spec.ts`, `account.journeys.spec.ts`; `src/__tests__/portal-access.test.tsx`, `login-form.test.tsx` | See QAM/AC_EVIDENCE_MATRIX.md |
| AC-02 | MET — real login/logout through existing routes; R-008 role rule only; logout clears both namespaces; mock flows never submit credentials. Note: inherited logout is GLOBAL scope | ER §3; `e2e/logout.final.spec.ts`; `portal-storage.test.ts` | See matrix |
| AC-03 | MET — real admin vs synthetic persona labelled in strip/menu; non-owner payload is `{kind:'denied', ownerContactLabel}` only; service denies add/billing | `portal-account.test.ts` (persona tests); account e2e personas | See matrix |
| AC-04 | MET — every C01–C17 + sign-in state reachable; missing context returns to a safe step with notice | ER §6; public/account e2e | See matrix |
| AC-05 | MET — count ≥1, N records required, reduce asks/keeps, 1/2/3 exercised | `portal-registration.test.ts`; e2e count reduction, 3-store journey | See matrix |
| AC-06 | MET — required fields, NCPDP 7 / NPI 10 as strings, conditional fields, summary focus, job title grants nothing | `portal-registration.test.ts` validation; e2e validation | See matrix |
| AC-07 | MET — back/edit/reload keep drafts; edits invalidate quote+consent; separate public/account namespaces; reset/logout/identity change clear; no secrets stored | e2e reload + storage check; `portal-storage.test.ts` | See matrix |
| AC-08 | MET — 9900/14800/19700; DEMO10 −1000 due-now only; unavailable ≠ 0; add 2450 | literal-expectation tests in `portal-registration.test.ts`, `portal-account.test.ts`; e2e $197.00/$187.00/$24.50 | See matrix |
| AC-09 | MET — two consents initial, one add; expired (injected clock)/stale revision rejected without mutation; refresh clears consent; busy disables; consent disabled until a current quote | engine tests; e2e consent error | See matrix |
| AC-10 | MET — labelled stand-in, no inputs; back/close/decline keep draft inactive; forged success URL changes nothing | e2e journeys + forged-URL test | See matrix |
| AC-11 | MET — three tracks, delayed never asks to repay, email failure → simulated resend, no login | engine activation tests; e2e activation | See matrix |
| AC-12 | MET — nominated admin keeps owner access; separate previews from submitted draft; nothing sent | engine preview test; e2e email preview | See matrix |
| AC-13 | MET — abandoned/declined resumable; expired restarts; unknown pauses payment | engine + e2e checkout tests | See matrix |
| AC-14 | MET — valid/expired/used/request/sent/error; neutral wording; no editable email; valid → labelled downstream boundary | engine link tests; e2e access link | See matrix |
| AC-15 | MET — summary/count/prices/next payment/cards consistent; invitation pending ≠ unpaid; loading/error/retry/empty | account e2e; engine load-error test | See matrix |
| AC-16 | MET — add-store from dashboard and OwedBook reference; draft kept on cancel/card change/failure; duplicates (own vs elsewhere) without identity | account e2e; engine duplicate test | See matrix |
| AC-17 | MET — same key ×3 → one store; failure unchanged; unknown blocks second attempt; 1→2 and 2→3 | engine idempotency tests; e2e double-click, failure, unknown | See matrix |
| AC-18 | MET — attention: one increment, setup pending, invitation held, recovery completes same store | engine attention test; e2e attention | See matrix |
| AC-19 | MET — portal stand-in for manage/cancel/resume/card/invoices; refreshing → unchanged/updated; launch error retry; no dates invented | engine billing tests; account e2e portal | See matrix |
| AC-20 | CLAIMED — amounts labelled illustrative; placeholders visible; brand in `src/components/portal/brand.ts`; proposed rule chip | source + screenshots `EVIDENCE/E2/screenshots/` | See matrix |
| AC-21 | CLAIMED — top bar + centered content, tokens byte-match design (+ R-004 link rule), Button/Pill deltas central, theme persists | `src/app/globals.scss`; screenshots; visual comparison by Engineer (not independent) | See matrix |
| AC-22 | MET (Engineering) — Gate M 136 public + 84 account measurements, 0 failures; Sheet/Escape/focus return; table/card at 768 | ER §5; `EVIDENCE/E2/gate-m-*.jsonl` | See matrix |
| AC-23 | PARTIAL — keyboard plan→owner, error-summary focus, aria-live/busy/invalid wiring; 200% zoom proxy; no AT walk; contrast not re-measured per state | ER §5 gaps | See matrix |
| AC-24 | MET — facade/types only in components; SDK-free types; services enforce rules; no server-global state | `portal-boundaries.test.ts` | See matrix |
| AC-25 | MET (browser) — no new APIs/SDKs/DB/role writes/deploy; browser hosts only localhost:3001; account URLs gated, registration public. GAP: server-side egress not captured | ER §4 | See matrix |
| AC-26 | MET — protected diff empty; GET login 405; removed routes 404; `/` now → plan (R-009) | ER §4; boundaries e2e | See matrix |
| AC-27 | MET with disclosed limits — build 0, tsc 0 (scratch), jest 106/106, Playwright 59/59; lint NOT CONFIGURED | `EVIDENCE/E2/01–05` | See matrix |
| AC-28 | CLAIMED — handoff + indexed ZIP with privacy scan (validated against synthetic leak and clean control and the real credential values) | QAM/HANDOFFS/ENGINEERING_HANDOFF.md; ZIP receipt | See matrix |
| AC-29 | MET — enumerated scenarios (public: registration only; account: scenarios/personas), reset, hostile text inert | engine scenario tests; e2e hostile text; components test | See matrix |
| AC-30 | NOT EXECUTED — Director ride after independent QA | — | Director |
