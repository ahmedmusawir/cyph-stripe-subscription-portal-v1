# REPAIR_003 — before / after (R-013)
Before = `d6fe678` + addenda 1/2, product unchanged. After = this repair. The same instruments were run on both.

| Instrument | Before | After |
|---|---|---|
| Cody `repair-boundaries.test.ts` (service, 23 tests) | 18 passed / 5 failed: closed-key reuse accepted; processing/unknown × count/pharmacy edit confirmed the edited 2-store/renamed draft under the original 1-store $99 key | **23/23**; old key refused, new key accepted; all four edit cases `resultOK: false`, payment still pending/unknown, original key kept |
| Cody `submitted-corrected.spec.ts` (browser, 2) | 2 failed: confirmation enabled → `paid`/`confirmed` with "Changed after submission" | **2/2**: confirmation disabled, `pending`/`unknown` |
| Engineering R-013 Jest blocks (22) | 20 failed / 2 passed (unchanged-behaviour guards) | **22/22** |
| `e2e/public.repair003.spec.ts` (7) | 6 failed (no scope recorded); same-page key test passed (the old service accepted reused keys) | **7/7** |

Raw outputs: `before/` and `after/` (logs, JSON, JSONL), `screenshots/cody-browser-{before,after}-*.png`.
Cody's files were run as copies in scratch with only the output paths (and port) changed; `diff` output in the run log confirmed that.
