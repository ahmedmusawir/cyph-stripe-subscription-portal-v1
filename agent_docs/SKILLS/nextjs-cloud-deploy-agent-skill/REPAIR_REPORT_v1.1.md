# next-deploy-auto v1.1 — Repair & Validation Report (2026-10-30)

Six repairs from the JARVIS review of v1.0. No live cloud touched; every check below ran against mock `gcloud` binaries in an isolated scratch directory. Design, scope and sibling-folder layout unchanged.

## Repairs

| # | Item | Change | Where |
|---|---|---|---|
| 1 | Build identity | `gcloud builds get-default-service-account --project P --region R` resolves Actor B; a top-level `serviceAccount:` in cloudbuild.yaml takes precedence. Lookup error/empty = abort with the error printed. v3.1 "empty history → compute default" inference removed everywhere. | CLAUDE.md §4.2/§4.5, SKILL.md 1.3/3.1, TEMPLATES.md T4, CONFIG_SCHEMA derived table, ANTI_PATTERNS AP-A5, example init + checklist |
| 2 | Placeholder validation | Canonical regex `REPLACE\|CHANGE[-_]?ME\|FIXME\|TODO\|PLACEHOLDER\|INVALID://\|<[^>]+>\|XXXX\|example\.com\|your[-_]` (case-insensitive) enforced in Phase 1 and in deploy.sh, one value per line, offending values printed. | CONFIG_SCHEMA "Placeholder formats", SKILL.md 1.2, TEMPLATES.md T3, example deploy.sh |
| 3 | Helper output | Raw gcloud stderr never printed; failure line = env key, secret name, gcloud exit code, two likely causes, describe command. Summary states how many succeeded and are KEPT; "Nothing else was changed" removed. | templates/upload-secrets.sh, TEMPLATES.md T6, example helper |
| 4 | Manual mode | Helper not generated; Phase 2 script list built dynamically (`[ -f upload-secrets.sh ]`), init's hint is `{UPLOAD_HINT}` per mode, Phase 3 handoff branches. | SKILL.md Phase 2/3, TEMPLATES.md T4/T6 |
| 5 | AGENTS.md | `cp CLAUDE.md AGENTS.md`; `cmp` clean. | — |
| 6 | Upload boundary | `gcloud meta list-files-for-upload .` (effective list, honors `.gcloudignore`) checked in Phase 1, Phase 2, and inside deploy.sh before every submit; abort on `.env*`/pem/key/service-account/credentials json, or if the listing fails. File names only, never contents. | CLAUDE.md §4.9, SKILL.md 1.2/1.3/Phase 2, TEMPLATES.md T3, ANTI_PATTERNS AP-A9, example deploy.sh |

Also fixed while testing: exit-code capture in the SA-lookup failure branch (`if !` inverted `$?`).

## Validation (mock-backed, executed)

| Test | Result |
|---|---|
| `bash -n` on template helper + all example scripts; YAML parse of template, example config, example cloudbuild; template-brace grep | all clean |
| T1 bundled example `deploy.sh` run unchanged | **aborts**, lists the 3 placeholder values, 0 `builds submit` calls |
| T2a real-looking values, clean upload list | boundary clean, submit happens |
| T2b `.env.local` + `service-account.json` in effective upload list | abort, both named, 0 submits |
| T2c `list-files-for-upload` fails | abort, exit 1, 0 submits |
| T3 helper: mock gcloud fails and echoes the submitted payload in stderr | exit 1; 0 occurrences of any value in output; summary reports 0 kept / 3 failed |
| T3' helper happy path (from v1.0, re-run): 3 values byte-exact by hash, no trailing newline, 0 leaks incl. under `bash -x` | pass |
| T4 init: default SA resolved / custom default SA / explicit `serviceAccount:` in yaml | correct identity printed in each case |
| T4 init: lookup PERMISSION_DENIED / empty result | abort exit 1, error shown, zero `compute@developer` strings emitted |
| T4' init rerun (from v1.0): second run creates nothing, reports reuse, flips green once versions exist | pass |
| T5 manual mode: Phase 2 checks with no helper file | parse/grep/chmod all succeed over the 2 scripts present |
| T6 `cmp CLAUDE.md AGENTS.md` | identical |

## Not tested (requires live GCP — first supervised run)
`gcloud builds get-default-service-account` output shape on your gcloud version · `gcloud secrets create` without a payload · `versions list --filter=state:ENABLED` · the IAM `--flatten/--filter` Staging Rule check · `gcloud meta list-files-for-upload` on the real repo · Cloud Build itself. All descend from documented gcloud behavior; the ledger is open for drift.

## v1.1.1 addendum (2026-10-30) — upload boundary, two fixes from the independent review

1. Env pattern widened from `(^|/)\.env($|\.)` to `(^|/)\.env[^/]*` in TEMPLATES.md T3, SKILL.md Phase 1/2, CLAUDE.md §4.9, example deploy.sh.
   Proven blocking (mock gcloud, deploy.sh exit 1, zero submits): `.env`, `.env.local`, `.envrc`, `.envproduction`, `config/.env`, `apps/web/.env.local`, `.env.production.local`. Lookalikes `src/environment.ts`, `docs/env-setup.md` deploy normally.
2. Phase 2 check now captures the listing status: success + no match → CLEAN (with file count); success + match → BREACH; listing failure → "COULD NOT VERIFY" and stop. Tested all three branches. deploy.sh already behaved this way.
