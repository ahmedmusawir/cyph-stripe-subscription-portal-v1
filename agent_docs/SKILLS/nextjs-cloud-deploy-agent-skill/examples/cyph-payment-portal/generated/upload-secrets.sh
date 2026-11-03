#!/bin/bash
# ==================================================================
# STARK FACTORY — Secret Value Upload Helper
# App: CyPh Payment Portal v1 | Project: cyberize-nextjs-staging
#
# YOU run this. The agent never does. It reads .env.local in YOUR terminal,
# and pushes each listed value into its Secret Manager slot. Nothing is
# printed, logged, or exported. Re-running adds a new version (safe).
#
# Exit 0  = every listed secret uploaded.
# Exit 1  = at least one missing key or failed upload. Output shows secret NAME + gcloud
#           exit code only — never the value, never raw gcloud error text.
# ==================================================================
set -euo pipefail
set +x   # never trace this file

PROJECT_ID="cyberize-nextjs-staging"
ENV_FILE="${1:-.env.local}"

# ENV_VAR=SECRET_MANAGER_NAME — one per secret, baked at generation.
# >>> GENERATE ONE LINE PER secrets.items[] ENTRY <<<
MAPPING=(
  "STRIPE_SECRET_KEY=cyph-payment-portal-stripe-secret-key"
  "STRIPE_WEBHOOK_SECRET=cyph-payment-portal-stripe-webhook-secret"
  "SUPABASE_SECRET_KEY=cyph-payment-portal-supabase-secret-key"
)

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ env file not found: $ENV_FILE"; exit 1
fi
command -v python3 >/dev/null || { echo "❌ python3 is required (dotenv parsing)"; exit 1; }
command -v gcloud  >/dev/null || { echo "❌ gcloud not on PATH"; exit 1; }

echo "=================================================="
echo "🔐 Uploading secret values → project $PROJECT_ID"
echo "   source: $ENV_FILE   secrets: ${#MAPPING[@]}"
echo "=================================================="

# Python does the parsing AND the upload so values never land in a bash variable,
# never hit argv, and never get echoed. -I = isolated mode (ignores cwd modules).
python3 -I - "$PROJECT_ID" "$ENV_FILE" "${MAPPING[@]}" <<'PY'
import re, subprocess, sys

project, env_path, *mapping = sys.argv[1:]

# --- minimal dotenv parser: KEY=value | export KEY=value | quotes | # comments ---
LINE = re.compile(r"""^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$""")
def parse(path):
    out = {}
    with open(path, encoding="utf-8") as fh:
        for raw in fh:
            line = raw.rstrip("\n")
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            m = LINE.match(line)
            if not m:
                continue
            key, val = m.group(1), m.group(2)
            if val[:1] in ("'", '"'):
                quote = val[0]
                end = val.find(quote, 1)
                while quote == '"' and end != -1 and val[end-1] == "\\":   # skip escaped quotes
                    end = val.find(quote, end + 1)
                if end == -1:
                    continue                           # unterminated quote: skip line
                inner = val[1:end]                     # anything after the closing quote is ignored
                val = inner.replace('\\n', '\n').replace('\\"', '"') if quote == '"' else inner
            else:
                val = val.split(" #", 1)[0].rstrip()   # unquoted: strip trailing comment
            out[key] = val
    return out

env = parse(env_path)
failures = 0
ok = 0

for pair in mapping:
    key, secret = pair.split("=", 1)
    val = env.get(key)
    if val is None or val == "":
        print(f"   ❌ {key:<38} missing or empty in env file  → {secret}")
        failures += 1
        continue
    # echo -n semantics: no trailing newline (a newline silently corrupts API tokens).
    r = subprocess.run(
        ["gcloud", "secrets", "versions", "add", secret, "--data-file=-", "--project", project, "--quiet"],
        input=val.encode("utf-8"), capture_output=True)
    if r.returncode == 0:
        print(f"   ✅ {key:<38} → {secret}  ({len(val)} chars)")
        ok += 1
    else:
        failures += 1
        # gcloud stderr is NEVER printed: it can echo the submitted payload. Exit code + name only.
        print(f"   ❌ {key:<38} → {secret}  gcloud exit {r.returncode}")
        print(f"      likely: secret does not exist in {project}, or your account lacks Secret Manager")
        print(f"      Secret Version Adder on it. Check: gcloud secrets describe {secret} --project {project}")

print("==================================================")
if failures:
    print(f"❌ {failures} of {len(mapping)} NOT uploaded ({ok} succeeded and are KEPT — a new version exists for those).")
    print("   Fix the cause and re-run; re-running re-uploads every listed secret, which is safe.")
    sys.exit(1)
print(f"✅ All {ok} secret values uploaded. Tell the agent: secrets done.")
PY
