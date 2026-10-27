# APP BRIEF — Cyber Pharma Subscription Portal

> Version: 1.0 · Date: 26 October 2026 (Asia/Dhaka)
> Status: DRAFT FOR DIRECTOR REVIEW — no approval is prefilled.
> Author: JARVIS, Architect · Director: Tony · Designer: Fable
> Repository: `cyph-stripe-subscription-portal-v1`
> Baseline: Claudy's 26 October recon and cleanup, based on `b0163249cc71ad7685b77e8e7a6e27e2c433bf5a` plus uncommitted cleanup and the pre-existing lockfile changes. This is not a committed cleanup revision.

## 1. Mission statement

Give pharmacy account owners a simple place to register their pharmacies, review subscription costs, add stores and reach Stripe's hosted billing tools. The first deliverable is an FFM: a convincing, clickable demonstration with mock business data, ready for Coach's review before real billing and provisioning are built.

OwedBook remains the product where pharmacy teams work. Mission Control remains an internal operations app. This portal owns the subscriber-facing registration and billing journeys. Marketing lives outside this module.

## 2. Hero action

An existing owner can understand their plan and store count, then choose **Add a store** or **Manage billing** within ten seconds. Completing registration and payment is a longer journey; it is not subject to that ten-second target.

## 3. User and auth scope

- Audience: pharmacy owners and the store administrators they nominate; ordinary team members only need a clear route back to OwedBook or to their owner.
- Technical level: business users; simple labels, explicit prices and clear next steps.
- Devices: desktop and mobile; 375px is the minimum design review width.
- Existing implementation: real Supabase password-login plumbing and server-side role lookup. The cleaned repo temporarily admits only `superadmin`. It has no customer account authorization or working cross-app SSO.
- Product intent: the owner controls billing for their account. A nominated store administrator manages that store in OwedBook; designation does not transfer ownership or grant billing permission. An owner may also be a store administrator.
- First-time entry: payment confirmation leads to an access email. A Stripe return alone never creates an authenticated customer session. Existing authenticated users should eventually move between OwedBook and this portal without another login.
- FFM boundary: registration, access-email sending, invitations, billing, entitlement changes and external-app transitions are simulated. The Designer represents these journeys; the FFM must label demonstrations honestly. Live SSO proof and production authorization are separate integration work and must not be certified from a mock transition.
- FFM access harness: retain the existing staff-only protection while designing customer personas with fixtures. Before engineering, the Architect must specify how reviewers select fixtures without giving arbitrary users real account access. Do not convert global `admin/member` roles into account ownership.

## 4. Complexity class

Small workflow app with an account summary. Full-stack web deployment class; frontend-first delivery. No AI, real-time collaboration, or internal operations console is needed. Mock activation progress is sufficient for the FFM.

## 5. Domain concepts

All objects below are PROPOSED MOCK VIEW MODELS, not declarations of existing database tables. `DATA_CONTRACT.md` defines them.

| Object | Purpose | Lifecycle |
|---|---|---|
| Billing account | Connects the owner, subscription and covered pharmacies | Draft → pending → active; billing exceptions represented separately |
| Plan | Describes the offer, billing interval and included store allowance | Configured fixture; commercial details pending |
| Pharmacy | Business details and administrator assignment | Draft → payment pending → provisioning → active/attention |
| Subscription | Account-level coverage and billing state | Pending → active/past due/cancellation scheduled/canceled |
| Quote | Shows current price, new price and any amount due today | Loading → ready → accepted/expired/error |
| Registration draft | Collects owner and pharmacy information before payment | Editing → ready → checkout pending/completed/abandoned |
| Admin invitation | Gives a nominated administrator store access | Not needed/pending/accepted/expired |

Do not combine invitation status, subscription status and store activation into one ambiguous status value.

## 6. Scope locks

### In scope for this FFM

1. New-owner journey: plan → owner details → pharmacy details → review/consent → simulated Stripe Checkout → activation status → access-email preview.
2. Account & Billing summary: plan, subscription state, covered pharmacies, next payment, owner identity, Add a store and Manage billing actions.
3. Add-store journey: details/admin → price review and consent → simulated payment outcome → pending/added outcome → OwedBook return handoff.
4. Stripe Customer Portal handoff for hosted billing management. Our summary does not duplicate editable card forms, invoice-download machinery, or cancellation processing.
5. Abandoned checkout, duplicate pharmacy, expired access link, payment failure, activation delay/failure and denied billing access states.
6. OwedBook entry/return reference panels and email previews sufficient to explain the whole journey. They are external-surface references, not a rebuild of OwedBook or an email service.
7. Login visual adaptation and authenticated/unauthenticated navigation states, without assuming missing password-reset, MFA or account-provisioning integrations already exist.
8. Both Mist and Slate, responsive behavior, keyboard access, visible focus, field errors, loading and retry states.

### Out of scope for this FFM

1. Live Stripe calls, webhooks, charges, refunds or real subscription changes.
2. Database migrations, live business-data reads/writes and production tenant authorization.
3. Sending email, creating accounts, inviting real users or changing real permissions.
4. Working cross-app SSO, shared-cookie rollout or changes to the OwedBook repository.
5. Marketing-site build, Mission Control screens, staff support tools and operational reporting.
6. Claims, prescriptions, patient information, pharmacy software connections and NPI ownership verification.
7. Custom replicas of Stripe Checkout or Customer Portal, including a custom cancellation wizard.
8. Production password/MFA enrollment, deployment and cloud infrastructure changes.

## 7. Success definition

Demo in three steps:

1. Walk a prospective owner through registration, the Stripe boundary, activation and access-email preview.
2. Show the owner's account summary, add a pharmacy, review the quoted change, and demonstrate success and payment failure without a premature store activation.
3. Show an account billing issue and the Stripe handoff; then show how a non-owner is directed to the owner without seeing billing controls.

Acceptance outcomes for the later FFM contract:

- Every Coach board is mapped in `DESIGNER_HANDOFF.md`; no board vanishes without a stated disposition.
- Every primary control works within the mock journey or explicitly represents an external handoff.
- Editing earlier steps preserves entered values; failed submissions preserve drafts.
- No billing mutation is shown as complete just because a user clicked a button or returned from a hosted page.
- No real card fields, patient data, credentials, production emails or charges are needed for review.
- Amounts, store counts, invitation states and completion messages stay consistent across the demonstration.
- An owner and nominated administrator have distinct, understandable outcomes.
- The canonical page and required states are readable in both themes and at 375px and desktop widths.
- The eventual module remains an FFM, with its existing naming convention, an ACCEPTANCE_SPEC and module-specific QAM. ABM-style execution does not rename it ABM. Later ABMs/APBMs replace BIM work for this project.

## 8. Planning state

| Item | Type | Direction / owner |
|---|---|---|
| Mission Control clone as base | Director decision | Cleaned foundation is the starting point. |
| Shared Cyber Pharma dev Supabase | Director decision | Keep the shared project; commented demo env blocks do not reopen this decision. Live DB state is unverified. |
| Coach account-level multi-store billing | Director provisional decision | Use for design/FFM while Coach answers the one-subscription-per-store conflict. No live schema/payment commitment. |
| Designer participation | Director decision | Coach sees the visual direction before engineering. |
| FFM naming + QAM | Director decision | Preserve FFM conventions; continuous bounded build, independent QA. |
| Top bar + centered content | Architect design direction | No inherited Mission Control sidebar requirement. Match the brand; exact OwedBook navbar parity needs current OwedBook evidence. |
| Brand text | Assumption | Use “Pharmacy Books” in customer-facing designs to follow Coach; make it one configurable text choice. Product destination remains OwedBook. Tony/Coach settle final naming. |
| Initial multi-store selection | Proposed resolution | If N stores are selected, collect N pharmacy records by repeating the same pharmacy step before payment. Do not charge for unidentified stores. Tony/Coach may simplify initial purchase to one store. |
| Prices, tiers and benefits | Open commercial decision | Fixture values only; no Starter/Pro/Enterprise inference from old env names. Coach/Frank own final offer. |
| Proration, cancellation, refunds, retention, grace periods | Open commercial decision | Show neutral pending-policy text or clearly labeled demo values; never invent promises. |
| Support/legal/sender addresses and link lifetime | Open content decision | Use visible placeholders; no production delivery promises. |
| Live SSO / production domains | Open integration decision | Design the boundary now; later verify both apps and trusted domains. |
| FFM persona access harness | Open engineering decision | Keep existing restrictive gate until explicitly replaced; fixture permissions are not production authority. |
| Password and two-step setup after first email | Open cross-app scope | Show downstream setup handoff; do not promise unimplemented MFA or design it into this portal by accident. |
| APA/code eligibility | Open business rule | Mock applied/rejected states only; a Stripe promotion does not establish APA membership. |

## 9. Integrations

| System | Product role | FFM treatment |
|---|---|---|
| Supabase Auth | Shared identity foundation | Existing auth retained; no live provisioning from mock flows |
| Stripe Checkout | Initial hosted payment | Labeled external handoff and scenario outcomes |
| Stripe Customer Portal | Hosted billing management | Handoff and returned-state scenarios; exact enabled features verified at integration |
| OwedBook | Main product, add-store entry and return | External reference panels; no real SSO claim |
| Email | Owner access and nominated-admin invitations | Rendered previews only |
| Mission Control | Internal operational overview | No customer journey or money access in this FFM |

## 10. Constraints and deadline

Reuse the supplied Tailwind 3 HSL token system, SCSS, Saira, flat corners and semantic UI primitives. Current reported installed stack: Next 16.4.3, React 19.2.4, Tailwind 3.4.6, Supabase SSR 0.6.1. Package ranges are not proof of installed versions; these values come from Claudy's recon, not an independent runtime inspection.

Keep the design small. No fixed 12-screen target. Screen states may share a layout, provided the flow map remains complete. No hard delivery date has been supplied. Prefer one complete handoff and two planned visual review stages over repeated micro-handoffs.

## 11. Risks and unknowns

The commercial, auth and cross-app unknowns in §8 remain explicit. The cleanup report also records pending credential rotation, existing dependency advisories, no authenticated visual walk and incomplete lint coverage. These are carried into engineering/QA; they do not turn the Designer's job into a security-remediation project.

The Architect reviewed the cleanup report and selected supplied files. The complete repo, deployment scripts and full working-tree diff were not supplied for independent execution. This is readiness for design, not Gate Q certification, merge authorization or production readiness.

## 12. Handoff and approval

Designer receives this brief, `DATA_CONTRACT.md`, `DESIGNER_HANDOFF.md`, Coach's HTML, the curated current references and relevant Designer doctrine.

Director approval of this revision: **PENDING**. Forwarding the package with an instruction to proceed may serve as the attributable release; record that instruction and any changes. Designer owns UI_SPEC, visual artifacts, token deltas and the component manifest. Architect owns the later FFM assembly and QAM. Do not start implementation from this draft alone.
