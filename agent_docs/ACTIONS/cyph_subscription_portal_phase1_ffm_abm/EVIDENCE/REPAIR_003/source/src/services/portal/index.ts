// Portal FFM — the only import surface for portal UI (components never import
// fixtures or the engines' state shapes directly; AC-24).
export { registration, registrationHarness, useRegistration } from './registrationService';
export { AccountDemoProvider, useAccount } from './accountService';
export type { AccountFacade } from './accountService';
export { clearDemoStorage, PUBLIC_STORAGE_KEY } from './storage';
export { formatCents, initialRecurringCents, ADDITIONAL_STORE_CENTS, BASE_CENTS, DEMO_CODE, QUOTE_TTL_MS } from './pricing';
export { formatDate, formatTime, maskEmail } from './format';
export {
  accessEmailPreviews,
  checkoutHold,
  estimateAvailable,
  firstIncomplete,
  isEmailVariant,
  isPharmacyStep,
  isQuoteExpired,
  EMAIL_VARIANTS,
} from './registration';
export type { EmailVariant, CheckoutHold, CheckoutOutcome, RegistrationStep } from './registration';
export type { CheckoutScope } from '@/types/portal/state';
export {
  addStoreAvailability,
  lastOperationPharmacy,
  PERSONA_PROFILE,
  BILLING_PURPOSES,
  isQuoteExpired as isAddQuoteExpired,
} from './account';
export type { AccountReadModel, AccountViewModel, PharmacyListItem, BillingPurpose, AddStoreAvailability } from './account';
export { PLAN_VIEW, US_STATE_NAMES, DEMO_HINTS, OWNER_DECLARATION } from './catalog';
export { classifyStripeStandIn } from './stripeRoute';
export {
  REGISTRATION_SCENARIOS,
  ACCOUNT_SCENARIOS,
  ACCOUNT_PERSONAS,
  ADD_OUTCOMES,
  ACTIVATION_PLANS,
} from '@/types/portal/state';
