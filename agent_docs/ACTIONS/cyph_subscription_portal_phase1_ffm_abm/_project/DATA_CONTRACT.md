# DATA CONTRACT — Subscription Portal design and mock journeys

> Version: 1.9 · Date: 30 October 2026 (Asia/Dhaka) · v1.9 applies R-014 addendum 1 (REPAIR_006: activation presented only where it agrees with the phase; resend needs paid + setup ready) · v1.8 applies R-014 (REPAIR_005: checkout/payment precedence, `paymentPhase`; stale activation flags never advance or discard a checkout; nothing-charged clears the activation) · v1.7 applies R-013 addendum 2 (REPAIR_004 addendum 1: submitted payments resolve only through Stripe's answer; unavailable history for unprovable completed records) · v1.6 applies R-013 addendum 1 (REPAIR_004: legacy checkouts bind only from retained evidence; completed activation and previews read the paid scope) · v1.5 applies R-013 (REPAIR_003: submitted payment bound to its quoted scope; single-use checkout keys) · v1.4 applies R-012 (REPAIR_002: pending checkout respects current prerequisites; bounded repeat-N work) · v1.3 applies R-011 (owner declaration replaces the job title; Coach decision, Director authorization); v1.2 applied Director rulings R-008/R-009
> Status: FFM contract under RULINGS R-001/R-005 · Owner: Architect
> Purpose: screen fields, mock relationships, transitions and permissions. NOT production SQL or a migration contract.

## 1. Evidence boundary

The repo has auth code that reads `user_roles`, an account-management gate that admits `admin` or `superadmin` (R-008) while registration is public (R-009), and no subscription domain services. Historical SQL describes `user_roles` and `profiles`, but conflicting trigger definitions have not been reconciled against the live database. No business table is verified by this package. The names below are view models for the FFM and do not instruct anyone to create tables.

Use one mock service boundary for business behavior. Screens consume consistent view models rather than inventing their own amounts, states or permission rules. Production ownership, Stripe customer mapping, RLS, provisioning and webhook idempotency will be specified in subsequent implementation work.

## 2. Relationships and permissions

Provisional Coach model: one billing account has one owner, one subscription and multiple pharmacies. An owner may manage more than one account in a future implementation, but account switching is not required for this FFM. Every pharmacy has one designated administrator; the administrator may be its owner or someone else. Team membership is outside this portal's editing scope.

| Persona | Account billing summary | Add store / billing management | Store administration |
|---|---|---|---|
| Prospective owner | Their own mock draft/review only | Initial checkout handoff | Nominate an administrator |
| Billing owner | Their account's full summary | Yes, subject to valid quote/consent | In OwedBook if also a store admin |
| Store admin who is not owner | Owner-contact/access-limited state | No controls or invoice/card details | Assigned store in OwedBook |
| Ordinary member | Neutral owner-contact state | No | According to OwedBook permissions, outside scope |
| Unauthenticated visitor | Public registration/sign-in | No existing-account actions | No |

Mock capability flags determine the visual fixtures. They are never proof of production authorization. A role from `user_metadata`, URL/query parameter, local storage or a generic global role must not authorize real billing. An owner choosing “Someone else” retains billing ownership and their own access email; the nominated admin gets a separate invitation.

## 3. Data conventions

- IDs: opaque fixture IDs such as `demo_account_01`, not production UUIDs or Stripe IDs.
- Currency: `USD` in the example fixtures. Integer cents internally; formatted currency in UI. No floating-point price calculations in components.
- Dates: ISO values in models; explicit user-facing dates. Never imply an unresolved grace/end date is final.
- Unknown is not zero. A missing quote displays “Price unavailable” with retry; it does not display `$0.00`.
- Required fields have visible labels and inline error messages. Phone numbers/postal codes/identifiers are strings, preserving leading zeros.
- Use `.example` emails and clearly synthetic pharmacy names and identifiers. Do not use patient information. Use invalid-checksum NPI examples for illustrative fixture data; do not send them to external systems.
- State terminology separates billing, activation and invitations. For example: “Subscription active; store admin invitation pending.”

## 4. View models and fields

| Model | Required fields / relevant optional fields | Screen use |
|---|---|---|
| PortalSessionView | `signedIn`, `displayName`, `persona`, `accountId?`, `canViewBilling`, `canManageBilling`, `canAddStore`, `isDemo` | Header, permitted actions, denied state |
| PlanView | `id`, `name`, `interval`, `includedStoreCount`, `baseAmountCents?`, `additionalStoreAmountCents?`, `benefits[]`, `commercialStatus: provisional|approved` | Plan and review panels |
| OwnerDraft | `firstName`, `lastName`, `email`, `mobile`, `ownerDeclarationAccepted`, `legalBusinessName?` | Owner form/review |
| PharmacyDraft | `id`, `name`, `street`, `city`, `state`, `zip`, `ncpdp`, `npi`, `phone`, `software`, `softwareOther?`, `adminAssignment` | Initial and add-store forms |
| AdminAssignment | `kind: owner|other`, `fullName?`, `email?` | Other-admin fields required only for `other` |
| RegistrationDraft | `id`, `planId`, `requestedStoreCount`, `owner`, `pharmacies[]`, `code?`, `consents`, `state`, `resumeAvailable` | Wizard progress, edits, abandoned checkout |
| BillingAccountView | `id`, `ownerName`, `ownerEmail`, `subscription`, `pharmacies[]`, `permissions` | Account & Billing canonical screen |
| SubscriptionView | `planName`, `status`, `coveredStoreCount`, `monthlyAmountCents?`, `nextPaymentAt?`, `cancelAtPeriodEnd?` (unknown omitted), `accessEndsAt?`, `billingIssue?` | Summary, issue banner, cancellation scheduled state |
| PharmacyView | `id`, `name`, `ncpdpDisplay`, `adminName`, `activationStatus`, `invitationStatus`, `isIncluded`, `monthlyAmountCents?` | Responsive pharmacy list |
| QuoteView | `id`, `kind: initial|add_store`, `status`, `currentStoreCount`, `proposedStoreCount`, `currentRecurringCents`, `newRecurringCents`, `prorationCents`, `discountCents`, `taxCents?`, `dueNowCents?`, `currency`, `effectiveAt?`, `expiresAt?`, `isIllustrative` | Review and add-store confirmation |
| ConsentView | `termsAccepted`, `recurringChargeAccepted`, `priceChangeAccepted`, `documentVersionLabel?` | Required unchecked consent controls appropriate to each journey |
| ActivationView | `paymentState`, `provisioningState`, `emailState`, `ownerEmailMasked`, `retryAvailable`, `supportMessage?` | Pending/ready/delayed/failed activation |
| InvitationView | `pharmacyId`, `recipientName`, `recipientEmailMasked`, `status`, `deliveryState` | Admin invitation preview and pharmacy status |
| HandoffView | `destination: stripe_checkout|stripe_portal|owedbook|account_setup`, `purpose`, `returnContext`, `isDemo`, `status` | Clear external destination, return/retry |
| AccessEmailView | `recipientKind: owner|store_admin`, `recipientName`, `recipientEmailMasked`, `pharmacyNames[]`, `subject`, `linkState`, `expiryLabel` | Email preview; no real token or send |

`ownerDeclarationAccepted` records the registering person's explicit owner self-declaration (R-011); it starts unaccepted, must be exactly `true`, is separate from `ConsentView`, and grants no permission. Registration is owner-only. Neither email (control of an inbox) nor payment proves pharmacy ownership or delegated authority; nothing in the FFM verifies ownership. NCPDP/NPI identify a claimed pharmacy; they are not proof of ownership.

## 5. Field and validation behavior

| Concern | Design/FFM rule |
|---|---|
| Owner identity | Require names, email, mobile and the owner declaration (R-011: required checkbox, initially unchecked, exact label "I confirm that I am the pharmacy owner and am registering this account to manage its subscription and pharmacies."); legal invoice name optional. Trim email; show ordinary format validation. The mock service rejects a missing declaration and refuses checkout; drafts saved before R-011 are migrated without acceptance. |
| Pharmacy details | Required business details above; NCPDP 7-digit format, NPI 10-digit format for UI demonstration. Do not label either “ownership verified.” |
| Software | Liberty / Pioneer / Other from Coach; Other reveals a name field. No software credentials. |
| Admin assignment | Me / Someone else; Someone else reveals full name/email. One designated admin per store. The registering owner keeps account ownership and billing either way: "Me" means the owner also manages the store; "Someone else" appoints a store admin and never transfers ownership, billing or permission to buy more stores (R-011). |
| Multiple initial stores | Proposed resolution: `pharmacies.length === requestedStoreCount` before payment. Repeat the pharmacy form; identify “Pharmacy 1 of N.” Count reduction asks before discarding entered records. |
| Duplicate pharmacy | Conflict fixture prevents submission; keep data, show sign-in/support routes, disclose no other owner's identity. |
| Existing owner email | Design sign-in/continue path. Live anti-enumeration and account-linking behavior remain implementation work. |
| Code | Empty/applying/applied/invalid states; changing a code refreshes the mock quote. Do not presume APA eligibility. |
| Consent | Unchecked by default; missing consent prevents submission and explains why. Terms/privacy destinations remain marked placeholders until supplied. |
| Quote changes | Recalculate/reload after draft changes. Expired or failed quote disables confirmation; a refreshed price requires renewed consent. |
| Repeated click | Busy action disabled; mock command reuses an operation key so one add-store attempt cannot produce two stores. |
| Resume | Mock draft survives route changes in the demo; no production persistence promise. Browser close/expiry behavior is simulated, not an actual retention policy. |

## 6. State transitions

### Initial purchase

`editing → ready_for_checkout → checkout_pending → payment_confirmed → provisioning → access_email_ready`

- Abandoned/back from Checkout: draft remains resumable, subscription inactive. The client return does not establish payment success.
- (R-012) An open (unpaid, unsubmitted) checkout is closed — `abandoned` with a `closedReason`, nothing charged, details kept — when the owner declaration is withdrawn, a pre-R-011 draft is restored, or the draft changes materially. Moving any unpaid checkout toward payment (same-key replay, paid/processing outcome, unknown→paid, waiting→confirmed) re-checks the current draft: declaration exactly `true` and draft complete. A submitted or unknown payment is held, not closed, until that holds. Paid/confirmed history is never reversed by later edits.
- (R-013) Each checkout records the scope it was quoted for (store count, pharmacy entries, code, due-now amount) and is bound to it: moving it toward payment also requires the current draft to match that scope. A submitted payment whose details changed is held, never charged again: the customer may restore the submitted details (then it confirms exactly that scope), or, when payment is unknown, resolve "nothing charged" and continue the edited details through a fresh quote, consent and checkout. A submitted payment (processing or unknown) accepts no checkout outcome, replay, restart or new checkout; it resolves only by confirmation, failure or confirmed nothing-charged (R-013 addendum 2). Precedence (R-014): the checkout record governs; an activation flag counts only where it agrees with it (paid > unknown > processing/open > failed/declined > not charged). Refresh advances only processing or paid-being-set-up; resume needs an abandoned or declined checkout; nothing-charged clears the activation. Stored flags are retained, not rewritten. (R-014 addendum 1) An activation record is presented and acted on only where it agrees with the phase (`readActivation`, C06, `resendAccessEmail`); a paid record without one reports setup/email status as unavailable. Activation shows the payment's scope, or says it is unavailable when none can be established; after payment, nominated-admin invitation claims and the C07 previews read the same covered details (R-013 addendum 1). A closed or replaced checkout's operation key is spent and refused for any new checkout; same-key replay of an open checkout is unchanged.
- Decline: display a Stripe-side failure reference and allow retry; no account activation.
- Processing/delayed: payment confirmation and provisioning are distinct; a paid-but-delayed account must not invite the user to pay again.
- Email-send failure: show resend/support without losing the confirmed payment state. The FFM simulates delivery and never sends mail.
- New-owner success: check email and proceed to the mocked secure access/account-setup handoff; do not sign in from the payment return.

### Add store

`draft → quote_loading → quote_ready → confirmation_pending → payment_pending → provisioning → added`

Failure before confirmed payment retains the existing subscription/store count and preserves the draft. Confirmed payment with provisioning failure enters an attention state; it must not claim that nothing changed financially. A pending admin invitation does not mean payment is pending. A successful add increments covered store count exactly once.

### Hosted billing management

`summary → handoff_loading → external_portal → return_refresh → refreshed_summary`

Handoff error offers retry. Return refresh may be pending; it cannot claim that a card or plan changed merely because the portal closed. Cancellation scheduled and fully canceled are separate summary states. No refund, retention, grace-period or reactivation promise is assumed.

### Access links

`valid → downstream_setup`, or `expired|used → request_new_link → request_received|error`.

Show a masked destination only when the flow already has legitimate account context. Otherwise use a neutral “If an account matches, check your email” response. No editable account-email replacement on an unauthenticated activation screen.

## 7. Mock service boundary (proposed, not implemented)

| Intent | Input | Result |
|---|---|---|
| Load billing account | Fixture account/persona | Account view or denied/error |
| Save registration draft | Owner, pharmacies, plan | Updated draft / field errors |
| Request quote | Draft or add-store request | Ready quote / expired / unavailable |
| Apply code | Draft ID + code | Quote with valid/invalid feedback |
| Start checkout preview | Ready draft + consent + operation key | Labeled handoff scenario |
| Read activation | Draft/operation ID | Activation state |
| Request access email preview | Legitimate mock context | Request received / retry state; no send |
| Confirm add-store preview | Pharmacy, quote ID, consent, operation key | Pending/failed/added outcome |
| Open billing preview | Mock account + capabilities | Hosted-portal boundary / denied / error |
| Refresh after handoff | Account + mock scenario | Updated/pending/unchanged summary |

Stripe sessions will eventually be created by authenticated server logic; webhooks will reconcile payment state. No webhook opens the browser portal. Exact API routes and Stripe configuration are deferred to integration, not prescribed by this screen contract.

## 8. Consistent demonstration fixtures

Numbers are illustrative engineering fixtures, not proposed commercial pricing. Designer may use explicit `[PRICE TBD]` in screenshots shown to Coach; if using these numbers, display “Illustrative pricing” prominently and consistently.

| Fixture | Values |
|---|---|
| Owner | Jordan Ellis · jordan@demo-pharmacy.example |
| Nominated administrator | Sam Ortiz · sam@demo-pharmacy.example |
| First pharmacy | Example Main Street Pharmacy · NCPDP `0000000` · NPI `0000000000` · synthetic demo identifiers |
| Added pharmacy | Example Riverside Pharmacy · NCPDP `0000001` · NPI `0000000001` · synthetic demo identifiers |
| Plan | Standard (placeholder) · monthly · one included pharmacy |
| One-store recurring fixture | 9900 cents = $99.00 |
| Additional-store recurring fixture | 4900 cents = $49.00 |
| Two-store recurring fixture | 14800 cents = $148.00 |
| Add-store due-now fixture | 2450 cents = $24.50; illustrative quote, not a local proration formula |
| Example applied code fixture | `DEMO10` → 1000 cents discount on initial due-now only; explicitly demo-only, no APA claim |

No-tax initial examples: one store $99.00, two stores $148.00. With the illustrative $10 initial discount: $89.00 or $138.00 due now; recurring remains $99.00 or $148.00. If the Designer chooses placeholders instead, use placeholders throughout that scenario. Do not mix unknown totals with seemingly exact confirmed amounts.

Required scenario fixtures: new owner/one store; new owner/two stores; owner as admin; other admin invited; active account; past due; cancellation scheduled; canceled; denied billing access; duplicate pharmacy; invalid code; quote unavailable/expired; abandoned checkout; delayed activation; expired access link. These are state variants, not necessarily separate routes or bespoke layouts.

## 9. Deferred production decisions

Coach confirms subscription granularity and commercial policy. Architect/Engineer later reconcile the real schema, tenant membership, owner provisioning, unique pharmacy checks, Stripe price model, quote validity, tax/proration rules, event ordering, duplicate webhooks, email delivery, secure return destinations and cross-app identity. Do not implement or infer these from demo fixtures.

## 10. Implementation binding (v1.1)

`portal-contract.ts` is the concrete type/service contract for these view models. Copy/adapt it into the portal types lane without introducing SDK dependencies. File organization is an implementation choice; field meanings and invariants are not. IMPLEMENTATION_CONTRACT defines routes, public/account isolation, state persistence and test boundaries.

- Quote has a draft revision and a unique ID. Changes to store count, pharmacy details, code or terms invalidate earlier quote consent. Refresh creates a new quote ID and clears relevant price/recurring consent. Confirm requires a matching ready quote, current revision and unexpired injected-clock timestamp.
- All mock commands enforce persona capabilities at the service boundary; hiding controls alone is insufficient. Errors are discriminated results. Denied responses contain no card/invoice/financial account payload. A real admin/superadmin role never becomes a customer-ownership grant, and a synthetic persona never becomes a real role.
- Store addition uses a stable operation key for retries while pending/succeeded. A repeated request with the same key returns the same result; it never adds/charges twice. A definitive failed attempt can be retried deliberately with a new key. Unknown/pending is not failure and must not open a second payment attempt.
- Paid/provisioning-attention adds one covered store in pending setup, keeps the financial change, holds invitation and prevents a duplicate addition. Paid amount, coverage and activation cannot contradict one another.
- Ordinary route navigation retains the draft. FFM sessionStorage stores synthetic data only, versioned (public namespace v3 since R-013; v2 checkouts without a recorded scope are bound only from retained evidence: the quote they opened with, for the same draft revision and count, or an unchanged demo seed; an open checkout alone is not evidence; otherwise held (R-013 addendum 1)), in two per-tab namespaces: the anonymous public registration draft and the account mock state keyed to the signed-in admin. A public page never reads the account namespace. Reset clears its namespace; actual logout clears both; identity change clears the account namespace. Theme storage may remain. A hard reload in the same tab restores the demo. Browser-close retention and cross-tab synchronization are not promises.
- (R-012) Pharmacy entries are materialized only as each step is filled in, in order; the requested count alone never allocates per-store state, and any step number up to the count is addressable.
- All counter values >=1 are supported by a repeatable form/list, not a hardcoded second-store page. For an illustrative initial quote use 9900 + 4900 * (N - 1) cents; DEMO10 subtracts 1000 from due-now only. Each one-store add uses the fixed illustrative 2450-cent due-now fixture, never a production proration formula. Account counts and names drive downstream screens; the canonical two-store screenshot is one seed, not every account's state.
- Status changes only through explicit mock service outcomes. URL `success=true`, closing an external preview or viewing a success route cannot grant authentication, confirm payment or activate a store. Deep-link missing context routes back to a safe starting step with an explanation.
- Access-link and email demonstrations remain inert local previews. Recipients are synthetic. No token, payment SDK, API mutation, real email link or credential is generated.
