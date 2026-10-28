# Stale-instruction check (R-009) — 27 Oct 2026
Method: case-insensitive grep of every **active** instruction/contract file. That means module entry files, `STATE`, `EXECUTION_PLAN`, `ACCEPTANCE_SPEC`/ledger, `SKILLS_MANIFEST`, `_project/*`, `playbook/*`, `verification/{BUILD_CHECKLIST,PHASE_GATES,EXPORT_CONTRACT}`, the QAM entry/preflight/risks/manifest/state/test plan/handoff, `agent_docs/PROJECT_POINTER.md`, and root `CLAUDE.md` and `RECOVERY.md`. Excluded as preserved history: `_design/**` (received design bytes), `_extraction/**`, `QAM/GOVERNING/**`, `skills/**`, the E1 evidence/review ZIP, `RULINGS.md` (append-only), `JOURNAL.md`, `INSTALL_RECORD.md`, and `FILE_INDEX.json`.

| Retired requirement (R-009) | Patterns searched | Active hits after reconciliation |
|---|---|---|
| All demo routes behind a staff/superadmin gate | `superadmin gate`, `staff gate`, `staff-only`, `behind the.*gate`, `protected reviewer`, `reviewer harness`, `demo URLs remain gated` | 2 hits, both the NEW rule ("account management behind the real admin/superadmin gate"). One stale "reviewer harness" step in EXECUTION_PLAN §5 → **fixed**. |
| Anonymous registration redirects to login | `redirect.*/dashboard`, `Staff preview`, `Already a member` | 3 hits, all describing the replaced interim redirect or the new `/` → plan rule |
| Admin accounts rejected | `temporarily admits only`, `super-admin-only`, `superadmin-only`, `admins? .*rejected`, `non-superadmin` | none |
| Real superadmin reviewer plus a second real account | `REVIEWER_EMAIL`, `NONOWNER` (env names), `real superadmin reviewer`, `second real account` | `NONOWNER` hits are the synthetic non-owner persona (kept). `second real account` hits all say "no second real account is required". |
| Product code | `getSuperAdminUser`, `SuperAdminUser`, `isSuperAdmin`, `=== 'superadmin'` literals in `src/` | none. `portal-boundaries.test.ts` enforces "no role literal outside the shared rule". |

Residual by design: `EXECUTION_PLAN.md:12` mentions `getSuperAdminUser()` as the former name ("was …"). The received `_design/approved_v1_0/UI_SPEC.md` keeps "Already a member? Sign in". The active `_project/UI_SPEC.md` says "Already subscribed? Sign in" (R-009).
