// Portal FFM — internal mock-state shapes (not part of the frozen contract).
//
// Two separate surfaces (RULINGS R-009):
// - RegistrationState: anonymous public registration draft and its checkout,
//   activation and access-link outcomes.
// - AccountState: the synthetic billing account shown to a signed-in admin or
//   superadmin, plus add-store drafts and operations.
// Both are synthetic, per browser tab, and never shared between the two.
import type {
  ActivationView,
  OperationView,
  PharmacyDraft,
  PharmacyView,
  QuoteView,
  RegistrationDraft,
  SubscriptionView,
  AddStoreDraft,
  Capabilities,
} from './contract';

export interface ServiceDeps {
  /** Epoch milliseconds. Injected so expiry is testable. */
  now(): number;
}

// ---------------------------------------------------------------------------
// Public registration
// ---------------------------------------------------------------------------

export const REGISTRATION_SCENARIOS = [
  'fresh',
  'prefilled_one_store',
  'prefilled_two_store',
  'prefilled_three_store',
  'quote_unavailable',
  'checkout_abandoned',
  'checkout_declined',
  'checkout_unknown',
  'checkout_expired',
  'activation_waiting',
  'activation_provisioning',
  'activation_delayed',
  'activation_email_failed',
  'activation_payment_failed',
  'activation_ready',
  'link_expired',
  'link_used',
  'link_request_error',
] as const;
export type RegistrationScenarioId = (typeof REGISTRATION_SCENARIOS)[number];

export type CheckoutStatus =
  | 'pending' // on the Stripe stand-in, nothing decided
  | 'declined' // Stripe kept the visitor after a decline
  | 'abandoned' // came back without paying; Stripe confirmed nothing charged
  | 'unknown' // payment status unknown; do not pay again
  | 'expired' // hold period over; start again
  | 'paid';

/**
 * Why Pharmacy Books closed an unpaid checkout itself (R-012). The record keeps
 * status 'abandoned' (nothing charged); this says what invalidated it.
 */
export type CheckoutClosedReason = 'details_changed' | 'owner_declaration';

export interface CheckoutRecord {
  operationKey: string;
  quoteId: string;
  status: CheckoutStatus;
  closedReason?: CheckoutClosedReason;
}

/** What the next activation status check resolves to (demo outcome). */
export const ACTIVATION_PLANS = ['ready', 'delayed', 'email_failed', 'payment_failed'] as const;
export type ActivationPlan = (typeof ACTIVATION_PLANS)[number];

export interface RegistrationState {
  version: 1;
  scenario: RegistrationScenarioId;
  draft: RegistrationDraft;
  quote: QuoteView | null;
  quoteSeq: number;
  /** Next N quote requests fail with quote_unavailable (demo). */
  quoteFailuresRemaining: number;
  codeFeedback: 'none' | 'applied' | 'invalid';
  checkout: CheckoutRecord | null;
  activation: ActivationView | null;
  activationPlan: ActivationPlan;
  emailResentAt: string | null;
  accessLink: 'valid' | 'expired' | 'used';
  accessRequest: 'idle' | 'request_sent' | 'error';
  accessRequestFailNext: boolean;
  clockOffsetMs: number;
}

// ---------------------------------------------------------------------------
// Account management (signed-in admin/superadmin viewing a synthetic account)
// ---------------------------------------------------------------------------

export const ACCOUNT_SCENARIOS = [
  'two_store_active',
  'one_store_active',
  'past_due',
  'cancel_scheduled',
  'canceled',
  'no_pharmacies',
  'load_error',
  'handoff_error',
  'add_draft_restored',
] as const;
export type AccountScenarioId = (typeof ACCOUNT_SCENARIOS)[number];

export const ACCOUNT_PERSONAS = ['billing_owner', 'store_admin', 'member'] as const;
export type AccountPersona = (typeof ACCOUNT_PERSONAS)[number];

export const ADD_OUTCOMES = ['succeeded', 'failed', 'unknown', 'attention'] as const;
export type AddOutcome = (typeof ADD_OUTCOMES)[number];

export type PortalOutcome =
  | 'no_change'
  | 'cancel_scheduled'
  | 'canceled'
  | 'resumed'
  | 'card_updated';

export interface PharmacyRecord extends PharmacyView {
  ncpdp: string;
  adminEmail: string;
  ownerIsAdmin: boolean;
}

export interface AccountRecord {
  id: string;
  ownerName: string;
  ownerEmail: string;
  subscription: SubscriptionView;
  pharmacies: PharmacyRecord[];
  cardLabel: string;
}

export interface OperationRecord extends OperationView {
  quoteId: string;
  pharmacy: PharmacyDraft;
  /** The financial change (coverage + recurring) has been applied exactly once. */
  applied: boolean;
}

export interface AccountState {
  version: 1;
  scenario: AccountScenarioId;
  persona: AccountPersona;
  account: AccountRecord;
  loadFailuresRemaining: number;
  handoffFailNext: boolean;
  /** Set by a portal stand-in outcome; applied on refresh. */
  pendingPortalOutcome: PortalOutcome | null;
  returnStatus: 'none' | 'refreshing' | 'unchanged' | 'updated';
  refreshedAt: string | null;
  addDraft: AddStoreDraft;
  addDraftRestored: boolean;
  quote: QuoteView | null;
  quoteSeq: number;
  quoteFailuresRemaining: number;
  operations: Record<string, OperationRecord>;
  /** Most recent add-store operation key (result page and pending checks). */
  lastOperationKey: string | null;
  nextAddOutcome: AddOutcome;
  clockOffsetMs: number;
}

export const OWNER_CAPABILITIES: Capabilities = {
  canViewBilling: true,
  canManageBilling: true,
  canAddStore: true,
};
export const NO_CAPABILITIES: Capabilities = {
  canViewBilling: false,
  canManageBilling: false,
  canAddStore: false,
};
