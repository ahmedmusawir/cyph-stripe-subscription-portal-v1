# REPAIR_001 engineering report — FFM-ABM-001-SUBSCRIPTION-PORTAL
Engineer: Claudy (Claude Code, Opus 5.5) · 28 Oct 2026 15:27–16:24 Asia/Dhaka (+06) · route authorized by RULINGS **R-010** (Tony; QA Lead JARVIS dispatch).
**These are Engineering claims and self-checks. They do not certify QA.** Gate Q still FAILS until Cody retests and JARVIS adjudicates.
Labels: **EVIDENCE** = observed by a command here; **GAP** = not verified.

## 1. Starting identity
| Fact | Value |
|---|---|
| Branch / HEAD at start | `qa/ffm-abm-001-subscription-portal` @ `94251beab08dd26d7f56f4b8f2299a1e841892c5` (failed Q2 candidate) |
| Tree at start | Product/config/tests clean. Only Cody's QAM records were modified or untracked (Q1/Q2 evidence, packages, receipts, AUTOMATION). They are preserved and were not edited. |
| Q2 package | `QAM/HANDOFFS/FFM-ABM-001-SUBSCRIPTION-PORTAL_Q2_REVIEW_001.zip` (SHA-256 `b99d77a7…ba75` per dispatch; read, not modified) |
| Toolchain | Node v22.17.0 · npm 11.15.0 · next 16.4.3 · TS 5.5.4 · jest 30.4.1 · @playwright/test 1.59.1 · system Google Chrome 150.0.7871.46 (`channel: "chrome"`) |
| Dependencies / lockfile | unchanged (`package.json`, `package-lock.json`: no diff vs 94251be) |
| Candidate after repair | **uncommitted working tree**, pending Director commit. No SHA exists yet. |

## 2. Finding → root cause → change → regression evidence
| Finding | Root cause (evidence) | Change | Regression / evidence |
|---|---|---|---|
| **Q2-F01** light-theme contrast (+ boundary/focus applicability) | Shared tokens: `--muted-foreground` light (L 42%) gave 4.44 on the page surface and 3.88–3.97 on 10% tinted notices; `--destructive` light (L 51%) gave 3.78/3.3. Text-entry boundaries (`--input`) were 1.3–1.65:1 in both themes. The keyboard focus ring (`--ring` = coral) was 2.2–2.8:1 on light surfaces. Elements with no ring utility (skip link, email-variant tabs, email CTA, native consent checkboxes, Demo-controls selects) fell back to Chrome's default outline: 1.55–1.88 on dark surfaces. Baseline measured on owned `:3102` (EVIDENCE: `data/before-contrast-*.jsonl`). | `globals.scss`: six token lightness changes marked `portal R1:` (hue kept). Light: muted-fg 36%, input 50%, ring 12 80% 44%, destructive 40%. Dark: muted-fg 76%, input 62%. One base `:focus-visible` outline in the ring token for elements without their own ring utility (radios excluded; their card label carries the ring). Ring utilities added to the five Demo-controls selects. **Decorative `--border` unchanged**; the coral `--primary` brand fill is unchanged. | `e2e/contrast.ts` probe (composites through every ancestor, same method as the Q2 scan). Text 4.5 (large 3); input boundary 3; focus ring over 30 Tab stops 3. 22 public + 11 account screens × light/dark: **0 failures** (before: 377 text, 232 boundary and 717 ring rows failed; see §5 caveat). Minimums after: boundary 3.62 light / 3.05 dark; ring 3.44 light / 3.07 dark. EVIDENCE: `data/contrast-summary.json`, `data/after-contrast-*.jsonl`. |
| **Q2-F02** account load error / retry | `loadAccount` used up the one-shot failure. Any second load ran before the error could render: a superseded effect run (the scenario change re-runs the dashboard effect while the first load is in flight) or a remount from the Load button's `router.push('/dashboard')`. The sequence guard then discarded the failing result, so the next load succeeded. EVIDENCE: the new component test fails on the baseline code (error view never found); the browser test failed on the baseline at the first `load-retry` check. | `account.ts`: a pending failure **persists across reads**. The new `retryLoadAccount` (the error view's "Try again") clears one failure, then loads. The facade exposes `retryLoadAccount`; `DashboardView` Retry uses it. | Engine: repeated loads keep failing; retry recovers to the 2-store / 14800 account; later loads succeed. Component (`portal-dashboard.test.tsx`, real provider + view): error survives a settle period **and a remount**; Retry shows `aria-busy`, then $148.00 / 2 stores. Browser (real admin): error persists after a 1.2 s settle, reload, and navigation away and back; Retry → coherent account, then reload stays healthy. Both themes. Annotation `load-retry-seen-at-least-once=true`. |
| **Q2-F03** repeated Stripe `mode` parameters | `params.mode === "portal"` compared a string. Repeated parameters arrive as an array, which fell through to public checkout. Case and whitespace variants also fell through (`mode=Portal`, `mode=%20portal` → 200, an extra finding at baseline). EVIDENCE: `data/query-probe.txt` (baseline section). | New pure `services/portal/stripeRoute.ts` `classifyStripeStandIn`. It considers every `mode` value, trimmed and lower-cased. **Public only** when `mode` is absent or every value is `checkout`. Any `portal`/`card` → account (portal wins over card). Any unrecognised value **fails closed** to login. `purpose` is the first allowed value, else `manage`. The page calls the existing `requireAccountUser()` before rendering anything; there is no new wrapper and the role predicate is unchanged. Return targets were already fixed internal paths (no query-chosen return). | Unit: 16 classifier cases. Server page (mocked roles): 7 signed-out variants redirect before any stand-in renders; member/role-less redirect; public checkout renders without an auth lookup; admin/superadmin get the portal/card stand-in in the account provider. Browser (anonymous): 13 account-mode queries → 307 `/login` for HTML **and** RSC, with no account markers in either body. 4 public checkout forms → 200, no markers. Real admin: positive portal/card journeys in `account.journeys`. After: `data/query-probe.txt`. **No account-data disclosure was observed at baseline either; this is not described as a leak.** |
| **Q2-O04** mobile dashboard parity | The implementation used the generic DataTable stacked rows and wrapped the section in a card panel with a bordered count pill. It had no initial refresh line. Compared with `_design/approved_v1_0/renders/account-billing__active_mist__mobile.png` and `screens/account-billing.html`. | `DashboardView`: the section restored to the approved treatment. Heading `text-xl` on the page surface, no panel; plain right-aligned `N of M` count; the table wrapper is the bordered card at ≥ md. Approved card at < md: activation pill in the title row; Store admin \| Monthly; Invitation (+ "Sent 26 Oct") \| action. Refresh line always present: `Last refreshed just now · Refresh` (ages to "at HH:MM" after 60 s), `Refreshed HH:MM after returning from Stripe`, `Refreshing…`. `DataTable` gained `tableClassName`, `renderMobileCard` and `mobileLabel`. Demo strip, longer mock notice and compact self-start pills are preserved. | Browser: section has no border; count is plain and right of the heading; 2 cards with the pill in the title row, Admin/Monthly on one row, action right of Invitation; desktop table card bordered; Refresh re-reads. Masked screenshots (light/dark) are in `screenshots/`. Gate M account 84 measurements, 0 failures. |
| **Q2-G06** 20-store cap | `MAX_STORES = 20` in `pricing.ts`, enforced by `isValidStoreCount` and the plan counter's `max`. It had no approved source (the contract says repeat-N). | Cap removed. `isValidStoreCount` = positive safe integer ≤ `MAX_REPRESENTABLE_STORES`, a **technical** bound computed so the cents total stays an exact safe integer (≈1.84 × 10¹²). This is not a commercial limit. The counter has no max. Oversize input gets an explicit "That many pharmacies can't be priced exactly." | Unit: 1/2/3/21/1000 stores → 9900/14800/19700/107900/4905000 (literal); a full 21-store draft quotes 107900; 25 accepted; MAX_SAFE_INTEGER, Infinity, NaN, −1, '3', null rejected; bound + 1 throws RangeError. Browser: counter reaches 21 → $1,079.00 and 22 → $1,128.00, with + still enabled. |
| **R1-N01** (self-found during evidence work) | After a Stripe portal return, the dashboard sat on the skeleton until the refresh finished, so the approved "refreshing" state (banner + "Checking…" pills over last-known data) never rendered. EVIDENCE: a MutationObserver never saw the banner in the browser; the component test fails with the fix removed (mutation check). | `accountService.peekAccount()` (synchronous last-known read, no state change). `DashboardView` shows that summary immediately while `refreshAfterHandoff` runs. | Component test (banner + $148.00 + "Refreshing…", then "Nothing changed" + returned refresh line); browser MutationObserver sees the banner. |

### Remaining Q2 evidence gaps addressed (behaviour already worked; no product change)
- **Account keyboard-only form completion (AC-23):** `account.repair` "keyboard only". Add store → confirm → result with Tab/typing/native-select typeahead/arrow + Space radio/Space consent/Enter, and no pointer input. It passed on the baseline too, so this is evidence, not a repair.
- **Mapped transient states (AC-04):** browser assertions for dashboard skeleton, Manage-billing `aria-busy`, refreshing banner (needed R1-N01), Review-price `aria-busy`, quote loading → ready, confirm `aria-busy`; load-retry busy in the component test.
- **Malformed auth-confirm (AC-26):** 7 anonymous variants (missing/empty hash, bogus type, fake hash, `next=https://evil.example/`, `next=//evil.example`) → 307 to same-origin `/login`, no auth cookie set, followed page is the sign-in form. `/login` ignores `next`. The two fake-hash cases make one rejected verification call each to the configured auth project (no account effect). The route file is unchanged.
- **Actual zoom:** GAP. I did not drive the browser's zoom setting. Instead `public.zoom.spec.ts` + `account.repair` use a **720 CSS px × DPR 2 emulation** (the geometry of a 1440 window at 200%) on plan, owner, login, dashboard and add-store confirm, both themes: no overflow, primary actions reachable. Cody's Q2 actual-zoom method remains the independent check.

## 3. Path inventory (repair diff vs 94251be: 19 tracked files changed, +288/−120; 8 new; 1 deleted)
Full patch: `REPAIR_001/REPAIR_001_product.diff` (tracked diff + new files as `/dev/null` diffs).
- **Product:** `src/app/globals.scss` · `src/app/(handoff)/demo/stripe/page.tsx` · `src/components/portal/{AccountStrip,PublicDemoControls,DataTable}.tsx` · `src/components/portal/account/DashboardView.tsx` · `src/components/portal/register/PlanView.tsx` · `src/services/portal/{account,pricing,registration,index}.ts` · `src/services/portal/accountService.tsx` · **new** `src/services/portal/stripeRoute.ts`
- **Jest:** updated `portal-account.test.ts` (the old test encoded the bug: a second load succeeded) and `portal-registration.test.ts`; **new** `portal-dashboard.test.tsx`, `portal-stripe-route.test.tsx`
- **Playwright:** **new** `e2e/auth.ts` (real admin sign-in **kept in memory**, one per worker, `/api/auth/logout` aborted), `e2e/contrast.ts`, `account.repair.spec.ts`, `public.repair.spec.ts`, `public.zoom.spec.ts`. Changed: `account.journeys.spec.ts` (uses the in-memory fixture; host check uses baseURL), `public.journeys.spec.ts` (host check), `logout.final.spec.ts` (fixture, opt-in). `playwright.config.ts`: the logout project runs only with `PORTAL_ALLOW_LOGOUT=1`. **Deleted** `e2e/admin.setup.ts` (it wrote `.auth/admin.json` to disk).
- **Records (scoped):** RULINGS R-010 (append), this report + `REPAIR_001/`, STATE, JOURNAL, session 2026-10-28, CHANGELOG, RECOVERY, RESPONSES. QAM records untouched.
- **Not touched (no diff vs 94251be, checked):** `src/proxy.ts`, `src/utils/**` (Supabase + `get-user-role`), `src/app/api/**` (login/logout/confirm), `src/services/auth/**`, `src/app/login/**`, `src/app/(account)/layout.tsx`, `supabase/**`, Dockerfile, `next.config.js`, `package.json`, `package-lock.json`, `tsconfig.json`, `jest.config.js`. No DB, role, account, Stripe, email, provisioning, SSO or deployment change.

## 4. Commands, CWD, exits, results (logs in `REPAIR_001/logs/`)
| # | Command | CWD | Exit | Result |
|---|---|---|---|---|
| B1 | `git archive 94251be \| tar -x` + physical `node_modules` copy + `.env.local` holding **only** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_SITE_URL` (values never printed) | scratchpad `r001/base` | 0 | baseline copy |
| B2 | `npx next build` → `next start -p 3102` | `r001/base` | 0 | baseline server (stopped at end) |
| B3 | curl probe; `playwright test --project=public e2e/public.repair.spec.ts`; `--project=account e2e/account.repair.spec.ts` against :3102 | repo root (`PORTAL_BASE_URL`) | 1 / 1 | failures reproduced (F01, F02, F03, G06, O04); account keyboard-only passed |
| R1 | `rsync` src/e2e → `r001/app`; `diff -rq` src and e2e identical; `rm -rf .next tsconfig.tsbuildinfo`; `npx next build` | `r001/app` | **0** | `logs/build.log` |
| R2 | `npx tsc --noEmit` (covers `src` + `e2e`) | `r001/app` | **0** | empty output |
| R3 | `npx jest --json` | repo root | **0** | **11 suites, 143/143** (`data/final-jest.json`) |
| R4 | `npx playwright test` (public, gate-m-public, account; logout **excluded**) → owned :3103 | repo root | **0** | **126/126**, 0 flaky (public 79 · gate-m-public 13 · account 34) in 13.5 min (`data/final-pw.json`) |
| R5 | Gate M (inside R4) | — | — | public 136 + account 84 measurements, **0 failures** |

Intermediate attempts (preserved in logs, not collapsed): `after-public-1.log` (22 dark focus-ring failures → central `:focus-visible` rule + radio probe correction); `after-account-1.log` (3 failures: a locator matched sr-only text, a missed transient banner exposed **R1-N01**, and the portal stand-in has no Demo strip). Each was rerun, and R3/R4 are the final full runs after the last code change.

## 5. Instrument corrections and caveats (honest record)
- The first account contrast run set the theme *after* load, so it caught `transition-colors` mid-animation (1.15–1.32 readings). The probe now reloads after setting the theme. **The baseline account counts include those artifacts; the baseline numbers are indicative, not exact.** The radio probe correction (measure the card label's ring) was also made after the public baseline run.
- My first probe recorded text from the real-identity strip. That output was deleted, the baseline log and jsonl were scrubbed, and the probe now masks `account-menu` and the strip summary. Playwright's automatic `error-context.md` page snapshots (which contain the real display name) are deleted after every run and are never packaged.
- Dark-theme margins are thin: boundary min 3.05, ring min 3.07, muted text on the strip 4.72. A different contrast instrument may land near the thresholds.

## 6. Limitations and independent retest requirements (for Cody)
1. **Retest F01** with the independent Q2 scanner on the committed candidate, light **and** dark, notices and interactive states (hover/active/disabled not individually scanned here), plus nontext applicability (native checkbox glyph colours are browser-drawn and not measured).
2. **Retest F02** with a real admin: dashboard → Demo controls → Account load error → Load. The error must persist through settle, reload and navigation; Retry must recover.
3. **Retest F03** for anonymous HTML + RSC on every variant in `data/query-probe.txt`, plus any of Cody's own. Repeated-parameter RSC variants were probed here; independent confirmation is still required.
4. **Retest O04** against the approved mobile and desktop renders. Remaining visible differences, **not** repaired here (outside the named items): body copy in the Billing owner / Need to cancel panels renders `text-xs` where the render uses `text-sm`; "STORE ADMIN" wraps under the name on the second card at 375; the plan card has no divider above ACTIONS. Lead disposition is needed.
5. **Retest G06:** >20 stores through review → checkout stand-in → activation (verified here only to the plan price and via engine quotes). **Limitation:** the draft keeps one pharmacy entry per store, so huge counts reachable through the engine API allocate that many entries. The UI only steps ±1.
6. Real **actual browser zoom** (settings level), assistive technology, real-device Safari: GAP.
7. Superadmin/member/role-less: **mocked** only (as approved). Live identity used: the single `.env.qa.local` admin.
8. Lint is not configured (inherited); npm audit advisories are inherited and unchanged.

## 7. Real-account effects
- Real sign-ins by Engineering through the real `/login` UI (in-memory fixture, one per Playwright worker): **22 (derived, not directly counted)**. Playwright discards the worker after every failed test, and each new worker signs in again. Derivation from test order and failure positions:

  | Run | Sign-ins | Basis |
  |---|---|---|
  | baseline `before-account` | 16 | 16 failures, last test failed |
  | `after-account-1` | 3 | |
  | `after-account-2` | 2 | |
  | final R4 | 1 | recorded in `data/signin-count.txt` |

  The earlier runs' counter file was cleared with `test-results/` before R4. I did not foresee the restart multiplication; it is disclosed here. No sign-in was rejected, and no lockout or rate limit was observed. **No storage-state file was written.** Credentials were read only by the helper and never printed, logged, screenshotted or packaged.
- Logouts: **0.** `/api/auth/logout` was aborted in every account context, so Tony's other sessions were not revoked by this work. The logout spec is now opt-in only.
- Privacy scan (`privacy_scan.py`, prints counts only): credential email/local-part/password + real display name across 166 output files and logs → **0 hits**. The ZIP is scanned again at packaging (see the deliverable receipt).

## 8. Processes and temp paths
| Item | Status |
|---|---|
| `next start -p 3102` (baseline, cwd `scratchpad/r001/base`) | **stopped** (PID 806672, cwd verified before kill) |
| `next start -p 3103` (repaired build, cwd `scratchpad/r001/app`) | **running**, owned, for a walk at http://localhost:3103/. Stopped on request. |
| `next start -p 3001` PID 420447 (my E2 server, cwd `scratchpad/run-r008`) | still running and **stale**: it serves the E2 build, not this repair. I will stop it on request. |
| PID 40320 (:3457) | not owned, untouched |
| Scratch copies `scratchpad/r001/{base,app}` (with physical `node_modules`; public config only) | retained until the Director says to clean up; not packaged |
| `test-results/` (ignored) | holds the final run outputs; `error-context.md` files deleted |

## 9. Next
Tony reviews and commits the repaired candidate on `qa/ffm-abm-001-subscription-portal` (future SHA unknown; not invented here) → Cody independently retests the repairs and the required regression → JARVIS adjudicates. Engineering does not self-certify and does not start another Q1 campaign.
