# REPAIR_006: inspected consumers of payment/activation state

Every reader of `checkout`, `activation` or the access email in the public registration surface, checked for the R5 precedence mismatch (raw activation flag or activation-null read before the payment phase).

## Changed
| Path | Before | After |
|---|---|---|
| `registration.ts` `resendAccessEmail` (writer) | raw flags only: `activation.paymentState === 'confirmed' && provisioningState === 'ready'` | paid phase + agreeing activation + setup `ready`; otherwise `conflict`, state unchanged |
| `registration.ts` `readActivation` (contract read) | returned any stored activation | returns it only when it agrees with the phase; paid without one → "Payment is confirmed, but setup and email status aren't available." |
| `registration.ts` `consistentActivation` (new) | — | the single agreement check used by the three readers/writers above and below |
| `ActivationView.tsx` (C06) | `if (!activation)` first → "no payment" for paid/terminal records; paid branch rendered the raw flag (pending → Refresh, failed → "Try payment again") | phase first: unknown / not charged / paid-status-unavailable / no payment / consistent tracks |

## Inspected, already consistent (unchanged)
| Path | Why it is consistent |
|---|---|
| `registration.ts` `refreshActivation` | REPAIR_005 already requires processing, or paid + `confirmed`. R5-O03 (repeat after setup finished returns a new deep-equal object) recorded, not repaired, per the Lead. |
| `registration.ts` `resumeSignup`, `restartSignup`, `resolveCheckout`, `startCheckout`, `resolveUnknownPayment` | REPAIR_005 / R-013 addendum 2: decided by the checkout record and `isSubmitted`; covered by the 224-cell matrix (passing in the full Jest run). |
| `registration.ts` `accessEmailPreviews`, `coveredDetails` | read the checkout scope, not the activation flag (R-013 addendum 1/2) |
| `CheckoutIncompleteView.tsx` (C14) | branches on `checkout.status`; paid → "See activation status" |
| `ReviewView.tsx` (C04) | paid → redirects to activation; submitted → R-013 addendum 2 notice |
| `CheckoutStandIn.tsx` (C05) | branches on `checkout.status` and `isSubmitted` |
| `EmailReferenceView.tsx` / `EmailPreview.tsx` (C07) | `coveredDetails`; no payment-state claims |
| `registrationService.ts` facade | thin wrappers over the engine functions above |

## Inspected, outside this mismatch (reported, not changed)
| Path | Observation |
|---|---|
| `registration.ts` `useAccessLink` / `requestNewAccessLink`, `AccessLinkView.tsx` (C08) | Depend on `accessLink` only, not on payment. The page models an emailed link token: a fresh public state starts with `accessLink: 'valid'`, so `/demo/access-link` can be used without a paid record. It makes no payment or setup claim. Recorded for JARVIS; not in this repair's scope. |
| Account surface (`account.ts`, `DashboardView.tsx`, `StoreResultView.tsx`, `OwedBookReferenceView.tsx`) | Separate account mock state (`activationStatus` per store); never reads the registration checkout/activation. Not run (would require a real sign-in). |
| `PublicDemoControls.tsx` | Loads seeded scenarios (all consistent; REPAIR_003 gave seeds scopes). |
