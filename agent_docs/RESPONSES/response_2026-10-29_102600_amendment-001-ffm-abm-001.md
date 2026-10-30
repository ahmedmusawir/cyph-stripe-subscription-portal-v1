✅ AMENDMENT_001 COMPLETE — FFM-ABM-001-SUBSCRIPTION-PORTAL (R-011) · owner-only registration, ready for independent QA

Registration is now owner-only. The "Your role" dropdown is gone, and the owner step has a required, initially unchecked declaration. Both the screen and the mock service enforce it. The repair work you committed as `0d43a4c` is intact. **This is not QA certification.**

Engineering results:
- build 0, typecheck 0
- Jest 12 suites, 156/156
- Playwright 131/131
- Gate M 220 measurements, 0 failures
- Contrast: 0 failures

First, as asked: the scratch copies are deleted (`r001`, `run-r008`, `buildcopy`, about 2.9 GB; I checked no process was using them).

**1. Identity**
- Branch `qa/ffm-abm-001-subscription-portal`, base HEAD `0d43a4c343909467487b327e654e0650b21c9336` (your REPAIR_001 commit).
- The amendment is uncommitted on top of it.
- Cody's QAM records are untouched, and no QA process was running.

**2. What changed** (product code: 16 files changed, +186/−61, plus 2 new test files)

| Item | Result |
|---|---|
| Role dropdown | Removed from the owner step, the types, validation and the review screen. A leftover job title is now dropped and has no effect. |
| Owner declaration | Required checkbox with the exact wording, initially unchecked. It has an accessible label, an inline error ("Confirm that you are the pharmacy owner to continue.") and a link in the error summary. It is separate from the terms and payment agreements. Its help text says this is a self-declaration and that email and payment don't prove ownership. |
| Mock service | The declaration must be exactly `true`. Without it the draft stays on the owner step, links past it are refused, and the mock checkout is refused. |
| Older drafts | Drafts saved before this change keep their details, but the declaration stays **unticked** and any held price is dropped. |
| Demo scenarios | Seeded scenarios are pre-accepted only through the synthetic demo fixture, which is labelled as such. A fresh signup always starts unticked. |
| Me / Someone else | Kept. The copy now says the registering owner keeps account ownership and billing. "Me" means the owner also manages the store. "Someone else" appoints a store admin and doesn't transfer ownership, billing or permission to buy more stores. One admin per store. |
| Ownership transfer | Clarified: no self-service transfer. Support details are explicit placeholders (`[SUPPORT EMAIL]`, `[OWNERSHIP TRANSFER PROCESS TBD]`). The duplicate-pharmacy text no longer promises "we'll verify ownership". |
| Unchanged | Database, RLS, roles, live auth, Stripe, Mission Control, OwedBook, the real admin/superadmin sign-in gate, pharmacy-software choices, and all REPAIR_001 logic. The real admin is not relabelled as an Owner. Registration, payment, provisioning and access-link delivery are still simulated, and no email verification was added or claimed. |

**3. Records**
- **RULINGS R-011** records Coach's decision and your authorization, quoting the dispatch, including the statement that email and payment don't prove ownership.
- **Contracts updated:**
  - ACCEPTANCE_SPEC v1.2: AC-06 reworded, new **AC-06a** "Owner declaration"
  - DATA_CONTRACT v1.3
  - portal-contract v1.2
  - UI_SPEC owner-step wording
- **Engineering records:** acceptance ledger (AC-06a marked "pending independent QA") and QA engineering handoff §9.
- **History:** the received design copies are preserved, and a stale-wording check found nothing out of date in the active documents.

**4. Verification** (owned isolated build on :3104, identical to the working tree)
- **Missing declaration** blocks the owner step and the mock checkout at three levels: service, component and browser.
- **Back and reload** both keep an accepted declaration, and terms/payment consent stays unticked.
- **Older drafts** were tested in the browser with a stored draft rewritten to the old format: it lands back on the owner step, unticked, with names kept.
- **Job title:** no role control remains anywhere.
- **Me / Someone else:** the owner stays the recipient of the access email while the nominated admin gets the store invitation.
- **Keyboard, mobile and themes:** the declaration can be reached with Tab and ticked with Space at 375 and 1440 px, in light and dark. Screenshots of the error state are in the package.
- **REPAIR_001 regressions** all still pass on the combined build:
  - contrast in both themes
  - load-error Retry
  - Stripe route query variants
  - more than 20 stores
  - mobile layout
  - refreshing state
  - keyboard-only add store
  - zoom emulation
  - auth-confirm links

**Limitations:**
- These are engineering self-checks only. Independent QA should cover AC-06a and also retest REPAIR_001 on the combined candidate; nobody independently retested `0d43a4c`.
- The declaration panel has no approved design render; it follows the existing consent-checkbox pattern, so a design decision is advised.
- Inherited gaps are unchanged: real browser zoom, assistive technology and Safari remain unverified.

**5. Account and processes**
- 1 real sign-in (credentials kept in memory), 0 logouts.
- Privacy scan: 0 hits (planted control 4, clean control 0).
- :3104 (my server, scratchpad `r002`) is **running** for your walk. I'll stop it and delete `r002` on request.
- PID 40320 is untouched. No Git changes, no deployment.

**6. What you need to do:** review and commit. Suggested scope:
```
git add src e2e CHANGELOG.md RECOVERY.md \
  agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/{RULINGS.md,STATE.md,JOURNAL.md,ACCEPTANCE_SPEC.md,ACCEPTANCE_LEDGER.md,_project/DATA_CONTRACT.md,_project/UI_SPEC.md,_project/portal-contract.ts,QAM/HANDOFFS/ENGINEERING_HANDOFF.md,EVIDENCE/AMENDMENT_001_ENGINEERING_REPORT.md,EVIDENCE/AMENDMENT_001,EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_AMENDMENT_001_REVIEW.zip} \
  agent_docs/SESSIONS/session_2026-10-29.md agent_docs/RESPONSES/response_2026-10-29_102600_amendment-001-ffm-abm-001.md
```
Cody's QAM records are yours to handle as you choose. Then independent QA runs on the combined candidate and JARVIS adjudicates. I've stopped here.

| Deliverable | Path |
|---|---|
| **Amendment review ZIP** (43 members, 525,860 bytes) | `/home/moose/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_AMENDMENT_001_REVIEW.zip` (identical canonical copy in module `EVIDENCE/`) |
| ZIP SHA-256 | `d98fe4ce9378f234b813246135bb10f8f799c1afcea731bc80b80754affb4088` |
| Engineering report | `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/EVIDENCE/AMENDMENT_001_ENGINEERING_REPORT.md` |
| Diffs, logs, data, screenshots | `…_ffm_abm/EVIDENCE/AMENDMENT_001/` |
| Ruling | `…_ffm_abm/RULINGS.md` R-011 |
| Response file (this report) | `agent_docs/RESPONSES/response_2026-10-29_102600_amendment-001-ffm-abm-001.md` (outside the ZIP; carries the receipt) |
| Session file | `agent_docs/SESSIONS/session_2026-10-29.md` |
| Recovery | `RECOVERY.md` |
