# Combined independent retest 001 — returned for JARVIS review

Candidate and execution HEAD: `24cf075dc3c6252bc22712b067cbf9a8680f24fa`. Branch `qa/ffm-abm-001-subscription-portal`. Direct parent REPAIR_001 `0d43a4c343909467487b327e654e0650b21c9336`; parent of repair is original failed candidate `94251beab08dd26d7f56f4b8f2299a1e841892c5`. Finalized delegated plan SHA-256 `a3f9a66040d20b34ca1163281e6075d9cbd36629114b52888bdcc0c839e972fc`. Approval in QAM_APPROVAL.md precedes execution. No Git mutation or product repair.

## Assessment for Lead
Independent execution is complete with acceptance failures for adjudication. The three original repair findings are no longer reproduced in their tested cases. **CR-F01: AC-06a is not met for an already pending checkout after declaration removal or legacy migration.** **CR-F02: very large valid counts eagerly allocate pharmacy objects; bounded inspection demonstrates a resource-exhaustion risk.** These observations are not certification or severity adjudication. Tony's manual walkthrough, Director acceptance and Architect closeout remain pending after Lead review.

## Identity and authority
The original identity stop is preserved and its resolution appended in HANDOFFS/COMBINED_RETEST_001_IDENTITY_STOP.md. Complete repair and amendment patches were reconstructed against their base commits in disposable directories: 27 repair paths and 18 amendment paths match the committed results byte-for-byte. The reviewed amendment archive SHA-256 matches `d98fe4ce9378f234b813246135bb10f8f799c1afcea731bc80b80754affb4088`; its Markdown index covers 42 files plus the index, all hashes verified, all 14 included source files match candidate. Raw patch-id differences reflect assembled patch format; reconstruction, not patch-id equality, establishes correspondence. Initial JSON-index assumption was corrected to the actual Markdown index; no package mutation.

RECOVERY.md/session working diffs describe engineering scratch cleanup/server stop and do not conflict with dispatch. Expected QAM changes are preserved. Product/configuration/tests match Git HEAD; scratch source, tests, config and lock bytes were checked against it. No documentation-only execution commit was created. Prior Q2 reports are preserved under AUTOMATION/combined001/history and original Q1/Q2 archives remain untouched.

## Independent execution and results
All commands ran with explicit repository or scratch CWD. Scratch `/tmp/cody-combined-24cf075` was populated from Git candidate; node_modules were physically copied, not symlinked. Existing package-lock/dependencies were used without install or lock mutation. App/build config contained only the three required NEXT_PUBLIC values; QA credentials were loaded only by helpers from the ignored, untracked repository file.

| Command / instrument (scratch CWD unless stated) | Result / evidence under evidence/combined001 |
|---|---|
| `npm run build` (clean production build) | PASS, cody-combined-build.log |
| `npx tsc --noEmit` | PASS, cody-combined-tsc.log |
| `npx jest --runInBand --json --outputFile=/tmp/cody-combined-jest.json` | 12 suites, 156 tests PASS; cody-combined-jest.json/log |
| Owned `next start` on 3110 with metadata-only undici preload | Built target independently; cody-combined-server.log, egress and cleanup records |
| `PORTAL_BASE_URL=http://localhost:3110 npx playwright test --config=qa.config.ts` | 131 PASS, zero skipped/flaky/unexpected, 13.8m; browser.json/log, executed-browser-coverage.json |
| `npx jest --config=qa-independent.config.cjs --runInBand` (owner-boundaries only at that point) | 9 PASS / 1 FAIL: legacy pending checkout; independent-jest.json/log |
| `npx jest --config=qa-independent.config.cjs --runInBand --runTestsByPath qa-independent/arithmetic.test.ts --json --outputFile=/tmp/cody-combined-arithmetic.json` | 9 PASS: independent literal pricing and exact quote-expiry boundaries |
| `npx playwright test --config=qa-extra.config.ts` | 2 locator failures; 1 premature false PASS invalidated. Originals retained |
| `npx playwright test --config=qa-extra-corrected.config.ts` | 2 PASS / 1 product FAIL: uncheck before checkout blocked; complete 21-store journey passed; migrated pending checkout bypass failed |
| `npx playwright test --config=qa-unchecked.config.ts` | 1 product FAIL: normal current UI unchecking after opening checkout still permits paid activation |
| `node /tmp/cody-combined-zoom.cjs`; settled successor | Actual browser zoom 2.0 verified on 12 route/theme combinations; original transition-race metrics preserved; settled 744 raw / 728 applicable measurements, no shortfalls |
| `node /tmp/cody-combined-final.cjs` | Real login200; refresh2 token exchanges; both clock/consent regressions; two-tab isolation; handoff retry; single global logout200; namespace2→0 and protected denial PASS |

Engineering-authored tests were independently executed on the owned clean target. Their prior passing results were not inherited as acceptance. Additional executor-authored service/browser/contrast probes exposed failures outside the current test suite. The complete individual test titles/statuses are in executed-browser-coverage.json and Jest JSON, with configurations/helpers retained for reproducibility.

## Attempts and corrections
No retries were enabled in the main browser run. Initial supplemental exact labels omitted accessible required markers; corrected selectors use owner-declaration ID with a separate exact declaration-copy assertion and compatible State label. The first legacy browser probe used immediate isVisible during checkout loading and falsely passed; that observation is INVALIDATED. Settled probing waits through the transition and asserts denial, producing a real failure. The same behavior was reproduced independently through current UI unchecking. No assertion was weakened to make these product failures pass.

The initial independent contrast pass sampled two destructive button colors during theme transitions. After a documented 400ms theme settling wait, the same 12 surfaces were remeasured. Initial raw data remains; settled results are the applicable measurements. BODY focus rows represent Tab wrapping to no control and are excluded, with raw rows preserved. Controls validate black/white=21, white/white=1 and border/focus=21. Independent settled minimum ratios: text4.5469, meaningful boundary3.0542, focus3.0668. Existing independent Q2 arithmetic helper was rerun against this candidate, not its historical verdict reused.

The previous live-build incident, rejected full-env symlink and failed Q2 helpers remain in historical Q2 reports and original archive; none is rewritten as success. This run built only in its scratch root. No unrelated server was restarted.

## Runtime and privacy limits
Four actual sign-in attempts, all successful: main worker1, zoom instruments2, final session1. Credentials/tokens stayed in helper memory; no storageState files, traces, videos or auth-bearing persistent browser profiles. The Chrome settings profile was anonymous; authenticated zoom used a separate nonpersistent context. Six account screenshots mask real staff identity; one additional screenshot is entirely anonymous synthetic checkout. All seven were visually reviewed. Numeric measurements contain classes/ratios, not account identity.

Source/import/diff review and passing boundary tests show mock fixtures behind portal services, SDK-free types, existing auth-only Supabase importers, no Stripe SDK/business client additions and no raw HTML injection. Browser journey host assertions are local-only. Server undici metadata records Supabase auth/user/role reads plus final logout, without headers, query strings or tokens. Three Supabase POST OTHER records correspond in timing/source to malformed auth-confirm checks; the allowlist omitted verify, so path attribution is source-correlated, not proven by those rows. No live Stripe/email/provisioning/business writes were introduced or observed. This is not OS-wide network capture and does not prove absence of every possible external effect.

Only the authorized real admin was used. Superadmin/member/role-less rules and account-persona payload denial tests are controlled/mocked, not additional real accounts. Actual browser 200% used Chrome settingsPrivate.setDefaultZoom(2) with readback2 and unchanged physical1440 window, CSS720/DPR2 from baseline1440/DPR1. It is not half-width emulation; the separate inherited DPR/viewport tests are geometry evidence only. No Safari, full assistive-technology audit, every87 design variant, or human Director walkthrough claim.

All safe planned categories are addressed; unresolved product failures and limits are grouped in FINDINGS/AC_EVIDENCE_MATRIX. No infrastructure/auth/identity blocker remains. Final package does not wait for Tony's ride.
