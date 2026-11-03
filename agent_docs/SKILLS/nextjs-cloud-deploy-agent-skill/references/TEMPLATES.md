# Canonical Templates — next-deploy-auto

Lifted byte-for-byte from `CLOUD_DEPLOYMENT_SKILLS_v3.1/next-deploy-generate/references/TEMPLATES.md` (field-passed, cyber-pharma 2026-07-31) except where marked **[AUTO]**. Templates 1, 1b, 2, 3 are unchanged. Template 4 (`init-app.sh`) is rewritten for the agent-run model: project-level resources are VERIFIED not created, secrets are created EMPTY (no placeholder version), and verification checks for an enabled version instead of counting versions. Template 5 is the run record. Template 6 is new: the operator-run secret upload helper.

The agent fills blanks from `stark-deploy.yaml`. It does not generate from memory (AP-G1).

---

## Template 1: Dockerfile

3 stages. Stage 1 (deps) and Stage 3 (runner) NEVER change. Stage 2 (builder) adapts based on which secrets are build-time and which public vars exist.

### Full Template

```dockerfile
# --- STAGE 1: DEPENDENCIES ---
# Node floor: 22 (Next 15/16 require >= 20 — Issue #2). Raise if package.json engines demand more.
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# --- STAGE 2: BUILDER ---
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# >>> INSERT BUILD-TIME SECRET ARGs HERE <<<
# >>> INSERT PUBLIC VAR ARGs HERE <<<

RUN npm run build

# --- STAGE 3: RUNNER ---
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### Stage 2 Insertion Rules

For each **build-time secret**, add:
```dockerfile
ARG SECRET_NAME
ENV SECRET_NAME=${SECRET_NAME}
```

For each **public var**, add:
```dockerfile
ARG NEXT_PUBLIC_VAR_NAME
ENV NEXT_PUBLIC_VAR_NAME=${NEXT_PUBLIC_VAR_NAME}
```

**`NEXT_PUBLIC_APP_URL` is ALWAYS present.** Order: secrets first, then public vars.

If there are ZERO build-time secrets, omit the secrets block entirely — only public var ARGs remain.

### Example A: No build-time secrets (Stripe + Supabase SaaS)

```dockerfile
# Stage 2 ARG/ENV block:
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
```

### Example B: With build-time secrets (WooCommerce ecom)

```dockerfile
# Stage 2 ARG/ENV block:
ARG WOOCOM_CONSUMER_KEY
ARG WOOCOM_CONSUMER_SECRET
ARG STRIPE_SECRET_KEY
ENV WOOCOM_CONSUMER_KEY=${WOOCOM_CONSUMER_KEY}
ENV WOOCOM_CONSUMER_SECRET=${WOOCOM_CONSUMER_SECRET}
ENV STRIPE_SECRET_KEY=${STRIPE_SECRET_KEY}

ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_BACKEND_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_BACKEND_URL=${NEXT_PUBLIC_BACKEND_URL}
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
```

---

## Template 1b: .dockerignore (MANDATORY PAIR with Template 1)

**Never generate a Dockerfile without this file.** The Dockerfile's `COPY . .` copies the entire repo root into the build container. Next standalone output mode copies `.env` files into `.next/standalone/`, which Stage 3 ships wholesale into the final image — without this shield, `SUPABASE_SECRET_KEY`-class values ride into Artifact Registry, bypassing the 3-Layer model (v3 field test, operator-caught blocker). It also slims the build context (no node_modules/.next upload).

```
.env*
node_modules
.next
.git
.gitignore
Dockerfile
.dockerignore
cloudbuild.yaml
deploy.sh
init-app.sh
upload-secrets.sh
stark-deploy.yaml
DEPLOYMENT_CHECKLIST.md
agent_docs
_SKILLS
README.md
```

### .dockerignore Rules

- `.env*` is deliberately broader than `.gitignore`'s typical `.env*.local` — it also catches a future bare `.env` the upload layer would miss (defense-in-depth: `.gcloudignore` mirrors `.gitignore` for the Cloud Build tarball; this file guards the docker build context)
- `public/` must NEVER appear here — Stage 3 copies `/app/public`
- Verify the ignore chain at generation: confirm `.gitignore` covers `.env*` variants; report the matching lines as EVIDENCE
- Note for accuracy (a v3-run misconception, corrected): real environment variables (the ARG→ENV pairs) OUTRANK `.env.local` in Next's precedence — the leak-into-image path is the danger, not value override

---

## Template 2: cloudbuild.yaml

Three steps: build, push, deploy. Two variants depending on whether build-time secrets exist.

### Template 2A: WITH build-time secrets

Use when the app has secrets needed during `next build` (e.g., WooCommerce SSG pages).

```yaml
substitutions:
  _REGION: "{REGION}"
  _SERVICE_NAME: "{APP_NAME}-prod"
  _NEXT_PUBLIC_APP_URL: "INVALID://SET-IN-DEPLOY-SH"
  # >>> ADD: _NEXT_PUBLIC_{VAR}: "REAL VALUE FROM INTAKE" for each public var <<<
  # Defaults for must-be-overridden vars use INVALID:// so a deploy.sh substitution
  # miss fails LOUDLY at build/runtime instead of shipping a plausible-looking string.
  # deploy.sh's string-builder overrides every substitution on every run.

steps:
  # 1. Build Docker Image (with build-time secrets)
  - name: "gcr.io/cloud-builders/docker"
    entrypoint: "bash"
    id: "Build Image"
    secretEnv:
      # >>> LIST each build-time secret's generic env var name <<<
      - "WOOCOM_CONSUMER_KEY"
      - "WOOCOM_CONSUMER_SECRET"
      - "STRIPE_SECRET_KEY"
    args:
      - "-c"
      - |
        docker build \
          --build-arg WOOCOM_CONSUMER_KEY="$$WOOCOM_CONSUMER_KEY" \
          --build-arg WOOCOM_CONSUMER_SECRET="$$WOOCOM_CONSUMER_SECRET" \
          --build-arg STRIPE_SECRET_KEY="$$STRIPE_SECRET_KEY" \
          --build-arg NEXT_PUBLIC_APP_URL="${_NEXT_PUBLIC_APP_URL}" \
          --build-arg NEXT_PUBLIC_BACKEND_URL="${_NEXT_PUBLIC_BACKEND_URL}" \
          --build-arg NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="${_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}" \
          -t "${_REGION}-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/${_SERVICE_NAME}:latest" \
          .

  # 2. Push to Artifact Registry
  - name: "gcr.io/cloud-builders/docker"
    id: "Push Image"
    args: ["push", "${_REGION}-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/${_SERVICE_NAME}:latest"]

  # 3. Deploy to Cloud Run
  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
    entrypoint: "gcloud"
    id: "Deploy to Cloud Run"
    args:
      [
        "run", "deploy", "${_SERVICE_NAME}",
        "--image", "${_REGION}-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/${_SERVICE_NAME}:latest",
        "--region", "${_REGION}",
        "--platform", "managed",
        "{INVOKER_FLAG}",
        "--service-account", "sa-{APP_NAME}-runtime@$PROJECT_ID.iam.gserviceaccount.com",
        "--set-secrets",
        "WOOCOM_CONSUMER_KEY={APP_NAME}-woocom-consumer-key:latest,WOOCOM_CONSUMER_SECRET={APP_NAME}-woocom-consumer-secret:latest,STRIPE_SECRET_KEY={APP_NAME}-stripe-secret-key:latest",
        "--set-env-vars",
        "NEXT_PUBLIC_BACKEND_URL=${_NEXT_PUBLIC_BACKEND_URL},NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}",
        "--memory", "{MEMORY}",
        "--max-instances", "{MAX_INSTANCES}",
        "--min-instances", "{MIN_INSTANCES}",
      ]

# Build-time secret mapping: app-specific Secret Manager name → generic build label
availableSecrets:
  secretManager:
    - versionName: projects/$PROJECT_ID/secrets/{APP_NAME}-woocom-consumer-key/versions/latest
      env: "WOOCOM_CONSUMER_KEY"
    - versionName: projects/$PROJECT_ID/secrets/{APP_NAME}-woocom-consumer-secret/versions/latest
      env: "WOOCOM_CONSUMER_SECRET"
    - versionName: projects/$PROJECT_ID/secrets/{APP_NAME}-stripe-secret-key/versions/latest
      env: "STRIPE_SECRET_KEY"
```

### Template 2B: WITHOUT build-time secrets

Use when all secrets are runtime-only (e.g., Stripe + Supabase SaaS). Much simpler — no bash wrapper, no secretEnv, no availableSecrets.

```yaml
substitutions:
  _REGION: "{REGION}"
  _SERVICE_NAME: "{APP_NAME}-prod"
  _NEXT_PUBLIC_APP_URL: "INVALID://SET-IN-DEPLOY-SH"
  # >>> ADD: _NEXT_PUBLIC_{VAR}: "REAL VALUE FROM INTAKE" for each public var <<<
  # (INVALID:// defaults fail loudly if deploy.sh ever misses a substitution)

steps:
  # 1. Build Docker Image (no secrets at build time)
  - name: "gcr.io/cloud-builders/docker"
    id: "Build Image"
    args:
      - "build"
      - "--build-arg"
      - "NEXT_PUBLIC_APP_URL=${_NEXT_PUBLIC_APP_URL}"
      # >>> ADD per public var: "--build-arg" then "VAR=${_VAR}" as separate items <<<
      - "-t"
      - "{REGION}-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/${_SERVICE_NAME}:latest"
      - "."

  # 2. Push to Artifact Registry
  - name: "gcr.io/cloud-builders/docker"
    id: "Push Image"
    args: ["push", "${_REGION}-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/${_SERVICE_NAME}:latest"]

  # 3. Deploy to Cloud Run
  - name: "gcr.io/google.com/cloudsdktool/cloud-sdk"
    entrypoint: "gcloud"
    id: "Deploy to Cloud Run"
    args:
      [
        "run", "deploy", "${_SERVICE_NAME}",
        "--image", "${_REGION}-docker.pkg.dev/$PROJECT_ID/cloud-run-source-deploy/${_SERVICE_NAME}:latest",
        "--region", "${_REGION}",
        "--platform", "managed",
        "{INVOKER_FLAG}",
        "--service-account", "sa-{APP_NAME}-runtime@$PROJECT_ID.iam.gserviceaccount.com",
        "--set-secrets",
        "STRIPE_SECRET_KEY={APP_NAME}-stripe-secret-key:latest,STRIPE_WEBHOOK_SECRET={APP_NAME}-stripe-webhook-secret:latest",
        "--memory", "{MEMORY}",
        "--max-instances", "{MAX_INSTANCES}",
        "--min-instances", "{MIN_INSTANCES}",
      ]
```

### cloudbuild.yaml Key Rules

- **[AUTO] `{INVOKER_FLAG}`** is `--allow-unauthenticated` when `access.invoker: public`, `--no-allow-unauthenticated` when `private`. Never defaulted — the config field is required.
- **[AUTO] `{MEMORY}` / `{MAX_INSTANCES}` / `{MIN_INSTANCES}`** come from `runtime:` (defaults 1Gi / 1 / 0).

- **Dynamic-env-access rule (v3.1, field-proven):** if the app has ANY dynamic `process.env[key]` reads (env validators at server start), ALL public vars must ride `--set-env-vars` on the deploy step — dynamic access is never build-inlined, and a missing runtime var means a fail-closed crash-loop on a green build. Document the reason in a header comment.
- **Region rides `${_REGION}` in every image path** — never hardcode the region into `*-docker.pkg.dev` strings (cross-region landmine).
- Must-override substitution defaults use `INVALID://...` — plausible-looking defaults produce green builds with garbage baked in.
- Build-time secrets use `$$VAR` (double dollar — Cloud Build injects from secretEnv)
- Public vars use `${_VAR}` (single dollar — Cloud Build substitution)
- `--set-secrets` format: `ENV_VAR={app}-{secret-name}:latest` — left = generic, right = app-prefixed
- `--set-env-vars` format: `VAR=${_VAR}` — for public vars needed at runtime (omit if none)
- `availableSecrets` maps: `versionName` (app-specific path) → `env` (generic label)
- Template 2A: requires `entrypoint: "bash"` + `args: ["-c", |]` for the multiline docker build with secret injection
- Template 2B: uses simple `args` list — cleaner, no bash wrapper

---

## Template 3: deploy.sh

```bash
#!/bin/bash
set -euo pipefail

# ==================================================
# STARK FACTORY — App Deployment Script
# App: {APP_DISPLAY_NAME}
# ==================================================

# --- CONFIG (change these per app) ---
PROJECT_ID="{GCP_PROJECT_ID}"
REGION="{REGION}"
SERVICE_NAME="{APP_NAME}-prod"

# --- PUBLIC VARIABLES (change these per app — REAL VALUES BAKED AT GENERATION) ---
NEXT_PUBLIC_APP_URL="{DOMAIN_URL_OR_PLACEHOLDER}"
# >>> ONE LINE PER PUBLIC VAR — REAL VALUE FROM INTAKE. REPLACE_ME here = generation defect (AP-G8). <<<

# --- GUARD: refuse to deploy with unfilled placeholders (v3.1 — MUST sit AFTER the
# --- last variable definition and BEFORE the execution banner; set -u makes any
# --- earlier placement a fatal unbound-variable error) ---
# PLACEHOLDER_PATTERN is the canonical list (references/CONFIG_SCHEMA.md "Placeholder formats").
# Matched case-insensitively against EVERY public value, one per line, so one bad value aborts.
PLACEHOLDER_PATTERN='REPLACE|CHANGE[-_]?ME|FIXME|TODO|PLACEHOLDER|INVALID://|<[^>]+>|XXXX|example\.com|your[-_]'
if printf '%s\n' {ALL_PUBLIC_VAR_REFS_ONE_PER_LINE} | grep -Eiq "$PLACEHOLDER_PATTERN"; then
  echo "❌ ABORT: a public var still holds placeholder text — fix stark-deploy.yaml and regenerate. Offending value(s):"
  printf '%s\n' {ALL_PUBLIC_VAR_REFS_ONE_PER_LINE} | grep -Ei "$PLACEHOLDER_PATTERN" | sed 's/^/   /'
  exit 1
fi
# >>> GENERATE {ALL_PUBLIC_VAR_REFS_ONE_PER_LINE} as "$VAR1" "$VAR2" ... (space-separated, each quoted) <<<

# --- UPLOAD BOUNDARY GUARD (v1.1): what gcloud would actually ship to Cloud Build. Honors
# --- .gcloudignore if present, else gitignore mirroring. Aborts if any credential file is in the list.
CRED_PATTERN='(^|/)\.env[^/]*|(^|/)\.gcloudignore\.bak$|\.pem$|\.p12$|\.key$|service[-_]?account.*\.json$|credentials.*\.json$'
if UPLOAD_LIST="$(gcloud meta list-files-for-upload . 2>/dev/null)"; then
  if printf '%s\n' "$UPLOAD_LIST" | grep -Eiq "$CRED_PATTERN"; then
    echo "❌ ABORT: the Cloud Build upload would include credential file(s):"
    printf '%s\n' "$UPLOAD_LIST" | grep -Ei "$CRED_PATTERN" | sed 's/^/   /'
    echo "   Add them to .gcloudignore (and .gitignore) — do not deploy."
    exit 1
  fi
  echo "🛡️  Upload boundary clean ($(printf '%s\n' "$UPLOAD_LIST" | grep -c .) files, no env/credential files)."
else
  echo "❌ ABORT: 'gcloud meta list-files-for-upload' failed — cannot prove the upload boundary. Not deploying."
  exit 1
fi

# --- EXECUTION (do not modify below this line) ---
echo "=================================================="
echo "🤖 Stark Deployment Agent: Initiating Sequence"
echo "   Project: $PROJECT_ID"
echo "   Region:  $REGION"
echo "   Service: $SERVICE_NAME"
echo "   URL:     $NEXT_PUBLIC_APP_URL"
echo "=================================================="

gcloud config set project "$PROJECT_ID" --quiet

echo "🚀 Submitting Cloud Build..."
# STRING-BUILDER PATTERN (mandatory — Issue #5). Never split --substitutions across
# ,\ continuation lines: bash keeps each line's leading indent, producing separate
# argv tokens and gcloud "unrecognized arguments". One += per public var:
SUBSTITUTIONS="_REGION=${REGION}"
SUBSTITUTIONS+=",_SERVICE_NAME=${SERVICE_NAME}"
SUBSTITUTIONS+=",_NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}"
# >>> ONE += LINE PER ADDITIONAL PUBLIC VAR <<<

gcloud builds submit \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --config cloudbuild.yaml \
  --substitutions "$SUBSTITUTIONS"

echo "=================================================="
echo "✅ Deployment Sequence Complete."
echo "   Service:  $SERVICE_NAME"
# DUAL-URL BANNER (v3.1): the domain URL is dead until DNS/SSL completes — printing
# only it buries the one link that works NOW twelve lines up in build scroll.
RUN_APP_URL="$(gcloud run services describe "$SERVICE_NAME" --project "$PROJECT_ID" --region "$REGION" --format='value(status.url)')"
echo "   LIVE NOW (run.app):            $RUN_APP_URL"
echo "   FINAL (after DNS/SSL, pending): $NEXT_PUBLIC_APP_URL"
echo "=================================================="
```

### deploy.sh Rules

- `NEXT_PUBLIC_APP_URL`: custom domain if known (e.g., `https://starkreads.cyberizedev.com`) — which also WAIVES the two-deploy pattern — else `"https://pending-initial-deploy"`
- One variable line per public var in the PUBLIC VARIABLES section — **real values from intake, never REPLACE_ME** (AP-G8)
- **[AUTO v1.1]** The placeholder guard uses the canonical `PLACEHOLDER_PATTERN` (CONFIG_SCHEMA.md) case-insensitively, one value per line — `REPLACE_WITH_X`, `https://REPLACE.supabase.co`, `sb_publishable_REPLACE`, `<your-key>`, `example.com` all abort. The upload-boundary guard follows it and runs `gcloud meta list-files-for-upload` — the EFFECTIVE Cloud Build file list — and aborts on any `.env*` file (`(^|/)\.env[^/]*` — whole family, any depth) or credential file; a failed listing also aborts (fail closed)
- The placeholder guard sits AFTER the last variable definition, BEFORE the execution banner — anchor-line placement, not section placement (v3 field lesson: "after the config block" was executed literally and produced an unbound-variable crash)
- One `SUBSTITUTIONS+=` line per public var — NEVER `,\` continuation lines (Issue #5)
- The completion banner prints BOTH URLs with honest labels — LIVE NOW (run.app) and FINAL (pending DNS/SSL)
- Everything below "EXECUTION" is identical for every app — never modify
- `bash -n deploy.sh` before presenting (generation rule)


---

## Template 4: init-app.sh **[AUTO — rewritten]**

Differences from v3.1: (1) project-level resources (APIs, Artifact Registry) are **verified, never created** — this skill is Path B only and does not mutate project infrastructure; a miss is a hard stop with the fix named. (2) Secrets are created **empty** — `gcloud secrets create` with no `--data-file` creates the container and zero versions. No placeholder version ever exists, so "version count" is not a thing anymore. (3) The verification tail reports whether each secret has at least one ENABLED version. Metadata proves a value was uploaded, not that it is correct. (4) Staging Rule grant is checked and reported — never silently added (CLAUDE.md §4.6). (5) **v1.1:** the build identity is RESOLVED with `gcloud builds get-default-service-account` (or the explicit `serviceAccount:` in cloudbuild.yaml); the v3.1 "empty build history → derive compute default" inference is gone — a lookup error aborts with the error shown, never a guessed email.

```bash
#!/bin/bash
set -euo pipefail

# ==================================================
# STARK FACTORY — One-Time App Setup (agent-run)
# App: {APP_DISPLAY_NAME} | Project: {GCP_PROJECT_ID}
# IDEMPOTENT — safe to run multiple times. Verifies project-level
# infrastructure; creates ONLY app-level resources (secrets, runtime SA, bindings).
# ==================================================

PROJECT_ID="{GCP_PROJECT_ID}"
REGION="{REGION}"
APP_NAME="{APP_NAME}"
REPO_NAME="cloud-run-source-deploy"
TMPDIR_ERR="$(mktemp -d)"; trap 'rm -rf "$TMPDIR_ERR"' EXIT

echo "=================================================="
echo "🤖 Stark Factory: Initializing $APP_NAME"
echo "   Project: $PROJECT_ID | Region: $REGION"
echo "=================================================="

gcloud config set project "$PROJECT_ID" --quiet
gcloud config set run/region "$REGION" --quiet

# --- VERIFY PROJECT-LEVEL INFRASTRUCTURE (Path B precondition — never created here) ---
echo "🔎 Verifying project infrastructure..."
ENABLED="$(gcloud services list --enabled --project "$PROJECT_ID" --format='value(config.name)')"
for API in cloudbuild.googleapis.com run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com iam.googleapis.com; do
  if grep -qx "$API" <<<"$ENABLED"; then echo "   ✅ API enabled: $API"
  else echo "   ❌ API NOT enabled: $API — this is not a bootstrapped project. Run Path A (v3.1 family CLAUDE.md §5.2) first."; exit 1; fi
done
if gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" --project "$PROJECT_ID" &>/dev/null; then
  echo "   ✅ Artifact Registry repo exists: $REPO_NAME ($REGION)"
else
  echo "   ❌ Artifact Registry repo $REPO_NAME missing in $REGION — Path A step 5 not done. Aborting."; exit 1
fi

# --- BUILD SA (Actor B) — RESOLVED, never inferred (§4.5 v1.1) ---
# deploy.sh submits with no --service-account, so the build runs as the project/region
# DEFAULT build identity. Ask Cloud Build which account that is. If cloudbuild.yaml ever
# declares an explicit top-level serviceAccount:, that one executes instead — honor it.
EXPLICIT_SA="$(grep -E '^serviceAccount:' cloudbuild.yaml 2>/dev/null | sed -E 's/^serviceAccount:[[:space:]]*"?([^"]*)"?/\1/' || true)"
if [ -n "$EXPLICIT_SA" ]; then
  BUILD_SA_EMAIL="${EXPLICIT_SA##*/serviceAccounts/}"
  echo "   Build SA (explicit in cloudbuild.yaml): $BUILD_SA_EMAIL"
else
  SA_RC=0
  DEFAULT_SA_RAW="$(gcloud builds get-default-service-account --project "$PROJECT_ID" --region "$REGION" --format='value(serviceAccountEmail)' 2>"$TMPDIR_ERR/sa.err")" || SA_RC=$?
  if [ "$SA_RC" -ne 0 ]; then
    echo "   ❌ Could not resolve the default Cloud Build service account (gcloud exit $SA_RC)."
    echo "      This is a lookup failure, NOT a missing account — do not guess an identity."
    echo "      Likely: Cloud Build API not enabled, missing cloudbuild.builds.get permission, or platform drift. Error:"
    sed 's/^/      | /' "$TMPDIR_ERR/sa.err"; exit 1
  fi
  BUILD_SA_EMAIL="${DEFAULT_SA_RAW##*/serviceAccounts/}"
  if [ -z "$BUILD_SA_EMAIL" ]; then echo "   ❌ Default build SA lookup returned empty — aborting, not guessing."; exit 1; fi
  echo "   Build SA (default for $PROJECT_ID/$REGION, resolved): $BUILD_SA_EMAIL"
fi

# --- STAGING RULE CHECK: build SA must hold roles/run.admin — REPORT ONLY, never auto-grant ---
if gcloud projects get-iam-policy "$PROJECT_ID" --flatten='bindings[].members' --format='value(bindings.role)' --filter="bindings.members:serviceAccount:${BUILD_SA_EMAIL}" | grep -qx "roles/run.admin"; then
  echo "   ✅ Staging Rule: $BUILD_SA_EMAIL holds roles/run.admin"
else
  echo "   ❌ Staging Rule MISSING: $BUILD_SA_EMAIL lacks roles/run.admin — first deploy would 403."
  echo "      Operator decision required. Fix (v3.1 §5.2 step 6):"
  echo "      gcloud projects add-iam-policy-binding $PROJECT_ID --member=\"serviceAccount:${BUILD_SA_EMAIL}\" --role=\"roles/run.admin\""
  exit 1
fi

# --- CREATE SECRETS (EMPTY — no placeholder version; values arrive via upload-secrets.sh) ---
echo "🔐 Secrets..."
# >>> FOR EACH secrets.items[] ENTRY, GENERATE: <<<
# SECRET_NAME_1="{SECRET_MANAGER_NAME}"
# if gcloud secrets describe "$SECRET_NAME_1" --project "$PROJECT_ID" &>/dev/null; then
#   echo "   ✅ exists (reused): $SECRET_NAME_1"
# else
#   gcloud secrets create "$SECRET_NAME_1" --replication-policy="automatic" --project "$PROJECT_ID" --quiet
#   echo "   ✅ created EMPTY: $SECRET_NAME_1"
# fi

# --- RUNTIME SERVICE ACCOUNT (Actor C) ---
RUNTIME_SA="sa-${APP_NAME}-runtime"
RUNTIME_SA_EMAIL="${RUNTIME_SA}@${PROJECT_ID}.iam.gserviceaccount.com"
echo "👤 Runtime SA..."
if gcloud iam service-accounts describe "$RUNTIME_SA_EMAIL" --project "$PROJECT_ID" &>/dev/null; then
  echo "   ✅ exists (reused): $RUNTIME_SA_EMAIL"
else
  gcloud iam service-accounts create "$RUNTIME_SA" --display-name="${APP_NAME} Runtime SA" --project "$PROJECT_ID"
  echo "   ⏳ Waiting for SA propagation..."
  for i in 1 2 3 4 5 6; do
    if gcloud iam service-accounts describe "$RUNTIME_SA_EMAIL" --project "$PROJECT_ID" &>/dev/null; then echo "   ✅ created: $RUNTIME_SA_EMAIL"; break; fi
    if [ "$i" -eq 6 ]; then echo "   ❌ SA not visible after 60s — aborting. Re-run this script."; exit 1; fi
    sleep 10
  done
fi

# BINDING RETRY (field-proven: describe-visibility ≠ IAM-backend visibility). Idempotent —
# add-iam-policy-binding on an existing binding is a no-op success.
bind_secret_accessor() {
  local SECRET="$1" MEMBER="$2"
  for i in 1 2 3 4 5 6; do
    if gcloud secrets add-iam-policy-binding "$SECRET" --project "$PROJECT_ID" --member="$MEMBER" --role="roles/secretmanager.secretAccessor" --quiet &>/dev/null; then
      echo "   ✅ secretAccessor: $MEMBER → $SECRET"; return 0
    fi
    if [ "$i" -eq 6 ]; then echo "   ❌ ABORT: binding failed after 6 attempts: $MEMBER → $SECRET"; exit 1; fi
    echo "   ⏳ binding not accepted yet — retry $i/6 in 10s..."; sleep 10
  done
}

echo "🔑 Build SA bindings (build-time secrets)..."
# >>> ONE LINE PER secret with scope build|both; if none: echo "   ✅ None needed — no build-time secrets." <<<
# bind_secret_accessor "$SECRET_NAME_1" "serviceAccount:${BUILD_SA_EMAIL}"

echo "🔑 Runtime SA bindings (runtime secrets)..."
# >>> ONE LINE PER secret with scope runtime|both <<<
# bind_secret_accessor "$SECRET_NAME_1" "serviceAccount:${RUNTIME_SA_EMAIL}"

# --- VERIFICATION (never prints values) ---
echo ""
echo "=================================================="
echo "🔍 VERIFICATION"
echo "=================================================="
MISSING=0
# >>> FOR EACH SECRET: <<<
# if [ -n "$(gcloud secrets versions list "$SECRET_NAME_1" --project "$PROJECT_ID" --filter='state:ENABLED' --format='value(name)' 2>/dev/null)" ]; then
#   echo "   ✅ $SECRET_NAME_1: enabled version present"
# else
#   echo "   ⚠️  $SECRET_NAME_1: NO VALUE YET — {UPLOAD_HINT}"; MISSING=$((MISSING+1))
# fi
gcloud iam service-accounts describe "$RUNTIME_SA_EMAIL" --project "$PROJECT_ID" --format="value(email)" >/dev/null && echo "   ✅ Runtime SA: $RUNTIME_SA_EMAIL"
echo ""
if [ "$MISSING" -gt 0 ]; then
  echo "⏸  Init complete. $MISSING secret(s) still empty → YOUR move: {UPLOAD_HINT}   (then the agent continues)"
else
  echo "✅ Init complete. All secrets hold a value. Next: ./deploy.sh"
fi
echo "=================================================="
```

### init-app.sh Generation Rules **[AUTO]**

- Numbered `SECRET_NAME_n` variables, one per `secrets.items[]` entry, in config order — reuse them everywhere (single source of truth)
- Zero build-time secrets → the build-SA bindings section collapses to an explicit "None needed" echo
- Every guard BLOCKS (`exit 1`); infrastructure misses name the Path A step that fixes them; the Staging Rule miss prints the exact grant command but NEVER runs it
- `{UPLOAD_HINT}` is `run ./upload-secrets.sh` when `secrets.mode: helper`, and `add the value with the gcloud command the agent hands you` when `manual`
- Build SA resolution: `gcloud builds get-default-service-account --project P --region R` (explicit `serviceAccount:` in cloudbuild.yaml wins if present). Lookup errors are fatal and printed; the script never falls back to a derived compute-default email
- `bash -n init-app.sh` before the agent runs it
- Exit code 0 with "NO VALUE YET" lines is the normal first-run outcome — the agent then hands the helper to the operator

---

## Template 5: DEPLOYMENT_CHECKLIST.md **[AUTO — run record]**

In the auto skill the checklist is the **run record**: the agent writes it at generation with every value real, and ticks boxes as phases complete. Required sections: Config Summary (table from the approved plan) · Pre-Flight evidence (account, project, APIs, repo, Staging Rule — each with EVIDENCE/GAP) · Init results · Secret upload (per secret: enabled version yes/no, helper exit code) · IAM matrix (Actor B / Actor C × secrets) · Deploy result (build ID, status, LIVE NOW run.app URL, FINAL pending URL) · Access verification (invoker policy as read back) · **Handoff** (what remains: domain mapping + DNS + two-deploy if applicable — explicitly NOT done by this skill) · Day-two note (code change → `./deploy.sh`; new env var → edit `stark-deploy.yaml` → re-run skill; new secret → edit yaml → re-run skill → upload the value via helper or manual command).

---

## Template 6: upload-secrets.sh **[AUTO — new, operator-run]**

Canonical file: `../templates/upload-secrets.sh`. The agent copies it beside the other files and bakes exactly three things: `PROJECT_ID`, the default `ENV_FILE`, and the `MAPPING` array (`ENV_VAR=secret-manager-name`, one per `secrets.items[]` entry). Nothing else in the file changes.

Rules:
- The agent generates it, `bash -n` checks it, `chmod +x` it — and **never runs it**. It is the operator's one manual moment.
- The helper does not `source` or `eval` the env file. An embedded Python (`-I`) parser reads it and pipes each value straight into `gcloud secrets versions add … --data-file=-` via stdin — no trailing newline, no bash variable, no argv, no echo.
- Output per secret: ✅/❌ with the env key, the secret name, the value's character count, and on failure the gcloud exit code. **Never the value, and never raw gcloud stderr** (v1.1 — stderr can echo the payload). The failure line names the two likely causes and the describe command to check.
- Exit 1 if any required key is missing/empty or any upload fails. The summary states that successful uploads ABOVE are kept (a new version exists for them) and that re-running re-uploads every listed secret, which is safe.
- `secrets.mode: manual` → this file is NOT generated; every later step that touches it (`bash -n`, placeholder grep, `chmod`, `.dockerignore` entry, init's `{UPLOAD_HINT}`, Phase 3 handoff) must branch on its absence.
- Only when `secrets.mode: manual`: skip this file and hand the operator one `echo -n '…' | gcloud secrets versions add` line per secret, v3.1 style.
