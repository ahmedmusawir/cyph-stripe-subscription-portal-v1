# QAM preflight
Target: local app from `/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1`; intended QA branch `qa/ffm-abm-001-subscription-portal`. No deployment target.

| Check / permitted method | Expected result | Resolution owner |
|---|---|---|
| Read-only Git status/branch/full HEAD/log/merge-base/diff; verify files exist before grepping | Bound candidate descended from foundation; all changed paths explained; QA writes only in declared lane | Director for Git; Engineer for manifest facts |
| Read contract/design/rulings/manifest/handoff; verify FILE_INDEX hashes of frozen initial package separately from later mutable records | Complete inputs; no self-certified QA | Architect / Engineer |
| Inspect installed Node/npm/package scripts/lock, browser driver; npm ci and local build allowed | Exact current versions; usable compiler/tests/browser | Executor; dependency changes need ruling |
| Choose unused local port 3001 or recorded alternative; start owned server only | Required routes ready, not merely an HTTP response | Executor |
| Inspect config precedence in code and resolved project host without printing credentials | Shared Cyber Pharma dev auth target; no guessed production or demo project | Director confirms unresolved identity |
| Verify role lookup/gate and permitted identity availability | One existing admin identity (R-009) or explicit blocked check; member/role-less denial is covered by mocked-role automated tests, labelled as mocked; no second real account is required | Director supplies/authorizes; no new users |
| Credential file if automated: `.env.qa.local`, `QA_PORTAL_ADMIN_EMAIL` / `QA_PORTAL_ADMIN_PASSWORD` (one pair only) | Ignored AND untracked; valid schema checked without values; consumed only by local test helper | Director credentials; Engineer preapproved ignore rule |
| Check exposure concern from cleanup | Rotated credential or different authorized test identity; never recover values from history | Director |
| Bounded login/logout and direct-route probe | Real gate works sufficiently to run QA; record side effects/sign-in count | Executor within allowed target |
| Validate privacy scanner with synthetic leak and clean controls; use in-memory browser sessions | No real secrets in retained evidence; scanner doesn't just match empty/missing files | Executor |
| Check evidence/export lane and available space | Safe indexed Q1 ZIP can be produced | Executor |

Q1 may install from existing lock, build, start/stop owned local servers, inspect mocked service behavior for planning and run the bounded auth/navigation probes above. It must not run the entire Q2 test matrix, repair product code, change dependencies, mutate business data or create accounts.

Credentials are never part of app build/server environment, NEXT_PUBLIC variables, shell arguments or logs. If tool policy requires manual entry, use that supported flow. Known missing access is a named blocker for dependent checks; complete other safe recon and return one package. Do not fabricate a successful auth walk from route-source inspection.

STOP-IDENTITY: wrong branch/candidate/drift. STOP-CONTRACT: conflicting requirement. STOP-ENV: missing/wrong target or instrument. STOP-AUTH: missing permitted identity. STOP-PRIVACY: unsafe evidence. Each stop records time, phase, candidate, evidence, affected work, owner, exact needed resolution and resume point.
