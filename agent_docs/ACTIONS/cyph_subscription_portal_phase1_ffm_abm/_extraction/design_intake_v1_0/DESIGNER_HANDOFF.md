# DESIGNER HANDOFF — Cyber Pharma Subscription Portal

> Version: 1.0 · Date: 26 October 2026 (Asia/Dhaka)
> Status: READY FOR DIRECTOR REVIEW / RELEASE TO DESIGN; approval not yet recorded.
> Assignment owner: JARVIS, Architect · Designer: Fable · Director: Tony

## 1. Assignment

Design the subscriber journeys described in `APP_BRIEF.md` and `DATA_CONTRACT.md` using the current Cyber Pharma design language. Coach's HTML is the business-flow reference. The cleaned repo's tokens and primitives are the implementation baseline. Historical Mission Control screens are references, not portal requirements.

This package replaces the earlier “recon plus clarification” as the complete design assignment. It does not authorize application implementation or live Stripe integration. Tony releases this revision to design; record his instruction and any amendments. If a new commercial assumption is not resolved, use the declared provisional treatment rather than inventing a policy.

## 2. Read order and precedence

1. `00_START_HERE.md` — baseline and package boundaries.
2. `APP_BRIEF.md` — scope, decisions, assumptions and acceptance outcomes.
3. `DATA_CONTRACT.md` — fields, permissions and transitions.
4. This document — screen map and deliverables.
5. `references/current/01_theme/`, `03_ui_primitives/`, `04_project_primitives/` and stack reference.
6. `references/coach/COACH_SUBSCRIPTION_PORTAL.html` — original board bundle, unchanged.
7. `references/doctrine/DESIGNER_PLAYBOOK.md` and `GLOBAL_DESIGN_SYSTEM_HANDBOOK.md` as needed.

Current Director decisions override older references. This package explicitly marks departures from Coach's literal screens below. Current source files override old component manifests and token version labels. Escalate a real unresolved contradiction as one bundled question; do not silently alter scope.

## 3. Visual direction

- Shared Metro Warm identity: Saira, coral brand actions, flat corners, Mist/Slate, semantic status colors, restrained uppercase labels and existing table styling where tables are used.
- Content-flow layout: top bar plus centered content. Wide review pages may use a form/summary split; mobile stacks the same content. No Mission Control rail is required.
- Customer brand placeholder: Pharmacy Books; destination app: OwedBook. Keep brand text configurable. The symbol can reuse `logo-color.svg` with token-colored HTML text. Avoid the inherited lockup's baked dark wordmark on Slate.
- Authenticated top bar: product identity, theme toggle, account menu/sign out and Back to OwedBook where applicable. Public top bar: identity, theme toggle, sign-in and support where appropriate. No billing details in the public header.
- Shared appearance is desired; exact OwedBook navbar source has not been supplied. Do not claim pixel parity or working SSO.
- Keep `globals.scss`, Tailwind 3 HSL triplets, current semantic names and Saira. No switch to Tailwind 4 or OKLCH.
- Current dark values: background `220 16% 22%`; card `220 14% 27%`; muted foreground `218 14% 70%`; border `220 12% 38%`. These are verified from the supplied cleanup snapshot; no unverified “v1.2” label is needed.
- Role labels can be neutral. If proposing owner/admin colors, supply named semantic tokens and both themes. Existing success/warning/info/destructive colors are status tokens, not a role authorization system.
- Measure contrast in the actual rendered combinations. Inherited colors are not automatic proof of accessible contrast, especially text on coral or colored status backgrounds. Propose a minimal, documented token or foreground adjustment if needed; do not silently redesign the palette.

## 4. First review: style tile and one canonical screen

Canonical screen: **Account & Billing**, showing an owner with two pharmacies, an active subscription, one accepted administrator and one pending administrator invitation. This demonstrates the header, summary, actions, pills, table-to-card behavior and information hierarchy.

First return:

1. Style tile as runnable HTML and PNG in both Mist and Slate.
2. Canonical Account & Billing HTML, desktop PNG in both themes, and mobile PNG in both themes at 375px.
3. Proposed component additions and token deltas, plus a short explanation of the main decisions.

Tony/Coach review this before the rest of the screens are expanded. After approval, clone and adapt the canonical visual system to complete the mapped journeys in one batch. Do not generate each screen with a new style.

## 5. Coach's 17-board coverage map

“External reference” means preserve the journey in the demo and documentation without implementing that external application. The rows are coverage IDs, not a fixed count of app pages. Equivalent states may share a layout or route.

| ID | Coach board | Portal disposition | Required design coverage |
|---|---|---|---|
| C01 | Choose plan | App flow | Plan, store count, estimated recurring total, sign-in path. No unsupported tier names. |
| C02 | Owner details | App flow | Owner fields, format errors, back/continue with retained values. Self-described business role is not an auth role. |
| C03 | First pharmacy | App flow | Business fields, Me/Someone else admin choice and conditional fields. Proposed repeated form for N initial pharmacies. No claim that identifiers prove ownership. |
| C04 | Review, code, consent | App flow | Editable summary, quote, optional code states, separate terms and recurring-payment consent, clear Stripe destination. |
| C05 | Stripe Checkout stand-in | External Stripe reference | Minimal handoff page/panel with demo success/back/abandoned/declined outcomes. Do not reproduce editable card fields. |
| C06 | Activation status | App flow | Waiting for payment, provisioning, ready/check email, delay, failure and resend-feedback states. No automatic login from redirect. |
| C07 | Access email | Email preview | Owner email, masked recipient, secure setup CTA, expired-link route; separate nominated-admin invitation variant. No real sending. |
| C08 | A. OwedBook Subscription | OwedBook reference | Entry panel with owner summary, Manage billing and Add a store. Non-owner variant directs to owner. No OwedBook shell rebuild. |
| C09 | B. Add store details/admin | App flow | Reuse pharmacy form in authenticated context, cancel/back, retained draft. |
| C10 | C. Price change/consent | App flow | Current/new monthly cost, proposed count, amount due today, quote loading/expired/error, price consent, payment-pending state. Changing card hands off to Stripe. |
| C11 | D. Store added | App flow | Confirm store/coverage only after mock success; invitation pending vs accepted; return to OwedBook. Include provisioning-attention alternative. |
| C12 | Billing overview | App summary + Stripe handoff | Canonical Account & Billing with plan and pharmacy summary. “Manage billing in Stripe” replaces custom invoice/card/change-plan machinery. |
| C13 | Cancel subscription | Stripe handoff + app return states | Explain account-wide effect before leaving; Stripe owns cancellation controls. Our returned summary shows scheduled/complete/unchanged state. No custom cancellation wizard. |
| C14 | Checkout not completed | App flow | Resume payment or review saved mock details. If payment status is unknown, say so; do not assert “nothing charged” solely from a canceled browser return. |
| C15 | Payment failed in OwedBook | Portal state + OwedBook reference | Owner sees billing issue and hosted remediation action; member sees neutral owner-contact message. No invented grace/access policy. |
| C16 | Pharmacy already registered | Inline form state | Keep fields and show conflict/sign-in/support actions; disclose no other account owner. Include existing-email sign-in branch. |
| C17 | Access link expired | App flow / access handoff | Expired or already-used link, neutral resend feedback, loading/error; no unauthenticated email-change control. |

Additional supporting states: sign-in visual adaptation; session expired; access denied to a non-owner; no pharmacies; account-load error/retry; hosted-portal launch failure; returned data still refreshing. These are required coverage, not justification to create many bespoke pages.

## 6. Specific departures from the literal Coach HTML

| Coach wording/layout | Handoff direction | Reason |
|---|---|---|
| Other admin gets access link “instead of you” | Owner retains account access; other admin receives a separate store invitation | Billing ownership must not disappear when delegating a store |
| Multi-store count but only first pharmacy collected | Proposed repeatable pharmacy step for each selected store before payment | Keep charged coverage and collected stores consistent; provisional pending Tony/Coach |
| Identifiers “confirm it is yours” | “Used to identify your pharmacy”; ownership checks are separate | Data entry does not establish ownership |
| Custom editable billing/cancellation screens | Summary + hosted Stripe management + returned states | Preserve simple Stripe-first v1 scope |
| Setup “under a minute,” exact link lifetime, MFA promise | Neutral progress and visible pending-policy placeholders / downstream setup handoff | Timings and enrollment scope are not verified |
| Payment failure always means “nothing changes” | Distinguish failed payment from paid-but-provisioning-delayed | Avoid misleading the owner or encouraging duplicate payment |

All product changes above remain visible for Director review. Do not assert that Coach has already approved them.

## 7. Component reality after cleanup

Existing local primitives: alert-dialog, breadcrumb, button, dialog, dropdown-menu, input, label, separator, sheet, skeleton, table, textarea, toast, toaster and use-toast. Generic project components: **DataTable, EmptyState and Pill**. `StoreCard` and `StatusPill` were removed; do not use the old recon inventory as current truth.

Card, Badge, Checkbox, RadioGroup and Tabs are absent as standalone local components. A Radix dependency in package.json is not an installed project component. Prefer existing Pill, simple token-based panels and accessible native controls where sufficient. If a new primitive is genuinely needed, list it as an addition with its screens and behavior. Do not add Tabs unless the agreed journeys require them.

Likely compositions: wizard progress, plan selector, pharmacy form, administrator choice, order summary, store-count control, activation status and external-handoff notice. These do not automatically require new component libraries.

## 8. Interaction, accessibility and responsive contract

- Visible labels, required markers, inline validation, an error summary for long forms and focus moved to the relevant error.
- Keyboard-operable choices, focus-visible controls, semantic buttons/links and text equivalents for status colors.
- Keep progress comprehensible on mobile; do not squeeze four long step labels into an unreadable row.
- Stack review summaries and pharmacy cards at narrow widths; no essential horizontal scrolling at 375px.
- Separate invalid input, quote unavailability, payment pending and provisioning delay. Preserve drafts through back/retry.
- Loading is not success. Busy controls prevent repeated submissions. Retry cannot invent a second completed operation.
- Preserve the user's theme across the demo. Public pages also need a theme toggle.
- Show clearly when leaving for Stripe and how to return. Prefer same-tab navigation for the mock journey; if a new-tab variant is chosen, label it and define return refresh.
- Match layouts in both themes, but do not require a pixel-identical Stripe-hosted interface. Demo handoff panels must be labeled as previews.
- Terms, support and policy placeholders should be obvious in Coach-review artifacts; never turn unknown commercial terms into final copy.

## 9. Final Designer deliverables

Return one ZIP containing:

| Deliverable | Required contents |
|---|---|
| `README.md` | Read order, canonical choice, approval record, limitations and how to open previews |
| `tokens/globals.scss` + Tailwind mapping | Both themes; preserve existing baseline and document explicit additions/changes |
| `style-tile/` | Runnable HTML plus Mist/Slate PNGs |
| `screens/` | Runnable HTML for each agreed layout and its reviewable state variants; desktop/mobile PNGs with clear names |
| `references/` | OwedBook boundary panels and owner/admin email previews, labeled as external/reference surfaces |
| `UI_SPEC.md` | Inventory mapped to C01–C17, hierarchy, fields, gates, state transitions, responsive and accessibility behavior |
| `COMPONENT_MANIFEST.md` | Existing vs new primitives, compositions, source paths and implementation priorities |
| `DECISIONS_AND_DELTAS.md` | Approval evidence, differences from Coach, token changes and unresolved items |

Every layout must be implemented for both themes. Supply at least canonical desktop/mobile PNGs in both; remaining layouts need desktop/mobile PNGs in the canonical theme plus opposite-theme checks for distinct form, alert, quote and error treatments. List the checks performed; do not infer visual passes from source inspection. Avoid duplicate images for identical layouts with only text changes; use a state matrix and runnable variant selector.

Use synthetic data. No backend, credentials, Stripe keys, live email or external-account access is required. HTML artifacts must open predictably; declare any external font/runtime dependency. Bundle the design references needed by engineering rather than relying on private chat context.

## 10. Acceptance and next handoff

The design is ready for FFM assembly when all C01–C17 rows have an explicit disposition, mapped states are complete, both themes/mobile are reviewed, component additions are named, and Tony's visual approval is recorded. Architect then reconciles the package into the FFM with ACCEPTANCE_SPEC and QAM.

This is not the FFM itself. There are no child ABMs to author here. Keep the old FFM naming conventions when the module is assembled after design approval.
