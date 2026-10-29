# REPAIR_002 cleanup report (29 Oct 2026, Claudy)
| Resource | Owner | Disposition |
|---|---|---|
| `next start -p 3105` (baseline 24cf075, cwd `scratchpad/r003/base`, PID 920921) | Engineer | stopped after cwd verification |
| `next start -p 3106` (repaired build, cwd `scratchpad/r003/app`, PID 930376; earlier PID 925255 replaced on rebuild) | Engineer | stopped after cwd verification |
| `scratchpad/r003/base`, `scratchpad/r003/app` (git archive + physical `node_modules` + `.env.local` with 3 public keys only) | Engineer | deleted (≈1.4 GB), no process using them |
| `scratchpad/r003/{before,logs,data,shots,tools}` | Engineer | kept (source of this package; no credentials) |
| Repo `test-results/` (incl. failure error-context snapshots of public pages) | Engineer | removed after every run; none present |
| Saved auth state | — | none created (in-memory fixture); no `.auth/` |
| Real sign-ins / logouts | — | 1 / 0 |
| Jest worker OOM on baseline (attempt 1) | Engineer | process exited by itself (heap limit); no residual process (`pgrep` checked) |
| `next-server` :3000 PID 916513 (cwd repo root, started 12:31) | not Engineer | untouched; repo `.next` not rebuilt |
| `next-server` :3457 PID 40320 | not Engineer | untouched |
| Git | Director | no commit, stage, stash, reset, branch or push |
