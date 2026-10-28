# UI_SPEC — Cyber Pharma Subscription Portal

> **Version:** 1.0 + R-009 wording · **Date:** 27 October 2026 (Asia/Dhaka) · **Status:** approved design (RULINGS R-001/R-004); this active copy applies R-009 sign-in wording. The received design copy under `_design/approved_v1_0/` is preserved unchanged.
> **Design mode:** Demo (functional clarity; token discipline mandatory) · **Designer:** Fable · **Architect:** JARVIS · **Director:** Tony
> **Repository baseline:** `cyph-stripe-subscription-portal-v1` foundation commit `1d15918` · **Module:** FFM-ABM-001-SUBSCRIPTION-PORTAL
> **Inputs:** `APP_BRIEF.md` v1.0, `DATA_CONTRACT.md` v1.0, `DESIGNER_HANDOFF.md` v1.0, Coach's 17-board HTML, Architect feedback 27 Oct (v0.2 corrections, all applied)

## 1. Design overview

- **Canonical screen:** Account & Billing (C12). Every other layout is a clone of its structure: top bar → optional demo notice → eyebrow + H1 + one-line lead → status banner slot → panels (`border border-border bg-card`) → footer.
- **Token theme:** Metro Warm, portal-scoped `globals.scss` (Mist `:root`, Slate `.dark`; six values changed from the inherited fleet file, see `DECISIONS_AND_DELTAS.md §5`). Tailwind 3.4 HSL triplets; semantic utilities only; `--radius: 0`.
- **Shells:** two. *Public* (brand · support placeholder · theme toggle · Sign in) for C01–C07, C14, C17, sign-in. *Authenticated* (brand · Back to OwedBook · theme toggle · account menu) for C09–C13. Both are top bar + centered content; no rail. Below `md` the right side collapses to theme toggle + 44px hamburger opening the existing left `Sheet` (shown as a disclosure panel in the HTML).
- **Content widths:** forms and status pages `max-w-3xl`; the canonical and the review page `max-w-6xl` with a `minmax(0,1fr) + 20–22rem` split at `lg`; focused pages (sign-in, access link) `max-w-md/xl`.
- **Brand text:** "Pharmacy Books" + sub-line "Account & Billing" (one configurable string pair). Symbol: `logo-color.svg`; wordmark is token-coloured HTML. Footer: "Pharmacy Books · a Cyber Pharma product".
- **Provisional data:** every amount is an illustrative fixture under a persistent "Demo · Illustrative pricing" notice; every open policy renders as a visible bracketed placeholder (`[POLICY TBD]`, `[GRACE POLICY TBD]`, `[LINK LIFETIME TBD]`, `[HOLD PERIOD TBD]`, `[PRORATION RULE TBD]`, `[EFFECTIVE DATE RULE TBD]`, `[SUPPORT EMAIL]`, `[LINK TBD]`, `[LAST 4]`, `[SENDING ADDRESS TBD]`, `[COMPANY MAILING ADDRESS TBD]`). Proposed product rules render with a "Proposed rule" chip.

## 2. Screen inventory — mapped to C01–C17

"Layout" = one runnable HTML file in `screens/` (or `references/`); "States" = the variants selectable with `?state=` and rendered to PNG per the matrix in `README.md`. Rows are coverage, not a page count: 13 app layouts + 2 reference layouts cover all 17 boards and the supporting states.

| ID | Coach board | Layout file | Shell | States (default first) |
|---|---|---|---|---|
| C01 | Choose plan | `signup-plan.html` | public, step 1 | one · two · reduce_confirm · price_unavailable |
| C02 | Owner details | `signup-owner.html` | public, step 2 | empty · filled · errors · existing_email (C16 email branch) · saving |
| C03 | First pharmacy (× N) | `signup-pharmacy.html` | public, step 3 | first_of_two · second_other_admin · software_other · errors · duplicate (C16) · single |
| C04 | Review, code, consent | `signup-review.html` | public, step 4 | two_stores · one_store · code_applying · code_applied · code_invalid · quote_unavailable · quote_expired · consent_missing · leaving |
| C05 | Stripe Checkout stand-in | `stripe-checkout-handoff.html` | public | leaving (ours) · preview (external) · declined (external) · portal_preview (external, Customer Portal) |
| C06 | Activation status | `activation.html` | public | ready · waiting_payment · provisioning · delayed · email_failed · resent · payment_failed |
| C07 | Access email | `references/email-access.html` | email preview | owner · store_admin · checkout_unfinished · expired_resend |
| C08 | OwedBook Subscription | `references/owedbook-panels.html` | OwedBook frame | owner · non_owner |
| C09 | Add store details/admin | `add-store.html` | authenticated | other_admin · me_admin · draft_restored · software_other · errors · duplicate · busy |
| C10 | Price change/consent | `add-store-confirm.html` | authenticated | quote_ready · quote_loading · quote_expired · quote_error · consent_missing · confirming · payment_failed · change_card |
| C11 | Store added | `store-added.html` | authenticated | added_invited · added_owner_admin · invitation_accepted · provisioning_attention |
| C12 | Billing overview (canonical) | `account-billing.html` | authenticated | active · past_due · cancel_scheduled · canceled · unchanged · refreshing · handoff_error · no_pharmacies · denied · loading · error |
| C13 | Cancel subscription | `account-billing.html` (cancel panel + returned states) and `stripe-checkout-handoff.html?state=portal_preview` | authenticated / external | cancel panel on every owner state · cancel_scheduled · canceled · unchanged · refreshing |
| C14 | Checkout not completed | `checkout-incomplete.html` | public | resumable · payment_unknown · declined · expired |
| C15 | Payment failed in OwedBook | `references/owedbook-panels.html` (OwedBook side) + `account-billing.html?state=past_due` (portal side) | OwedBook frame / authenticated | owner_past_due · member_past_due / past_due |
| C16 | Pharmacy already registered | `signup-pharmacy.html?state=duplicate`, `add-store.html?state=duplicate`, `signup-owner.html?state=existing_email` | public / authenticated | inline conflict with retained fields; sign-in and support routes |
| C17 | Access link expired | `access-link.html` | public | expired · valid · used · sending · request_sent · error |
| — | Sign-in visual adaptation, session expired | `sign-in.html` | public | default · session_expired · error · busy |
| — | Access denied to non-owner · no pharmacies · account-load error/retry · hosted-portal launch failure · returned data still refreshing | `account-billing.html` | authenticated | denied · no_pharmacies · error · handoff_error · refreshing |

## 3. Visual system (reads from `tokens/globals.scss`)

- **Type (Saira):** Display 32/700 (desktop H1), H1 26/700 (mobile H1), H2 20/700, H3 16/600, body 15/400, small 13 muted, label 11/600 uppercase tracked, amounts 24/600 tabular, eyebrow 11/700 uppercase `text-muted-foreground`.
- **Surfaces:** page `bg-background`; panels `border border-border bg-card`; table head `bg-muted`; external stand-ins `border-2 border-dashed border-border`.
- **Buttons (kit `Button`, portal recipe):** height `h-11` (44px), uppercase tracked semibold labels. Primary `bg-primary text-primary-foreground border border-foreground/25` (dark ink on coral; the hairline is the Mist edge fix). Secondary/outline `border border-input bg-background hover:bg-accent` (1px, not the kit's `border-4`). Quiet `bg-secondary`. Destructive-outline `border-destructive text-destructive hover:bg-destructive/10`. Disabled: `opacity-50` + `aria-disabled`. Busy: spinner + `aria-busy` + disabled; label changes to the gerund ("Confirming…").
- **External actions** carry the `i-ext` icon and "in Stripe" / "to OwedBook" in the label.
- **Links:** `text-foreground underline underline-offset-4 decoration-1 hover:text-primary`. Coral is never small text.
- **Pills (kit `Pill`):** `text-foreground border border-<tone> bg-<tone>/10`; muted = `border-border bg-muted`. One axis per pill. Tones: success = Active/Added/Paid/Accepted; warning = Pending/Past due/Provisioning/Expired/Setup pending; destructive = Canceled/Failed/Unavailable/Needs attention; info = Cancellation scheduled/Demo/Preview/Illustrative; muted = Not required/Inactive/Held/Checking.
- **Role labels:** plain `text-[11px] font-semibold uppercase tracking-wide text-muted-foreground` after the name: Owner · Store admin · Owner · Store admin. Never a pill, never a status token.
- **Alerts (new `Alert`):** `border-l-[3px] border-<tone> bg-<tone>/10 p-4`, title `font-semibold`, body `text-sm text-muted-foreground`, optional action slot that moves below the text under `sm`. `role="status"` for info/warning, `role="alert"` for destructive, `aria-live="polite"` where content changes while visible.
- **Selected state:** radio cards `border-2 border-primary`; unselected `border border-border`; focus `focus-within:ring-2 ring-ring`.
- **Forms:** label above, required asterisk in `text-destructive` with sr-only "(required)", help text 12px muted, inline error 12px `text-destructive` with icon, `aria-invalid` → `border-destructive`, error summary alert at top linking to fields and taking focus on failed submit. Native `select`, `checkbox`, `radio` styled with tokens (`accent-color: hsl(var(--primary))`).
- **Icons:** lucide paths as inline `<symbol>` sprites (`_icons` partial): ext, back, check, alert, chevron, menu, spinner, mail, lock, sun, moon.

## 4. Responsive rules (Rule Zero)

- Base 375. No horizontal scroll anywhere (`CHECKS.md §1`: 510 loads pass). Touch targets ≥ 44px (`h-11`, `min-h-[44px]` on list links).
- Top bar: brand + toggle + hamburger below `md`; full nav at `md`+. Mobile menu is the existing left `Sheet` in the build.
- Wizard progress: four labelled steps at `sm`+; "Step n of 4 · label" + bar below `sm`.
- Canonical plan card: 3-up stats → 2-up at 375 with "next payment" spanning; actions column drops under the stats with full-width buttons.
- Pharmacies: `Table` at `md`+ → one card per row below `md` (name + activation pill hero, 2×2 detail grid, action bottom-right).
- Review page: form/summary split at `lg`; summary stacks under the panels below `lg` (sticky only at `lg`).
- Pharmacy form: 6-column grid at `sm`+ (city 3 · state 2 · ZIP 1; NCPDP 3 · NPI 3); single column below.
- Banner action buttons: right-aligned at `sm`+, full-width below.
- Long strings: emails `break-all`, phone numbers `whitespace-nowrap`, grid children `min-w-0`.

## 5. Screen specifications

### C01 Choose plan — `signup-plan.html`
- **Purpose:** pick the (single, provisional) plan and the number of pharmacies; see an estimate; sign-in path.
- **Elements:** radio-card plan selector (one real plan + a dashed "[Second plan TBD]" slot, not selectable); store-count control (− / count / +); estimate panel ("Estimate · not a charge"); Continue; "Already subscribed? Sign in" line → real `/login` (R-009); "not charged until the final step" note.
- **Gating:** Continue enabled whenever a plan is selected (always). Count ≥ 1; − disabled at 1.
- **States:** `two` recomputes the estimate (1 included + 1 additional). `reduce_confirm` appears when lowering the count would discard an entered pharmacy: inline `alertdialog` with "Remove and continue with 1" (destructive-outline) / "Keep 2". `price_unavailable` replaces the estimate with a retry alert; Continue stays enabled because the full price is shown again before payment.
- **Human checkpoint:** the reduce confirmation.

### C02 Owner details — `signup-owner.html`
- **Fields:** first name*, last name*, work email* (help: access link goes here), mobile*, role* (Owner / Pharmacist in charge / Manager / Other — self-description, explicitly "doesn't change what you can do"), legal business name (optional, for invoices).
- **Gating:** Continue always clickable; submit validates → `errors` state (summary + per-field) and focus moves to the summary.
- **States:** `filled` = returning via Back with retained values. `existing_email` = info alert with "Sign in instead" (primary) / "Use a different email"; copy says "may already have an account" (anti-enumeration is implementation work). `saving` = busy CTA.

### C03 Pharmacy n of N — `signup-pharmacy.html`
- **Fields:** pharmacy name*, street*, city*, state* (select), ZIP*, NCPDP* (7 digits, "identifies the pharmacy; not proof of ownership"), NPI* (10 digits), store phone*, software* (Liberty / Pioneer / Other → reveals "Software name*"), admin assignment* (radio cards: Me / Someone else → reveals admin name* + email*). PHI note.
- **Repeat:** title "Pharmacy 1 of 2", chip "1 more after this"; CTA "Continue to pharmacy 2 of 2" then "Continue to review". `single` shows "Your pharmacy · 1 of 1".
- **States:** `errors` (NCPDP/NPI format), `duplicate` (C16: destructive alert, NCPDP field flagged, routes to sign-in / support / fix; CTA "Fix and try again"; no owner identity disclosed).
- **Gating:** submit validates; duplicate blocks submission until the NCPDP changes.

### C04 Review and pay — `signup-review.html`
- **Left:** Billing owner summary (Edit), one panel per pharmacy (Edit), consent fieldset with two separate unticked checkboxes (terms; recurring charge with the recurring amount inline and `[CANCELLATION TERMS TBD]`).
- **Right (sticky at lg):** Order summary (plan line, additional stores line, discount row when applied, Due today, "Then $X every month", tax note), code field with Apply/Remove, CTA "Continue to secure payment ↗", lock note (Stripe handles card; access link by email).
- **Gating:** CTA enabled only with a current quote; `consent_missing` on submit shows the summary alert + per-checkbox errors and `aria-invalid`. `quote_unavailable` / `quote_expired` disable the CTA with a reason line; expired requires refresh then re-consent (checkboxes clear).
- **Code:** empty → applying (busy, CTA paused) → applied (discount row, Due today drops, button becomes Remove, success line "demo code; no APA claim") or invalid (error line). Changing the code refreshes the quote.
- **`leaving`:** CTA busy "Opening Stripe…"; next is C05.

### C05 Stripe boundary — `stripe-checkout-handoff.html`
- **Ours:** `leaving` — spinner, "Opening Stripe's secure checkout…", what-happens-next list, manual continue/back links.
- **External (labelled "Preview · external surface", dashed frame):** `preview` (Checkout stand-in: order we send, greyed non-editable Stripe form blocks, demo-outcome buttons → activation / review / checkout-incomplete / declined), `declined` (Stripe keeps the user; our next surface is C14), `portal_preview` (Customer Portal stand-in reached from "Manage billing"; return refreshes C12).
- **Rule:** no editable card fields; access never granted from the browser return alone.

### C06 Activation — `activation.html`
- **Structure:** three independent tracks (Payment · Pharmacy setup · Access email), each with its own icon state; contextual panel; resend section.
- **States:** `waiting_payment` (nothing set up), `provisioning` (paid, setting up), `ready` (open-email panel + resend), `delayed` (paid, setup late — "don't pay again"), `email_failed` (paid + set up; resend is the primary fix), `resent` (success line with time), `payment_failed` (retry on Stripe / review details; nothing set up).
- **Rules:** no automatic login; link lifetime placeholder; wrong email → support, not an unauthenticated change control.

### C07 Email previews — `references/email-access.html`
- Envelope (From `[SENDING ADDRESS TBD]`, masked To, Subject) + 600px body. Variants: owner access ("Set up my account"), store-admin invitation ("Accept invitation"; billing stays with the owner), checkout-unfinished reminder, new link after expiry. Footer placeholders. Labelled reference; no sending.

### C08 / C15 OwedBook panels — `references/owedbook-panels.html`
- Neutral OwedBook frame (not a rebuild). `owner`: plan + pill + next payment + Manage billing ↗ + Add a store + pharmacy list + SSO disclaimer. `non_owner`: plan pill, "Billing is managed by the account owner", owner contact, Email the owner. `owner_past_due`: warning banner with Update payment method ↗ (via Account & Billing → Stripe). `member_past_due`: neutral banner "owner has been notified", `[MEMBER ACCESS DURING GRACE PERIOD TBD]`.

### C09 Add a store — `add-store.html`
- Same pharmacy form in the authenticated shell; breadcrumb; chip "Joins your existing subscription"; Cancel keeps a draft; CTA "Review price change" → `busy` "Getting your quote…". `draft_restored` info banner with "start over". `duplicate` copy acknowledges the match may be the owner's own store.

### C10 Confirm your new price — `add-store-confirm.html`
- **Quote panel (`aria-live`):** current price (1) · add line (+$49) · new monthly (2) · Charged today ($24.50, from the billing system, `[PRORATION RULE TBD]`, `[EFFECTIVE DATE RULE TBD]`, valid-until). States: `quote_loading` (skeleton), `quote_expired` (refresh → re-approve), `quote_error` (retry).
- **Payment panel:** card on file `[LAST 4]`; "Use a different card ↗" → `change_card` (labelled preview of leaving for Stripe; quote and draft kept; store never added from Stripe's page).
- **Consent:** one unticked checkbox approving new monthly + today's charge. `consent_missing` on submit.
- **CTA:** "Confirm and add store" enabled only with a current quote; `confirming` busy with "payment pending" line; `payment_failed` alert: store NOT added, plan unchanged, update card in Stripe then confirm again. Double-click safety stated.

### C11 Store added — `store-added.html`
- Success header only after mock payment success; status panel with three separate axes (Subscription · Store activation · Store admin + invitation pill); next-step copy per state; Return to OwedBook (primary) / Back to Account & Billing. `provisioning_attention`: paid, plan shows 2, setup pending, "don't add it again", invitation held.

### C12 Account & Billing (canonical) — `account-billing.html`
- See v0.2 record. Added in v1.0: `unchanged` (returned from Stripe; refreshed time; nothing changed), `refreshing` (returned; actions disabled until refreshed data arrives; pills "Checking…"), `handoff_error` (couldn't open Stripe; retry; nothing changed), `no_pharmacies` (EmptyState with Add a store).
- **Hero action gating:** Add a store enabled in `active`/`unchanged`/`no_pharmacies`; disabled with "Proposed rule" chip in `past_due` and `cancel_scheduled`; absent in `canceled`; all actions disabled in `refreshing`.
- **Human checkpoints:** every Stripe handoff is explicit ("in Stripe", ↗, helper line); Cancel is a destructive-outline link with the account-wide warning and `[POLICY TBD]`.

### C13 Cancel — covered by C12 states + Customer Portal stand-in
- Before leaving: cancel panel copy (account-wide effect; timing, charges, refunds, retention → `[POLICY TBD]`). After return: `cancel_scheduled` (Scheduled; Resume in Stripe), `canceled` (Start a new subscription; Past invoices in Stripe), `unchanged`, `refreshing`. No custom cancellation wizard.

### C14 Checkout not completed — `checkout-incomplete.html`
- `resumable` (Stripe confirmed nothing charged → info), `payment_unknown` (warning + spinner; CTA paused; "don't pay again"), `declined` (destructive; CTA enabled), `expired` (`[HOLD PERIOD TBD]`; start a new signup). Saved-details panel with "Saved until" chip; "Review my details first".

### C17 Access link — `access-link.html`
- `valid` (spinner → downstream account setup, explicitly not designed here), `expired` / `used` (request a new link; no email shown or editable), `sending`, `request_sent` (neutral "if an account matches"), `error`.

### Sign-in — `sign-in.html` (realised on the real `/login`, R-009)
- Kit login adapted: email + password, Sign in; `session_expired` info banner; `error` alert + `aria-invalid`; `busy`. Password reset and MFA shown as out-of-scope placeholders, not links.

## 6. Loading, empty and error states (summary)

| Surface | Loading | Empty | Error |
|---|---|---|---|
| Account & Billing | skeleton (`loading`) | `no_pharmacies` EmptyState | `error` panel + retry; `handoff_error` banner |
| Quotes (C04, C10) | skeleton / busy line | — | unavailable (retry) · expired (refresh + re-consent) |
| Code | "Checking code…" | hint line | invalid line |
| Activation | track spinners | — | payment_failed · email_failed · delayed |
| Access link | sending busy | — | error alert |
| Forms | saving / quoting busy CTA | empty first visit | summary + inline errors; duplicate conflict |

## 7. Accessibility baseline

- All text ≥ 4.5:1 and all pill borders / edges ≥ 3:1 in both modes on the portal tokens (`CHECKS.md §2`). Coral primary button edge on white: 1px hairline 4.22:1 (`CHECKS.md §3`).
- Visible labels, required markers with sr-only text, `aria-describedby` for help/error, `aria-invalid`, error summaries with in-page links and `tabindex="-1"` focus targets.
- Status colour is never the only cue: every pill and alert carries text; role is text.
- `focus-visible:ring-2 ring-ring ring-offset-2` on every control; skip link; semantic `button` vs `a`; `aria-busy` on pending actions; `aria-live="polite"` on quote, activation and refresh regions; `role="alert"` reserved for failures.
- Theme toggle on every shell including public pages; choice persisted per viewer.
- Not performed: assistive-technology walk; full keyboard traversal (engineering/QAM).

## 8. Out of scope for this UI

Live Stripe, webhooks, charges; account provisioning, password/MFA setup, password reset; real email; cross-app SSO proof; OwedBook shell changes; Mission Control; marketing site; patient data of any kind.

## 9. Conflict resolution

`DATA_CONTRACT.md` wins on fields and transitions; `APP_BRIEF.md` on scope; this spec on screen behaviour and visual system; `tokens/globals.scss` on values. A conflict is recorded in `DECISIONS_AND_DELTAS.md` and resolved by the Director, not silently in either file.
