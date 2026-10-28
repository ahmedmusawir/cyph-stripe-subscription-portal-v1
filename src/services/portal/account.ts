// Portal FFM — account-management engine (pure; no I/O).
//
// Runs only behind the real admin/superadmin login (RULINGS R-008/R-009). The
// signed-in admin views a SYNTHETIC billing account; the synthetic persona
// (billing owner / store admin / member) drives capability checks here at the
// service boundary, never the real session or user_roles.
import type {
  AccountRead,
  AddStoreDraft,
  BillingAccountView,
  Capabilities,
  ConsentView,
  HandoffView,
  OperationView,
  PharmacyDraft,
  PharmacyView,
  PortalSessionView,
  QuoteView,
  Result,
  ReturnContext,
} from '@/types/portal/contract';
import type {
  AccountPersona,
  AccountScenarioId,
  AccountState,
  AddOutcome,
  OperationRecord,
  PharmacyRecord,
  PortalOutcome,
  ServiceDeps,
} from '@/types/portal/state';
import {
  ACCOUNT_PERSONAS,
  ACCOUNT_SCENARIOS,
  ADD_OUTCOMES,
  NO_CAPABILITIES,
  OWNER_CAPABILITIES,
} from '@/types/portal/state';
import {
  ADMIN_SAM,
  DATES,
  DUPLICATE_REGISTRY,
  oneStoreAccount,
  OWNER_JORDAN,
  twoStoreAccount,
} from '@/mocks/portal/fixtures';
import { ADD_STORE_DUE_NOW_CENTS, ADDITIONAL_STORE_CENTS, QUOTE_TTL_MS } from './pricing';
import { hasErrors, isOperationKey, validatePharmacy } from './validation';
import { iso, maskEmail } from './format';

export interface Step<T> {
  state: AccountState;
  result: Result<T>;
}
const ok = <T>(state: AccountState, value: T): Step<T> => ({ state, result: { ok: true, value } });
const fail = <T>(
  state: AccountState,
  code: Extract<Result<T>, { ok: false }>['code'],
  message: string,
  fieldErrors?: Record<string, string>,
): Step<T> => ({ state, result: { ok: false, code, message, ...(fieldErrors ? { fieldErrors } : {}) } });

const EMPTY_CONSENTS: ConsentView = { termsAccepted: false, recurringChargeAccepted: false, priceChangeAccepted: false };

function emptyAddDraft(seq = 1): AddStoreDraft {
  return { id: `demo_add_${seq}`, revision: 1, pharmacy: { adminAssignment: { kind: 'other', fullName: '', email: '' } }, consents: { ...EMPTY_CONSENTS } };
}

export function createAccount(scenario: AccountScenarioId = 'two_store_active', persona: AccountPersona = 'billing_owner'): AccountState {
  const s: AccountState = {
    version: 1,
    scenario,
    persona,
    account: twoStoreAccount(),
    loadFailuresRemaining: 0,
    handoffFailNext: false,
    pendingPortalOutcome: null,
    returnStatus: 'none',
    refreshedAt: null,
    addDraft: emptyAddDraft(),
    addDraftRestored: false,
    quote: null,
    quoteSeq: 0,
    quoteFailuresRemaining: 0,
    operations: {},
    lastOperationKey: null,
    nextAddOutcome: 'succeeded',
    clockOffsetMs: 0,
  };
  const sub = s.account.subscription;
  switch (scenario) {
    case 'two_store_active':
      return s;
    case 'one_store_active':
      return { ...s, account: oneStoreAccount() };
    case 'past_due':
      return { ...s, account: { ...s.account, subscription: { ...sub, status: 'past_due', billingIssue: 'payment_failed', nextPaymentAt: DATES.lastPaymentDue } } };
    case 'cancel_scheduled':
      return { ...s, account: { ...s.account, subscription: { ...sub, status: 'cancel_scheduled' } } };
    case 'canceled':
      return { ...s, account: { ...s.account, subscription: { ...sub, status: 'canceled', nextPaymentAt: undefined } } };
    case 'no_pharmacies':
      return { ...s, account: { ...s.account, pharmacies: [], subscription: { ...sub, coveredStoreCount: 1, monthlyAmountCents: 9900 } } };
    case 'load_error':
      return { ...s, loadFailuresRemaining: 1 };
    case 'handoff_error':
      return { ...s, handoffFailNext: true };
    case 'add_draft_restored':
      return {
        ...s,
        addDraftRestored: true,
        addDraft: {
          ...emptyAddDraft(),
          pharmacy: {
            name: 'Example Hillside Pharmacy',
            street: '9 Hill Street',
            city: 'Springfield',
            state: 'Alabama',
            zip: '00000',
            adminAssignment: { kind: 'owner' },
          },
        },
      };
  }
}

const isOneOf = <T extends string>(list: readonly T[], v: unknown): v is T =>
  typeof v === 'string' && (list as readonly string[]).includes(v);

export function selectScenario(state: AccountState, id: unknown): Step<AccountScenarioId> {
  if (!isOneOf(ACCOUNT_SCENARIOS, id)) return fail(state, 'validation', 'Unknown demo scenario.');
  return ok({ ...createAccount(id, state.persona), clockOffsetMs: state.clockOffsetMs }, id);
}

export function selectPersona(state: AccountState, persona: unknown): Step<AccountPersona> {
  if (!isOneOf(ACCOUNT_PERSONAS, persona)) return fail(state, 'validation', 'Unknown persona.');
  return ok({ ...state, persona }, persona);
}

export function setNextAddOutcome(state: AccountState, outcome: unknown): Step<AddOutcome> {
  if (!isOneOf(ADD_OUTCOMES, outcome)) return fail(state, 'validation', 'Unknown outcome.');
  return ok({ ...state, nextAddOutcome: outcome }, outcome);
}

export function capabilitiesFor(persona: AccountPersona): Capabilities {
  return persona === 'billing_owner' ? { ...OWNER_CAPABILITIES } : { ...NO_CAPABILITIES };
}

export const PERSONA_PROFILE: Record<AccountPersona, { name: string; label: string; detail: string }> = {
  billing_owner: { name: 'Jordan Ellis', label: 'Billing owner', detail: 'Owner' },
  store_admin: { name: ADMIN_SAM.fullName, label: 'Store admin', detail: 'Store admin for Example Riverside Pharmacy' },
  member: { name: 'Casey Brooks', label: 'Team member', detail: 'Team member at Example Main Street Pharmacy' },
};

export function getSession(state: AccountState): PortalSessionView {
  return {
    signedIn: true,
    displayName: PERSONA_PROFILE[state.persona].name,
    persona: state.persona,
    accountId: state.account.id,
    isDemo: true,
    ...capabilitiesFor(state.persona),
  };
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export interface PharmacyListItem extends PharmacyView {
  ownerIsAdmin: boolean;
  invitationEmailMasked?: string;
}
export interface AccountViewModel extends BillingAccountView {
  pharmacies: PharmacyListItem[];
  cardLabel: string;
  ownerPhone: string;
}

function toView(state: AccountState): AccountViewModel {
  const a = state.account;
  return {
    id: a.id,
    ownerName: a.ownerName,
    ownerEmail: a.ownerEmail,
    ownerPhone: OWNER_JORDAN.mobile,
    cardLabel: a.cardLabel,
    subscription: { ...a.subscription },
    permissions: capabilitiesFor(state.persona),
    pharmacies: a.pharmacies.map((p) => ({
      id: p.id,
      name: p.name,
      ncpdpDisplay: p.ncpdpDisplay,
      adminName: p.adminName,
      activationStatus: p.activationStatus,
      invitationStatus: p.invitationStatus,
      isIncluded: p.isIncluded,
      monthlyAmountCents: p.monthlyAmountCents,
      ownerIsAdmin: p.ownerIsAdmin,
      invitationEmailMasked: p.ownerIsAdmin ? undefined : maskEmail(p.adminEmail),
    })),
  };
}

/** Denied payload carries the owner's name only: no amounts, stores, card or invoices. */
function denied(): AccountRead {
  return { kind: 'denied', ownerContactLabel: 'Jordan Ellis' };
}

export type AccountReadModel = { kind: 'account'; account: AccountViewModel } | Extract<AccountRead, { kind: 'denied' }>;

export function loadAccount(state: AccountState): Step<AccountReadModel> {
  if (state.loadFailuresRemaining > 0)
    return fail({ ...state, loadFailuresRemaining: state.loadFailuresRemaining - 1 }, 'conflict', "We couldn't load your account.");
  if (!capabilitiesFor(state.persona).canViewBilling) return ok(state, denied() as AccountReadModel);
  return ok(state, { kind: 'account', account: toView(state) });
}

export type AddStoreAvailability = 'allowed' | 'paused_past_due' | 'paused_cancel_scheduled' | 'unavailable_canceled';

export function addStoreAvailability(state: AccountState): AddStoreAvailability {
  switch (state.account.subscription.status) {
    case 'past_due':
      return 'paused_past_due';
    case 'cancel_scheduled':
      return 'paused_cancel_scheduled';
    case 'canceled':
      return 'unavailable_canceled';
    default:
      return 'allowed';
  }
}

function guardAdd<T>(state: AccountState): Step<T> | null {
  if (!capabilitiesFor(state.persona).canAddStore) return fail(state, 'denied', 'Only the billing owner can add a store.');
  if (addStoreAvailability(state) !== 'allowed')
    return fail(state, 'conflict', 'Adding a store is paused for this subscription (proposed rule).');
  return null;
}

// ---------------------------------------------------------------------------
// Add a store
// ---------------------------------------------------------------------------

/** Cancel / navigate away: keep whatever was typed, no validation, no quote. */
export function keepAddStoreDraft(state: AccountState, pharmacy: Partial<PharmacyDraft>): Step<AddStoreDraft> {
  const denied = guardAdd<AddStoreDraft>(state);
  if (denied) return denied;
  const addDraft = { ...state.addDraft, pharmacy: { ...pharmacy } };
  return ok({ ...state, addDraft }, addDraft);
}

export function startOverAddStore(state: AccountState): Step<AddStoreDraft> {
  const addDraft = emptyAddDraft(state.quoteSeq + 2);
  return ok({ ...state, addDraft, addDraftRestored: false, quote: null }, addDraft);
}

export function saveAddStoreDraft(state: AccountState, pharmacy: Partial<PharmacyDraft>): Step<AddStoreDraft> {
  const denied = guardAdd<AddStoreDraft>(state);
  if (denied) return denied;
  const addDraft: AddStoreDraft = {
    ...state.addDraft,
    revision: state.addDraft.revision + 1,
    pharmacy: { ...pharmacy, id: state.addDraft.pharmacy.id ?? `demo_ph_add_${state.addDraft.id}` },
    consents: { ...EMPTY_CONSENTS },
  };
  const next: AccountState = { ...state, addDraft, quote: null, addDraftRestored: false };
  const errors = validatePharmacy(pharmacy);
  if (hasErrors(errors)) return fail(next, 'validation', 'Some fields need attention.', errors);
  if (pharmacy.ncpdp && state.account.pharmacies.some((p) => p.ncpdp === pharmacy.ncpdp))
    return fail(next, 'duplicate', 'This pharmacy may already be on your account.', {
      ncpdp: 'Already registered — check your pharmacies list first.',
    });
  if (pharmacy.ncpdp && DUPLICATE_REGISTRY.includes(pharmacy.ncpdp))
    return fail(next, 'duplicate', 'This pharmacy is already registered.', {
      ncpdp: 'Already registered. Check the number or contact support.',
    });
  return ok(next, addDraft);
}

function addDraftReady(state: AccountState): boolean {
  return !hasErrors(validatePharmacy(state.addDraft.pharmacy)) && state.addDraft.revision > 1;
}

export function requestAddQuote(state: AccountState, deps: ServiceDeps): Step<QuoteView> {
  const denied = guardAdd<QuoteView>(state);
  if (denied) return denied;
  if (!addDraftReady(state)) return fail(state, 'missing_context', 'Enter the new pharmacy first.');
  if (state.quoteFailuresRemaining > 0)
    return fail({ ...state, quote: null, quoteFailuresRemaining: state.quoteFailuresRemaining - 1 }, 'quote_unavailable', "We couldn't get a price.");
  const sub = state.account.subscription;
  const current = sub.monthlyAmountCents ?? 0;
  const now = deps.now();
  const seq = state.quoteSeq + 1;
  const quote: QuoteView = {
    id: `demo_quote_add_${seq}`,
    draftRevision: state.addDraft.revision,
    kind: 'add_store',
    status: 'ready',
    currentStoreCount: sub.coveredStoreCount,
    proposedStoreCount: sub.coveredStoreCount + 1,
    currentRecurringCents: current,
    newRecurringCents: current + ADDITIONAL_STORE_CENTS,
    prorationCents: ADD_STORE_DUE_NOW_CENTS,
    discountCents: 0,
    dueNowCents: ADD_STORE_DUE_NOW_CENTS,
    currency: 'USD',
    effectiveAt: iso(now),
    expiresAt: iso(now + QUOTE_TTL_MS),
    isIllustrative: true,
  };
  return ok({ ...state, quote, quoteSeq: seq, addDraft: { ...state.addDraft, consents: { ...EMPTY_CONSENTS } } }, quote);
}

export function setAddConsent(state: AccountState, accepted: boolean): Step<ConsentView> {
  const consents = { ...state.addDraft.consents, priceChangeAccepted: accepted === true };
  return ok({ ...state, addDraft: { ...state.addDraft, consents } }, consents);
}

export function isQuoteExpired(quote: QuoteView | null, deps: ServiceDeps): boolean {
  return !quote?.expiresAt || deps.now() >= Date.parse(quote.expiresAt);
}

function blockingOperation(state: AccountState): OperationRecord | undefined {
  return Object.values(state.operations).find((op) => op.state === 'pending' || op.state === 'unknown');
}

function activationFor(state: OperationView['state']): OperationView['activation'] {
  return {
    paymentState: state === 'failed' ? 'failed' : state === 'unknown' || state === 'pending' ? 'unknown' : 'confirmed',
    provisioningState: state === 'succeeded' ? 'ready' : state === 'attention' || state === 'paid_provisioning' ? 'attention' : 'not_started',
    emailState: 'not_started',
    ownerEmailMasked: maskEmail(OWNER_JORDAN.email),
    retryAvailable: state === 'failed',
  };
}

/** The one guarded financial update: +1 covered store, +recurring, exactly once per operation. */
function applyFinancialChange(state: AccountState, op: OperationRecord, storeStatus: 'active' | 'attention'): AccountState {
  if (op.applied) return state;
  const sub = state.account.subscription;
  const p = op.pharmacy;
  const other = p.adminAssignment?.kind === 'other' ? p.adminAssignment : null;
  const record: PharmacyRecord = {
    id: op.pharmacyId!,
    name: p.name ?? 'New pharmacy',
    ncpdp: p.ncpdp ?? '',
    ncpdpDisplay: `NCPDP ${p.ncpdp} · ${p.city}`,
    adminName: other ? other.fullName : state.account.ownerName,
    adminEmail: other ? other.email : state.account.ownerEmail,
    ownerIsAdmin: !other,
    activationStatus: storeStatus,
    invitationStatus: other ? (storeStatus === 'attention' ? 'held' : 'pending') : 'not_required',
    isIncluded: false,
    monthlyAmountCents: ADDITIONAL_STORE_CENTS,
  };
  return {
    ...state,
    account: {
      ...state.account,
      pharmacies: [...state.account.pharmacies, record],
      subscription: {
        ...sub,
        coveredStoreCount: sub.coveredStoreCount + 1,
        monthlyAmountCents: (sub.monthlyAmountCents ?? 0) + ADDITIONAL_STORE_CENTS,
      },
    },
    operations: { ...state.operations, [op.operationKey]: { ...op, applied: true } },
  };
}

function publicOp(op: OperationRecord): OperationView {
  return { id: op.id, operationKey: op.operationKey, state: op.state, pharmacyId: op.pharmacyId, activation: op.activation };
}

export function confirmAddStore(
  state: AccountState,
  input: { quoteId: string; consents: ConsentView; operationKey: string },
  deps: ServiceDeps,
): Step<OperationView> {
  const denied = guardAdd<OperationView>(state);
  if (denied) return denied;
  if (!isOperationKey(input.operationKey)) return fail(state, 'validation', 'Missing operation key.');
  const replay = state.operations[input.operationKey];
  if (replay) return ok(state, publicOp(replay)); // same key → same result, never a second store
  const blocking = blockingOperation(state);
  if (blocking) return fail(state, 'conflict', 'A payment for a new store is still pending. Check its status instead.');
  const quote = state.quote;
  if (!quote || quote.status !== 'ready' || quote.id !== input.quoteId)
    return fail(state, 'conflict', 'The price changed. Review the updated quote.');
  if (quote.draftRevision !== state.addDraft.revision)
    return fail(state, 'conflict', 'The store details changed after this quote. Review the updated quote.');
  if (isQuoteExpired(quote, deps)) return fail(state, 'quote_expired', 'This quote has expired. Refresh it to continue.');
  if (!input.consents.priceChangeAccepted)
    return fail(state, 'validation', 'Approve the new price to continue.', { consent: 'Approve the new monthly price and today’s charge.' });

  const outcome = state.nextAddOutcome;
  const opState: OperationView['state'] = outcome === 'attention' ? 'attention' : outcome;
  const seq = Object.keys(state.operations).length + 1;
  const op: OperationRecord = {
    id: `demo_op_add_${seq}`,
    operationKey: input.operationKey,
    state: opState,
    pharmacyId: `demo_ph_added_${seq}`,
    activation: activationFor(opState),
    quoteId: quote.id,
    pharmacy: { ...(state.addDraft.pharmacy as PharmacyDraft) },
    applied: false,
  };
  let next: AccountState = {
    ...state,
    operations: { ...state.operations, [op.operationKey]: op },
    lastOperationKey: op.operationKey,
  };
  if (opState === 'succeeded' || opState === 'attention') {
    next = applyFinancialChange(next, op, opState === 'succeeded' ? 'active' : 'attention');
    next = { ...next, addDraft: emptyAddDraft(seq + 1), quote: null };
  }
  return ok(next, publicOp(next.operations[op.operationKey]));
}

export function readOperation(state: AccountState, operationKey: string | null): Result<OperationView> {
  const op = operationKey ? state.operations[operationKey] : undefined;
  return op ? { ok: true, value: publicOp(op) } : { ok: false, code: 'missing_context', message: 'There is no store addition to show.' };
}

export function lastOperationPharmacy(state: AccountState): PharmacyListItem | null {
  const op = state.lastOperationKey ? state.operations[state.lastOperationKey] : undefined;
  const p = op?.pharmacyId ? state.account.pharmacies.find((x) => x.id === op.pharmacyId) : undefined;
  if (!op) return null;
  if (p) return toView(state).pharmacies.find((x) => x.id === p.id) ?? null;
  // Not added (failed/unknown): describe the attempted store from the operation itself.
  const other = op.pharmacy.adminAssignment?.kind === 'other' ? op.pharmacy.adminAssignment : null;
  return {
    id: op.pharmacyId ?? op.id,
    name: op.pharmacy.name ?? 'New pharmacy',
    ncpdpDisplay: `NCPDP ${op.pharmacy.ncpdp} · ${op.pharmacy.city}`,
    adminName: other ? other.fullName : state.account.ownerName,
    activationStatus: 'payment_pending',
    invitationStatus: 'not_required',
    isIncluded: false,
    ownerIsAdmin: !other,
  };
}

/** DemoHarness.resolveOperation — explicit review control, never a page visit. */
export function resolveOperation(
  state: AccountState,
  operationKey: string | null,
  outcome: 'failed' | 'unknown' | 'paid_provisioning' | 'attention' | 'succeeded',
): Step<OperationView> {
  const op = operationKey ? state.operations[operationKey] : undefined;
  if (!op) return fail(state, 'missing_context', 'There is no store addition to resolve.');
  if (op.state === 'succeeded' || op.state === 'failed') return fail(state, 'conflict', 'This addition already has a final outcome.');
  if (op.applied && outcome === 'failed')
    return fail(state, 'conflict', 'Payment was already confirmed; it cannot become a failure.');
  let next: AccountState = { ...state, operations: { ...state.operations, [op.operationKey]: { ...op, state: outcome, activation: activationFor(outcome) } } };
  const updated = next.operations[op.operationKey];
  if (outcome === 'succeeded' || outcome === 'attention' || outcome === 'paid_provisioning') {
    const storeStatus = outcome === 'succeeded' ? 'active' : 'attention';
    if (!updated.applied) {
      next = applyFinancialChange(next, updated, storeStatus);
      next = { ...next, addDraft: emptyAddDraft(Object.keys(next.operations).length + 1), quote: null };
    } else {
      // Recovery of the SAME store: activation finishes, held invitation released. No new purchase.
      next = {
        ...next,
        account: {
          ...next.account,
          pharmacies: next.account.pharmacies.map((p) =>
            p.id === updated.pharmacyId
              ? { ...p, activationStatus: storeStatus, invitationStatus: p.ownerIsAdmin ? 'not_required' : storeStatus === 'active' ? 'pending' : 'held' }
              : p,
          ),
        },
      };
    }
  }
  return ok(next, publicOp(next.operations[op.operationKey]));
}

export function acceptInvitation(state: AccountState, pharmacyId: string): Step<string> {
  const target = state.account.pharmacies.find((p) => p.id === pharmacyId);
  if (!target || target.invitationStatus !== 'pending') return fail(state, 'conflict', 'No pending invitation for that store.');
  return ok(
    { ...state, account: { ...state.account, pharmacies: state.account.pharmacies.map((p) => (p.id === pharmacyId ? { ...p, invitationStatus: 'accepted' } : p)) } },
    pharmacyId,
  );
}

// ---------------------------------------------------------------------------
// Hosted billing (Customer Portal stand-in)
// ---------------------------------------------------------------------------

export const BILLING_PURPOSES = ['manage', 'cancel', 'resume', 'change_card', 'invoices'] as const;
export type BillingPurpose = (typeof BILLING_PURPOSES)[number];

export function openBillingPreview(state: AccountState, purpose: unknown): Step<HandoffView> {
  if (!isOneOf(BILLING_PURPOSES, purpose)) return fail(state, 'validation', 'Unknown billing action.');
  if (!capabilitiesFor(state.persona).canManageBilling) return fail(state, 'denied', 'Only the billing owner can manage billing.');
  if (state.returnStatus === 'refreshing') return fail(state, 'conflict', 'Wait for the refreshed summary first.');
  if (state.handoffFailNext)
    return fail({ ...state, handoffFailNext: false }, 'conflict', "We couldn't open Stripe's billing page.");
  return ok(
    { ...state, returnStatus: 'none' },
    { destination: 'stripe_portal', purpose, returnContext: 'account_billing', isDemo: true, status: 'ready' },
  );
}

export const PORTAL_OUTCOMES: readonly PortalOutcome[] = ['no_change', 'cancel_scheduled', 'canceled', 'resumed', 'card_updated'];

/** Leaving the stand-in: the summary refreshes; nothing counts as changed until refresh confirms. */
export function returnFromPortal(state: AccountState, outcome: unknown): Step<PortalOutcome> {
  if (!capabilitiesFor(state.persona).canManageBilling) return fail(state, 'denied', 'Only the billing owner can manage billing.');
  if (!isOneOf(PORTAL_OUTCOMES, outcome)) return fail(state, 'validation', 'Unknown outcome.');
  return ok({ ...state, pendingPortalOutcome: outcome, returnStatus: 'refreshing' }, outcome);
}

export function refreshAfterHandoff(state: AccountState, context: ReturnContext, deps: ServiceDeps): Step<AccountReadModel> {
  void context;
  const outcome = state.pendingPortalOutcome;
  const sub = state.account.subscription;
  let subscription = sub;
  if (outcome === 'cancel_scheduled' && (sub.status === 'active' || sub.status === 'past_due')) subscription = { ...sub, status: 'cancel_scheduled' };
  if (outcome === 'canceled' && sub.status !== 'canceled') subscription = { ...sub, status: 'canceled', nextPaymentAt: undefined };
  if (outcome === 'resumed' && sub.status === 'cancel_scheduled') subscription = { ...sub, status: 'active' };
  if (outcome === 'card_updated' && sub.status === 'past_due')
    subscription = { ...sub, status: 'active', billingIssue: undefined, nextPaymentAt: DATES.nextPayment };
  const changed = subscription !== sub;
  const next: AccountState = {
    ...state,
    account: { ...state.account, subscription },
    pendingPortalOutcome: null,
    returnStatus: state.returnStatus === 'none' && !outcome ? 'none' : changed ? 'updated' : 'unchanged',
    refreshedAt: iso(deps.now()),
  };
  return loadAccount(next);
}

export function advanceClock(state: AccountState, ms: number): Step<number> {
  const delta = Number.isFinite(ms) && ms > 0 ? Math.min(ms, 24 * 60 * 60 * 1000) : 0;
  return ok({ ...state, clockOffsetMs: state.clockOffsetMs + delta }, state.clockOffsetMs + delta);
}
