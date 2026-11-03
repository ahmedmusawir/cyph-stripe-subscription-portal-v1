# Next Deploy Auto — v1.2

Point your local deployment agent at this folder and tell it to follow the skill. No long startup prompt is needed.

The agent finds your app and stark-deploy.yaml, explains missing configuration, guides you through the answers, and saves confirmed nonsecret config. It checks cloud login and provides the browser-login command only when needed, then resumes in the same session.

It validates the target and presents the deployment plan for approval, generates the deployment files, guides any operator-run secret upload, deploys, and verifies access and the run.app response.

You retain Git control. The agent never reads .env contents or handles secret values. Existing deployment checks remain in place.

Scope: an existing bootstrapped Google Cloud project (Path B). Custom domains, DNS and Gate D certification remain separate. Start with CLAUDE.md or AGENTS.md (identical), then SKILL.md and references/STARTUP.md.

This revision changes startup instructions only; deployment scripts/templates are unchanged. Local instruction checks do not establish a successful cloud deployment.
