# v1.2 revision — 2026-11-03

Purpose: make folder-only activation sufficient for guided configuration and cloud-login readiness.

Changed: SKILL.md, CLAUDE.md, AGENTS.md, README.md, references/CONFIG_SCHEMA.md, references/ANTI_PATTERNS.md, templates/stark-deploy.yaml. Added references/STARTUP.md and this report.

The agent now discovers the app, explains missing configuration, collects unresolved answers, shows nonsecret config changes before saving, guides operator-run browser login, verifies identity and project access, and continues to the existing deployment-plan approval. It retains Git ownership with the operator unless delegated. Zero-secret runs skip an empty upload handoff; existing secret versions require a retain/replace decision.

Checks: identical CLAUDE.md/AGENTS.md; original executable templates, TEMPLATES.md and generated examples byte-identical; independent read-only missing-config/missing-login walkthrough completed. Clarified plan-artifact timing after walkthrough. No cloud commands or deployments performed, no application changes and no QA certification claimed.

Install: overlay this folder into agent_docs/SKILLS/nextjs-cloud-deploy-agent-skill/. Keep existing examples/templates. Preserve root application stark-deploy.yaml if already present; this archive contains no root application config. REPAIR_REPORT_v1.1.md is retained as history. This is a replacement package for the local skill, not a ChatGPT skill installation.
