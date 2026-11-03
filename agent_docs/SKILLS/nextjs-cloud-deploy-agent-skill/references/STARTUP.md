# Guided startup — mandatory on every activation

Pointing an agent at this folder is sufficient. Do not require a separate startup prompt, a prefilled config, or a prior cloud login. Read either CLAUDE.md or AGENTS.md, then SKILL.md, then this file before Phase 1. These v1.2 intake rules supersede older instructions that say to send the operator away to fill a template or log in before opening the agent. Deployment and secret safeguards remain in effect.

## 1. Locate the app and resume evidence

Identify the intended repository from the operator's working directory or supplied path. If the skill is stored under agent_docs/SKILLS, locate the enclosing repo rather than treating the skill folder as the app. If ambiguous, ask one short question. Inspect package.json, next.config.*, current branch/full SHA, git status, existing deployment files and deployment recovery records. Do not switch branches, pull, commit or push unless the operator explicitly delegates Git. For a certified candidate, record its decision/binding and compare the selected deployment inputs; do not claim certification transfers to changed inputs. Report unrelated local changes; never discard them.

## 2. Discover and explain configuration

Look for stark-deploy.yaml beside package.json. Read it if present; do not silently choose an example config. Read CONFIG_SCHEMA.md and inspect actual source env-var names (exclude dependencies, generated output, agent_docs, and all .env* contents). Examples demonstrate structure only, never establish live target values.

If absent, say where the config belongs and conduct the intake yourself. Offer to create it from templates/stark-deploy.yaml using the operator's answers. If incomplete, list the missing or conflicting fields together, explain them simply, and collect only unresolved answers. Do not say merely 'fill the file and call me again'.

Present a short table: field, discovered/proposed value, needs confirmation. Cover app/resource name, existing GCP project ID, region, expected login account, service name, public/private access, custom-domain choice, public environment values, secret NAMES/scopes, and runtime sizing. Explain that a '-prod' resource suffix does not establish the environment; explicitly establish staging or production. Reuse verified facts and schema defaults; never guess account, project, exposure, domain or secret values. Public values must be intentionally supplied as public; never retrieve them from .env files. An existing project is required; project bootstrap remains out of scope.

Before creating or editing root stark-deploy.yaml, show the proposed nonsecret config or exact changes and ask for confirmation. The operator's instruction to save those values authorizes that config write only, not deployment. Preserve unrelated config fields. Never put private values in it. If the operator prefers manual editing, guide them and reread afterward. Config drafting and response/session records are the only pre-plan write exceptions; deployment-file generation and cloud changes still wait for the deployment plan approval.

## 3. Check cloud CLI and guide browser login

Check gcloud availability, active account and configured project using read-only commands. If the CLI is missing, explain that and provide environment-appropriate installation guidance; do not silently install software. If signed in, reuse the operator's credentials: no new agent identity, key file or unnecessary repeat login.

If no account is active or the session is expired, give this operator-run command:

```bash
gcloud auth login
```

Explain: run it in your terminal, finish Google's browser login, and tell me when done. Remain in the same workflow; do not require a new agent session. Never request passwords, browser authorization codes or access tokens in chat. Do not execute interactive login yourself. ADC login is not required for ordinary gcloud deployment commands; do not add it by default.

After the operator reports completion, rerun account discovery and a read-only query against the intended project. A listed account alone does not prove project permissions. If the active account is wrong, provide operator-run gcloud config set account ACCOUNT using the confirmed account. If desired, provide gcloud config set project PROJECT_ID after the target is confirmed; still use explicit --project and --region in deployment queries/actions. Never silently change identity or target. Authentication does not grant missing permissions and does not override local agent-tool approvals. Report permission errors separately.

## 4. Continue without routine handoffs

Once config and login are ready, continue directly into Phase 1 validation and the concrete deployment plan. Do not ask 'shall I continue?' between routine checks. Write the plan artifact, present account/project/region/service/access, reuse/create actions and outstanding issues, then request the existing deployment approval. Do not treat intake answers, login completion or config-save confirmation as deployment approval.

The only normal human actions are missing intake answers/config confirmation, browser login if needed, deployment-plan approval, and the operator-run secret upload when required. If there are zero configured secrets, skip the empty secret-upload handoff and state why. For existing secrets, verify metadata and ask whether to retain existing versions or upload replacements; never overwrite values merely because this is a rerun. No extra routine QA campaign. Finish with deployment evidence and the established not-done list; Gate D stays with the QA authority.

## 5. Recovery

Record confirmed nonsecret config path, target, source SHA, last completed phase and next action in the response/session record. After interruption, reread the record and verify current identity and cloud state. Preserve valid approvals for the same concrete scope; obtain revised approval if target, exposure or resource changes exceed that scope. Never record tokens or private values.
