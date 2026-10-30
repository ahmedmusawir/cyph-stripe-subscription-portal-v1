# REPAIR_002 engineering report — FFM-ABM-001-SUBSCRIPTION-PORTAL (RULINGS R-012)
Engineer: Claudy (Claude Code, Opus 5.5) · 29 Oct 2026 12:43–13:35 Asia/Dhaka (+06).
Authorization: JARVIS (QA Lead) REPAIR_002 dispatch after **Gate Q FAIL** on `24cf075` (CR-F01 blocker, CR-F02 robustness, Q2-O04 residual), under the R-010 repair route.
**These are engineering self-checks, not QA certification.** Cody's independent failures stand until he retests; nothing here rewrites them.

## 1. Identity and starting tree
| Fact | Value |
|---|---|
| Branch / required candidate | `qa/ffm-abm-001-subscription-portal` @ `24cf075dc3c6252bc22712b067cbf9a8680f24fa`, verified as the full HEAD before editing |
| Product inputs at start | `src`, `e2e`, configs, package files and lockfile all **identical** to `24cf075`; no untracked product files |
| Pre-existing work (preserved, not mine) | Cody's QAM records: 8 modified files (`AC_EVIDENCE_MATRIX`, `FINDINGS`, `QAM_APPROVAL`, `QAM_CLEANUP_REPORT`, `QAM_EXECUTION_REPORT`, `QAM_RECON_REPORT`, `QAM_STATE`, `QAM_TEST_PLAN`) plus untracked `QAM/AUTOMATION/{combined001,q2}`, `QAM/evidence/{q1,q2,combined001}`, Q1/Q2/combined packages and receipts, and `REVIEW_START_HERE.md`. Also my own earlier one-line edits to `RECOVERY.md` and the session file (r002 deletion). None of Cody's records were edited. |
| QA package | `QAM/HANDOFFS/…_COMBINED_RETEST_001_REVIEW.zip` and the `~/Downloads` copy: SHA-256 `2360f162…94c2` (matches), 134 members |
| Unowned processes | `next start` on :3000 (PID 916513, cwd repo root, started 12:31) and PID 40320 on :3457: **not touched**. The repo `.next` was not rebuilt. |
| Toolchain | Node v22.17.0 · next 16.4.3 · TS 5.5.4 · jest 30 · @playwright/test 1.59.1 · system Chrome. No dependency or lockfile change. |

## 2. Reproduction before repair (owned baseline build of `24cf075`, scratch `r003/base`, :3105)
Scripts: `REPAIR_002/repro/public.repro002.spec.ts` (browser) and `repro002.test.ts` (service). Output: `REPAIR_002/before/`.

| Case | Observed on 24cf075 | File |
|---|---|---|
| **CR-F01 A** (current UI): accepted checkout → owner step → untick → Continue (error shown) → revisit `/demo/stripe` | Error shown, but the checkout **stayed pending**. "Payment succeeds" was offered; clicking it gave checkout `paid`, payment `confirmed`, declaration `false`. | `before-A-current-ui.json`, `before-A-activation.png` |
| **CR-F01 B** (legacy): pending checkout → storage rewritten to v1 without the declaration → reload | Declaration `false`, quote cleared, checkout still pending; paid control offered; result `paid`/`confirmed`. | `before-B-legacy-browser.json`; service: `before-service.json` B (`resolvePaidOk: true`) |
| Same-key replay after withdrawal (service) | `startCheckout` with the same key returned **ok** (handoff replayed) | `before-service.json` A `sameKeyReplayOk: true` |
| Processing → refresh after withdrawal | payment `confirmed` | A `processingThenRefresh: confirmed` |
| Unknown payment → "Stripe confirms payment" after withdrawal | `paid` / `confirmed` | `unknown` |
| **R2-N01 (self-found):** change the store count 1→2 while the checkout is open → revisit stand-in | Quote cleared, checkout **still pending and payable**. Paid for the 1-store quote while the draft asked for 2 stores with 1 entered; activation confirmed. The review copy already says editing "closes the open checkout". | `before-C-edit-while-open.json` |
| **CR-F02** instrument: `setStoreCount(1_000_000_000)` with a 64-push budget | Aborted at push 65 (eager loop); 21 stores made 21 placeholder entries | `before-service.json` allocation |
| **R2-N02 (self-found):** `?store=100` with 99 entered | Rendered **Pharmacy 1 of 100**: the route only parsed `\d{1,2}`, a hidden 99-store step limit | `logs/before-regression-spec.log` test 9 |

The new regression tests were also run against the baseline:
- **Browser:** 10 of 12 failed; the two valid-path controls (replay, 21-store journey) passed. See `logs/before-regression-spec.log`.
- **Jest:** 22 of 69 failed; the 47 that passed were the existing tests. Of the 22, 19 fail on behaviour or markup. Three fail at least partly because the new helpers (`checkoutHold`, `isPharmacyStep`) don't exist on `24cf075`. See `logs/before-jest-new.log` and `before/before-jest-new.json`.

## 3. Root causes
- **CR-F01.** The R-011 declaration was enforced only where a checkout is created (`startCheckout` → `isDraftComplete`). Five paths moved an existing checkout toward payment without re-checking the draft:
  - same-key replay (it returns before validation)
  - `resolveCheckout('paid' | 'processing')`
  - `resolveUnknownPayment('paid')`
  - `refreshActivation` pending→confirmed
  - the stand-in UI, which rendered its outcome buttons for any pending checkout

  Owner edits (`keepOwner`/`saveOwner`) and `migrateRegistration` never touched the checkout.
- **R2-N01.** `touch()` (any material edit) dropped the quote and consent but left an open checkout pending.
- **CR-F02.** `setStoreCount` pushed one `{}` placeholder per requested store, and `savePharmacy` accepted any index below the count, so a far index produced a count-sized sparse array.
- **R2-N02.** The two-digit `?store` parse in `pharmacies/page.tsx`.

## 4. Implementation and recovery semantics (R-012)
Product diff vs `24cf075`: 10 product files, +175/−27. With tests, 12 tracked files (+467/−27) plus 2 new test files. Full patch: `REPAIR_002/REPAIR_002_product.diff`.

| Concept | Rule | Where |
|---|---|---|
| Open checkout | `pending` with no activation waiting, or `declined`. Unpaid, and nobody has submitted payment on it. | `isOpenCheckout` (registration.ts) |
| **Pending invalidation** | Withdrawing the declaration (owner Continue **or** Back), restoring a storage-v1 draft, or a material edit (count, pharmacy, code) **closes** an open checkout. It becomes status `abandoned` with `closedReason: 'owner_declaration' \| 'details_changed'`. Quote and consent are cleared, details kept, nothing charged, and the record is kept. | `withOwner`, `touch`, `migrateRegistration`; `CheckoutRecord.closedReason` (internal `state.ts`; the frozen view contract is unchanged) |
| **Current-prerequisite gate** | `checkoutHold(draft)` returns `owner_declaration` (declaration not exactly `true`), `details_incomplete`, or null. It is checked against the **current** draft on every move toward payment: same-key replay, paid/processing outcome, unknown→paid, and waiting→confirmed refresh. A failure returns `missing_context` and leaves state unchanged. | `startCheckout`, `resolveCheckout`, `resolveUnknownPayment`, `refreshActivation` |
| Submitted vs open | A submitted payment ("processing", or `unknown`) is **held, not closed**. It can't advance while the hold applies. It confirms after explicit re-acceptance, because money may already be in flight. Non-advancing outcomes stay available: back, decline, unknown, "nothing charged", and the payment-failed plan. | same |
| Completed history | `paid` / `confirmed` is never closed, reversed or rewritten by later edits | `isOpenCheckout` excludes it; tested |
| Recovery path | Tick the declaration explicitly → review ("Welcome back … we closed that checkout. Nothing was charged.") → **Get a fresh quote** → fresh consent → a **new** checkout and operation key → pay. Re-accepting never reopens the closed checkout or restores consent. Acceptance is never inferred from payment, email, store-admin nomination or an old checkout. v1 drafts are forced to `false`, even if the field is present. | engine and `ReviewView` copy |
| Valid replay kept | An unchanged valid checkout still replays the same handoff on the same key (identical state object), and a different key is still refused while one is open | tests |
| UI (service also refuses) | Stand-in: **closed** notice, or **hold** notice with no outcome buttons. Activation: hold alert, Refresh disabled. Unknown payment: "Stripe confirms payment" disabled with a note; "nothing charged" still enabled. | `CheckoutStandIn`, `ActivationView`, `CheckoutIncompleteView`, `ReviewView` |
| **CR-F02** | No placeholders. Entries are created only as each step is filled in. `isPharmacyStep` requires a valid count, index < count and index ≤ entries, so steps fill in order. A far deep link goes to the first missing step. Work and storage scale with **entered** pharmacies. **No business cap added.** The only bound is still the technical safe-integer pricing bound `MAX_REPRESENTABLE_STORES` (≈1.84 × 10¹²), which exists so cents stay exact. Neither bound is a purchasing rule. | `setStoreCount`, `keepPharmacy`, `savePharmacy`, `PharmacyStepView` |
| **R2-N02** | `?store=` accepts any safe integer; the view validates it | `pharmacies/page.tsx` |
| **Q2-O04 residual** | Plan Actions column follows the approved C10 source: `border-t pt-5` divider above on mobile, `lg:border-l lg:pl-8` beside on desktop (20 rem), 12 px gaps. Cards, plain count, refresh line, pills, owner/support copy and mock notices are unchanged. | `DashboardView.tsx` (classes only) |

Unchanged:
- The real admin/superadmin gate, auth, `proxy.ts`, API routes, Supabase, Stripe, email, DB/RLS/roles and dependencies.
- The R-011 declaration: exact label, unchecked default, strict boolean, review summary, and Me / Someone else.
- Quote and consent rules, and all REPAIR_001 logic.

## 5. Verification (owned build `r003/app`, :3106; `src` and `e2e` byte-identical to the tree)
| # | Command | Exit | Result |
|---|---|---|---|
| 1 | `next build` (clean `.next`; public Supabase URL, publishable key and site URL only) | **0** | `logs/build.log` |
| 2 | `tsc --noEmit` | **0** | `logs/tsc.log` (empty) |
| 3 | `jest` (repo) | **0** | **13 suites, 180/180**: +24 vs AMENDMENT_001, namely 17 engine tests (`portal-registration.test.ts` R-012 blocks) and 7 in new `portal-checkout-hold.test.tsx` |
| 4 | Playwright `public` + `gate-m-public` → :3106 | **0** | **113/113**: public 100, including 16 new `public.repair002`; Gate M public 13 |
| 5 | Playwright `account` → :3106 | **0** | **35/35**, including the new O04-residual geometry test; **1 real sign-in**, 0 logouts |
| 6 | `public.repair002 --grep "R-012 surface"` rerun after a screenshot-only spec change (blur before capture) | **0** | 4/4 |

**Totals:** browser **148/148**. Gate M: 136 public + 16 new surfaces + 84 account = **236 measurements, 0 failures**. Contrast: public 44, R-012 surfaces 16 and account 22 screen×theme entries, with 0 text, boundary or focus-ring failures.

**Dispatch checklist**

CR-F01 and recovery:
- **A, current UI:** owner Continue and Back both close the checkout. The stand-in shows "closed" on direct revisit and after reload (twice), with no payment control. `/demo/activation` has nothing to track. The incomplete page explains the closure. Recovery reaches `paid` with the declaration `true`, a **new** operation key, and consent re-required.
- **B, legacy:** reload migrates to storage v2 with declaration `false`, quote cleared and the checkout closed; recovery works the same way.
- **Holds:** a stored checkout that is already unaccepted, a processing payment and an unknown payment are each held, at both service and UI.
- **History and replay:** paid history is preserved. A valid replay and a repeated reload still give one checkout, paid once.

CR-F02:
- Billion-store push probe shows **0** pushes, the price is exact ($49,000,000,050.00), and a far index is refused with no growth.
- A restored billion-store draft renders, and a deep link to 999,999,999 redirects to store 2. Storage stays under 20 KB with at most 2 entries.
- Malformed counts (−5, 0, 1.5, 1e300, NaN, `'3'`, null) return to the plan step.
- `MAX` is accepted and `MAX+1` refused.
- 1, 2 and 3 stores keep their literal prices. Reduction asks before discarding, and restoring the count refills the missing step in order ($197.00).
- The **full 21-store journey** completes at $1,079.00 through activation, with 21 distinct pharmacies.
- Store 100 of 100 is reachable (R2-N02).

Earlier repairs and boundaries (all pass in the full suites):
- F02 load-error/Retry
- F03 Stripe `mode` routing, 13 HTML and RSC variants
- Quote expiry and consent invalidation
- Idempotent add-store
- Public/private payload boundaries
- Me / Someone else
- AMENDMENT_001 declaration specs

Visual, keyboard and zoom:
- The new hold and closed surfaces pass Gate M at 375 and 1440 in light and dark, plus contrast.
- The hold link is reachable with Tab and opens with Enter.
- O04 residual geometry is asserted: mobile top border 1 px, padding-top 20 px, gaps 12 px; desktop left border 1 px, padding-left 32 px, width 320 px.
- **Zoom:** `public.zoom.spec.ts` is **viewport/DPR emulation**, not the browser's own zoom setting. Real browser zoom was **not** tested.

Screenshots in `REPAIR_002/screenshots/` (account shots mask the account menu and strip identity):
- the approved reference render
- `repair002-account-billing_active_{light,dark}_{mobile,desktop}.png`
- 16 R-012 surface shots

## 6. Failed attempts, corrections, limitations
1. ⚠️ **Memory exhaustion on the baseline, contrary to the dispatch.** My first before-run of the new Jest tests on the **unrepaired** copy called `setStoreCount(1_000_000_000)` outside the push budget in four places. The facade test was one of them. The eager loop ran until that Jest worker hit its ~4 GB heap limit and crashed (`logs/before-jest-new-attempt1-OOM.log`). It was contained to that one worker process: no browser, no server, and no other process was affected. I then routed **every** extreme-count call through the budget instrument, so a regression now fails cleanly instead of exhausting memory. The rerun used a 512 MB heap cap as a further safeguard (`logs/before-jest-new.log`: clean abort, no OOM).
2. **First repaired browser run: 3 of 15 failed** (`logs/pw-repair002-1.log`):
   - One test wrongly expected the "Welcome back" banner after the incomplete page's Continue had already cleared the closed record. The behaviour is correct; I fixed the assertion.
   - One test clicked a link and then reloaded before navigating; I added a URL wait.
   - The CR-F02 deep-link test exposed **R2-N02**, which I fixed in the product.
3. **Bugs in my own tests, caught during the run:**
   - A malformed-count check exposed that `isPharmacyStep` accepted `1e300`; I added the valid-count guard.
   - A push-count assertion also counted Jest's own pushes; I moved the assertions outside the probe.
   - One TS cast; the typecheck caught it.
4. A `pkill -f` pattern matched its own shell and ended that command (exit 144) before an edit ran. Nothing else was killed; I re-checked the processes and re-applied the edit.
5. The R-012 surface screenshots were retaken after blurring the focus left on the skip link by the focus-ring probe. Measurements are unchanged.
6. **Limitations:**
   - Engineering evidence only; independent retest is required.
   - Real browser zoom, assistive technology and Safari are still unverified.
   - The hold and closed notices follow the existing Alert pattern; no approved design render exists for them.
   - The owner step stays editable after payment. Edits there don't change payment history by design, but locking the step is a design question I did not change.
   - The Counter shows an extreme restored count (10 digits) wider than its 56 px box. The count is functional, but this was not styled.
   - Cody's combined001 tests that expect the defect (for example the "aborts after 64 pushes" probe) will now see the repaired behaviour.

## 7. Account actions, privacy, processes
- **Real sign-ins: 1** (account run, in-memory fixture, no worker restarts). **Logouts: 0** (the logout endpoint was aborted). No saved auth state: no `.auth/`, and `test-results/` was removed after every run. No error-context snapshots in the account run.
- Credentials stayed in test-helper memory only; they were not passed to the app, the build or evidence. The build env holds only the 3 public keys.
- **Privacy scan** of the package: credential values, env values and the credential email's local part. Result in §9 and the response file. The real display name was not separately scanned; screenshots mask the account menu, and logs carry only test titles.
- **Processes:** my servers :3105 (baseline) and :3106 (repaired) were **stopped**, each after its cwd was verified. :3000 (PID 916513) and PID 40320 are untouched.
- **Scratch:** the `r003/base` and `r003/app` copies were deleted (≈1.4 GB, no process using them). Logs and data are kept in the scratchpad.

## 8. Changed-path inventory and proposed commit
| Mine (REPAIR_002) | Path |
|---|---|
| Product | `src/services/portal/{registration.ts,index.ts}`, `src/types/portal/state.ts`, `src/components/portal/handoff/CheckoutStandIn.tsx`, `src/components/portal/activation/{ActivationView,CheckoutIncompleteView}.tsx`, `src/components/portal/register/{ReviewView,PharmacyStepView}.tsx`, `src/components/portal/account/DashboardView.tsx`, `src/app/(public)/demo/register/pharmacies/page.tsx` |
| Tests | `src/__tests__/portal-registration.test.ts` (modified), `src/__tests__/portal-checkout-hold.test.tsx` (new), `e2e/public.repair002.spec.ts` (new), `e2e/account.repair.spec.ts` (modified) |
| Records | module `RULINGS.md` (R-012), `ACCEPTANCE_SPEC.md` v1.3, `ACCEPTANCE_LEDGER.md`, `_project/DATA_CONTRACT.md` v1.4, `_project/UI_SPEC.md`, `QAM/HANDOFFS/ENGINEERING_HANDOFF.md` §9, `STATE.md`, `JOURNAL.md`, `EVIDENCE/REPAIR_002_ENGINEERING_REPORT.md`, `EVIDENCE/REPAIR_002/`, `EVIDENCE/…_REPAIR_002_REVIEW.zip`; `CHANGELOG.md`, `RECOVERY.md`, `agent_docs/SESSIONS/session_2026-10-29.md`, the response file |
| **Not mine** (pre-existing; leave for the Director) | All of Cody's modified and untracked `QAM/` records listed in §1 (except `ENGINEERING_HANDOFF.md` §9, which is engineering-owned) |

Proposed Director commit:
```
git add src e2e CHANGELOG.md RECOVERY.md \
  agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/{RULINGS.md,STATE.md,JOURNAL.md,ACCEPTANCE_SPEC.md,ACCEPTANCE_LEDGER.md,_project/DATA_CONTRACT.md,_project/UI_SPEC.md,QAM/HANDOFFS/ENGINEERING_HANDOFF.md,EVIDENCE/REPAIR_002_ENGINEERING_REPORT.md,EVIDENCE/REPAIR_002,EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_REVIEW.zip} \
  agent_docs/SESSIONS/session_2026-10-29.md agent_docs/RESPONSES/response_2026-10-29_133500_repair-002-ffm-abm-001.md
```
No commit, push, merge, deployment or certification by Engineering. Next: JARVIS reviews → Tony commits → Cody independently retests → Tony's walkthrough → JARVIS certification decision.

## 9. Package
`EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_REVIEW.zip`, with a byte-identical copy in `~/Downloads/`. Member list, sizes and SHA-256 are in `FILE_INDEX.json` and `00_INDEX.md` inside the ZIP. The ZIP's own hash and the privacy-scan result are in the response file, since a ZIP can't contain its own hash.

## 10. Addendum 1 — C14 unknown-payment introduction (manual review, 29 Oct 2026 13:47–13:55)
- **Finding (Director manual review):** on the saved-signup page (C14), the unknown-payment state's introduction said "Payment wasn't completed", while its warning says we're still checking whether payment went through. The sentence came from the received design, which used the resumable introduction for every state.
- **Base:** HEAD `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36`, the Director commit of REPAIR_002. `src` and `e2e` were clean at HEAD before the change.
- **Change:** one product file, `src/components/portal/activation/CheckoutIncompleteView.tsx`. For `unknown` only, the introduction is now "Your details are saved. We're checking your payment status. Please don't pay again yet." Straight apostrophes match the page's existing copy.
- **Unchanged:**
  - Abandoned and declined keep "Your details for N pharmacies are saved. Payment wasn't completed, so your account isn't active yet."
  - Expired keeps no introduction.
  - The payment lock is unchanged: Continue and Review disabled, the "don't pay again" warning, and "Payment is paused…".
  - Explicit recovery ("Stripe confirms nothing charged" leads to resumable) and the R-012 hold are unchanged.
- **Tests:** `portal-checkout-hold.test.tsx` gained 3 component checks: unknown, abandoned and declined. `e2e/public.repair002.spec.ts` gained 3 rendered checks covering the same states at 375 and 1440, light and dark: wording, lock state, Gate M, contrast, screenshots, and unknown → nothing charged → resumable.
- **Verification** on the owned build `r004/app`, :3107, from `git archive d6fe678` plus the tree (`src` and `e2e` byte-identical):
  - `next build` exit 0; `tsc` 0
  - Jest **13 suites, 183/183**
  - Focused Playwright **6/6**: the 3 new checks, the existing "abandoned checkout resumes…; unknown payment pauses payment" journey, and the R-012 unknown-hold checks
  - Gate M 12 measurements, 0 failures; contrast 12 entries, 0 failures
  - Per the QA Lead, no full retest campaign
- **Account and process:** 0 real sign-ins (public only). Server :3107 was stopped after its cwd was verified. The `r004` scratch copy was deleted. :3000 (PID 916513) and PID 40320 were untouched. No Git actions.
- **Evidence:** `REPAIR_002/addendum_001/` (diff, logs, data, 12 screenshots). Package: `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_ADDENDUM_001_REVIEW.zip`. The committed REPAIR_002 ZIP is unchanged.
- **Updated candidate:** `d6fe678` plus this uncommitted addendum. It becomes a new SHA when the Director commits it; record that SHA before final certification.

## 11. Addendum 2: activation demo controls (QA Lead authorization, 29 Oct 2026 14:20–14:45)
- **Finding:** the Director tried every "Next activation check" option, saw no visible change, and saw the selection return to "ready". This is a **demo-usability finding; no engine failure was reproduced.**
  - **Reproduction** on an owned build of `d6fe678` + ADDENDUM_001, 24 scenario × option combinations (`REPAIR_002/addendum_002/before/before-activation-plan-matrix.json`):
    - Selecting an option never changed the visible screen, because it only applies to the next Refresh status.
    - The email-failed, payment-failed and ready states have no Refresh status, so the option had no effect there.
    - Loading any scenario resets the option to `ready`.
    - Every Refresh outcome matched the engine rules.
- **Base:** HEAD `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36` (Cody's retest candidate) + the expected uncommitted ADDENDUM_001, which I preserved. No Git actions; Cody's build and records untouched.
- **Change:** one product file, `src/components/portal/PublicDemoControls.tsx`.
  - Removed the "Next activation check" select, along with its now-unused imports and the `useRegistration` read.
  - The grid went from 4 columns to 3 at `lg`.
  - Comment updated: Registration scenario → Load is the single way to choose a named activation state.
  - Engine, scenarios, activation view and customer actions are unchanged.
- **Now-unused (left in place, removal needs your approval):**
  - `registrationHarness.setActivationPlan` (`registrationService.ts`)
  - the `ACTIVATION_PLANS` re-export (`services/portal/index.ts`)

  The engine's `setActivationPlan`/`activationPlan` stay in use by `refreshActivation`, the R-012 hold exception and the engine tests.
- **Scenario evidence:** `REPAIR_002/addendum_002/SCENARIO_RESULTS.md`. All six named states load on `/demo/activation` as named, unchanged after a 2.5 s wait and a reload, with the stored state identical and the plan `ready`. Each customer action reaches the expected next state:

  | Named state | Customer action | Next state |
  |---|---|---|
  | Waiting | Refresh | Provisioning, then a second Refresh → ready |
  | Provisioning | Refresh | Ready |
  | Delayed | Refresh | Ready |
  | Email failed | Resend | Ready, with "Sent again" |
  | Payment failed | Try payment again | Review: fresh $148.00 quote, unticked consent, no checkout or activation left open, so no duplicate payment |
  | Ready | Resend | "Sent again" (no Refresh) |

- **Verification** on the owned build `r005/app`, :3108, from `git archive d6fe678` + tree, with `src` and `e2e` byte-identical:
  - `next build` exit 0; `tsc` 0
  - Focused Jest 76/76: registration, checkout-hold (with the new demo-controls component test) and components
  - New `e2e/public.activation-scenarios.spec.ts`: **9/9**
    - control absent, with no customer action inside the demo strip
    - the 6 scenario rows
    - keyboard only: Tab to Demo controls → Enter → arrow-select a scenario → Load → Tab to Refresh status → Enter
    - 375 and 1440 px, light and dark, for the open strip and every state
  - Affected existing tests **35/35**: activation contrast, R-012 holds, the 21-store journey, Gate M public
  - Gate M 180 measurements, 0 failures; contrast 0 failures
  - The same spec on the **baseline**: only the "control is gone" check failed; the scenario, keyboard and mobile checks passed, which confirms no engine repair was needed (`logs/before-focused.log`)
- **Account and process:** 0 real sign-ins. My server :3108 was stopped after its cwd was verified, and the `r005` copy was deleted after packaging. :3000 (PID 916513) and PID 40320 were untouched.
- **Limitations:**
  - The engine still supports non-`ready` plans; a session restored with an old non-ready plan would play that plan on the next Refresh. This is coherent, but there is no longer a UI to select it.
  - Focused checks only, as instructed.
  - Real browser zoom was not tested; only viewport emulation was used.
- **Package:** `EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_002_ADDENDUM_002_REVIEW.zip`. The earlier REPAIR_002 and ADDENDUM_001 ZIPs are unchanged.
