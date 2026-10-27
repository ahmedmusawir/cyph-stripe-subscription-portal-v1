# E1 recon — facts on disk
Module FFM-ABM-001-SUBSCRIPTION-PORTAL v1.0 · Engineer: Claudy (Claude Code, Opus 5.5) · 27 Oct 2026, 12:3x–13:xx Asia/Dhaka
Launch CWD: `/home/moose/NEXTJS/CYBER_PHARMA/cyph-stripe-subscription-portal-v1` (repository root).
Labels: **EVIDENCE** = observed by command in this session · **INFERENCE** = reasoned from evidence · **GAP** = not verifiable here.
These are Engineering claims, not independent QA.

## 1. Package verification (before any edit)
| Check | Result |
|---|---|
| Archive | `/home/moose/Downloads/FFM-ABM-001-SUBSCRIPTION-PORTAL_v1_0.zip`, 80,125,281 bytes, mtime 27 Oct 12:36 |
| SHA-256 | `5c0ad43a4682d85b7b357cad50d3299df9b6c33d30f94d81e62cde35be97372e`. **EVIDENCE: matches the Director-supplied value.** |
| Members | 392 files, single top folder `cyph_subscription_portal_phase1_ffm_abm/`, no absolute or `..` paths, no symlinks |
| FILE_INDEX.json | `index_excludes_self: true`; 391 entries; every entry present, size equal and SHA-256 equal; 0 unindexed files except the index itself; `source == path` for all 391 |
| Extraction | isolated scratch directory; verifier script kept outside it and run with `python3 -I` |
| After install copy | the same 391/391 match at `agent_docs/ACTIONS/cyph_subscription_portal_phase1_ffm_abm/` before any edit |

## 2. Repository identity (read-only Git)
| Fact | Value |
|---|---|
| Branch | `main`; `main...origin/main [ahead 1]` (push not evidenced, consistent with R-003) |
| HEAD | `1d15918dc20d80476d6a3cb017b10179f3ddf783` "chore: prepare subscription portal foundation from Mission Control" (Ahmed Rahat Musawir, 2026-10-27 08:51 +0600) |
| Foundation | `1d15918` resolves to the same full SHA; **HEAD == foundation** (`git diff --quiet 1d15918 HEAD`) |
| Parents | `b016324…` "26oct2026 - init" → `1df2a7b…` "Initial commit" |
| origin/main | `b0163249cc71ad7685b77e8e7a6e27e2c433bf5a` |
| Designated E2 branch `ffm-abm-001-subscription-portal` | **absent** (local and remote) |
| Working tree at E1 start | 71 entries, all ` D` under `agent_docs/CURRENT_APP/super_admin_portal_phase1_ffm/` (the old Mission Control FFM). `agent_docs/CURRENT_APP/` no longer on disk. **Not made by this session**; INFERENCE: Director-side removal (dir mtime 12:39). Preserved untouched. |
| Untracked at E1 start | none; `agent_docs/ACTIONS/` existed **empty** (untracked dirs do not show) |
| Product source vs foundation | zero changes outside `agent_docs/CURRENT_APP/` |
| Stashes | 0 |
| Lockfile | committed in `1d15918`; no working-tree diff |

## 3. Toolchain and installed versions (from node_modules, not ranges)
Node v22.17.0 · npm 11.15.0 · next 16.4.3 · react/react-dom 19.2.4 · typescript 5.5.4 · tailwindcss 3.4.6 · @supabase/ssr 0.6.1 · @supabase/supabase-js 2.106.1 · zustand 4.5.4 · react-hook-form 7.52.1 · zod 3.25.76 · @hookform/resolvers 3.9.0 · next-themes 0.4.6 · lucide-react 1.16.0 · jest 30.4.2 · ts-jest 29.4.11 · jest-environment-jsdom 30.4.1 (jsdom 26.1.0) · @testing-library/react 16.3.2 · @playwright/test 1.59.1 · stripe 22.1.0 (installed, **not imported anywhere in src**) · eslint **absent**.

Browser driver: Playwright 1.59.1 expects Chromium build 1217 at `~/.cache/ms-playwright/chromium-1217`; the cache holds only `chromium-1194` (older). System Google Chrome is present at `/usr/bin/google-chrome`. No `playwright.config.*` exists.

## 4. Baseline gates (E1, HEAD == foundation)
| Command (CWD = repo root unless stated) | Exit | Result |
|---|---|---|
| `npx tsc --noEmit` | 0 | clean |
| `npx jest` | 0 | 2 suites, 8/8 (`get-user-role.test.ts`, `proxy.test.ts`) |
| `npm run lint` (`next lint`) | 1 | "Invalid project directory provided, no such directory: …/lint". `next lint` was removed in Next 16 and eslint is not installed. **LINT NOT CONFIGURED** (inherited) |
| `next build` on a `git archive HEAD` copy in scratch (own node_modules copy, placeholder Supabase env, no `.env.local`) | 0 | 8 routes: `/`, `/_not-found`, `/api/auth/{confirm,login,logout}`, `/dashboard`, `/icon.png`, `/login` + Proxy |
| `npm audit --json` | — | 3 advisories: zod **high** ("memory exhaustion validating oversized constrained collections", fix only via zod 4), postcss-selector-parser moderate (through @tailwindcss/typography). The cleanup report had 5; the advisory data changed, not the lockfile. |

The build ran in a copy because the repo's `.next/` is being served by PID 40320 (§7).

## 5. Auth, gate and session primitives (unchanged since cleanup)
- `src/proxy.ts`: matcher covers all non-static paths and calls `updateSession`. `src/utils/supabase/middleware.ts` refreshes via `auth.getUser()` and **does not redirect** ("let layouts handle auth").
- `src/app/(portal)/layout.tsx`: `getSuperAdminUser()`; null → `redirect("/login")`; renders `<Shell user={{displayName,email}}>`. TEMPORARY superadmin-only comment present.
- `src/services/auth/session.ts`: `auth.getUser()` → `getUserRole()` (`public.user_roles`) → `superadmin` check → `SuperAdminUser {id,email,displayName,isSuperAdmin:true}`.
- `src/app/api/auth/login/route.ts`: POST only (GET removed in cleanup → 405). `logout/route.ts`: POST `signOut()` + `revalidatePath('/', 'layout')`. `confirm/route.ts` unchanged.
- `src/app/login/LoginPageContent.tsx`: POSTs `/api/auth/login`; rejects non-superadmin by logging out again; pushes `/dashboard`.
- Shell signs out with `fetch('/api/auth/logout', {method:'POST'})`, then `/login`.
- INFERENCE (App Router semantics): a parent layout is not re-executed on client-side navigation between its children. The layout gate covers every direct request and reload. A page-level re-check closes the soft-navigation gap (plan §4.1).

## 6. Auth target and credentials (names and shapes only; no values printed)
- `.env.local`: present, ignored by `.gitignore:28 .env*.local`, untracked. Keys set: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_ENABLE_MOOSE_PORTAL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (sb_-prefixed), `SUPABASE_SECRET_KEY` (sb_-prefixed; consumed only by unused `utils/supabase/admin.ts`), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY` (test-mode prefix), three `STRIPE_PRICE_*`, `STRIPE_WEBHOOK_SECRET`. Stripe values are present but no source imports Stripe.
- `NEXT_PUBLIC_SUPABASE_URL` is a standard `https://<20-char-ref>.supabase.co`. **The ref equals the only Supabase ref recorded in historical Mission Control agent_docs.** GAP: whether that project *is* the shared Cyber Pharma dev project named in R-003 cannot be proven locally (no network probe made). See blocker B2.
- QA/reviewer credential file `.env.qa.local`: **absent**. No authorized reviewer or non-superadmin negative identity is available to Engineering. The inherited exposed credential is not used (README, IMPLEMENTATION_CONTRACT §6). See blocker B3.
- No network auth request was made in E1. No sign-in count to report.

## 7. Processes and ports
- PID **40320** `next-server (v16.4.3)` listening on `*:3457`, CWD = this repo, started **2026-10-26 17:04**, parent = user systemd. Owner unrecorded. INFERENCE: it may be a leftover from the cleanup smoke test. Not stopped (never stop an unrelated process). It serves the repo's `.next/`; an E2 build in place would replace those files under it (blocker B4).
- Ports 3000 and 3001 free → E2 uses **3001**.

## 8. Packaging hygiene
- `tsconfig.json` already excludes `agent_docs/**` and `_SKILLS/**`. **No tsconfig change needed.** Module `.ts` files (`_project/portal-contract.ts`, design `tokens/tailwind.config.ts`) are therefore not compiled. Jest `roots: ['<rootDir>/src']` → agent_docs never collected.
- `.dockerignore` absent. Dockerfile unchanged since cleanup; deploy stubs exit 1.
- `.gitignore`: has `.env*.local` (covers `.env.qa.local`), `/coverage`, `/.next/`. Lacks Playwright outputs and auth-state paths.

## 9. Design inputs vs repo
- `tokens/globals.scss` vs `src/app/globals.scss`: exactly the six portal value changes in DECISIONS_AND_DELTAS §5, plus the header comment. Nothing else differs.
- `tokens/tailwind.config.ts` is **byte-identical** to repo `tailwind.config.ts`.
- Kit deltas still to apply: `ui/button.tsx` outline is `border-4`, default height `h-10`, no primary hairline. `portal/Pill.tsx` TONE uses tinted bg + tone text (manifest wants foreground text + tone border).
- `Shell.tsx` is a 248px left rail + Sheet. The design wants top bar + centered content, with the left Sheet kept for mobile.
- Primitives present: alert-dialog, breadcrumb, button, dialog, dropdown-menu, input, label, separator, sheet, skeleton, table, textarea, toast/toaster/use-toast; portal DataTable/EmptyState/Pill/Shell; ThemeToggler; SpinnerLarge. **Absent** (manifest declares as new): Alert, FormField, ErrorSummary, RadioCard, Stepper, Counter, ExternalHandoffPanel.

## 10. Skills and activation
- Read sequence this session: root `CLAUDE.md` (auto-loaded by the harness as project instructions) → module `CLAUDE.md` → `FFM_ENTRY.md` → read-order docs 1–6 (STATE, RULINGS, APP_BRIEF, DATA_CONTRACT, IMPLEMENTATION_CONTRACT, portal-contract.ts, UI_SPEC, COMPONENT_MANIFEST, DECISIONS §5, ACCEPTANCE_SPEC, SKILLS_MANIFEST, playbook 00–07, PHASE_GATES, BUILD_CHECKLIST, EXPORT_CONTRACT, QAM_PREFLIGHT, QAM_RISK_REQUIREMENTS, QAM_MANIFEST, ENGINEERING_HANDOFF, QAM_STATE, _extraction/README). First read from the verified extract, then confirmed from the installed copy after install.
- Harness skill list shows `stark-frontend-first` **from `agent_docs/.claude/skills/`** (the repo copy). That copy **differs** from the module's byte-preserved `skills/stark-frontend-first/` in `references/ANTI_PATTERNS.md`. Module copy + SKILLS_MANIFEST govern. The repo copy is not edited.
- Root instruction files: `CLAUDE.md` (pointer added) and `WINDSURF.md` (Windsurf rules, not this tool's instructions; unchanged). No root `AGENTS.md`/`GEMINI.md`, and none were created.

## 11. Drift vs supplied recon/cleanup
| Supplied claim | Disk now | Disposition |
|---|---|---|
| Cleanup left the tree uncommitted, 93 entries | committed as `1d15918` | resolved by Director |
| npm audit 5 advisories | 3 | data drift only |
| `agent_docs/CURRENT_APP/` retains design refs | deleted in working tree (uncommitted) | Director's dirt; preserved |
| `.next` stale-validator trap (L25) | not triggered (`.next` built from the same tree) | keep `rm -rf .next` before typecheck in E2 after route moves |
