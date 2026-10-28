# Retrospective
Status: NOT EXECUTED. Engineer appends build lessons after E2; QA Lead/Architect later add measured process outcomes.
Record what worked, what failed, actual preparation/build/Q1/review/Q2/repair/cleanup durations, interventions, helper fixes, product fixes, carried limitations and next-module improvements. Separate structural lessons from portal-specific choices. No prefilled success story.

## E2 — Engineer notes (27 Oct 2026; factual, not a success claim)
- Duration: E1 ~1 h; R-008 fix ~15 min; R-009 reconciliation + E2 ~1.5 h of wall clock in one session. Director touches during E2: one dispatch, `.env.qa.local` supplied mid-build.
- What worked: pure engines with literal-cents tests before any UI caught nothing late; Gate M as assertions (not screenshots) found five real defects screenshots would likely have missed (5px overflow, 33px brand target, consent race).
- What failed first: route-boundary test assumed RSC requests return 307 (Next 16 adds an `_rsc` hop); text locators matched hidden `<option>`s; Playwright wipes `test-results/` per run, losing a sign-in tally and a measurement log (moved to append-per-measurement + Engineer tally).
- Structural lesson: an access-model change (R-009) late in E1→E2 touched 15 active documents; keeping one route table (IMPLEMENTATION_CONTRACT §2) as the source made the reconciliation mechanical.
- Carried: lint not configured; audit advisories; global-scope logout; per-state contrast and AT walk for QA.
