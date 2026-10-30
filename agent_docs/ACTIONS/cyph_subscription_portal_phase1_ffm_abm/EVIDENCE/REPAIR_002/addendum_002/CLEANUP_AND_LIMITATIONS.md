# ADDENDUM_002 cleanup and remaining limitations (29 Oct 2026, Claudy)
| Resource | Disposition |
|---|---|
| Owned `next start -p 3108`: baseline build (cwd `scratchpad/r005/base`), then the repaired build (cwd `r005/app`, PID 961165) | Each stopped after its cwd was verified |
| `scratchpad/r005` (git archive of `d6fe678` + tree, physical `node_modules`, `.env.local` holding only the 3 public keys) | Deleted after packaging |
| Repo `test-results/` | Removed after each run |
| Real sign-ins / logouts / saved auth | 0 / 0 / none (public-only checks) |
| :3000 PID 916513, :3457 PID 40320, Cody's isolated build and records | Untouched |
| Git | No commit, stage, reset or push. ADDENDUM_001 changes preserved uncommitted. |

## Remaining limitations
- Focused verification only, as the QA Lead instructed; this is not a full suite.
- Now unused and left in place, pending approval to remove: `registrationHarness.setActivationPlan` and the `ACTIVATION_PLANS` re-export.
- The engine still honours a non-`ready` `activationPlan` restored from an older session on the next Refresh. That is coherent, but nothing in the UI selects it any more.
- Zoom was emulated through the viewport only. Assistive technology and Safari were not tested.
- Engineering evidence only; QA includes the scenario/progression check in the addendum verification.
