# E1 review — FFM-ABM-001-SUBSCRIPTION-PORTAL

**Status:** E1 complete. Plan returned for Architect review and Director approval. No product code changed.

**Package:** `/home/moose/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_v1_0.zip`. SHA-256 matches the supplied value, and 391/391 FILE_INDEX entries match in size and hash, both before and after install.

**Installed at:** `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/`. ACTIONS was empty and CURRENT_APP was absent, so nothing was overwritten. The relocation is recorded as RULINGS R-007. 8 active/mutable files changed and 2 evidence files were added. Current hashes are in `EVIDENCE/INSTALLED_FILE_MANIFEST.json`; `FILE_INDEX.json` is unchanged.

**Bridge:** new `agent_docs/PROJECT_POINTER.md`, plus a 6-line scoped pointer at the top of root `CLAUDE.md`.

**Repository:** `main` @ `1d15918dc20d80476d6a3cb017b10179f3ddf783`. HEAD equals the foundation commit, ahead of origin by 1. 71 deleted files under `agent_docs/CURRENT_APP/super_admin_portal_phase1_ffm/` were already in the tree; they are not mine and are left as they are.

**Baseline**

| Check | Result |
|---|---|
| tsc | exit 0 |
| jest | 8/8 |
| build (clean HEAD copy) | exit 0, 8 routes |
| lint | not configured: `next lint` is gone in Next 16 and eslint is not installed |
| npm audit | 3 advisories, including zod high |

**Plan:** `EXECUTION_PLAN.md`
- Real staff gate unchanged, with a per-page re-check that calls the same function.
- One mock service engine with an injected clock, quote revisions and operation keys.
- Synthetic personas in per-tab sessionStorage, cleared on reset, logout and identity change.
- The 17 contract routes in three nested route groups; URLs unchanged.
- Tokens, Button and Pill changes; manifest components; Gate M at 375/767/768/1023/1024/1440 in both themes.
- Jest service and component tests, plus Playwright on system Chrome on port 3001.

**Exceptions to approve:**
- X1: per-page gate re-check.
- X2: fallback Playwright browser download.
- X3: rework Shell and move the dashboard file.
- A-1: plain service validators instead of react-hook-form and zod.

**Blockers**

| ID | Issue | Blocks | Needs |
|---|---|---|---|
| B1 | Branch `ffm-abm-001-subscription-portal` does not exist. The contract says E2 waits for it. | All E2 product writes | Tony creates it and decides about the 71 deletions |
| B2 | The `.env.local` Supabase ref equals the Mission Control ref in historical docs. | Real-auth network probes | Confirm it is the shared Cyber Pharma dev project |
| B3 | No reviewer identity (`.env.qa.local` absent), and the inherited credential is exposed. Every demo route sits behind the superadmin gate. | Authenticated journeys and Gate M in the real app | Rotated or new superadmin credential, or one headed sign-in by Tony; optionally a non-superadmin identity for the negative check |
| B4 | PID 40320, a `next-server` on :3457 started 26 Oct 17:04 from this repo, serves `.next`. | Nothing, if permission is given | May I stop it? |

**Review ZIP:** `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/EVIDENCE/FFM-ABM-001-SUBSCRIPTION-PORTAL_E1_REVIEW_001.zip`, with a byte-identical copy in `/home/moose/Downloads/`.

**Decision needed:** approve the plan, including X1–X3 and A-1, and resolve B1–B4.
