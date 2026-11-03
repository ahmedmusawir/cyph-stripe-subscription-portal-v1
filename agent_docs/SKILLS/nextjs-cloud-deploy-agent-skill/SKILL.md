---
name: next-deploy-auto
description: >
  Config-driven, agent-executed deployment of a Next.js app to Google Cloud Run inside an
  EXISTING, already-bootstrapped GCP project (Path B). Reads stark-deploy.yaml from the project
  root (guiding config creation and browser login when needed), validates it against the code and the live project, generates the six deployment files
  plus the operator-run secret upload helper, runs init and IAM verification itself, pauses once
  for the operator to upload secret values, runs deploy.sh, and stops at a live run.app URL.
  Triggers on "auto deploy", "deploy from config", "stark deploy", "run next-deploy-auto",
  "ship it from the yaml". Does NOT bootstrap projects, set up custom domains or DNS, or
  certify the app — those remain operator-led (v3.1 family Path A / execute Phases 4–7).
allowed-tools: [bash, view, create_file, str_replace, list_files, read_file]
---

# Next Deploy Auto — Config-Driven Cloud Run Deployment (v1.2)

## Role

You are the Cloud Deployment Agent in **agent-execution mode**. CLAUDE.md (same folder) is your doctrine — read it first. This file is what you DO. You run the commands yourself, in the operator's terminal, under the operator's already-authenticated gcloud identity. You read evidence from command output instead of from pasted text. Guide missing configuration and operator browser login first, following `references/STARTUP.md`. After intake, the normal manual steps are deployment approval and secret upload when required.

Phases 0–6. Deployment approval is required; the Phase 3 operator handoff applies when secret upload is needed. One announced action (Phase 5 access). Done at a live run.app URL.

---

## Phase 0: Discover

Read `references/STARTUP.md` and follow its guided intake. Goal: locate the app, establish configuration and verify the operator identity without assuming prior setup.

Run (read-only):

```bash
pwd && ls -la
test -f stark-deploy.yaml && echo "CONFIG FOUND" || echo "CONFIG NOT FOUND"
test -f package.json && grep -E '"(next|node)"|"engines"' package.json
ls next.config.* 2>/dev/null
ls Dockerfile .dockerignore cloudbuild.yaml deploy.sh init-app.sh upload-secrets.sh DEPLOYMENT_CHECKLIST.md 2>/dev/null
git remote -v 2>/dev/null | head -1; git branch --show-current 2>/dev/null
gcloud --version | head -1
gcloud auth list --filter=status:ACTIVE --format="value(account)"
gcloud config get-value project 2>/dev/null
```

Rules:
- `CONFIG NOT FOUND` → guide the intake in STARTUP.md, show the proposed nonsecret config, and save only after operator confirmation. Never send the operator away with a blank template.
- No active/valid gcloud account → hand over `gcloud auth login` for the operator to run, wait in this workflow, then recheck identity and target access. Never create keys or execute interactive login yourself.
- Existing deployment files → they will be regenerated from config in Phase 2; say so in the plan. Never read `.env*`.
- Write `agent_docs/RESPONSES/response_<date>_<time>_auto-plan.md` before presenting the deployment plan on screen (CLAUDE.md §4.3); intake questions may come first. Create `agent_docs/SKILL_ISSUES_LEDGER_next_deploy_auto.md` if absent.

---

## Phase 1: Validate Config → Plan → APPROVED  ⛔ HARD STOP

Goal: prove the config is complete, consistent with the code, and consistent with the cloud — then get a typed approval.

### 1.1 Parse and schema-check
Read `stark-deploy.yaml`. Apply every rule in `references/CONFIG_SCHEMA.md`. Any required field empty, any enum wrong, any `NEXT_PUBLIC_` secret, any public var without a value → list ALL problems together and resolve them through guided intake. Edit the config only after confirmation of the exact nonsecret changes (CLAUDE.md §4.10), then revalidate before proceeding.

### 1.2 Repo evidence (local, read-only)
- **Gate 1 standalone:** `grep -n "standalone" next.config.*`. Absent → stop; propose the one-line add; require `npm run build` proving `.next/standalone/` before continuing.
- **Gate 2 Node floor:** engines / Next major. Next ≥15 needs Node ≥20; Dockerfile floor is `node:22-alpine`; raise if engines demand more.
- **Per listed env var:** `grep -rn "process.env.NAME" --include=*.ts --include=*.tsx --include=*.js --include=*.mjs . | grep -v node_modules | grep -v .next` — zero hits → QUESTION (fossil?).
- **Reverse check:** `grep -rhoE "process\.env\.[A-Z0-9_]+" … | sort -u` minus the config's list → QUESTION list ("code reads these, config doesn't mention them").
- **Dynamic access:** `grep -rn "process.env\[" …`. Hit + `dynamic_env_access: auto` → all public vars also ride `--set-env-vars`; record why.
- **Leak shield:** `grep -n "\.env" .gitignore` → EVIDENCE lines; `ls .gcloudignore` → if present, it governs the upload and must also cover `.env*` (verified by the `list-files-for-upload` Truth Command in 1.3).
- **Placeholder scan:** every `public_vars[].value` against the canonical placeholder regex in CONFIG_SCHEMA.md (`REPLACE|CHANGE[-_]?ME|FIXME|TODO|PLACEHOLDER|INVALID://|<[^>]+>|XXXX|example\.com|your[-_]`, case-insensitive) → any hit is a config problem; list them and stop.

### 1.3 Cloud evidence (read-only Truth Commands, single-line each)
```bash
gcloud projects describe PROJECT_ID --format="value(projectId,projectNumber,lifecycleState)"
gcloud services list --enabled --project PROJECT_ID --format="value(config.name)"
gcloud artifacts repositories describe cloud-run-source-deploy --location REGION --project PROJECT_ID --format="value(name)"
gcloud builds get-default-service-account --project PROJECT_ID --region REGION
gcloud projects get-iam-policy PROJECT_ID
gcloud meta list-files-for-upload .
gcloud secrets list --project PROJECT_ID --filter="name:APPNAME"
gcloud iam service-accounts describe sa-APPNAME-runtime@PROJECT_ID.iam.gserviceaccount.com --project PROJECT_ID
gcloud run services describe SERVICE --project PROJECT_ID --region REGION --format="value(status.url)"
```
Label each result. **Build SA:** the `get-default-service-account` output IS Actor B (strip the `projects/…/serviceAccounts/` prefix) unless `cloudbuild.yaml` has a top-level `serviceAccount:`; a failed or empty lookup is GAP + stop — never derive an email (CLAUDE.md §4.5). Read the full IAM policy yourself for that SA's `roles/run.admin`. **Upload boundary:** the `list-files-for-upload` command must SUCCEED (a failure is GAP → stop, never clean) and its output must contain no `.env*` (any name starting `.env`, at any depth), `*.pem`, `*.p12`, `*.key`, `*service*account*.json`, `*credentials*.json`; a hit, or an existing `.gcloudignore` that would let one through, is a stop. Report file NAMES only. Account mismatch vs `gcp.expected_account` → stop. Existing secrets/SA/service with the expected names → "will reuse". Existing service with a DIFFERENT runtime SA or region than config → MISMATCH, stop and ask.

### 1.4 Present the plan (first line: `Logged: response_<…>.md`)
Table: identity · target (account, project, number, region) · derived names · URL mode (domain baked / two-deploy) · secrets (env → secret → scope → exists?) · public vars with values · access (**say the sentence**: "Service will be PUBLIC: anyone on the internet can call it" / "PRIVATE: no one can call it until you grant invoker") · files to be generated · what will be REUSED vs CREATED · QUESTIONs · exactly where the two manual moments are.

Close with: **"Awaiting your APPROVED before deployment files are generated or cloud resources are changed."** Wait. Never pre-fill the approval (CLAUDE.md §4.7).

---

## Phase 2: Generate

Goal: the seven files, born complete, parse-checked, nothing run yet.

Read `references/TEMPLATES.md` first (AP-G1). Generate into the project root:

| File | Template | Conditional |
|---|---|---|
| `Dockerfile` | 1 | Stage 2 ARGs: build-time secrets then public vars |
| `.dockerignore` | 1b | always, unchanged |
| `cloudbuild.yaml` | 2A if any `build`/`both` secret else 2B | `{INVOKER_FLAG}` from `access.invoker`; `--set-secrets` lists runtime/both; `--set-env-vars` if dynamic access |
| `deploy.sh` | 3 | `NEXT_PUBLIC_APP_URL` baked from `urls`; one line + one `+=` per public var; guard after the last variable |
| `init-app.sh` | 4 [AUTO] | numbered `SECRET_NAME_n`; bindings per scope |
| `upload-secrets.sh` | 6 | `PROJECT_ID`, `ENV_FILE`, `MAPPING` only. **NOT generated when `secrets.mode: manual`** — six files then, and `{UPLOAD_HINT}` in init reads "add the value with the gcloud command the agent hands you" |
| `DEPLOYMENT_CHECKLIST.md` | 5 [AUTO] | run record, Config Summary filled |

Then:
```bash
SCRIPTS="deploy.sh init-app.sh"; [ -f upload-secrets.sh ] && SCRIPTS="$SCRIPTS upload-secrets.sh"
for f in $SCRIPTS; do bash -n "$f" && echo "parse OK $f"; done
grep -nP '(?<!\$)\{[A-Z_]+\}' Dockerfile cloudbuild.yaml $SCRIPTS || echo "TEMPLATE BRACES CLEAN"
chmod +x $SCRIPTS
CRED_PATTERN='(^|/)\.env[^/]*|\.pem$|\.p12$|\.key$|service[-_]?account.*\.json$|credentials.*\.json$'
if UPLOAD_LIST="$(gcloud meta list-files-for-upload . 2>&1)"; then
  printf '%s\n' "$UPLOAD_LIST" | grep -Ei "$CRED_PATTERN" && echo "UPLOAD BOUNDARY BREACH" || echo "UPLOAD BOUNDARY CLEAN ($(printf '%s\n' "$UPLOAD_LIST" | grep -c .) files)"
else
  echo "UPLOAD BOUNDARY: COULD NOT VERIFY — listing failed: $UPLOAD_LIST"
fi
```
Any brace hit = generation defect; fix before Phase 3. An upload-boundary BREACH = stop: name the file(s), tell the operator what to add to `.gcloudignore`, never read the file. COULD NOT VERIFY = also stop (fail closed) — a listing failure is a GAP, never CLEAN. (The same boundary check also runs inside `deploy.sh` before every submit, and `deploy.sh`'s placeholder guard re-checks every public value against the canonical list — defense in depth, not a substitute for Phase 1.) `bash -n` is syntax only; the mock-backed behavioral tests live in the skill's validation report, not in the operator's run. Present a one-line description per file. No stop here — the plan already approved these exact files.

---

## Phase 3: Init + Secret Handoff  ⛔ HARD STOP (operator runs the helper)

Goal: app-level resources exist; secret values are uploaded by the operator.

### 3.1 Run init yourself
```bash
./init-app.sh
```
Read the output. Expected first-run: infrastructure ✅ lines, Build SA resolved line (a ❌ here is a LOOKUP failure — show it, stop, never substitute an email), Staging Rule ✅, secrets "created EMPTY" (or "exists (reused)"), runtime SA created/reused, bindings ✅, verification shows "NO VALUE YET" for new secrets, exit 0. Any ❌ → stop, ledger row, report the exact line. Never add a missing grant yourself (CLAUDE.md §4.6) — show the command, let the operator decide.

### 3.2 Hand over the helper (CLAUDE.md §4.8 format)
> **RUN THIS:**
> ```
> ./upload-secrets.sh
> ```
> What happens: it reads `.env.local` in your terminal and pushes each listed value into its Secret Manager slot. I never see the file or the values.
> Stop if you see: a ❌ line — it names the env key that is missing or failed.
> When done: say "secrets done".

`secrets.mode: manual` instead → there is no helper file; hand over one `echo -n 'PASTE_VALUE' | gcloud secrets versions add SECRET --data-file=- --project PROJECT_ID` block per secret (same RUN THIS format, one block each, `echo -n` mandatory), and "When done: say secrets done".

Wait. Do not poll, do not proceed on silence.

### 3.3 Verify metadata only
```bash
gcloud secrets versions list SECRET --project PROJECT_ID --filter="state:ENABLED" --format="value(name,state,createTime)"
```
Per secret: ≥1 ENABLED version → EVIDENCE "value present". None → back to 3.2. State plainly: metadata proves a value was uploaded, not that it is the right one — the smoke test in Phase 5 is the functional proof.

---

## Phase 4: IAM Matrix

Goal: Actor B and Actor C can each read what they need. Run, read, label — same commands as v3.1 execute Phase 2, you are now the one running them.

```bash
gcloud secrets get-iam-policy SECRET --project PROJECT_ID
```
Per build/both secret: build SA email holds `roles/secretmanager.secretAccessor`. Per runtime/both secret: `sa-APPNAME-runtime@…` holds it. Missing binding → it is an init regression: report it, show the `add-iam-policy-binding` command, ask. Do not grant silently.

Output: a matrix in the RESPONSES artifact, every cell EVIDENCE or GAP. Any GAP → do not deploy.

---

## Phase 5: Announce Access → Deploy → Verify

### 5.1 Announce (on screen, before running anything)
"Deploying `SERVICE` to `PROJECT_ID`/`REGION`. On success the service will be **PUBLIC/PRIVATE** per `access.invoker`. Build takes roughly 8–12 minutes." Then run — the APPROVED in Phase 1 covers this; the announcement is so the operator can interrupt.

### 5.2 Deploy
```bash
./deploy.sh
```
Expected: three Cloud Build steps succeed; NO "Setting IAM policy failed" warning (its absence is the Staging Rule passive proof); dual-URL banner.

Failure handling — report, don't retry blindly:
- Step 1 fails on `npm ci`/`next build` → read the build log tail; node floor, lockfile, or a build-time secret Actor B can't read (`Permission denied` on `secrets/…` → back to Phase 4).
- Step 3 fails → runtime SA missing or `--set-secrets` name typo; or `Setting IAM policy failed` → Staging Rule, show the grant, stop.
- Container crash-loops after a green deploy → `gcloud run services logs read SERVICE --project PROJECT_ID --region REGION --limit 50`; dynamic env access or a wrong secret value are the usual causes. Never print secret values while diagnosing.
Every failure: ledger row + safe diagnostic (build ID, step, last 20 log lines) + what to fix. Resume from the failed phase, not from zero.

### 5.3 Verify access matches intent
```bash
gcloud run services get-iam-policy SERVICE --project PROJECT_ID --region REGION
curl -s -o /dev/null -w "%{http_code}\n" RUN_APP_URL
```
`public` → `allUsers` has `roles/run.invoker` AND curl returns 200/3xx. `private` → no `allUsers` binding AND curl returns 403. Anything else → MISMATCH, stop.

### 5.4 Two-deploy note
If `urls.custom_domain` was empty: say so — `NEXT_PUBLIC_APP_URL` is the placeholder; the operator should set `custom_domain` (or decide to use the run.app URL) and re-run. Not performed automatically.

---

## Phase 6: Report and Hand Off

Write the final RESPONSES artifact and tick `DEPLOYMENT_CHECKLIST.md`. On screen:

> **DEPLOYED — `SERVICE`**
> LIVE NOW: `https://…run.app`  (expect a Chrome Safe-Browsing warning on fresh run.app URLs — not an app defect)
> Access: PUBLIC/PRIVATE — verified by policy read-back
> Secrets: N present (metadata), IAM matrix all EVIDENCE
> Build ID: …
>
> **Not done by this skill (your call, together):** domain mapping for `custom_domain`, the DNS record Google asks for, SSL wait, app certification on the final URL. Successful deploy ≠ Gate D.
> Day two: code change → `./deploy.sh`. New env var or secret → edit `stark-deploy.yaml` → run me again.

Done criteria: service exists · deploy succeeded with no IAM warning · access verified matches config · smoke-test HTTP code matches intent · ledger closed · checklist ticked. Anything less → "partial", with the failing item named.

---

## Worked Example (abridged)

```
Operator: Go read _SKILLS/next-deploy-auto/CLAUDE.md and follow it.
Agent:    [Phase 0] CONFIG FOUND. Next 15, node:22 floor OK. Active account moose@cyberizegroup.com,
          project cyberize-nextjs-staging. No deployment files yet.
          [Phase 1] Config valid. standalone ✅. 4 secrets all read in code. Reverse check: code also
          reads NEXT_PUBLIC_SITE_URL — QUESTION: bake it with the same value as APP_URL?
          Cloud: project 524380376459 ACTIVE, APIs ✅, repo ✅, build SA = compute default,
          run.admin ✅ (EVIDENCE: get-iam-policy). No existing secrets/SA/service → all CREATE.
          Logged: response_2026-10-30_131500_auto-plan.md  [table]  Service will be PUBLIC.
          Awaiting your APPROVED before deployment files are generated or cloud resources are changed.
Operator: yes bake SITE_URL too. APPROVED
Agent:    [Phase 2] 7 files written, bash -n clean, grep clean.
          [Phase 3] ./init-app.sh → exit 0, 4 secrets created EMPTY, SA created, 4 bindings ✅.
          RUN THIS: ./upload-secrets.sh  … When done: say "secrets done".
Operator: secrets done
Agent:    4/4 secrets: 1 ENABLED version each (metadata). [Phase 4] matrix 4/4 EVIDENCE.
          [Phase 5] Deploying cyph-payment-portal-prod → PUBLIC. ./deploy.sh … SUCCESS, no IAM
          warning. allUsers invoker ✅, curl 200. [Phase 6] DEPLOYED — LIVE NOW https://…run.app.
          Not done: domain mapping + DNS for payment-portal.cyberizedev.com.
```

---

## Skill-Specific Anti-Patterns

See `references/ANTI_PATTERNS.md` (AP-A1…A8). The three that bite first: running `upload-secrets.sh` yourself (A1), granting a missing IAM role to "keep moving" (A2), treating a deploy SUCCESS as done without the access read-back (A4).

---

## When You're Done

1. Plan artifact written before presentation; APPROVED typed by the operator
2. Seven files generated from TEMPLATES.md, parse-checked, grep-clean
3. init exit 0; operator handled any required secret upload; every configured secret shows an ENABLED version
4. IAM matrix all EVIDENCE
5. deploy.sh SUCCESS with no IAM warning; access policy read back and matches `access.invoker`; HTTP code matches
6. Report delivered with LIVE NOW URL and the explicit not-done list
7. Ledger has a row for every issue, written when it happened

## Version History

Version 1.2 (2026-11-03): mandatory guided startup, confirmed config drafting, same-session browser-login handoff and recovery; deployment templates unchanged.

| Version | Date | Change |
|---|---|---|
| 1.1.1 | 2026-10-30 | Upload boundary: env pattern widened to `(^|/)\.env[^/]*` (full `.env*` family, nested); Phase 2 check captures listing status and fails closed. |
| 1.1 | 2026-10-30 | Review repairs: build SA via `get-default-service-account` (Phase 1.3, 3.1); canonical placeholder scan in 1.2; upload-boundary Truth Command in 1.3 and Phase 2; Phase 2/3 branch on helper absence for `secrets.mode: manual`. |
| 1.0 | 2026-10-30 | Initial. Combines v3.1 generate + execute Phases 0–3 and 6 into one config-driven, agent-executed skill for Path B. New: `stark-deploy.yaml`, operator-run `upload-secrets.sh`, empty-secret creation, enabled-version verification, mandatory access announcement + read-back, explicit stop at run.app URL. Not yet field-tested. |
