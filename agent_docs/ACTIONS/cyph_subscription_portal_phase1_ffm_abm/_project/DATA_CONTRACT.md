# DATA CONTRACT — Subscription Portal design and mock journeys

> Version: 1.1 · Date: 27 October 2026 (Asia/Dhaka)
> Status: FFM contract under RULINGS R-001/R-005 · Owner: Architect
> Purpose: screen fields, mock relationships, transitions and permissions. NOT production SQL or a migration contract.

## 1. Evidence boundary

The cleaned repo has auth code that reads `user_roles`, a temporary superadmin gate and no subscription domain services. Historical SQL describes `user_roles` and `profiles`, but conflicting trigger definitions have not been reconciled against the live database. No business table is verified by this package. The names below are view models for the FFM and do not instruct anyone to create tables.

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
| OwnerDraft | `firstName`, `lastName`, `email`, `mobile`, `businessRole`, `legalBusinessName?` | Owner form/review |
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

`businessRole` is a self-described job title (owner, pharmacist in charge, manager, other), not a permission grant. NCPDP/NPI identify a claimed pharmacy; they are not proof of ownership.

## 5. Field and validation behavior

| Concern | Design/FFM rule |
|---|---|
| Owner identity | Require names, email, mobile and business role; legal invoice name optional. Trim email; show ordinary format validation. |
| Pharmacy details | Required business details above; NCPDP 7-digit format, NPI 10-digit format for UI demonstration. Do not label either “ownership verified.” |
| Software | Liberty / Pioneer / Other from Coach; Other reveals a name field. No software credentials. |
| Admin assignment | Owner selected by default; Other reveals full name/email. Explain separate billing-owner and store-admin access. |
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

`portal-contract.ts` is the concrete type/service contract for these view models. Copy/adapt it into the portal types lane without introducing SDK dependencies. File organization is an implementation choice; field meanings and invariants are not. IMPLEMENTATION_CONTRACT defines routes, reviewer isolation, state persistence and test boundaries.

- Quote has a draft revision and a unique ID. Changes to store count, pharmacy details, code or terms invalidate earlier quote consent. Refresh creates a new quote ID and clears relevant price/recurring consent. Confirm requires a matching ready quote, current revision and unexpired injected-clock timestamp.
- All mock commands enforce persona capabilities at the service boundary; hiding controls alone is insufficient. Errors are discriminated results. Denied responses contain no card/invoice/financial account payload. Real staff-role claims never become customer-ownership grants.
- Store addition uses a stable operation key for retries while pending/succeeded. A repeated request with the same key returns the same result; it never adds/charges twice. A definitive failed attempt can be retried deliberately with a new key. Unknown/pending is not failure and must not open a second payment attempt.
- Paid/provisioning-attention adds one covered store in pending setup, keeps the financial change, holds invitation and prevents a duplicate addition. Paid amount, coverage and activation cannot contradict one another.
- Ordinary route navigation retains the draft. FFM sessionStorage stores synthetic data only, namespaced/versioned per reviewer session; reset, actual logout and identity change clear it. Theme storage may remain. A hard reload in the same tab restores the demo. Browser-close retention and cross-tab synchronization are not promises.
- All counter values >=1 are supported by a repeatable form/list, not a hardcoded second-store page. For an illustrative initial quote use 9900 + 4900 * (N - 1) cents; DEMO10 subtracts 1000 from due-now only. Each one-store add uses the fixed illustrative 2450-cent due-now fixture, never a production proration formula. Account counts and names drive downstream screens; the canonical two-store screenshot is one seed, not every account's state.
- Status changes only through explicit mock service outcomes. URL `success=true`, closing an external preview or viewing a success route cannot grant authentication, confirm payment or activate a store. Deep-link missing context routes back to a safe starting step with an explanation.
- Access-link and email demonstrations remain inert local previews. Recipients are synthetic. No token, payment SDK, API mutation, real email link or credential is generated.
