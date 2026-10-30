# REPAIR_003 — cleanup and limitations
## Cleanup
- Owned `next start -p 3109` (scratchpad `r006/app`): started twice (baseline, then repaired); each time stopped by PID after verifying its cwd. Port free afterwards.
- Deleted: scratch app copy (802 MB, incl. its `.env.local` with the three `NEXT_PUBLIC_*` values only), baseline/after Jest copies, diff staging, extracted QA input.
- 0 real sign-ins, 0 logouts, no saved auth state (account project not run).
- Untouched: `:3000` PID 970525, `:3457` PID 40320, `codex` PID 745259, repo `.next`, Cody's QAM records and `/tmp` outputs, earlier ZIPs. No Git actions.
## Limitations
- The hold notices have no approved design render. On C14 "What we saved" still lists the edited draft; the hold below names what the payment covers.
- Loading a demo scenario starts a new synthetic state, so spent keys are not carried over; no customer path does this.
- A legacy unscoped record that was edited while processing can only go to support or a payment failure. It arises only from an old build's sessionStorage.
- "Use the details I paid for" drops post-payment edits; adding stores later is the existing account flow, not exercised here.
- Account project, assistive technology, Safari and real browser zoom were not rerun.
