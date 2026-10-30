# REPAIR_004: cleanup and limitations

## Cleanup
- **Owned server:** `next start -p 3109` was started three times: baseline, repaired, and a rebuild of the final tree. Each time the server was stopped by PID after its cwd was verified as the scratch `r007/app`. Port 3109 is free.
- **Deleted from scratch:**
  - the app copy (807 MB). Its `.env.local` held only the three `NEXT_PUBLIC_*` values (site URL, Supabase URL, publishable key) and was deleted with it.
  - the pre-repair snapshot (116 MB)
  - the extracted QA input `qa_in`
  - the raw output directory, after copying into this folder
  - the two scratch Chrome profiles that Cody's zoom probe created (`zoom-profile`, which held its default-zoom setting). These were not packaged.
  - my contrast calculation script. The ratios it computed are quoted in the report; the measured browser values are in `data/focus-repair004.jsonl`.
- **Auth:** 0 real sign-ins, 0 logouts, no saved auth state. The account project was not run.
- **Not touched:**
  - `:3000` (PID 970525) and `:3457` (PID 40320) are still listening.
  - `codex` (PID 745259) is still running.
  - the repo `.next`; Cody's QAM records (the records diff shows only §9 of the engineering handoff); his `/tmp` paths; earlier ZIPs.
- **No Git actions.**

## Limitations
- **Design:** the unmatched stand-in state and the covered-admin rule have no approved design render.
- **Seeded records:** seed matching relies on the current seed fixtures. An older v2 seeded record whose seeded details differed would be held, not bound.
- **Legacy paid record edited after payment** (no evidence, no scope): Activation makes no admin invitation claim, but its names and amount still fall back to the draft, as before.
- **C07 store-admin tab:** it shows its sample admin when the covered scope has no nominated admin. Activation never links to it in that case.
- **Focus ring:** the adjustment was checked on alerts only; other tinted surfaces were not swept. Measured after the change: dark 3.33 / 4.86, light 4.49 / 4.02.
- **Not rerun or not checked:** the account project, Safari, assistive technology. Real zoom was checked only through Cody's 200% probe.
- **Cody's QA files** ran as adapted copies (`probes/install.sh` lists every substitution). His originals are in his package.
- **R4-N01** (Review can close a processing payment) is reproduced and not repaired. See report §6.
