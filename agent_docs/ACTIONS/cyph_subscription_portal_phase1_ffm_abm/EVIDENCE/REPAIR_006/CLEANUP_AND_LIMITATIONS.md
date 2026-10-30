# REPAIR_006: cleanup and limitations

## Cleanup
- **Owned server:** `next start -p 3109`, started three times (baseline for Cody's probes, baseline for the new spec, repaired); each stopped by PID after its cwd was verified as the scratch `r010/app`. Port 3109 free.
- **Deleted from scratch:** the app copy (with its `.env.local` of three `NEXT_PUBLIC_*` values), the pre-repair snapshot, the extracted QA input, the raw outputs after copying into this folder.
- **Auth:** 0 real sign-ins, 0 logouts, no saved auth state. The account project was not run.
- **Not touched:** `:3000`, `:3457`, `codex`, the repo `.next`, Cody's QAM records (records diff touches only §9 of the engineering handoff), the earlier ZIPs.
- **No Git actions.**

## Limitations
- The "Payment confirmed / can't show setup or access-email status" notice has no approved design render.
- R5-O03 is unchanged by design (Lead disposition): Cody's oracle still reports 1 failure for it.
- The access-link page doesn't depend on payment (see `INSPECTED_PATHS.md`); reported, not changed.
- Paid-with-conflicting-activation states are constructed by overriding the stored activation; normal current flows don't produce them (Cody's note as well).
- The account project, Safari and assistive technology were not run.
