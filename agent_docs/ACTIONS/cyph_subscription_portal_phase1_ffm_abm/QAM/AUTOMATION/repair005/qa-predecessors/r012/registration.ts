// Portal FFM — public registration engine (pure; no I/O).
//
// Anonymous surface (RULINGS R-009): plan → owner → pharmacies → review →
// initial-checkout stand-in → activation → access email/link. Every function
// takes the current state and returns the next state plus a discriminated
// Result. Mock payment never creates a user, grants a role or signs anyone in.
import type {
  AccessEmailView,
  ActivationView,
  ConsentView,
  HandoffView,
  OwnerDraft,
  PharmacyDraft,
  QuoteView,
  RegistrationDraft,
  Result,
} from '@/types/portal/contract';
import type {
  CheckoutClosedReason,
  CheckoutRecord,
  RegistrationScenarioId,
  RegistrationState,
  ServiceDeps,
} from '@/types/portal/state';
import { REGISTRATION_SCENARIOS } from '@/types/portal/state';
import {
  DUPLICATE_REGISTRY,
  EMAIL_EXISTING_ACCOUNT,
  OWNER_JORDAN,
  PHARMACY_HILLSIDE,
  PHARMACY_MAIN,
  PHARMACY_RIVERSIDE,
  PLAN,
} from '@/mocks/portal/fixtures';
import {
  initialDiscountCents,
  initialRecurringCents,
  isValidStoreCount,
  normalizeCode,
  QUOTE_TTL_MS,
  DEMO_CODE,
} from './pricing';
import { hasErrors, isEmail, isOperationKey, validateOwner, validatePharmacy } from './validation';
import { maskEmail, iso } from './format';

export interface Step<T> {
  state: RegistrationState;
  result: Result<T>;
}

const ok = <T>(state: RegistrationState, value: T): Step<T> => ({ state, result: { ok: true, value } });
const fail = <T>(
  state: RegistrationState,
  code: Extract<Result<T>, { ok: false }>['code'],
  message: string,
  fieldErrors?: Record<string, string>,
): Step<T> => ({ state, result: { ok: false, code, message, ...(fieldErrors ? { fieldErrors } : {}) } });

export const EMPTY_CONSENTS: ConsentView = {
  termsAccepted: false,
  recurringChargeAccepted: false,
  priceChangeAccepted: false,
};

function draftFor(pharmacies: Partial<PharmacyDraft>[], owner: Partial<OwnerDraft>): RegistrationDraft {
  return {
    id: 'demo_reg_01',
    revision: 1,
    planId: PLAN.id,
    requestedStoreCount: Math.max(1, pharmacies.length),
    owner,
    pharmacies: pharmacies.length ? pharmacies : [{}],
    consents: { ...EMPTY_CONSENTS },
    state: 'editing',
    resumeAvailable: false,
  };
}

function base(scenario: RegistrationScenarioId, draft: RegistrationDraft): RegistrationState {
  return {
    version: 1,
    scenario,
    draft,
    quote: null,
    quoteSeq: 0,
    quoteFailuresRemaining: 0,
    codeFeedback: 'none',
    checkout: null,
    activation: null,
    activationPlan: 'ready',
    emailResentAt: null,
    accessLink: 'valid',
    accessRequest: 'idle',
    accessRequestFailNext: false,
    clockOffsetMs: 0,
  };
}

const paidCheckout: CheckoutRecord = { operationKey: 'demo_checkout_seed', quoteId: 'demo_quote_seed', status: 'paid' };

function activation(partial: Partial<ActivationView>, ownerEmail: string): ActivationView {
  return {
    paymentState: 'confirmed',
    provisioningState: 'pending',
    emailState: 'not_started',
    ownerEmailMasked: maskEmail(ownerEmail),
    retryAvailable: false,
    ...partial,
  };
}

/** Deterministic scenario seeds (enumerated; anything else is rejected). */
export function createRegistration(scenario: RegistrationScenarioId = 'fresh'): RegistrationState {
  if (scenario === 'fresh') return base('fresh', draftFor([], {}));
  const two = draftFor([{ ...PHARMACY_MAIN }, { ...PHARMACY_RIVERSIDE }], { ...OWNER_JORDAN });
  const email = OWNER_JORDAN.email;
  const s = base(scenario, two);
  switch (scenario) {
    case 'prefilled_one_store':
      return base(scenario, draftFor([{ ...PHARMACY_MAIN }], { ...OWNER_JORDAN }));
    case 'prefilled_two_store':
      return s;
    case 'prefilled_three_store':
      return base(
        scenario,
        draftFor([{ ...PHARMACY_MAIN }, { ...PHARMACY_RIVERSIDE }, { ...PHARMACY_HILLSIDE }], { ...OWNER_JORDAN }),
      );
    case 'quote_unavailable':
      return { ...s, quoteFailuresRemaining: 1 };
    case 'checkout_abandoned':
    case 'checkout_declined':
    case 'checkout_unknown':
    case 'checkout_expired': {
      const status = scenario.replace('checkout_', '') as CheckoutRecord['status'];
      return {
        ...s,
        draft: { ...s.draft, state: status === 'unknown' ? 'checkout_pending' : 'abandoned', resumeAvailable: status !== 'expired' },
        checkout: { ...paidCheckout, status },
      };
    }
    case 'activation_waiting':
      return {
        ...s,
        draft: { ...s.draft, state: 'checkout_pending' },
        checkout: { ...paidCheckout, status: 'pending' },
        activation: activation({ paymentState: 'pending', provisioningState: 'not_started' }, email),
      };
    case 'activation_provisioning':
      return { ...s, draft: { ...s.draft, state: 'provisioning' }, checkout: paidCheckout, activation: activation({}, email) };
    case 'activation_delayed':
      return {
        ...s,
        draft: { ...s.draft, state: 'provisioning' },
        checkout: paidCheckout,
        activation: activation({ provisioningState: 'attention' }, email),
      };
    case 'activation_email_failed':
      return {
        ...s,
        draft: { ...s.draft, state: 'payment_confirmed' },
        checkout: paidCheckout,
        activation: activation({ provisioningState: 'ready', emailState: 'failed', retryAvailable: true }, email),
      };
    case 'activation_payment_failed':
      return {
        ...s,
        draft: { ...s.draft, state: 'abandoned', resumeAvailable: true },
        checkout: { ...paidCheckout, status: 'declined' },
        activation: activation({ paymentState: 'failed', provisioningState: 'not_started', retryAvailable: true }, email),
      };
    case 'activation_ready':
    case 'link_expired':
    case 'link_used':
    case 'link_request_error': {
      const ready: RegistrationState = {
        ...s,
        draft: { ...s.draft, state: 'access_email_ready' },
        checkout: paidCheckout,
        activation: activation({ provisioningState: 'ready', emailState: 'sent', retryAvailable: true }, email),
      };
      if (scenario === 'link_expired') return { ...ready, accessLink: 'expired' };
      if (scenario === 'link_used') return { ...ready, accessLink: 'used' };
      if (scenario === 'link_request_error') return { ...ready, accessLink: 'expired', accessRequestFailNext: true };
      return ready;
    }
  }
}

export function isRegistrationScenario(id: unknown): id is RegistrationScenarioId {
  return typeof id === 'string' && (REGISTRATION_SCENARIOS as readonly string[]).includes(id);
}

export function selectScenario(state: RegistrationState, id: unknown): Step<RegistrationScenarioId> {
  if (!isRegistrationScenario(id)) return fail(state, 'validation', 'Unknown demo scenario.');
  return ok(createRegistration(id), id);
}

// ---------------------------------------------------------------------------
// Draft
// ---------------------------------------------------------------------------

/**
 * R-012: a checkout Stripe has not charged and nobody has submitted payment on —
 * still on the stand-in, or kept there after a decline.
 */
function isOpenCheckout(state: RegistrationState): boolean {
  const status = state.checkout?.status;
  return (status === 'pending' || status === 'declined') && state.activation?.paymentState !== 'pending';
}

/**
 * Material change: new revision, quote dropped, consents cleared. An open
 * checkout was priced and agreed for the old details, so it is closed
 * (status 'abandoned', nothing charged, record kept). A submitted or paid
 * checkout is never closed or reversed here.
 */
function touch(
  state: RegistrationState,
  draft: RegistrationDraft,
  reason: CheckoutClosedReason = 'details_changed',
): RegistrationState {
  const checkout =
    state.checkout && isOpenCheckout(state) ? { ...state.checkout, status: 'abandoned' as const, closedReason: reason } : state.checkout;
  return {
    ...state,
    checkout,
    draft: { ...draft, revision: draft.revision + 1, consents: { ...EMPTY_CONSENTS }, state: 'editing' },
    quote: null,
  };
}

function hasContent(p: Partial<PharmacyDraft> | undefined): boolean {
  if (!p) return false;
  return Object.entries(p).some(([k, v]) => k !== 'id' && k !== 'adminAssignment' && typeof v === 'string' && v.trim() !== '');
}

/** Labels of entered pharmacies a count reduction would discard (empty = no confirmation needed). */
export function storeCountDiscards(state: RegistrationState, n: number): string[] {
  return state.draft.pharmacies
    .slice(n)
    .map((p, i) => (hasContent(p) ? p.name?.trim() || `Pharmacy ${n + i + 1}` : null))
    .filter((x): x is string => x !== null);
}

export function setStoreCount(state: RegistrationState, n: unknown): Step<RegistrationDraft> {
  if (!isValidStoreCount(n))
    return fail(
      state,
      'validation',
      typeof n === 'number' && Number.isInteger(n) && n > 1 ? "That many pharmacies can't be priced exactly." : 'Choose at least 1 pharmacy.',
    );
  // Entries are created only as each pharmacy step is filled in (R-012), so the
  // work here is bounded by what was entered, never by the requested count.
  const pharmacies = state.draft.pharmacies.slice(0, n);
  if (n === state.draft.requestedStoreCount) return ok(state, state.draft);
  const next = touch(state, { ...state.draft, requestedStoreCount: n, pharmacies });
  return ok(next, next.draft);
}

/**
 * Owner fields the draft may hold (R-011). Anything else, such as the retired
 * self-described `businessRole`, is dropped, and the owner declaration is kept
 * only when it is exactly `true` — it is never inferred.
 */
function ownerFields(owner: Partial<OwnerDraft> | undefined): Partial<OwnerDraft> {
  const o = owner ?? {};
  const pick = (v: unknown) => (typeof v === 'string' ? v : undefined);
  const out: Partial<OwnerDraft> = {
    firstName: pick(o.firstName),
    lastName: pick(o.lastName),
    email: pick(o.email),
    mobile: pick(o.mobile),
    ownerDeclarationAccepted: o.ownerDeclarationAccepted === true,
    legalBusinessName: pick(o.legalBusinessName),
  };
  for (const k of Object.keys(out) as (keyof OwnerDraft)[]) if (out[k] === undefined) delete out[k];
  return out;
}

/**
 * Persisted public drafts written before R-011 (storage version 1) carried a
 * job title and no owner declaration. They are kept, but the declaration is NOT
 * assumed: it stays unaccepted, so the owner step must be completed again
 * before a quote or checkout. Any held quote is dropped for the same reason.
 */
export function migrateRegistration(persisted: unknown): RegistrationState {
  const old = persisted as Partial<RegistrationState> | null;
  if (!old || typeof old !== 'object' || !old.draft || typeof old.draft !== 'object') return createRegistration('fresh');
  const migrated = { ...old, quote: null } as RegistrationState;
  // Storage v1 never recorded the declaration, so none is carried over, and an
  // open checkout from then was never covered by one (R-012).
  return withOwner(migrated, { ...ownerFields(old.draft.owner), ownerDeclarationAccepted: false });
}

/**
 * Store owner fields. Withdrawing the declaration while a checkout is open
 * closes that checkout (R-012): it can't be paid until the owner confirms
 * again and gets a fresh quote.
 */
function withOwner(state: RegistrationState, owner: Partial<OwnerDraft>): RegistrationState {
  const draft = { ...state.draft, owner };
  return owner.ownerDeclarationAccepted !== true && isOpenCheckout(state)
    ? touch(state, draft, 'owner_declaration')
    : { ...state, draft };
}

/** Back/navigation away: keep what was typed without validating. */
export function keepOwner(state: RegistrationState, owner: Partial<OwnerDraft>): Step<RegistrationDraft> {
  const next = withOwner(state, ownerFields(owner));
  return ok(next, next.draft);
}

/**
 * A pharmacy step that can be written: within the requested count and no later
 * than the next unentered one, so entries never skip ahead and leave a sparse
 * array sized by the count (R-012).
 */
export function isPharmacyStep(draft: RegistrationDraft, index: number): boolean {
  return (
    isValidStoreCount(draft.requestedStoreCount) &&
    Number.isInteger(index) &&
    index >= 0 &&
    index < draft.requestedStoreCount &&
    index <= draft.pharmacies.length
  );
}

/** Back/navigation away on a pharmacy step: keep the entries (a real edit still invalidates the quote). */
export function keepPharmacy(state: RegistrationState, index: number, pharmacy: Partial<PharmacyDraft>): Step<RegistrationDraft> {
  if (!isPharmacyStep(state.draft, index)) return fail(state, 'missing_context', 'That pharmacy step is not part of this signup.');
  const before = state.draft.pharmacies[index] ?? {};
  const merged = { ...pharmacy, id: before.id ?? `demo_reg_ph_${index + 1}` };
  if (JSON.stringify(before) === JSON.stringify(merged)) return ok(state, state.draft);
  const pharmacies = [...state.draft.pharmacies];
  pharmacies[index] = merged;
  const next = touch(state, { ...state.draft, pharmacies });
  return ok(next, next.draft);
}

export function saveOwner(state: RegistrationState, owner: Partial<OwnerDraft>): Step<RegistrationDraft> {
  const picked = ownerFields(owner);
  const clean: Partial<OwnerDraft> = { ...picked, email: picked.email?.trim() };
  const errors = validateOwner(clean);
  const kept = withOwner(state, clean);
  if (hasErrors(errors)) return fail(kept, 'validation', 'Some fields need attention.', errors);
  if (clean.email?.toLowerCase() === EMAIL_EXISTING_ACCOUNT)
    return fail(kept, 'conflict', 'This email may already have a Pharmacy Books account.');
  return ok(kept, kept.draft);
}

export function savePharmacy(
  state: RegistrationState,
  index: number,
  pharmacy: Partial<PharmacyDraft>,
): Step<RegistrationDraft> {
  if (!isPharmacyStep(state.draft, index)) return fail(state, 'missing_context', 'That pharmacy step is not part of this signup.');
  const pharmacies = [...state.draft.pharmacies];
  pharmacies[index] = { ...pharmacy, id: pharmacies[index]?.id ?? `demo_reg_ph_${index + 1}` };
  const next = touch(state, { ...state.draft, pharmacies });
  const errors = validatePharmacy(pharmacy);
  if (hasErrors(errors)) return fail(next, 'validation', 'Some fields need attention.', errors);
  if (pharmacy.ncpdp && DUPLICATE_REGISTRY.includes(pharmacy.ncpdp))
    return fail(next, 'duplicate', 'This pharmacy is already registered.', {
      ncpdp: 'Already registered. Check the number or contact support.',
    });
  const dupInDraft = pharmacies.findIndex((p, i) => i !== index && p.ncpdp === pharmacy.ncpdp);
  if (dupInDraft !== -1)
    return fail(next, 'duplicate', 'You already entered this pharmacy in this signup.', {
      ncpdp: `Same NCPDP as pharmacy ${dupInDraft + 1}.`,
    });
  return ok(next, next.draft);
}

export type RegistrationStep = 'plan' | 'owner' | 'pharmacy' | 'review';

/** First step that still needs input (guards deep links to later steps). */
export function firstIncomplete(draft: RegistrationDraft): { step: RegistrationStep; index?: number } {
  if (!isValidStoreCount(draft.requestedStoreCount)) return { step: 'plan' };
  if (hasErrors(validateOwner(draft.owner)) || draft.owner.email?.toLowerCase() === EMAIL_EXISTING_ACCOUNT)
    return { step: 'owner' };
  for (let i = 0; i < draft.requestedStoreCount; i++) {
    const p = draft.pharmacies[i];
    if (!p || hasErrors(validatePharmacy(p)) || (p.ncpdp && DUPLICATE_REGISTRY.includes(p.ncpdp)))
      return { step: 'pharmacy', index: i };
  }
  return { step: 'review' };
}

export function isDraftComplete(draft: RegistrationDraft): boolean {
  return firstIncomplete(draft).step === 'review' && draft.pharmacies.length === draft.requestedStoreCount;
}

export type CheckoutHold = 'owner_declaration' | 'details_incomplete';

/**
 * R-012: what currently stops an unpaid checkout from moving toward payment
 * (null = nothing). Checked on every such move — replay, outcome, unknown
 * resolution, activation refresh — against the draft as it is NOW, so a
 * stored or replayed checkout can't outlive its prerequisites.
 */
export function checkoutHold(draft: RegistrationDraft): CheckoutHold | null {
  if (draft.owner?.ownerDeclarationAccepted !== true) return 'owner_declaration';
  return isDraftComplete(draft) ? null : 'details_incomplete';
}

const HOLD_MESSAGE: Record<CheckoutHold, string> = {
  owner_declaration: 'Confirm that you are the pharmacy owner before paying.',
  details_incomplete: 'Some signup details are missing. Finish them before paying.',
};

// ---------------------------------------------------------------------------
// Quotes, code, consent
// ---------------------------------------------------------------------------

export function estimateAvailable(state: RegistrationState): boolean {
  return state.quoteFailuresRemaining === 0;
}

/** C01 "Try again": one retry consumes one simulated failure. */
export function retryPricing(state: RegistrationState): Step<boolean> {
  const next = { ...state, quoteFailuresRemaining: Math.max(0, state.quoteFailuresRemaining - 1) };
  return ok(next, next.quoteFailuresRemaining === 0);
}

export function requestQuote(state: RegistrationState, deps: ServiceDeps): Step<QuoteView> {
  if (state.quoteFailuresRemaining > 0)
    return fail(
      { ...state, quote: null, quoteFailuresRemaining: state.quoteFailuresRemaining - 1 },
      'quote_unavailable',
      "We couldn't load current pricing.",
    );
  const { draft } = state;
  if (!isValidStoreCount(draft.requestedStoreCount)) return fail(state, 'missing_context', 'Choose a plan first.');
  const now = deps.now();
  const recurring = initialRecurringCents(draft.requestedStoreCount);
  const discount = initialDiscountCents(draft.code);
  const seq = state.quoteSeq + 1;
  const quote: QuoteView = {
    id: `demo_quote_init_${seq}`,
    draftRevision: draft.revision,
    kind: 'initial',
    status: 'ready',
    currentStoreCount: 0,
    proposedStoreCount: draft.requestedStoreCount,
    currentRecurringCents: 0,
    newRecurringCents: recurring,
    prorationCents: 0,
    discountCents: discount,
    dueNowCents: recurring - discount,
    currency: 'USD',
    effectiveAt: iso(now),
    expiresAt: iso(now + QUOTE_TTL_MS),
    isIllustrative: true,
  };
  const consents = { ...draft.consents, termsAccepted: false, recurringChargeAccepted: false, acceptedQuoteId: undefined };
  return ok({ ...state, quote, quoteSeq: seq, draft: { ...draft, consents, state: 'ready_for_checkout' } }, quote);
}

export function isQuoteExpired(quote: QuoteView | null, deps: ServiceDeps): boolean {
  return !quote?.expiresAt || deps.now() >= Date.parse(quote.expiresAt);
}

export function applyCode(state: RegistrationState, code: string, deps: ServiceDeps): Step<QuoteView> {
  const normalized = normalizeCode(code);
  if (!normalized) return fail(state, 'validation', 'Enter a code.', { code: 'Enter a code.' });
  if (normalized !== DEMO_CODE) {
    const kept = { ...state, codeFeedback: 'invalid' as const };
    return fail(kept, 'validation', "That code isn't valid.", { code: "That code isn't valid. Check it and try again." });
  }
  const touched = touch(state, { ...state.draft, code: normalized });
  const step = requestQuote({ ...touched, codeFeedback: 'applied' }, deps);
  return step;
}

export function removeCode(state: RegistrationState, deps: ServiceDeps): Step<QuoteView> {
  const touched = touch(state, { ...state.draft, code: undefined });
  return requestQuote({ ...touched, codeFeedback: 'none' }, deps);
}

export function setConsents(
  state: RegistrationState,
  consents: Pick<ConsentView, 'termsAccepted' | 'recurringChargeAccepted'>,
): Step<ConsentView> {
  const next = {
    ...state.draft.consents,
    termsAccepted: consents.termsAccepted === true,
    recurringChargeAccepted: consents.recurringChargeAccepted === true,
  };
  return ok({ ...state, draft: { ...state.draft, consents: next } }, next);
}

// ---------------------------------------------------------------------------
// Initial checkout stand-in
// ---------------------------------------------------------------------------

export const CHECKOUT_HANDOFF_PATH = '/demo/stripe';

function checkoutHandoff(key: string): HandoffView {
  return {
    destination: 'stripe_checkout',
    purpose: 'Initial subscription checkout',
    returnContext: 'registration_review',
    isDemo: true,
    operationId: key,
    status: 'ready',
  };
}

export function startCheckout(
  state: RegistrationState,
  input: { quoteId: string; consents: ConsentView; operationKey: string },
  deps: ServiceDeps,
): Step<HandoffView> {
  if (!isOperationKey(input.operationKey)) return fail(state, 'validation', 'Missing operation key.');
  const existing = state.checkout;
  if (existing && existing.operationKey === input.operationKey && existing.status === 'pending') {
    const hold = checkoutHold(state.draft);
    if (hold) return fail(state, 'missing_context', HOLD_MESSAGE[hold]);
    return ok(state, checkoutHandoff(existing.operationKey)); // replay: same handoff, no second checkout
  }
  if (existing && (existing.status === 'pending' || existing.status === 'unknown'))
    return fail(state, 'conflict', "A checkout is already in progress. Check its status instead of paying again.");
  if (existing?.status === 'paid') return fail(state, 'conflict', 'This signup is already paid.');
  if (!isDraftComplete(state.draft)) return fail(state, 'missing_context', 'Some signup details are missing.');
  const quote = state.quote;
  if (!quote || quote.status !== 'ready' || quote.id !== input.quoteId)
    return fail(state, 'conflict', 'The price changed. Review the updated total.');
  if (quote.draftRevision !== state.draft.revision)
    return fail(state, 'conflict', 'Your details changed after this price was shown. Review the updated total.');
  if (isQuoteExpired(quote, deps)) return fail(state, 'quote_expired', 'This price has expired. Refresh it to continue.');
  const errors: Record<string, string> = {};
  if (!input.consents.termsAccepted) errors.terms = 'Agree to the terms to continue.';
  if (!input.consents.recurringChargeAccepted) errors.recurring = 'Agree to the recurring charge to continue.';
  if (hasErrors(errors)) return fail(state, 'validation', 'Two agreements are required before payment.', errors);
  const next: RegistrationState = {
    ...state,
    draft: {
      ...state.draft,
      consents: { ...input.consents, acceptedQuoteId: quote.id },
      state: 'checkout_pending',
      resumeAvailable: true,
    },
    checkout: { operationKey: input.operationKey, quoteId: quote.id, status: 'pending' },
    activation: null,
  };
  return ok(next, checkoutHandoff(input.operationKey));
}

export type CheckoutOutcome = 'paid' | 'processing' | 'declined' | 'back' | 'unknown';
export const CHECKOUT_OUTCOMES: readonly CheckoutOutcome[] = ['paid', 'processing', 'declined', 'back', 'unknown'];

/** Explicit "Demo outcome" buttons on the stand-in. Visiting a route never changes state. */
export function resolveCheckout(state: RegistrationState, outcome: unknown): Step<CheckoutRecord> {
  const checkout = state.checkout;
  if (!checkout) return fail(state, 'missing_context', 'There is no checkout to complete.');
  if (!(CHECKOUT_OUTCOMES as readonly unknown[]).includes(outcome)) return fail(state, 'validation', 'Unknown outcome.');
  if (checkout.status !== 'pending' && checkout.status !== 'declined')
    return fail(state, 'conflict', 'This checkout already has an outcome.');
  const hold = outcome === 'paid' || outcome === 'processing' ? checkoutHold(state.draft) : null;
  if (hold) return fail(state, 'missing_context', HOLD_MESSAGE[hold]);
  const email = state.draft.owner.email ?? '';
  let next: RegistrationState;
  switch (outcome as CheckoutOutcome) {
    case 'paid':
      next = {
        ...state,
        checkout: { ...checkout, status: 'paid' },
        draft: { ...state.draft, state: 'provisioning', resumeAvailable: false },
        activation: activation({}, email),
      };
      break;
    case 'processing':
      next = {
        ...state,
        checkout: { ...checkout, status: 'pending' },
        activation: activation({ paymentState: 'pending', provisioningState: 'not_started' }, email),
      };
      break;
    case 'declined':
      next = { ...state, checkout: { ...checkout, status: 'declined' }, draft: { ...state.draft, state: 'abandoned' } };
      break;
    case 'back':
      next = { ...state, checkout: { ...checkout, status: 'abandoned' }, draft: { ...state.draft, state: 'abandoned' } };
      break;
    case 'unknown':
      next = { ...state, checkout: { ...checkout, status: 'unknown' } };
      break;
  }
  return ok(next, next.checkout!);
}

/** C14 payment_unknown → explicit demo resolution. */
export function resolveUnknownPayment(state: RegistrationState, outcome: 'paid' | 'not_charged'): Step<CheckoutRecord> {
  const checkout = state.checkout;
  if (checkout?.status !== 'unknown') return fail(state, 'conflict', 'Payment status is not pending.');
  if (outcome === 'paid') {
    const hold = checkoutHold(state.draft);
    if (hold) return fail(state, 'missing_context', HOLD_MESSAGE[hold]);
    const next: RegistrationState = {
      ...state,
      checkout: { ...checkout, status: 'paid' },
      draft: { ...state.draft, state: 'provisioning', resumeAvailable: false },
      activation: activation({}, state.draft.owner.email ?? ''),
    };
    return ok(next, next.checkout!);
  }
  const next = { ...state, checkout: { ...checkout, status: 'abandoned' as const }, draft: { ...state.draft, state: 'abandoned' as const } };
  return ok(next, next.checkout);
}

/** Abandoned/declined → back to review with values kept; a fresh quote and fresh consent are needed. */
export function resumeSignup(state: RegistrationState): Step<RegistrationDraft> {
  const status = state.checkout?.status;
  if (status !== 'abandoned' && status !== 'declined' && state.activation?.paymentState !== 'failed')
    return fail(state, 'conflict', 'There is no unfinished checkout to resume.');
  const next = touch({ ...state, checkout: null, activation: null }, { ...state.draft, resumeAvailable: false });
  return ok(next, next.draft);
}

/** C14 expired → start a new signup (drafts discarded on purpose). */
export function restartSignup(state: RegistrationState): Step<RegistrationDraft> {
  const next = { ...createRegistration('fresh'), clockOffsetMs: state.clockOffsetMs };
  return ok(next, next.draft);
}

// ---------------------------------------------------------------------------
// Activation, access email, access link
// ---------------------------------------------------------------------------

export function readActivation(state: RegistrationState): Result<ActivationView> {
  return state.activation
    ? { ok: true, value: state.activation }
    : { ok: false, code: 'missing_context', message: 'There is no payment to track yet.' };
}

export function setActivationPlan(state: RegistrationState, plan: RegistrationState['activationPlan']): Step<string> {
  return ok({ ...state, activationPlan: plan }, plan);
}

/** "Check status": advance one stage according to the demo activation plan. */
export function refreshActivation(state: RegistrationState): Step<ActivationView> {
  const a = state.activation;
  if (!a) return fail(state, 'missing_context', 'There is no payment to track yet.');
  let next: ActivationView = a;
  let draftState = state.draft.state;
  if (a.paymentState === 'pending') {
    const hold = state.activationPlan === 'payment_failed' ? null : checkoutHold(state.draft);
    if (hold) return fail(state, 'missing_context', HOLD_MESSAGE[hold]);
    if (state.activationPlan === 'payment_failed') {
      next = { ...a, paymentState: 'failed', retryAvailable: true };
      draftState = 'abandoned';
    } else {
      next = { ...a, paymentState: 'confirmed', provisioningState: 'pending' };
      draftState = 'provisioning';
    }
  } else if (a.paymentState === 'confirmed' && (a.provisioningState === 'pending' || a.provisioningState === 'attention')) {
    if (state.activationPlan === 'delayed' && a.provisioningState === 'pending') {
      next = { ...a, provisioningState: 'attention' };
    } else if (state.activationPlan === 'email_failed') {
      next = { ...a, provisioningState: 'ready', emailState: 'failed', retryAvailable: true };
      draftState = 'payment_confirmed';
    } else {
      next = { ...a, provisioningState: 'ready', emailState: 'sent', retryAvailable: true };
      draftState = 'access_email_ready';
    }
  }
  const checkout =
    state.checkout && next.paymentState === 'confirmed'
      ? { ...state.checkout, status: 'paid' as const }
      : state.checkout && next.paymentState === 'failed'
        ? { ...state.checkout, status: 'declined' as const }
        : state.checkout;
  return ok({ ...state, activation: next, checkout, draft: { ...state.draft, state: draftState } }, next);
}

/** Simulated resend; nothing is sent. */
export function resendAccessEmail(state: RegistrationState, deps: ServiceDeps): Step<ActivationView> {
  const a = state.activation;
  if (!a || a.paymentState !== 'confirmed' || a.provisioningState !== 'ready')
    return fail(state, 'conflict', 'The access email can be resent once setup is finished.');
  const next = { ...a, emailState: 'sent' as const };
  return ok({ ...state, activation: next, emailResentAt: iso(deps.now()), draft: { ...state.draft, state: 'access_email_ready' } }, next);
}

export const EMAIL_VARIANTS = ['owner', 'store_admin', 'checkout_unfinished', 'expired_resend'] as const;
export type EmailVariant = (typeof EMAIL_VARIANTS)[number];

export function isEmailVariant(v: unknown): v is EmailVariant {
  return typeof v === 'string' && (EMAIL_VARIANTS as readonly string[]).includes(v);
}

/** Inert local previews built from the registration draft. No token, no send. */
export function accessEmailPreviews(state: RegistrationState): Record<EmailVariant, AccessEmailView> {
  const owner = state.draft.owner;
  const ownerName = [owner.firstName, owner.lastName].filter(Boolean).join(' ') || 'Jordan Ellis';
  const ownerEmail = isEmail(owner.email) ? owner.email! : OWNER_JORDAN.email;
  const pharmacies = state.draft.pharmacies.filter((p) => p?.name);
  const names = pharmacies.map((p) => p.name!) ;
  const nominated = pharmacies.find((p) => p.adminAssignment?.kind === 'other');
  const admin = nominated?.adminAssignment?.kind === 'other' ? nominated.adminAssignment : null;
  const linkState = state.accessLink;
  return {
    owner: {
      recipientKind: 'owner',
      recipientName: ownerName,
      recipientEmailMasked: maskEmail(ownerEmail),
      pharmacyNames: names,
      subject: 'Set up your Pharmacy Books account',
      linkState,
      expiryLabel: '[LINK LIFETIME TBD]',
    },
    store_admin: {
      recipientKind: 'store_admin',
      recipientName: admin?.fullName || 'Sam Ortiz',
      recipientEmailMasked: maskEmail(admin?.email || 'sam@demo-pharmacy.example'),
      pharmacyNames: nominated?.name ? [nominated.name] : names.slice(0, 1),
      subject: `You've been invited to manage ${nominated?.name ?? 'a pharmacy'} in OwedBook`,
      linkState: 'valid',
      expiryLabel: '[LINK LIFETIME TBD]',
    },
    checkout_unfinished: {
      recipientKind: 'owner',
      recipientName: ownerName,
      recipientEmailMasked: maskEmail(ownerEmail),
      pharmacyNames: names,
      subject: 'Your Pharmacy Books signup is waiting',
      linkState: 'valid',
      expiryLabel: '[HOLD PERIOD TBD]',
    },
    expired_resend: {
      recipientKind: 'owner',
      recipientName: ownerName,
      recipientEmailMasked: maskEmail(ownerEmail),
      pharmacyNames: names,
      subject: 'Your new Pharmacy Books access link',
      linkState: 'valid',
      expiryLabel: '[LINK LIFETIME TBD]',
    },
  };
}

/** Owner opens the (valid) link: hands off to downstream account setup and the link is used. */
export function useAccessLink(state: RegistrationState): Step<'downstream_setup'> {
  if (state.accessLink !== 'valid') return fail(state, 'conflict', 'This link can no longer be used.');
  return ok({ ...state, accessLink: 'used' }, 'downstream_setup');
}

/** Neutral response: never reveals whether an account matches. */
export function requestNewAccessLink(state: RegistrationState): Step<'request_received'> {
  if (state.accessRequestFailNext)
    return fail({ ...state, accessRequest: 'error', accessRequestFailNext: false }, 'conflict', "We couldn't send a new link.");
  return ok({ ...state, accessRequest: 'request_sent' }, 'request_received');
}

export function setLinkState(state: RegistrationState, link: RegistrationState['accessLink']): Step<string> {
  return ok({ ...state, accessLink: link, accessRequest: 'idle' }, link);
}

export function advanceClock(state: RegistrationState, ms: number): Step<number> {
  const delta = Number.isFinite(ms) && ms > 0 ? Math.min(ms, 24 * 60 * 60 * 1000) : 0;
  const next = { ...state, clockOffsetMs: state.clockOffsetMs + delta };
  return ok(next, next.clockOffsetMs);
}
