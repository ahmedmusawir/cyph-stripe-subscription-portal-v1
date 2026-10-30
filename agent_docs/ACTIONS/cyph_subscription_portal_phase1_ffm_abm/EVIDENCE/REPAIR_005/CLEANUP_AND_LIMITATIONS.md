# REPAIR_005: cleanup and limitations

## Cleanup
- **Owned server:** `next start -p 3109` was started three times (baseline for Cody's probes, baseline again for the new spec, repaired). Each was stopped by PID after its cwd was verified as the scratch `r009/app`. Port 3109 is free.
- **Deleted from scratch:** the app copy (with its `.env.local` of three `NEXT_PUBLIC_*` values), the pre-repair snapshot, the extracted QA input and the raw outputs, after copying into this folder.
- **Auth:** 0 real sign-ins, 0 logouts, no saved auth state. The account project was not run.
- **Not touched:** `:3000`, `:3457`, `codex`, the repo `.next`, Cody's QAM records (the records diff touches only §9 of the engineering handoff), his `/tmp` paths, the earlier ZIPs.
- **No Git actions.**

## Limitations
- The two new C06 notices have no approved design render.
- Stored conflicting flags are retained, not rewritten. A record such as `unknown` + `failed` stays that way until the customer resolves it on C14; the retained flag is never shown as a failure.
- The matrix constructs its 32 states by overriding the activation flag on real engine states. It covers the combinations old builds could leave behind, but it is not a proof over every field.
- Cody's `legacy-transitions.spec.ts` covered-admin cases fail before and after on his superseded expectation; his corrected file passes.
- The account project, Safari and assistive technology were not run.
