# Cyber Pharma subscription portal — Gate Q decision

Date: 30 October 2026, Asia/Dhaka  
Module: FFM-ABM-001-SUBSCRIPTION-PORTAL  
Decision owner: JARVIS / QA Lead  
Decision: **PASS for the identified tested snapshot, with the retained nonblocking observation below. Commit binding and integration remain pending.**

## Certified scope and exact identity

This decision accepts the module's approved FFM/mock subscription-portal behavior under the current acceptance contract and recorded rulings, including the owner-declaration amendment and repairs through REPAIR_006. It does not certify live payments, production provisioning/email, deployed operation or the full Cyber Pharma application.

Repository: `/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1`  
Branch: `qa/ffm-abm-001-subscription-portal`  
Base HEAD: `d6fe67839961fcbbf801b0bb04d3a2522e7b1f36`

The base HEAD alone is NOT the accepted candidate. The Director authorized QA of an immutable uncommitted snapshot containing the accumulated repairs/addenda.

Accepted 168-input manifest SHA-256:
`f7181d3c7c537e27ebc43403c8727a39084aae723ba895cb89acf7622d56e9ab`

Finalized QA plan SHA-256:
`9017fa6d39d86091da0a7ef7efac791be33eea4af816d568f1a5f28f6df4d987`

Reviewed results archive:
`FFM-ABM-001-SUBSCRIPTION-PORTAL_REPAIR_006_RETEST_001_REVIEW.zip`

Archive SHA-256:
`6b45c7ae8cdd65495d49a5ec312429d6f5240d9de8e08d2ad0838d24aaf45f08`

172 members including FILE_INDEX.json; all 171 indexed members, sizes, SHA-256 hashes, member-set correspondence and archive integrity verified by the Lead. Manifest and finalized plan hashes independently recomputed and matched during review.

## Findings and evidence accepted

- R5-F01: CLOSED by independent verification. Paid/terminal rendering and readers follow authoritative phase. Missing/conflicting activation does not invent setup/email completion, offer another payment or substitute an edited draft amount. Current nothing-charged recovery presents the correct terminal notice and fresh-key recovery.
- R5-F02: CLOSED by independent verification. Invalid resend calls refuse without state mutation; valid paid/setup-ready resend remains functional. Independent reader/writer agreement and neighboring cases pass.
- Prior required repairs remain accepted through the recorded independent returns and current diff-based evidence applicability. This includes declaration, scope/price binding, legacy migration, spent keys, submitted-payment protection, stale recovery, bounded allocation, route boundaries and affected presentation. Retained evidence keeps its original candidate/provenance; it is not described as freshly rerun.
- R5-O03: ACCEPTED NONBLOCKING, NOT REPAIRED. The original strict assertion remains failed: repeat refresh after completed setup returns success/new identity. Five additional repetitions leave deep financial, checkout, setup, email and timestamp data unchanged. This is not an unresolved release blocker or a repaired PASS.
- C08 access-link reference: outside this repair scope under the recorded Lead disposition. It is inert demo/reference behavior; no protected-authentication bypass was established. No live-auth certification is inferred.

Current independent execution: clean build and product typecheck pass; 248 Jest tests pass; 27 browser cases pass; 85 consistency cases pass; eight actual browser 200% zoom samples pass sampled geometry/keyboard checks, with no sampled contrast shortfalls. The accepted strict no-op failure remains visible, so this decision does not claim every assertion is green.

The Lead accepts the documented reuse argument: AST/function and input comparison limits changed engine logic to consistentActivation, readActivation and resendAccessEmail, plus the changed activation reader, exports and tests. Passing prior transition/legacy/scope/key/cardinality/account/auth evidence remains applicable within its recorded limits.

## Acceptance, cleanup and limitations

Tony's previously reported manual walkthrough acceptance, including login/logout and the copy/demo-control improvements, remains attributed and recorded. No duplicate full walkthrough is required by this decision. Later repairs were independently verified; this is not a claim Tony personally tested every later byte.

QA-owned server/browser/auth hygiene is accepted on the reported evidence: owned port 3116 server stopped; anonymous profile, public-only environment file and browser output removed; unrelated servers preserved; zero real sign-ins/logouts or runtime credentials in this run. Sanitized evidence/privacy controls are retained. An inactive frozen source/dependency/build copy remains in `/tmp` for review, excluded from export; authorized owner may remove it after durable evidence/commit comparison no longer needs it. Preserve manifest, cumulative diff, helper, results and failed historical attempts.

No full Safari or assistive-technology audit, universal accessibility certification, fresh real-admin run in REPAIR_006, live business integration, production readiness or Gate D is claimed. Coach confirmations remain pending, without invented answers. Architect must preserve their exact known status and assess any actual answer that changes approved release behavior; unknown questions are not silently resolved.

## Architect handoff and closeout authority

Proceed with bounded documentation closeout using this exact decision and the reviewed results archive. Instruct Engineering to install this decision unchanged, reconcile current module/QAM/acceptance records with the final dispositions, retain the nonblocking observation and history, and produce one complete closeout report plus scoped Director Git instructions. No further product cleanup, refactor or feature change is authorized.

The QA Lead decision must be attributed to JARVIS; Engineering/QA may transcribe it but must not strengthen its scope. New implementation changes return for impact adjudication.

Director commit may occur after documentation closeout as requested. Before declaring any commit certified, run the retained read-only commit-input verification helper against its full SHA and verify every tested manifest path/hash and absence of extra relevant build inputs. Record the result and commit SHA in a binding receipt. Documentation-only additions are identified separately. Matching bytes bind this snapshot PASS to the commit without another test campaign. A mismatch is not an automatic PASS; assess its actual impact.

No push, merge or deployment is performed or newly authorized by this letter. Those remain with the Director and the established integration/deployment process. Gate D follows actual deployment.

**Final checkpoint: Gate Q PASS for the exact snapshot above; required repair verification complete. Architect documentation closeout, Director Git/integration, commit binding, deployment and Gate D remain separately tracked.**
