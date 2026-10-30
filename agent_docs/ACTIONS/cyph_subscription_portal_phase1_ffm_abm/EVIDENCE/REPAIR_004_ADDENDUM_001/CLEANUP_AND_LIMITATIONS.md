# REPAIR_004 ADDENDUM_001: cleanup and limitations

## Cleanup
- **Owned server:** `next start -p 3109` was started three times: baseline, repaired, then a rebuilt baseline for the corrected spec, and the repaired build was restored for the regression. Each time it was stopped by PID after its cwd was verified as the scratch `r008/app`. Port 3109 is free.
- **Deleted from scratch:**
  - the app copy (808 MB). Its `.env.local` held only the three `NEXT_PUBLIC_*` values and was deleted with it.
  - the pre-addendum snapshot (116 MB)
  - the raw output, after copying into this folder
- **Session scratchpad:** the session's scratchpad directory was withdrawn mid-task. I used it only to copy my own results out and then deleted my scratch directory in it. Packaging ran from the repo evidence folder; no staging directory was used.
- **Auth:** 0 real sign-ins, 0 logouts, no saved auth state. The account project was not run.
- **Not touched:**
  - `:3000` (PID 970525) and `:3457` (PID 40320) are still listening.
  - `codex` (PID 745259) is still running.
  - the repo `.next`; Cody's QAM records (the records diff shows only §9 of the engineering handoff); the REPAIR_004 package and earlier ZIPs.
- **No Git actions.**

## Limitations
See report §6.
