# stark-deploy.yaml — Schema Reference

The config retains deployment intent; references/STARTUP.md defines guided intake when it is absent or incomplete. Every question `next-deploy-generate` used to ask has a field here. The agent reads this file, validates it against the repo and the GCP project, and only asks the operator about what the file leaves open or what the evidence contradicts.

Location: project root, beside `package.json`. Committed to git — therefore **secret names only, never values**.

---

## Top level

| Field | Required | Notes |
|---|---|---|
| `version` | yes | Must be `1`. Any other value → stop. |
| `app` | yes | Identity block. |
| `gcp` | yes | Target project block. |
| `urls` | yes (keys may be empty) | Drives `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_BACKEND_URL`. |
| `access` | yes | Invoker policy. |
| `secrets` | yes (`items` may be empty) | Secret Manager mapping. |
| `public_vars` | yes (may be empty) | `NEXT_PUBLIC_*` values. |
| `runtime` | no | Cloud Run sizing; defaults below. |

---

## `app`

| Field | Required | Validation |
|---|---|---|
| `name` | yes | `^[a-z][a-z0-9-]{1,40}$`. Becomes the prefix for secrets (`{name}-…`), runtime SA (`sa-{name}-runtime`), service (`{name}-prod`). |
| `display_name` | no | Free text for script banners. Default: `name`. |

## `gcp`

| Field | Required | Validation |
|---|---|---|
| `project_id` | yes | Must exist (`gcloud projects describe`). Path B only — the skill never creates projects. |
| `region` | no | Default `us-east1`. Must be a Cloud Run region. |
| `expected_account` | no | If set, preflight compares with `gcloud auth list --filter=status:ACTIVE`. Mismatch = hard stop. If unset, the agent reports the active account as EVIDENCE and asks the operator to confirm it is the intended one. |
| `service_name` | no | Default `{app.name}-prod` (CLAUDE.md §7.5 — matches `cyber-pharma-prod`, `cyph-mission-ctrl-prod`). |

## `urls`

| Field | Required | Effect |
|---|---|---|
| `custom_domain` | no | Non-empty → `NEXT_PUBLIC_APP_URL=https://{custom_domain}` baked; Two-Deploy waived. Empty → `https://pending-initial-deploy` placeholder and the two-deploy pattern applies (the skill runs deploy once, reports the run.app URL, and tells the operator a second deploy is needed after updating this field). Bare hostname only — no scheme, no trailing slash. |
| `backend_url` | no | Non-empty → `NEXT_PUBLIC_BACKEND_URL` baked with this value as a public var. |

## `access`

| Field | Required | Effect |
|---|---|---|
| `invoker` | **yes, no default** | `public` → cloudbuild deploy step uses `--allow-unauthenticated`; after deploy the agent verifies `allUsers` holds `roles/run.invoker`. `private` → `--no-allow-unauthenticated`; agent verifies NO `allUsers` binding exists. Any other value or empty → stop and ask. The agent announces the resulting access state on screen before the deploy step runs. |

## `secrets`

| Field | Required | Notes |
|---|---|---|
| `mode` | no | `helper` (default) or `manual`. See SKILL.md Phase 3. |
| `env_file` | no | Default `.env.local`. Read only by the helper script, only in the operator's terminal. |
| `items[]` | yes (may be empty) | One entry per secret. |

### `secrets.items[]`

| Field | Required | Validation |
|---|---|---|
| `env` | yes | Exact env var name the code reads. The agent greps the source for it; zero hits = QUESTION (env-file fossil?). |
| `secret` | no | Secret Manager name. Default: `{app.name}-` + `env` lowercased with `_` → `-`. Must match `^[a-zA-Z0-9_-]{1,255}$`. |
| `scope` | yes | `build` / `runtime` / `both`. Decides Dockerfile ARGs, cloudbuild `availableSecrets`, `--set-secrets`, and which Actor (B or C) gets `secretAccessor`. |

A secret whose `env` starts with `NEXT_PUBLIC_` is a config error (AP-G3) → stop.

## `public_vars[]`

| Field | Required | Validation |
|---|---|---|
| `env` | yes | Must start with `NEXT_PUBLIC_`. Must not be `NEXT_PUBLIC_APP_URL` or `NEXT_PUBLIC_BACKEND_URL` (derived from `urls`). |
| `value` | yes | Baked verbatim into `deploy.sh` and `cloudbuild.yaml`. Empty value, or a value matching a **placeholder format** (below) = stop and ask. |

### Placeholder formats (canonical list — used by Phase 1 validation AND the deploy.sh guard)

A public value is a placeholder if it matches, case-insensitively, the extended regex
`REPLACE|CHANGE[-_]?ME|FIXME|TODO|PLACEHOLDER|INVALID://|<[^>]+>|XXXX|example\.com|your[-_]`.
This catches `REPLACE_ME`, `pk_test_REPLACE_WITH_REAL_KEY`, `https://REPLACE.supabase.co`, `sb_publishable_REPLACE`, `<your-key>`, `https://your-project.supabase.co`, `https://example.com`. The bundled example config deliberately uses such values and therefore cannot deploy unchanged — that is the test. If a REAL value legitimately matches (rare), the operator overrides per CLAUDE.md §4.6 and the agent logs it.

## `runtime`

| Field | Default | Notes |
|---|---|---|
| `memory` | `1Gi` | Passed to `--memory`. |
| `max_instances` | `1` | Passed to `--max-instances`. |
| `min_instances` | `0` | Passed to `--min-instances`. |
| `dynamic_env_access` | `auto` | `auto`: agent greps for `process.env[` and bracket/dynamic reads; any hit → all public vars also ride `--set-env-vars`. `true`/`false` force the decision; the agent still reports what the grep found. |

---

## Derived values (never in the file)

| Derived | Formula |
|---|---|
| Service name | `gcp.service_name` or `{app.name}-prod` |
| Runtime SA | `sa-{app.name}-runtime@{project_id}.iam.gserviceaccount.com` |
| Build SA | Resolved, never inferred: `gcloud builds get-default-service-account --project P --region R --format=value(serviceAccountEmail)` (strip `projects/…/serviceAccounts/`); an explicit top-level `serviceAccount:` in cloudbuild.yaml takes precedence. Lookup error = stop (CLAUDE.md §4.5) |
| Image | `{region}-docker.pkg.dev/{project_id}/cloud-run-source-deploy/{service}:latest` |
| `NEXT_PUBLIC_APP_URL` | `https://{custom_domain}` or `https://pending-initial-deploy` |

---

## Validation order the agent follows

1. Parse YAML. Fail = stop with the parser error.
2. Schema checks above (required fields, regexes, enum values).
3. Repo checks: `output: "standalone"` present; Node floor; each `secrets.items[].env` and `public_vars[].env` has at least one read in source (`grep -rn "process.env.NAME"` outside `node_modules`/`.next`); `.gitignore` covers `.env*`.
4. Reverse check: env vars the code reads that the config does not list → QUESTION list (the config may be incomplete).
5. Cloud checks (read-only): active account, project exists, APIs enabled, Artifact Registry repo exists, Staging Rule grant on build SA, existing secrets / SA / service with these names (reported as "will reuse" or "mismatch").
6. Present the summary. Wait for APPROVED.

Only operator-confirmed nonsecret config drafting and bookkeeping may be written before step 6. Deployment files and cloud mutations require plan approval.
