#!/bin/bash
set -euo pipefail

# ==================================================
# STARK FACTORY — App Deployment Script
# App: CyPh Payment Portal v1
# ==================================================

# --- CONFIG (from stark-deploy.yaml) ---
PROJECT_ID="cyberize-nextjs-staging"
REGION="us-east1"
SERVICE_NAME="cyph-payment-portal-prod"

# --- PUBLIC VARIABLES (REAL VALUES BAKED AT GENERATION) ---
NEXT_PUBLIC_APP_URL="https://payment-portal.cyberizedev.com"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_REPLACE_WITH_REAL_PUBLISHABLE_KEY"
NEXT_PUBLIC_SUPABASE_URL="https://REPLACE.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_REPLACE"

# --- GUARDS (sit AFTER the last variable definition, BEFORE the execution banner) ---
# PLACEHOLDER_PATTERN is the canonical list (references/CONFIG_SCHEMA.md "Placeholder formats").
# Matched case-insensitively against EVERY public value, one per line, so one bad value aborts.
PLACEHOLDER_PATTERN='REPLACE|CHANGE[-_]?ME|FIXME|TODO|PLACEHOLDER|INVALID://|<[^>]+>|XXXX|example\.com|your[-_]'
if printf '%s\n' "$NEXT_PUBLIC_APP_URL" "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "$NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" | grep -Eiq "$PLACEHOLDER_PATTERN"; then
  echo "❌ ABORT: a public var still holds placeholder text — fix stark-deploy.yaml and regenerate. Offending value(s):"
  printf '%s\n' "$NEXT_PUBLIC_APP_URL" "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "$NEXT_PUBLIC_SUPABASE_URL" "$NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY" | grep -Ei "$PLACEHOLDER_PATTERN" | sed 's/^/   /'
  exit 1
fi

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
# STRING-BUILDER PATTERN — one += per public var, never ,\ continuations.
SUBSTITUTIONS="_REGION=${REGION}"
SUBSTITUTIONS+=",_SERVICE_NAME=${SERVICE_NAME}"
SUBSTITUTIONS+=",_NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}"
SUBSTITUTIONS+=",_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}"
SUBSTITUTIONS+=",_NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}"
SUBSTITUTIONS+=",_NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY}"

gcloud builds submit \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --config cloudbuild.yaml \
  --substitutions "$SUBSTITUTIONS"

echo "=================================================="
echo "✅ Deployment Sequence Complete."
echo "   Service:  $SERVICE_NAME"
RUN_APP_URL="$(gcloud run services describe "$SERVICE_NAME" --project "$PROJECT_ID" --region "$REGION" --format='value(status.url)')"
echo "   LIVE NOW (run.app):            $RUN_APP_URL"
echo "   FINAL (after DNS/SSL, pending): $NEXT_PUBLIC_APP_URL"
echo "=================================================="
