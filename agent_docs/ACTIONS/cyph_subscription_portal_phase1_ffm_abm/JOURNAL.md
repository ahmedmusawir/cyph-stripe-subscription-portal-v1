# Engineering journal
27 October 2026 — Architect assembled v1.0 against supplied recon/cleanup, Director foundation receipt and approved design. No product build or QA run performed during package authoring.

Engineer appends meaningful checkpoints: time, identity, work, command/result evidence, failure/fix, next action. Preserve failed attempts; no transcript dump. Record actual duration and Director touches rather than promising a shot-count outcome.

## 27 Oct 2026 12:36–13:2x — E1 (Claudy, Claude Code Opus 5.5, CWD repo root)
- Verified archive SHA-256 = Director value; extracted to an isolated scratch dir; 391/391 FILE_INDEX entries match (size + hash), no unindexed files except the index, no unsafe paths.
- Repo: main @ 1d15918 (full SHA resolved), HEAD == foundation, ahead 1; 71 Director-side ` D` paths in old CURRENT_APP module; ACTIONS/ empty. CURRENT_APP absent, so no copy to reconcile.
- Installed via `cp -a` to `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/`; re-verified 391/391 before edits.
- Baseline: tsc 0; jest 8/8; `next lint` exit 1 (removed in Next 16, eslint absent → LINT NOT CONFIGURED); next build on a git-archive copy exit 0, 8 routes (a copy because PID 40320 serves the repo `.next`); npm audit 3 advisories.
- Failed attempt kept: first `diff -rq` of skills exited 1. Cause: the repo copy `agent_docs/.claude/skills/stark-frontend-first/references/ANTI_PATTERNS.md` differs from the module copy. Recorded; no edit.
- Edits: R-007, entry repoint (CLAUDE/AGENTS/GEMINI/README), STATE, this journal, EXECUTION_PLAN, EVIDENCE/E1_RECON, INSTALL_RECORD, INSTALLED_FILE_MANIFEST; repo bridge PROJECT_POINTER + root CLAUDE.md pointer.
- Director touches: one dispatch. Next: plan approval + B1–B4.

## 27 Oct 2026 14:20–14:35 — R-008 focused admin-login fix (Claudy, CWD repo root)
- Director paused broader E2: admin OR superadmin may enter, member denied. Branch `ffm-abm-001-subscription-portal` @ `b1fbdda` (Director commit), tree clean at start; no E2 product work existed.
- Cause found in three places: login form role check (`!== "superadmin"` → logout), `getSuperAdminUser()` in the `(portal)` layout, and the `/login` page redirect. Shell label hard-coded "Super Admin".
- Fix: shared pure predicate `isPortalStaffRole` (`services/auth/access.ts`); `getPortalStaffUser`; `PortalStaffUser {role}`; Shell role label. tsc 0; jest 36/36.
- Mutation check: predicate reverted to superadmin-only → 5 tests fail; member admitted → 6 fail; restored → green.
- Found while smoke-testing (pre-existing): signed-out `/dashboard` 307 body contained the dashboard RSC payload, because the page renders in parallel with the layout. Added a page guard; HTML and `RSC: 1` bodies now carry 0 occurrences. jest 40/40.
- Mistake kept: `pkill -f run-r008` matched my own shell and killed it (exit 144). No other process was affected; my :3001 server was then stopped by PID after a cwd check.
- Real browser login NOT tested: `.env.qa.local` absent. Next: Tony's manual admin login.

## 27 Oct 2026 14:38–16:01 — E2 under R-009 (Claudy, CWD repo root)
- Director dispatch: record Tony's manual admin login as Director-reported (done in R-008), R-009 entry/access model, reconcile active contracts, resume E2 without further plan approval. Branch/HEAD verified `b1fbdda`.
- Reconciled (replaced, not annotated): APP_BRIEF v1.2, DATA_CONTRACT v1.2, IMPLEMENTATION_CONTRACT v1.1, ACCEPTANCE_SPEC v1.1 (AC-01/02/03/07/25/26/29), EXECUTION_PLAN §3/§4.1/§5/§6/§9, README, SKILLS_MANIFEST, playbook 04/05, `_project/UI_SPEC.md` sign-in wording, QAM preflight/risks/manifest/handoff, BUILD_CHECKLIST.
- Built: types → engines (registration, account) + 52 engine tests first → stores/facade → tokens/kit deltas → shells → 9 public + 6 account views → pages → Playwright (public, Gate M, admin setup, account, logout).
- Gate M findings fixed: brand link 33px; stand-in outcome buttons overflow 375 by 5px; mobile stretched counter/pills; consent ticked before quote silently cleared (race); empty activation amount for seeded scenarios. Test bugs fixed: RSC `_rsc` hop, hidden `<option>` matched by text, static `<title>` counted as payload.
- Removed a fake-credential e2e test (would have sent a synthetic login to the real auth target); replaced by mocked unit tests.
- Real auth: `.env.qa.local` appeared 14:44 (Director). 3 real sign-ins, 2 global logouts. Discovered inherited logout = Supabase global scope.
- Final: build 0, tsc 0, jest 106/106, Playwright 59/59; Gate M 136 + 84 measurements, 0 failures.

### 28 Oct 2026 — REPAIR_001 (Claudy)
- Reproduced every Q2 finding on an owned `git archive` build of 94251be before changing code. F03 also failed for case/whitespace variants (`mode=Portal`, `mode=%20portal`).
- F02 root cause: a superseded/second load consumed the one-shot failure; the sequence guard then threw that error away. The old engine test asserted the buggy behaviour.
- While proving transient states, found R1-N01: the "refreshing" banner after a Stripe return never rendered (skeleton until done). Fixed with a synchronous last-known read.
- Instrument lessons: theme set after load measures colour transitions; Playwright restarts the worker after each failure, so a worker-scoped real sign-in multiplies (≈22 sign-ins this repair). Error-context snapshots carry the real display name and must be deleted.

### 29 Oct 2026 — AMENDMENT_001 (Claudy)
- Declaration enforced once, in `validateOwner`, so the owner step, deep links and `startCheckout` all inherit it; a quote still prices without it (pricing only).
- The real risk was old drafts: persisted v1 drafts are migrated with the declaration explicitly false; an allow-list keeps `businessRole` (or any stray key) out of drafts.
- One test expectation was wrong (expected `requestQuote` to fail); corrected to the mock submission (`startCheckout`). All browser runs passed first time, so 1 sign-in only.

### 29 Oct 2026 — REPAIR_002 (Claudy)
- Root cause CR-F01: the declaration was enforced only where a checkout is *created*; nothing re-checked it when an existing checkout was replayed, paid, resolved from unknown or confirmed on refresh, and owner edits never touched the checkout. Fix = close open checkouts on withdrawal/migration/material edit + a single `checkoutHold` gate on every move toward payment.
- The review copy already promised "editing … closes the open checkout"; `touch` never did. That gap is R2-N01, found while reproducing.
- Failed attempt: on the unrepaired baseline, billion-count test calls outside the push budget exhausted one Jest worker heap (4 GB) before I moved every extreme-count call inside the budget. Contained to that worker; recorded in the report.
- R2-N02 found because the CR-F02 deep-link test failed: the route parsed `?store=` with `\d{1,2}`.
- 29 Oct (addendum 1): the contradictory C14 sentence came from the received design, which used the resumable introduction for every state. Changed for `unknown` only; straight apostrophes to match the page's existing copy.
- 29 Oct (addendum 2): the "Next activation check" control was a pre-select for the *next* Refresh. Nothing visible could happen on the email-failed, payment-failed and ready states, which have no Refresh, and Load always reset it, which matches what Tony saw. A baseline run of the new focused spec showed every scenario already loading and progressing correctly, so the fix is removal only. Engine code is untouched.

## Final candidate preparation — Director dispatch,29 October2026
Both addenda verified against d6fe678; no further product work. Tony reports completed manual walkthrough and acceptance, including login/logout and activation-dropdown removal. Coach questions remain pending confirmations; exact questions/answers not supplied. JARVIS certification is not granted by this preparation. Next: Tony scoped commit of both addenda/engineering records, record full candidate SHA, then Lead disposition. Prior walkthrough-pending entries remain historical. Verification and exact unexecuted commit command: EVIDENCE/FINAL_CANDIDATE_PREPARATION_001.md/.json. Cody records preserved.

### 29 Oct 2026 — REPAIR_003 (Claudy)
- R2-F01 root cause: R-012 kept a *submitted* checkout open on purpose, but nothing recorded what it was for, so `checkoutHold` judged the current draft only, and `touch` dropped the quote that had the price. The fix records the scope when a checkout opens and binds every move toward payment to it. Recovery restores that scope; nothing is cancelled or charged again.
- Values are compared, not revisions, so typing the original details back in counts as unchanged. Persisted v2 records are bound only when provably unedited (`draft.state` stays `checkout_pending` until any edit).
- R2-F02: the review page kept one key per mount, so "Edit my details instead" followed by paying again on the same page would have hit the new service refusal. The page now renews its key whenever no checkout is open; a browser test covers this.
- The storage bump to v3 broke three of my own assertions pinned to version 2 (two R-012 tests and one AMENDMENT_001 test). These were updated as intended consequences; the owner-declaration one surfaced in the full run (131/132), not earlier.

### 29 Oct 2026 — REPAIR_004 (Claudy)
- R3-F01 root cause: REPAIR_003 assumed "open means unedited" for stored v2 checkouts. That holds for R-012, which closes an open checkout on any edit, but not for R-011: it kept the checkout pending and only dropped the quote and bumped the revision. Both engines drop the quote and bump the revision on every scope edit, so a retained quote with the checkout's id, at the draft's revision, is the evidence. When no quote is retained, a demo seed can still be matched deterministically. Binding no longer falls back to `listPrice`; that fallback was the "invented price".
- R3-F02 root cause: REPAIR_003 moved names and amount to the paid scope but left the admin lookup on the draft, both in ActivationView and in `accessEmailPreviews`. Cody's case-sensitive check missed the preview button because buttons are rendered uppercase; my browser checks lowercase the text.
- R3-O03: my calculation matched Cody's 2.9942 exactly. Success-on-card is lower still (2.97); info and destructive scrape by (3.04/3.07). That is why the fix is on Alert rather than on the one button.
- My own REPAIR_003 assertion "paid legacy records are left as they are" was changed on purpose. Paid records now bind on the same evidence, so an unedited completed record keeps naming what it paid for.
- Found while checking "don't encourage another payment": Review offers "Edit my details instead" during processing, and the service accepts `back` for any pending checkout. Recorded as R4-N01 and not repaired, because it is outside the three authorized items.

### 29 Oct 2026 — REPAIR_004 addendum 1 (Claudy)
- R4-N01 root cause: `resolveCheckout` only asked "is the record `pending` or `declined`?". A processing payment is also `pending`, so every stand-in outcome, and Review's "back", applied to a submitted payment. `startCheckout`'s same-key replay had the same blind spot, and `restartSignup` had no guard at all. `isSubmitted` already drew the right line for R-013, so the fix exports it and refuses at those three entry points.
- My first browser assertion for unknown expected the Review notice, but Review already redirects an unknown payment to C14 from an effect; the component test passed only because the router is mocked. I asserted the redirect instead and reran the corrected spec on a fresh baseline build. On the baseline, the unknown browser case passes; its exposure was service-only (`restartSignup`).
- The C06 waiting copy ("nothing was charged and you can resume checkout") came from the approved render. For our processing state it was a stale control pointing back to the checkout, so it was removed and recorded as a deviation.
- Baseline Activation for an edited legacy completed record showed "Confirmed by Stripe · $99.00". The $99.00 was recomputed from the edited draft (`initialRecurringCents`), not recorded, which is the dishonest part.

### 30 Oct 2026 — REPAIR_005 (Claudy)
- Both findings have one cause: `refreshActivation` and `resumeSignup` trusted `activation.paymentState` on its own. The d6fe678 engine could leave the two records disagreeing (unknown checkout + failed flag; abandoned checkout + pending flag, the latter via the current nothing-charged step, which never cleared the activation). Each reader picked whichever flag suited it.
- Rather than patch two readers, `paymentPhase` fixes the precedence once and the readers and C06 use it. I did not rewrite stored flags: a migration that deletes a conflicting flag would itself be choosing an authority silently, and keeping the flags leaves the history inspectable.
- The matrix caught two of my own test mistakes before anything in the product: a composed action compared the refusal to the wrong input, and I had expected resume to be refused after a decline, which R-012 allows. Both fixes are in the test, with comments.
- `refreshActivation` used to return a silent no-op success on a failed flag. That is why Cody's unknown+failed case could call refresh "successfully"; it now refuses unless the record is processing or paid.

### 30 Oct 2026 — REPAIR_006 (Claudy)
- REPAIR_005 put the phase check after `if (!activation)` in C06, so a cleared or missing activation short-circuited before the phase was ever read; the paid branch then rendered straight from the raw flag. Moving the phase first and adding one agreement check (`consistentActivation`) closes both the paid conflicts and the terminal-notice gap.
- For paid-without-agreeing-activation I chose not to show the three tracks at all: any setup/email track would either invent an outcome or show a stale one. The notice says what is known (paid, amount if recorded) and what isn't.
- Side effect caught by the focused regression: an open checkout closed by a withdrawn declaration is `abandoned`, so it now gets the not-charged notice on C06. I updated my own R-012 assertion rather than special-casing the copy.
- R5-O03 left as is on purpose (Lead disposition). Making repeat refresh refuse would only turn Cody's assertion green.

### 30 Oct 2026 — Documentation closeout (Claudy)
- JARVIS / QA Lead issued Gate Q PASS for the frozen snapshot (manifest `f7181d3c…e9ab`), R5-O03 retained as nonblocking. Decision installed byte-identical; records reconciled with dated supersession rather than rewritten.
- The reviewed results archive's 171 indexed members were already in the repo, byte-identical, so nothing was extracted over newer records.
- Pre-commit check (the helper's own logic applied to the working tree): 168/168 manifest rows match; 0 additional inputs. Six tracked non-doc paths outside the helper's filename filter (`.env.example`, `_SKILLS/…`, `scripts/install-gcloud.sh`, `supabase/*.sql`) are unchanged from HEAD and not part of the Next build.
- QAM records were updated by Engineering only because the decision directs Engineering to reconcile them; every addition is dated and attributed to JARVIS, and Cody's entries are untouched.
- Content scan of all 1,430 pending files and 1,785 ZIP members: no secret patterns and no literal env values; the only pattern hits are `password` type/annotation lines in Cody's QA helpers that read credentials from the QA env file at test time.
