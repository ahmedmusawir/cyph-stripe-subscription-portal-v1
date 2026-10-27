# Deployment — NOT CONFIGURED

**App:** `cyph-stripe-subscription-portal-v1` · **Status (2026-10-26):** no cloud target.

This repo was cloned from the Mission Control FFM, whose `deploy.sh`, `cloudbuild.yaml`,
`init-app.sh` and checklist pointed at that app's **live** Cloud Run service. Those files
were replaced with fail-safe stubs (each prints "NOT CONFIGURED" and exits 1) so nothing
in this repo can deploy to, or reconfigure, the Mission Control service.

What remains:
- `Dockerfile` — generic multi-stage Next.js standalone image (unchanged, target-agnostic).
- `next.config.js` — `output: "standalone"` (required by the Dockerfile).

What does **not** exist yet (and must not be invented ad hoc):
- GCP project / region, Cloud Run service name, runtime service account
- Secret Manager entries, custom domain, DNS
- CI trigger

When the Subscription Portal reaches its deploy phase, author the pipeline fresh with the
cloud-deployment skill under `_SKILLS/CLOUD_DEPLOYMENT_SKILLS/`, with an explicitly approved
target. Do not resurrect the Mission Control values.
