# QA Lead decision 001 — Subscription Portal Q1

**Date:** 28 October 2026 · Asia/Dhaka  
**Module:** FFM-ABM-001-SUBSCRIPTION-PORTAL  
**Director:** Tony · **Architect:** Astra · **Engineer:** Claudy · **QA Executor:** Cody · **QA Lead:** JARVIS

## Decision

**HOLD — complete one bounded Q1 readiness/plan correction pass and return for Lead review. Q2 is NOT approved or released. No Gate Q product verdict is issued.**

The plan has a useful risk order, maps all 30 ACs, preserves R-008/R-009, and correctly separates mock business operations from real authentication. The hold concerns unresolved real-admin readiness, an unsuitable isolated build setup, and insufficiently concrete instruments/coverage evidence. It is not a finding that the product has failed acceptance.

This is amendment and readiness work within the Q1 review checkpoint. Preserve the completed Q1 work; do not restart recon or run the full Q2 matrix. The next return is one consolidated package. The Lead will review the finalized plan hash and readiness evidence before approval; Tony's Q2 release follows separately.

## Bound identities and review limits

| Item | Identity |
|---|---|
| Repository on Tony's VM | `/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1` |
| QA branch | `qa/ffm-abm-001-subscription-portal` |
| Required product candidate | `94251beab08dd26d7f56f4b8f2299a1e841892c5` |
| Foundation | `1d15918dc20d80476d6a3cb017b10179f3ddf783` |
| Module home | `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/` |
| Reviewed archive | `FFM-ABM-001-SUBSCRIPTION-PORTAL_Q1_REVIEW_001(1).zip` |
| Archive SHA-256 | `1bf8f43518813405b2ca78cc0c0100f67ae10adf4ac4bfcf1673e47f71d9432f` |
| Reviewed draft plan SHA-256 | `42ebdbc6ac88ddf6733416aaa0374be1cc852400a6f1679ca631891ef7ddc24d` — **not approved** |

The Lead independently checked archive integrity, unique safe paths, exact index membership, and all **31 indexed file sizes/hashes** (32 files including the index). The included QA, QAM and RRM playbooks match the available project-source copies byte for byte. Contract, rulings, plan, recon, findings, engineering report, build logs and supporting records were reviewed.

The Lead has not accessed Tony's VM or independently executed the application. Candidate/branch/process observations are Cody's supplied evidence. Hash validation proves the reviewed bytes, not product correctness or an independent reproduction of Cody's 800 manifest comparisons. Those comparisons report 367 original-index matches, 24 changed records, and 409 installed-manifest matches; R-007 already explains the distinction between original and installed records.

Current subject authority is ACCEPTANCE_SPEC v1.1, APP_BRIEF/DATA_CONTRACT v1.2, IMPLEMENTATION_CONTRACT v1.1 and R-001–R-009. The older versions named in the acceptance specification's introductory “Basis” line do not override its explicit v1.1 amendment or R-009. Preserve frozen history; use the current subject versions in the plan.

## Findings disposition

| Record | Lead disposition |
|---|---|
| STOP-AUTH | **Readiness blocker.** The single bounded attempt did not reach the dashboard within 20 seconds. Cause is undetermined. Neither bad credentials nor a product auth defect is established. Resolve with safe diagnostics before approving protected-browser execution. |
| Q1-ENV-001 | **Confirmed QA process/environment incident.** Cody reports an accidental repo-root build that replaced `.next` while an unowned server was listening. Source damage or a user-visible outage is not established. Preserve the incident and assess safely; no unsolicited restart or rollback. |
| Q1-ENV-002 | **QA setup problem.** The scratch build's external `node_modules` symlink was rejected by default Turbopack. Webpack completed but reported 27 files omitted from standalone tracing. This fallback does not establish the intended isolated default-build readiness. |
| Q1-GAP-001 | Resolve actual configured shared-dev target and whether the authorized credential is rotated or a different identity from the historical exposed credential. Prior authorization remains valid; do not demand new accounts or retrieve historical secrets. |
| Q1-GAP-002 | Final dashboard, contrast, zoom and egress remain Q2 work. Establish the instruments and coverage plan in Q1; do not claim acceptance from readiness probes. |
| Q1-OBS-001 | Keep “Advance 31 minutes appears inert” as Director-reported usability observation. Test clock effect, stale-quote rejection and visible feedback separately; no product repair or new requirement is authorized by this report. |
| Q1-RISK-001 | Inherited global logout is an acknowledged side effect of the already-authorized auth check. Schedule one deliberate logout last; prevent existing test-project hooks from causing additional global logouts. |

## Consolidated correction instructions to Cody

### A01 — Establish a safe isolated target and document the incident

1. Preserve Q1 attempt 001 and all three build logs. Recheck candidate/branch and complete tracked/untracked status. Explain each new path. Record product/protected-path comparisons with commands, CWD, exits and safe output; the current `protected-diff.txt` lists paths but contains no command/exit record. Include deployment stubs in the protected comparison and distinguish permitted auth changes from protected auth files.
2. Record current process ownership, CWD, listening ports and build-output locations without exporting process environments or sensitive arguments. Perform only bounded unauthenticated health/static-resource checks on affected existing servers if safely accessible. Do not log into them, stop them, rebuild in their directories, or claim that listening proves continuity. Without pre-incident evidence, historical continuity remains unknown even if current checks pass.
3. Create a new owned scratch copy from the exact committed candidate, excluding old build/cache/auth outputs. Resolve dependencies physically inside it using the existing lock (`npm ci` in scratch is already permitted), or a verified independent local copy. Do not use a dependency directory symlink pointing outside the build root. Do not change product configuration to accommodate the QA setup.
4. Add a fail-closed command wrapper: explicit absolute scratch CWD, assertion that it differs from the repository root, candidate-byte comparison, and verification that dependency/output paths cannot write through into the live repo. Run the unchanged default `npm run build` there, start only its owned server on an actually free port, and record build/server identities. Keep QA passwords out of build/server environment. Preserve required app configuration securely without exporting `.env` contents.
5. The correction pass may prove build readiness and perform bounded route probes. Full tests stay in Q2. A successful QA-controlled clean build may be reused in Q2 if unchanged candidate/configuration/dependencies and provenance remain demonstrable; no ceremonial rebuild is required.

**Exit evidence:** isolated default-build success and usable owned target, or a precise remaining setup stop; source identity and incident status recorded. Restoring an unrelated server remains Tony's operational decision and need not block a demonstrably isolated QA target.

### A02 — Diagnose the real-admin readiness failure

1. Resolve the configured project against existing authorized records, not host shape alone. Inspect configuration precedence and any site-URL/secure-cookie implications. Use a sanitized project identifier; disclose no keys. Reuse attributable prior target/credential confirmation if it answers the question. If rotation/different-identity status or actual target remains unknown, return the precise question for Tony together with all other completed corrections; do not invent an answer or rotate credentials.
2. Inspect the Q1 probe/helper and actual login form before retrying. Verify the selected fields, submit action, navigation expectation, isolated server and browser origin. Obtain useful allowlisted diagnostics: local login HTTP status, sanitized error category, resulting pathname, session-present boolean and authorized-role result where available. Redact at collection. Do not retain request bodies, auth headers, cookies, password values or raw authenticated logs. “Raw error suppressed” alone is not a diagnosis.
3. Once the target/identity prerequisite is resolved, make a bounded, instrumented login attempt on the owned target. Additional attempts require a specific diagnosed setup/helper correction and an attempt record, not blind retries. Separate authentication rejection, role denial, cookie/redirect behavior, unavailable service and helper timeout.
4. A successful real-admin dashboard observation and reload establish readiness only. Close the in-memory browser afterward. Do not globally log out in this correction pass. If an application defect is reproduced, capture the evidence and return it to the Lead for Astra's bounded engineering route; do not repair product code.

**Exit evidence:** explained successful readiness with sign-in count, or an actionable STOP-AUTH with exact failing stage, owner and safe resume point. Mocked auth cannot substitute for this real-admin prerequisite.

### A03 — Make the plan executable and freeze the coverage matrix

Keep T01–T30 and the useful independent expected prices. Add concrete setup/run commands, helper paths, CWD, prerequisites, inputs and evidence destinations for each test group. Identify the required existing Jest/browser suites and how they will be independently executed or faithfully covered without running unsafe default auth-state, screenshot, trace or logout hooks. Avoid unqualified “relevant tests” or blind `npx playwright test` with inherited settings.

Populate the route/state/persona/theme/width matrix now, including entry actions, intended assertions and any shared-layout reductions. The current AC table only maps AC-01 to T01, etc.; the prose promises to enumerate detailed state coverage later. Use actual registry values plus normal workflows and all C01–C17 mapped states. Include both account modes of `/demo/stripe`, conflicting/repeated mode parameters, safe return destinations, HTML/RSC negatives with positive controls, and final committed dashboard pills. Follow R-004's corrected design counts: **87 screen/reference states and 244 PNGs**, not the old 92/245 claim; behavior coverage is what matters.

Make registration 1/2/3 and add-store 1→2/2→3 cases explicit, including concurrent/same-key replay, unknown versus definitive failure, and paid-attention recovery with unchanged operation/store identity. Preserve controlled-role tests as mocked evidence. Target member/role-less denial at each required layer without acquiring additional real accounts or mutating roles.

### A04 — Specify server-side evidence and permitted traffic

Replace T25's open-ended “server egress where instrumented” with a named, feasible method and its limits. Review the final diff/import/call paths and observe representative actual QA-server runtime requests, together with browser destinations. The method must identify which server process/children it covers and must be validated with a safe synthetic loopback control; a browser capture or a helper that misses the actual server is insufficient. Keep instrumentation in the QA lane and avoid machine-wide monitoring or persistent system changes.

Allow existing authorized auth/session requests **and read-only `user_roles` lookup on the configured shared-dev project**. Distinguish these from forbidden business-data/schema/role writes. Separate dependency installation or inherited build-time resource retrieval from application business runtime; record actual destinations/purposes rather than treating every nonlocal build request as billing activity. No live Stripe/email/provisioning probe is authorized. If a suitable method is unavailable, record the exact evidence gap for Lead disposition before claiming AC-25 passes.

### A05 — Prove the zoom instrument and define accessibility grading

Demonstrate real browser UI zoom at 200% on a harmless page in an owned context, with browser-setting evidence and corroborating viewport measurements. Neither CSS zoom/transform, device scale nor halving viewport width is equivalent. If the environment cannot operate browser UI zoom, explicitly allocate a small human-assisted 200% check with exact pages, actions and evidence to Tony during Q2; mark it pending and retain the acceptance requirement. Do not fabricate automation capability.

Keep keyboard-only core journeys, focus/error-summary and Sheet/Escape/return tests, and actual-surface contrast in both themes. State how rendered colors, transparency and applicable text/control states are measured. Grade disabled controls and inline links against the frozen contract with explicit applicability notes; do not invent blanket thresholds or silently import engineering exemptions. No new full assistive-technology or real-device Safari campaign is required by this decision.

### A06 — Return reproducible readiness and complete review inputs

Include the actual Q1 auth/build/privacy helpers or their exact safe commands, plus command/CWD/exit records and bounded sanitized diagnostics. The current `privacy.json` is four summary assertions; supply scanner/control provenance, synthetic leak and clean-control results, scanned-path/count inventory, value-scan timing and expanded-archive coverage. Exclude the real values and their hashes. Synthetic test secrets must be clearly identifiable as fixtures.

Add these three small missing module inputs to the revised review ZIP: `QAM/QAM_ENTRY.md`, `ACCEPTANCE_LEDGER.md`, and `EVIDENCE/E2_STALE_INSTRUCTION_CHECK.md`. Include the populated coverage matrix, amended plan and exact plan diff, updated recon/findings/state, this decision verbatim, and supporting readiness evidence. Do not resend the entire design archive or nest the previous ZIP. Keep attempt 001 intact on disk and reference its archive hash.

### A07 — Preserve approval, effects and closeout boundaries

Keep the product candidate pinned. A later documentation-only commit must be demonstrated from its complete diff and separately identified as execution HEAD; product/config/test changes return for Lead review. Only declared QA records/helpers/transient setup are writable in this pass; no product edits, Git mutations, account changes or deployment.

Q2's final logout remains an explicitly identified single global logout, with Tony informed through the release instructions; it can revoke his other sessions. Ensure test-project setup/teardown cannot perform it earlier. Session refresh must be exercised and labelled honestly; a page reload alone is not proof that token refresh occurred.

AC-30 stays pending Director/Architect judgment after the tested-product verdict. Do not let T30 delay export of Q2 evidence while waiting for a verdict that depends on that export. Final retention/credential cleanup and Architect closeout retain their separate ownership.

## Required return and approval gate

Return one new indexed package:

`QAM/HANDOFFS/FFM-ABM-001-SUBSCRIPTION-PORTAL_Q1_AMENDMENT_REVIEW_002.zip`

Also provide a byte-identical copy at:

`/home/moose/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_Q1_AMENDMENT_REVIEW_002.zip`

Its start-here record must list the candidate, execution HEAD, amended-plan SHA-256, disposition of A01–A07, remaining blockers/questions, archive member count/hash and exact decision requested. Revalidate membership, sizes, hashes, archive integrity and privacy. Final state remains **AWAITING_LEAD / Q2 NOT RELEASED**.

The Lead will approve or hold the exact revised plan after reviewing this return. An amendment hash supplied by Cody is not itself approval. Once approved, Tony releases Q2 under the existing Git policy.

No new owner role, removal of the job-title field, vendor support integration, dependency upgrade, production authorization, live billing, deployment or additional real account is part of this correction pass. R-006's disclosed upstream-provenance limitation is accepted for this local review; do not create another doctrine-sync task.

**QA Lead: JARVIS — HOLD, bounded Q1 corrections required.**
