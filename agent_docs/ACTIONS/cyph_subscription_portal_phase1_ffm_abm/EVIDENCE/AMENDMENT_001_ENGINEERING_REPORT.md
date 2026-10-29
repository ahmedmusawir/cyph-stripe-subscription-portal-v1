# AMENDMENT_001 engineering report — FFM-ABM-001-SUBSCRIPTION-PORTAL (RULINGS R-011)
Engineer: Claudy (Claude Code, Opus 5.5) · 29 Oct 2026 09:55–10:26 Asia/Dhaka (+06).
Business decision: Coach (owner-only registration, explicit owner declaration, job-title dropdown removed). Implementation authorized by the Director (Tony) before final certification.
**These are Engineering self-checks, not QA certification.** The combined candidate needs independent QA.

## 1. Identity
| Fact | Value |
|---|---|
| Branch / base HEAD | `qa/ffm-abm-001-subscription-portal` @ `0d43a4c343909467487b327e654e0650b21c9336` ("fix: repair subscription portal QA findings and add regression coverage" — the Director's REPAIR_001 commit) |
| Tree at start | Product clean at `0d43a4c`. Cody's QAM records were modified or untracked (Q1/Q2 evidence and packages); preserved, not edited. No QA process was running (only the unowned PID 40320 on :3457). |
| Candidate | **uncommitted working tree** on top of `0d43a4c`, pending Director commit. No future SHA invented. |
| Toolchain | Node v22.17.0 · next 16.4.3 · TS 5.5.4 · jest 30.4.1 · @playwright/test 1.59.1 · Chrome 150. Dependencies and lockfile unchanged. |
| Scratch cleanup (requested) | Deleted the REPAIR_001 copies `scratchpad/r001` (base + app), `run-r008` and `buildcopy` (≈2.9 GB) after confirming no process used them. |

## 2. What changed (product diff vs 0d43a4c: 16 tracked files, +186/−61; 2 new test files)
Full patch: `AMENDMENT_001/AMENDMENT_001_product.diff`. Records patch: `AMENDMENT_001/AMENDMENT_001_records.diff`.
| Requirement | Change | Files |
|---|---|---|
| 1. Remove "Your role" | Select and the `ROLES` list removed from C02. `OwnerDraft.businessRole` removed from the contract types; validation list removed; review no longer prints a role. | `register/OwnerView.tsx`, `types/portal/contract.ts` (+ module `_project/portal-contract.ts` v1.2), `services/portal/validation.ts`, `register/ReviewView.tsx` |
| 2. Owner declaration | Required checkbox, initially unchecked, exact label from `OWNER_DECLARATION` (catalog). Native checkbox inside its `<label>`; `aria-required`, `aria-invalid`, `aria-describedby` (help + error); an error-summary entry "Owner declaration" linking to `#owner-declaration`; inline error "Confirm that you are the pharmacy owner to continue." It sits in its own panel, separate from terms/payment consent (`ConsentView` untouched). Help text: owner-only; a self-declaration; email and payment don't prove ownership. | `OwnerView.tsx`, `services/portal/catalog.ts`, `index.ts` |
| 3. Mock contract + service boundary | `OwnerDraft.ownerDeclarationAccepted: boolean`; `validateOwner` requires exactly `true` (`false`, `"true"`, `1`, `null`, missing all fail). That keeps `firstIncomplete` on the owner step and makes `startCheckout` refuse with `missing_context`. `ownerFields()` allow-list in keep/save drops unknown keys (e.g. `businessRole`) and never infers acceptance. Public storage **v2**: `migrateRegistration` keeps v1 drafts' details, drops the job title, sets the declaration **false** and drops any held quote. Fixture `OWNER_JORDAN.ownerDeclarationAccepted: true` is commented as a SYNTHETIC demo fixture used only by seeded scenarios; `fresh` starts unaccepted. | `registration.ts`, `registrationService.ts`, `validation.ts`, `mocks/portal/fixtures.ts` |
| 4. Me / Someone else | Kept. Copy: "Each store has one designated admin … Either way, you keep account ownership and billing." Me: "You also manage this store as its admin, in addition to owning the account." Someone else (signup): "You appoint a store admin … This doesn't transfer ownership, billing or permission to buy more stores." (Account add-store variant equivalent.) | `PharmacyFields.tsx` |
| 5. Ownership-transfer copy | Clarified, with no form or integration: "There's no self-service ownership transfer … contact [SUPPORT EMAIL] … process [OWNERSHIP TRANSFER PROCESS TBD]" (denied view and Billing owner panel). Duplicate-pharmacy copy changed from "we'll verify ownership" to "we'll review it (ownership review process [TBD])", so no verification process is implied. | `account/DashboardView.tsx` (copy only), `register/PharmacyStepView.tsx`, `account/AddStoreView.tsx` |
| 6. Honesty | No live email verification introduced or claimed. Registration, payment, provisioning and access-link delivery remain simulated. A stale-wording scan of `src` found no "verified owner / ownership verified / email verified" claims. | — |

**Not changed (no diff vs 0d43a4c, checked):**
- Auth and server:
  - `src/proxy.ts`
  - `src/utils/**`
  - `src/app/api/**`
  - `src/services/auth/**`
  - `src/app/login/**`
  - `src/app/(account)/**`
  - `src/app/(handoff)/**`
- REPAIR_001 product logic:
  - `globals.scss` tokens
  - `account.ts`
  - `accountService.tsx`
  - `pricing.ts`
  - `stripeRoute.ts`
- Configuration and dependencies:
  - `supabase/**`
  - Dockerfile
  - `next.config.js`
  - `package.json`
  - lockfile
  - `tsconfig.json`
  - `jest.config.js`
- Out of scope:
  - pharmacy-software choices
  - database, RLS, stored roles, live auth, Stripe
  - Mission Control and OwedBook

The real authenticated admin is still labelled "(real account)" and is not relabelled as a provisioned Owner.

## 3. Records (attributable; history preserved)
- **RULINGS R-011** (append) quotes the dispatch: Coach's decision, Tony's authorization, the email/payment-proof statement.
- **Contracts:**
  - ACCEPTANCE_SPEC v1.1→**v1.2**: AC-06 text replaced; new **AC-06a** "Owner declaration".
  - DATA_CONTRACT v1.2→**v1.3**: OwnerDraft field, its meaning, owner identity and admin assignment rules.
  - `_project/portal-contract.ts` v1.1→**v1.2**.
  - `_project/UI_SPEC.md` C02 fields.
- **Engineering records:** ACCEPTANCE_LEDGER (AC-06 reworded, AC-06a "pending independent QA"); QAM `HANDOFFS/ENGINEERING_HANDOFF.md` §9 appended. Cody's QAM records are not edited.
- **History left as is:** received design (`_design/`), `_extraction/`, earlier evidence and Q1/Q2 packages. A stale check leaves only intentional retirement notes in active docs.

## 4. Verification (owned isolated build `scratchpad/r002/app`, :3104; `src`/`e2e`/config byte-identical to the tree)
| # | Command | CWD | Exit | Result |
|---|---|---|---|---|
| 1 | `npx next build` (clean `.next`; public config only: Supabase URL + publishable key + site URL) | `r002/app` | **0** | `logs/build.log` |
| 2 | `npx tsc --noEmit` (src + e2e) | `r002/app` | **0** | empty |
| 3 | `npx jest --json` | repo | **0** | **12 suites, 156/156** (+13 vs REPAIR_001: R-011 service tests and `portal-owner.test.tsx`) |
| 4 | `playwright test --project=public --project=gate-m-public` → :3104 | repo | **0** | **97/97** (public 84, incl. 5 new `public.owner-declaration` tests; Gate M public 13) |
| 5 | `playwright test --project=account` → :3104 | repo | **0** | **34/34** (all REPAIR_001 account regressions); **1** real sign-in; 0 logouts |

**Total browser: 131/131.** Gate M public 136 + account 84 measurements, 0 failures. Contrast (REPAIR_001 probe, which now also covers the declaration panel): public 22 screens × 2 themes and account 11 × 2, with 0 text, boundary or focus-ring failures.

**Focused checks requested → evidence:**
| Check | Evidence |
|---|---|
| Missing declaration blocks progression **and** mock submission | Service: 5 invalid values → `ownerDeclaration` error; complete draft with declaration false → `firstIncomplete=owner`, `isDraftComplete=false`, `startCheckout` → `missing_context`, no checkout record. Component: Continue → inline error, `aria-invalid`, summary link, no navigation. Browser: stays on owner; deep link to review is refused. |
| Accepted declaration survives Back / reload | Service JSON round trip; browser Back → plan → forward still checked, reload still checked, stored `true`; terms/recurring consent remain false. |
| Older drafts don't acquire acceptance | Service `migrateRegistration` (job title dropped, false, quote null, details kept). Browser: a stored draft rewritten to the v1 shape → review redirects to owner, box unchecked, names kept, storage now v2 with `false`. |
| Job title no longer affects registration | Service: an extra `businessRole` is dropped and the saved owner is identical to one without it. Component and browser: no "Your role" / `#role` / "Pharmacist in charge". |
| Me / Someone else preserves billing ownership | Service: the owner stays the access-email recipient while a nominated admin gets the store-admin invitation. Browser: clarified copy present. |
| Keyboard, mobile, both themes | Browser: Tab to the declaration, Space checks it at 375 and 1440 in light/dark; label ≥ 44 px; Gate M geometry passes. The updated Gate M keyboard flow ticks it with Space. Screenshots: `AMENDMENT_001/screenshots/` (error state, light/dark, mobile/desktop). |
| Previous repairs intact | All REPAIR_001 specs pass on the combined build (F01 contrast both themes; F02 load-error persistence and Retry; F03 13 query variants HTML+RSC; G06 > 20 stores; O04 layout; R1-N01 refreshing; keyboard-only add store; zoom emulation; malformed auth-confirm). |

## 5. Limitations and independent QA requirements
1. Engineering self-checks only. Cody should verify **AC-06a** and re-run the REPAIR_001 retest on the **combined** candidate (the REPAIR_001 commit `0d43a4c` was never independently retested).
2. The declaration is a self-declaration. Nothing in the FFM verifies ownership or delegated authority, and nothing claims to. The production ownership model is separate backend work.
3. Seeded review scenarios use the synthetic pre-accepted fixture by design; only `fresh` exercises the unchecked default.
4. Inherited gaps unchanged: no real browser-zoom setting (emulation only), no assistive technology, no real-device Safari; lint not configured; npm audit advisories inherited.
5. Visual: the declaration panel follows the existing consent-checkbox pattern; there is no approved design render for it (the received C02 design predates R-011). Lead/design disposition advised.

## 6. Real-account effects, privacy, processes
- **Real sign-ins:** exactly **1** (account run, in-memory fixture, all passed, so no worker restarts). **Logouts:** 0 (logout endpoint aborted).
- **Privacy:** credentials and display name never printed. Privacy scan over the package is in the ZIP receipt.
- **Processes:** `next start -p 3104` (owned, cwd `scratchpad/r002/app`) is **running** for your walk; stopped on request. PID 40320 untouched.
- **Scratch:** `scratchpad/r002` kept until you ask me to delete it.

## 7. Combined repair/amendment state and proposed commit scope
State: `0d43a4c` (REPAIR_001, committed) + AMENDMENT_001 (this report, uncommitted). Proposed commit (Director):
```
git add src e2e CHANGELOG.md RECOVERY.md \
  agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/{RULINGS.md,STATE.md,JOURNAL.md,ACCEPTANCE_SPEC.md,ACCEPTANCE_LEDGER.md,_project/DATA_CONTRACT.md,_project/UI_SPEC.md,_project/portal-contract.ts,QAM/HANDOFFS/ENGINEERING_HANDOFF.md,EVIDENCE/AMENDMENT_001_ENGINEERING_REPORT.md,EVIDENCE/AMENDMENT_001,EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_AMENDMENT_001_REVIEW.zip} \
  agent_docs/SESSIONS/session_2026-10-29.md agent_docs/RESPONSES/response_2026-10-29_102600_amendment-001-ffm-abm-001.md
```
Cody's QAM records are left for you to handle as you choose. Then: independent QA on the combined candidate → JARVIS adjudication. No commit, push, deployment or certification by Engineering.
