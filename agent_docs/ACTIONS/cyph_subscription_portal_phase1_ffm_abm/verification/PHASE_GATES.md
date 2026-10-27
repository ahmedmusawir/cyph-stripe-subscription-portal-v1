# Phase and mobile gates
| Gate | Evidence / owner | Human stop? |
|---|---|---|
| Design | Received v1.0 + Tony approval in RULINGS | Already satisfied; do not request again |
| E1 | Verified repo + complete plan / Engineer; Architect review and Director release | Yes, once before product changes |
| Internal types/services/fixtures | Type safety and meaningful invariants / Engineer | No routine pause |
| Gate M | Mobile/menu/table/form controls and no overflow at declared widths/themes / Engineer | Fix before continuing affected layout, no approval ceremony |
| E2 | Build/tests, actual browser walk, no-break diff and complete QAM handoff | Engineering return |
| Q1 | Independent readiness/recon/plan + indexed ZIP / Cody | QA Lead review |
| Q2 release | Bound Lead-approved plan + Director release | Explicit authority required |
| Q2 | Approved independent campaign and result ZIP / Cody | QA Lead adjudication |
| Repair | Only if findings; Architect bounded handoff → Engineer → Director candidate → independent retest | As ruled, no automatic extra campaign |
| Closeout | Lead verdict + required cleanup; Architect post-FFM review; Tony ride and integration | Attributable decisions |
| Gate D | Deployment verification | Excluded/deferred; no deployed claims |

Gate M is required during every UI-bearing build task: 375/768/1440, both themes; check relevant breakpoint edges; mobile Sheet is reachable, focus-managed and keyboard operable. No vanished desktop-only controls, clipping or horizontal scroll; required target sizes hold. Refuse “mobile later”. QA independently verifies the final implementation. A failed required gate cannot become green through a scope rewrite by the Engineer.
