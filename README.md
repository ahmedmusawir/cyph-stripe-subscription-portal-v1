# cyph-stripe-subscription-portal-v1

Cyber Pharma **Subscription Portal** — foundation state (2026-10-26). Cloned from the
Mission Control FFM, then cut back to a minimal buildable base for Designer-approved FFM work.

## Stack (installed)
Next.js 16.4 (App Router, `src/proxy.ts`) · React 19.2 · TypeScript 5.5 · Tailwind **3.4** (HSL
tokens in `src/app/globals.scss`, class dark mode via `next-themes`, Saira) · shadcn primitives
(`src/components/ui`) · Supabase (`@supabase/ssr`) · Jest 30.

## What exists
- `/login` → real Supabase email+password sign-in (`POST /api/auth/login`), logout, email-confirm handler.
- `/dashboard` → placeholder inside the reusable shell (rail ≥ md, drawer < md, theme toggle).
- `/` → 307 to `/dashboard`.
- **Temporary auth gate:** `src/app/(portal)/layout.tsx` only admits `user_roles.role = 'superadmin'`.
  Customer authorization is deliberately NOT implemented; it is specified in the FFM.
- Service layer / mock data: none yet (removed with Mission Control). The FFM re-establishes them.

## Run
```bash
cp .env.example .env.local   # then fill the two REQUIRED Supabase values
npm ci
npm run dev
```
Verification: `npx tsc --noEmit` · `npm test` · `npm run build`.

## Not configured
Deployment (`deploy.sh`, `cloudbuild.yaml`, `init-app.sh` are fail-safe stubs — see
`DEPLOYMENT_CHECKLIST.md`), Stripe, database schema (`supabase/` holds unverified reference SQL only).

## Working agreements
`CLAUDE.md` (factory doctrine) · `RECOVERY.md` (3-second state) · `agent_docs/SESSIONS/`,
`agent_docs/RESPONSES/`, `agent_docs/RECON/` (evidence trail).
