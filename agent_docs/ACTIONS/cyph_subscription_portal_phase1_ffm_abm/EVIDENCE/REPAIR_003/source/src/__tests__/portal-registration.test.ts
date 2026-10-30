// Public registration engine (R-009 surface). Expected cents are hard-coded
// literals (DATA_CONTRACT §8), never computed with the code under test.
import * as reg from '@/services/portal/registration';
import * as pricing from '@/services/portal/pricing';
import type { RegistrationState } from '@/types/portal/state';
import { REGISTRATION_SCENARIOS } from '@/types/portal/state';
import type { PharmacyDraft } from '@/types/portal/contract';

const T0 = Date.parse('2026-10-27T08:00:00Z');
const at = (ms: number) => ({ now: () => ms });
const deps = at(T0);
const KEY = 'demo_key_000001';

function value<T>(step: { result: { ok: boolean } & ({ value: T } | object) }): T {
  if (!step.result.ok) throw new Error(`expected ok, got ${JSON.stringify(step.result)}`);
  return (step.result as { value: T }).value;
}

function pharmacy(n: number, overrides: Partial<PharmacyDraft> = {}): Partial<PharmacyDraft> {
  return {
    name: `Example Test Pharmacy ${n}`,
    street: '1 Test Street',
    city: 'Springfield',
    state: 'Alabama',
    zip: '00000',
    ncpdp: `000001${n}`,
    npi: `000000001${n}`,
    phone: '(555) 010-0199',
    software: 'Liberty',
    adminAssignment: { kind: 'owner' },
    ...overrides,
  };
}

const owner = {
  firstName: 'Jordan',
  lastName: 'Ellis',
  email: 'jordan@demo-pharmacy.example',
  mobile: '(555) 010-0144',
  ownerDeclarationAccepted: true,
};

/** Walk the real steps: count → owner → N pharmacies → quote. */
function completeDraft(n: number): RegistrationState {
  let s = reg.createRegistration('fresh');
  s = reg.setStoreCount(s, n).state;
  s = reg.saveOwner(s, owner).state;
  for (let i = 0; i < n; i++) {
    const step = reg.savePharmacy(s, i, pharmacy(i + 1));
    expect(step.result.ok).toBe(true);
    s = step.state;
  }
  return s;
}

describe('initial pricing fixtures', () => {
  it.each([
    [1, 9900],
    [2, 14800],
    [3, 19700],
  ])('%i store(s) recur at %i cents, due now equal without a code', (n, cents) => {
    const s = completeDraft(n);
    const quote = value<{ newRecurringCents: number; dueNowCents: number; discountCents: number }>(reg.requestQuote(s, deps));
    expect(quote.newRecurringCents).toBe(cents);
    expect(quote.dueNowCents).toBe(cents);
    expect(quote.discountCents).toBe(0);
  });

  it('DEMO10 lowers due-now by 1000 only; recurring unchanged', () => {
    const s = reg.requestQuote(completeDraft(2), deps).state;
    const step = reg.applyCode(s, ' demo10 ', deps);
    const quote = value<{ newRecurringCents: number; dueNowCents: number; discountCents: number }>(step);
    expect(quote.newRecurringCents).toBe(14800);
    expect(quote.dueNowCents).toBe(13800);
    expect(quote.discountCents).toBe(1000);
    expect(step.state.codeFeedback).toBe('applied');
  });

  it('an invalid code keeps the price and reports invalid', () => {
    const s = reg.requestQuote(completeDraft(1), deps).state;
    const step = reg.applyCode(s, 'APA2026', deps);
    expect(step.result).toMatchObject({ ok: false, code: 'validation' });
    expect(step.state.quote?.dueNowCents).toBe(9900);
    expect(step.state.codeFeedback).toBe('invalid');
  });

  it('an unavailable quote is an error, never a zero price', () => {
    const s = { ...completeDraft(2), quoteFailuresRemaining: 1 };
    const step = reg.requestQuote(s, deps);
    expect(step.result).toMatchObject({ ok: false, code: 'quote_unavailable' });
    expect(step.state.quote).toBeNull();
    expect(value<{ dueNowCents: number }>(reg.requestQuote(step.state, deps)).dueNowCents).toBe(14800);
  });
});

describe('store count and repeat-N', () => {
  it('rejects counts below 1 and non-integers', () => {
    const s = reg.createRegistration('fresh');
    expect(reg.setStoreCount(s, 0).result.ok).toBe(false);
    expect(reg.setStoreCount(s, 1.5).result.ok).toBe(false);
  });

  // REPAIR_001 Q2-G06: repeat-N has no business cap; only unrepresentable counts are rejected.
  it('accepts counts above 20 and prices them by repeat-N (literal cents)', () => {
    let s = reg.createRegistration('fresh');
    s = reg.setStoreCount(s, 21).state;
    s = reg.saveOwner(s, owner).state;
    for (let i = 0; i < 21; i++) {
      const step = reg.savePharmacy(s, i, pharmacy(i + 1, { ncpdp: String(1000000 + i), npi: String(1000000000 + i) }));
      expect(step.result.ok).toBe(true);
      s = step.state;
    }
    expect(s.draft.requestedStoreCount).toBe(21);
    expect(value<{ newRecurringCents: number; dueNowCents: number; proposedStoreCount: number }>(reg.requestQuote(s, deps))).toMatchObject({ newRecurringCents: 107900, dueNowCents: 107900, proposedStoreCount: 21 });
    expect(reg.setStoreCount(reg.createRegistration('fresh'), 25).result.ok).toBe(true);
  });

  it('rejects unsafe or non-numeric counts explicitly', () => {
    const s = reg.createRegistration('fresh');
    for (const bad of [Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER + 2, Infinity, NaN, -1, '3', null]) {
      expect(reg.setStoreCount(s, bad).result).toMatchObject({ ok: false });
    }
    expect(reg.setStoreCount(s, Number.MAX_SAFE_INTEGER).result).toMatchObject({ ok: false, code: 'validation', message: "That many pharmacies can't be priced exactly." });
  });

  it('reports which entered pharmacies a reduction would discard', () => {
    const s = completeDraft(3);
    expect(reg.storeCountDiscards(s, 1)).toEqual(['Example Test Pharmacy 2', 'Example Test Pharmacy 3']);
    expect(reg.storeCountDiscards(s, 3)).toEqual([]);
    const blank = reg.setStoreCount(reg.createRegistration('fresh'), 2).state;
    expect(reg.storeCountDiscards(blank, 1)).toEqual([]);
  });

  it('requires N valid pharmacy records before checkout', () => {
    let s = reg.createRegistration('fresh');
    s = reg.setStoreCount(s, 3).state;
    s = reg.saveOwner(s, owner).state;
    s = reg.savePharmacy(s, 0, pharmacy(1)).state;
    s = reg.savePharmacy(s, 1, pharmacy(2)).state;
    expect(reg.firstIncomplete(s.draft)).toEqual({ step: 'pharmacy', index: 2 });
    s = reg.requestQuote(s, deps).state;
    const step = reg.startCheckout(s, { quoteId: s.quote!.id, consents: { ...s.draft.consents, termsAccepted: true, recurringChargeAccepted: true }, operationKey: KEY }, deps);
    expect(step.result).toMatchObject({ ok: false, code: 'missing_context' });
  });

  it('rejects a pharmacy index outside the requested count', () => {
    const s = reg.setStoreCount(reg.createRegistration('fresh'), 2).state;
    expect(reg.savePharmacy(s, 2, pharmacy(3)).result).toMatchObject({ ok: false, code: 'missing_context' });
  });
});

describe('validation', () => {
  it('keeps leading zeros and requires 7/10 digit identifiers', () => {
    let s = reg.setStoreCount(reg.createRegistration('fresh'), 1).state;
    const bad = reg.savePharmacy(s, 0, pharmacy(1, { ncpdp: '00000', npi: '000' }));
    expect(bad.result).toMatchObject({ ok: false, code: 'validation' });
    const errors = (bad.result as { fieldErrors: Record<string, string> }).fieldErrors;
    expect(Object.keys(errors).sort()).toEqual(['ncpdp', 'npi']);
    expect(bad.state.draft.pharmacies[0].ncpdp).toBe('00000'); // input retained
    s = reg.savePharmacy(s, 0, pharmacy(1, { ncpdp: '0001234', npi: '0000000099' })).state;
    expect(s.draft.pharmacies[0].ncpdp).toBe('0001234');
  });

  it('requires the conditional Other-software and other-admin fields', () => {
    const s = reg.setStoreCount(reg.createRegistration('fresh'), 1).state;
    const step = reg.savePharmacy(s, 0, pharmacy(1, { software: 'Other', adminAssignment: { kind: 'other', fullName: '', email: 'nope' } }));
    const errors = (step.result as { fieldErrors: Record<string, string> }).fieldErrors;
    expect(Object.keys(errors).sort()).toEqual(['adminEmail', 'adminName', 'softwareOther']);
  });

  it('flags a duplicate pharmacy without naming the other owner and keeps the draft', () => {
    const s = reg.setStoreCount(reg.createRegistration('fresh'), 1).state;
    const step = reg.savePharmacy(s, 0, pharmacy(1, { ncpdp: '0000099' }));
    expect(step.result).toMatchObject({ ok: false, code: 'duplicate' });
    expect(JSON.stringify(step.result)).not.toMatch(/@|Ellis|Ortiz/);
    expect(step.state.draft.pharmacies[0].name).toBe('Example Test Pharmacy 1');
  });

  it('treats the existing-account email as a conflict', () => {
    const step = reg.saveOwner(reg.createRegistration('fresh'), { ...owner, email: 'existing.owner@demo-pharmacy.example' });
    expect(step.result).toMatchObject({ ok: false, code: 'conflict' });
  });

});

// R-011: owner-only registration with an explicit owner declaration (Coach-approved).
describe('owner declaration (R-011)', () => {
  const errorsOf = (step: { result: unknown }) => (step.result as { fieldErrors?: Record<string, string> }).fieldErrors ?? {};

  it('a fresh draft starts unaccepted; seeded scenarios carry the synthetic fixture acceptance', () => {
    expect(reg.createRegistration('fresh').draft.owner.ownerDeclarationAccepted).toBeUndefined();
    expect(reg.createRegistration('prefilled_two_store').draft.owner.ownerDeclarationAccepted).toBe(true);
  });

  it.each([[undefined], [false], ['true'], [1], [null]])('declaration %p blocks the owner step at the service', (value) => {
    const step = reg.saveOwner(reg.createRegistration('fresh'), { ...owner, ownerDeclarationAccepted: value as never });
    expect(step.result).toMatchObject({ ok: false, code: 'validation' });
    expect(errorsOf(step)).toEqual({ ownerDeclaration: 'Confirm that you are the pharmacy owner to continue.' });
  });

  // A quote only prices the store count; the mock SUBMISSION is startCheckout.
  it('missing declaration blocks review and the mock checkout submission even when every other field is complete', () => {
    let s = completeDraft(2);
    s = reg.keepOwner(s, { ...owner, ownerDeclarationAccepted: false }).state;
    expect(reg.firstIncomplete(s.draft)).toEqual({ step: 'owner' });
    expect(reg.isDraftComplete(s.draft)).toBe(false);
    const quoted = reg.requestQuote(completeDraft(2), deps).state;
    const unaccepted = reg.keepOwner(quoted, { ...owner, ownerDeclarationAccepted: false }).state;
    const consents = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
    const start = reg.startCheckout(unaccepted, { quoteId: quoted.quote!.id, consents, operationKey: KEY }, deps);
    expect(start.result).toMatchObject({ ok: false, code: 'missing_context' });
    expect(start.state.checkout).toBeNull();
  });

  it('an accepted declaration survives Back (keep) and a reload (JSON round trip)', () => {
    const saved = reg.saveOwner(reg.createRegistration('fresh'), owner).state;
    const back = reg.keepOwner(saved, { ...saved.draft.owner, firstName: 'Jordan' }).state;
    const reloaded = JSON.parse(JSON.stringify(back));
    expect(reloaded.draft.owner.ownerDeclarationAccepted).toBe(true);
    expect(reg.saveOwner(reloaded, reloaded.draft.owner).result.ok).toBe(true);
  });

  it('a pre-R-011 draft (job title, no declaration) is migrated WITHOUT acceptance', () => {
    const v1 = JSON.parse(JSON.stringify(reg.requestQuote(completeDraft(2), deps).state));
    delete v1.draft.owner.ownerDeclarationAccepted;
    v1.draft.owner.businessRole = 'owner';
    const migrated = reg.migrateRegistration(v1);
    expect(migrated.draft.owner).not.toHaveProperty('businessRole');
    expect(migrated.draft.owner.ownerDeclarationAccepted).toBe(false);
    expect(migrated.quote).toBeNull();
    expect(reg.firstIncomplete(migrated.draft)).toEqual({ step: 'owner' });
    expect(migrated.draft.pharmacies).toEqual(v1.draft.pharmacies); // entered details are kept
    expect(reg.migrateRegistration(null).draft.owner).toEqual({});
  });

  it('a job title no longer exists or affects registration', () => {
    const step = reg.saveOwner(reg.createRegistration('fresh'), { ...owner, businessRole: 'superadmin' } as never);
    expect(step.result.ok).toBe(true);
    expect(step.state.draft.owner).not.toHaveProperty('businessRole');
    const without = reg.saveOwner(reg.createRegistration('fresh'), owner);
    expect(step.state.draft.owner).toEqual(without.state.draft.owner);
  });

  it('Me / Someone else never moves ownership: the registering owner stays the billing/access recipient', () => {
    let s = reg.createRegistration('fresh');
    s = reg.setStoreCount(s, 2).state;
    s = reg.saveOwner(s, owner).state;
    s = reg.savePharmacy(s, 0, pharmacy(1)).state; // Me
    s = reg.savePharmacy(s, 1, pharmacy(2, { adminAssignment: { kind: 'other', fullName: 'Sam Ortiz', email: 'sam@demo-pharmacy.example' } })).state;
    const previews = reg.accessEmailPreviews(s);
    expect(previews.owner).toMatchObject({ recipientKind: 'owner', recipientName: 'Jordan Ellis' });
    expect(previews.store_admin).toMatchObject({ recipientKind: 'store_admin', recipientName: 'Sam Ortiz' });
    expect(s.draft.owner).toMatchObject({ email: 'jordan@demo-pharmacy.example', ownerDeclarationAccepted: true });
  });
});

describe('quote freshness and consent', () => {
  function ready() {
    const s = reg.requestQuote(completeDraft(2), deps).state;
    return { s, quoteId: s.quote!.id };
  }
  const consented = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };

  it('requires both consents', () => {
    const { s, quoteId } = ready();
    const step = reg.startCheckout(s, { quoteId, consents: { ...consented, recurringChargeAccepted: false }, operationKey: KEY }, deps);
    expect(step.result).toMatchObject({ ok: false, code: 'validation', fieldErrors: { recurring: expect.any(String) } });
    expect(step.state.checkout).toBeNull();
  });

  it('rejects an expired quote by the injected clock, with no mutation', () => {
    const { s, quoteId } = ready();
    const later = at(T0 + 30 * 60 * 1000);
    const step = reg.startCheckout(s, { quoteId, consents: consented, operationKey: KEY }, later);
    expect(step.result).toMatchObject({ ok: false, code: 'quote_expired' });
    expect(step.state).toBe(s);
  });

  it('rejects a quote from an earlier revision after a material edit and clears consent', () => {
    const { s, quoteId } = ready();
    const withConsent = reg.setConsents(s, consented).state;
    const edited = reg.savePharmacy(withConsent, 1, pharmacy(2, { name: 'Renamed Pharmacy' })).state;
    expect(edited.draft.consents.termsAccepted).toBe(false);
    expect(edited.quote).toBeNull();
    const step = reg.startCheckout({ ...edited, quote: s.quote }, { quoteId, consents: consented, operationKey: KEY }, deps);
    expect(step.result).toMatchObject({ ok: false, code: 'conflict' });
  });

  it('a refreshed quote has a new id and clears consent', () => {
    const { s, quoteId } = ready();
    const refreshed = reg.requestQuote(reg.setConsents(s, consented).state, deps).state;
    expect(refreshed.quote!.id).not.toBe(quoteId);
    expect(refreshed.draft.consents.termsAccepted).toBe(false);
  });
});

describe('checkout boundary', () => {
  const consented = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
  function checkoutPending() {
    const s = reg.requestQuote(completeDraft(1), deps).state;
    return reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: KEY }, deps);
  }

  it('same operation key replays the same handoff; a different key cannot start a second checkout', () => {
    const first = checkoutPending();
    expect(first.result).toMatchObject({ ok: true, value: { destination: 'stripe_checkout', isDemo: true } });
    const replay = reg.startCheckout(first.state, { quoteId: first.state.quote!.id, consents: consented, operationKey: KEY }, deps);
    expect(replay.result.ok).toBe(true);
    expect(replay.state).toBe(first.state);
    const second = reg.startCheckout(first.state, { quoteId: first.state.quote!.id, consents: consented, operationKey: 'demo_key_000002' }, deps);
    expect(second.result).toMatchObject({ ok: false, code: 'conflict' });
  });

  it('starting checkout does not confirm payment or activate anything', () => {
    const s = checkoutPending().state;
    expect(s.checkout?.status).toBe('pending');
    expect(s.activation).toBeNull();
    expect(reg.readActivation(s).ok).toBe(false);
  });

  it('back from Stripe keeps the draft resumable and inactive; resume needs a fresh quote', () => {
    const back = reg.resolveCheckout(checkoutPending().state, 'back').state;
    expect(back.checkout?.status).toBe('abandoned');
    expect(back.activation).toBeNull();
    const resumed = reg.resumeSignup(back).state;
    expect(resumed.draft.pharmacies[0].name).toBe('Example Test Pharmacy 1');
    expect(resumed.quote).toBeNull();
    expect(resumed.checkout).toBeNull();
  });

  it('unknown payment blocks a new checkout until resolved', () => {
    const unknown = reg.resolveCheckout(checkoutPending().state, 'unknown').state;
    const retry = reg.startCheckout(unknown, { quoteId: unknown.quote!.id, consents: consented, operationKey: 'demo_key_000003' }, deps);
    expect(retry.result).toMatchObject({ ok: false, code: 'conflict' });
    expect(reg.resumeSignup(unknown).result.ok).toBe(false);
    const paid = reg.resolveUnknownPayment(unknown, 'paid').state;
    expect(paid.activation?.paymentState).toBe('confirmed');
  });

  it('rejects outcomes outside the enum', () => {
    expect(reg.resolveCheckout(checkoutPending().state, 'success=true').result.ok).toBe(false);
  });
});

describe('activation and access', () => {
  const consented = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
  function paid(plan: RegistrationState['activationPlan'] = 'ready') {
    let s = reg.requestQuote(completeDraft(2), deps).state;
    s = reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: KEY }, deps).state;
    s = reg.setActivationPlan(s, plan).state;
    return reg.resolveCheckout(s, 'paid').state;
  }

  it('keeps payment, setup and email as separate tracks', () => {
    const s = paid();
    expect(s.activation).toMatchObject({ paymentState: 'confirmed', provisioningState: 'pending', emailState: 'not_started' });
    const ready = reg.refreshActivation(s).state;
    expect(ready.activation).toMatchObject({ paymentState: 'confirmed', provisioningState: 'ready', emailState: 'sent' });
  });

  it('delayed setup stays paid (never asks to pay again) and recovers', () => {
    const delayed = reg.refreshActivation(paid('delayed')).state;
    expect(delayed.activation).toMatchObject({ paymentState: 'confirmed', provisioningState: 'attention' });
    expect(delayed.checkout?.status).toBe('paid');
    const recovered = reg.refreshActivation(delayed).state;
    expect(recovered.activation?.provisioningState).toBe('ready');
  });

  it('email failure keeps the payment confirmed and resend is simulated', () => {
    const failed = reg.refreshActivation(paid('email_failed')).state;
    expect(failed.activation).toMatchObject({ paymentState: 'confirmed', emailState: 'failed' });
    const resent = reg.resendAccessEmail(failed, deps).state;
    expect(resent.activation?.emailState).toBe('sent');
    expect(resent.emailResentAt).toBe('2026-10-27T08:00:00.000Z');
  });

  it('owner and nominated admin previews use the submitted draft', () => {
    let s = reg.setStoreCount(reg.createRegistration('fresh'), 2).state;
    s = reg.saveOwner(s, owner).state;
    s = reg.savePharmacy(s, 0, pharmacy(1)).state;
    s = reg.savePharmacy(s, 1, pharmacy(2, { adminAssignment: { kind: 'other', fullName: 'Sam Ortiz', email: 'sam@demo-pharmacy.example' } })).state;
    const previews = reg.accessEmailPreviews(s);
    expect(previews.owner).toMatchObject({ recipientName: 'Jordan Ellis', recipientEmailMasked: 'j•••@demo-pharmacy.example' });
    expect(previews.owner.pharmacyNames).toEqual(['Example Test Pharmacy 1', 'Example Test Pharmacy 2']);
    expect(previews.store_admin).toMatchObject({ recipientName: 'Sam Ortiz', pharmacyNames: ['Example Test Pharmacy 2'] });
  });

  it('access-link request feedback is neutral and the link is single use', () => {
    const s = reg.createRegistration('link_expired');
    expect(reg.useAccessLink(s).result.ok).toBe(false);
    expect(reg.requestNewAccessLink(s).result).toEqual({ ok: true, value: 'request_received' });
    const valid = reg.createRegistration('activation_ready');
    const used = reg.useAccessLink(valid).state;
    expect(used.accessLink).toBe('used');
    expect(reg.useAccessLink(used).result.ok).toBe(false);
  });
});

describe('scenarios', () => {
  it('rejects scenario ids outside the enum', () => {
    const s = reg.createRegistration('fresh');
    expect(reg.selectScenario(s, '<script>').result.ok).toBe(false);
    expect(reg.selectScenario(s, 'prefilled_two_store').state.draft.requestedStoreCount).toBe(2);
  });

  it('every scenario seed is constructible and stays synthetic', () => {
    for (const id of REGISTRATION_SCENARIOS) {
      const s = reg.createRegistration(id);
      expect(JSON.stringify(s)).not.toMatch(/@(?!demo-pharmacy\.example)/);
    }
  });
});

describe('repeat-N pricing bound (REPAIR_001 Q2-G06)', () => {
  it('prices 1/2/3/21/1000 stores by 9900 + 4900·(N−1) (literal cents)', () => {
    expect([1, 2, 3, 21, 1000].map(pricing.initialRecurringCents)).toEqual([9900, 14800, 19700, 107900, 4905000]);
  });
  it('the only upper bound keeps the total an exact safe integer', () => {
    const max = pricing.MAX_REPRESENTABLE_STORES;
    expect(max).toBeGreaterThan(1_000_000_000);
    expect(Number.isSafeInteger(pricing.initialRecurringCents(max))).toBe(true);
    expect(pricing.isValidStoreCount(max + 1)).toBe(false);
    expect(() => pricing.initialRecurringCents(max + 1)).toThrow(RangeError);
  });
});

// REPAIR_002 (RULINGS R-012). CR-F01: an unpaid checkout never reaches payment
// while the owner declaration is not exactly true. CR-F02: work and memory are
// bounded by the pharmacies entered, never by the requested count.
describe('pending checkout respects current prerequisites (R-012, CR-F01)', () => {
  const consented = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
  const withdrawn = { ...owner, ownerDeclarationAccepted: false };
  function open(n = 1, key = KEY) {
    const s = reg.requestQuote(completeDraft(n), deps).state;
    return reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: key }, deps).state;
  }
  function refused(step: { state: RegistrationState; result: { ok: boolean } }, before: RegistrationState) {
    expect(step.result).toMatchObject({ ok: false });
    expect(step.state).toBe(before);
  }

  it('A: withdrawing the declaration on the owner step closes the open checkout; pay and replay are refused', () => {
    const pending = open();
    const w = reg.saveOwner(pending, withdrawn);
    expect(w.result).toMatchObject({ ok: false, code: 'validation', fieldErrors: { ownerDeclaration: expect.any(String) } });
    expect(w.state.checkout).toMatchObject({ operationKey: KEY, status: 'abandoned', closedReason: 'owner_declaration' });
    expect(w.state.quote).toBeNull();
    expect(w.state.draft.consents).toMatchObject({ termsAccepted: false, recurringChargeAccepted: false });
    expect(w.state.draft.owner.ownerDeclarationAccepted).toBe(false);
    expect(w.state.draft.pharmacies[0].name).toBe('Example Test Pharmacy 1'); // details kept
    for (const outcome of ['paid', 'processing'] as const) refused(reg.resolveCheckout(w.state, outcome), w.state);
    expect(reg.startCheckout(w.state, { quoteId: pending.quote!.id, consents: consented, operationKey: KEY }, deps).result.ok).toBe(false);
    expect(w.state.activation).toBeNull();
  });

  it('A: Back with the box unticked (keepOwner) closes it the same way', () => {
    const k = reg.keepOwner(open(), withdrawn).state;
    expect(k.checkout).toMatchObject({ status: 'abandoned', closedReason: 'owner_declaration' });
    refused(reg.resolveCheckout(k, 'paid'), k);
  });

  it('B: a legacy (storage v1) draft restored over a pending checkout cannot be paid', () => {
    const s = open(1, 'qa_legacy_pending');
    delete (s.draft.owner as Record<string, unknown>).ownerDeclarationAccepted;
    (s.draft.owner as Record<string, unknown>).businessRole = 'owner';
    const m = reg.migrateRegistration(JSON.parse(JSON.stringify(s)));
    expect(m.draft.owner.ownerDeclarationAccepted).toBe(false);
    expect(m.draft.owner).not.toHaveProperty('businessRole');
    expect(m.quote).toBeNull();
    expect(m.checkout).toMatchObject({ status: 'abandoned', closedReason: 'owner_declaration' });
    expect(m.draft.owner.firstName).toBe('Jordan');
    refused(reg.resolveCheckout(m, 'paid'), m);
    expect(reg.startCheckout(m, { quoteId: s.quote!.id, consents: consented, operationKey: 'qa_legacy_pending' }, deps).result.ok).toBe(false);
  });

  it('B: a v1 draft never carries acceptance over, even if the field is present', () => {
    const s = open();
    const m = reg.migrateRegistration(JSON.parse(JSON.stringify(s)));
    expect(m.draft.owner.ownerDeclarationAccepted).toBe(false);
    expect(m.checkout?.status).toBe('abandoned');
  });

  it('a stored pending checkout with the declaration already false (no transition) is held at every step toward payment', () => {
    const pending = open();
    const tampered: RegistrationState = { ...pending, draft: { ...pending.draft, owner: { ...pending.draft.owner, ownerDeclarationAccepted: false } } };
    expect(reg.checkoutHold(tampered.draft)).toBe('owner_declaration');
    refused(reg.startCheckout(tampered, { quoteId: pending.quote!.id, consents: consented, operationKey: KEY }, deps), tampered);
    refused(reg.resolveCheckout(tampered, 'paid'), tampered);
    refused(reg.resolveCheckout(tampered, 'processing'), tampered);
    // Non-advancing outcomes stay available.
    expect(reg.resolveCheckout(tampered, 'back').state.checkout?.status).toBe('abandoned');
    for (const bad of [undefined, 'true', 1, null]) {
      const forged = { ...tampered, draft: { ...tampered.draft, owner: { ...tampered.draft.owner, ownerDeclarationAccepted: bad as unknown as boolean } } };
      refused(reg.resolveCheckout(forged, 'paid'), forged);
    }
  });

  it('a submitted payment (processing) is held, not closed, while the declaration is withdrawn', () => {
    const processing = reg.resolveCheckout(open(), 'processing').state;
    const w = reg.keepOwner(processing, withdrawn).state;
    expect(w.checkout?.status).toBe('pending');
    expect(w.checkout?.closedReason).toBeUndefined();
    refused(reg.refreshActivation(w), w);
    // The failure path still plays; it doesn't advance toward payment.
    const failPlan = reg.setActivationPlan(w, 'payment_failed').state;
    expect(value<{ paymentState: string }>(reg.refreshActivation(failPlan)).paymentState).toBe('failed');
    // Explicit acceptance lets the same payment confirm.
    const back = reg.saveOwner(w, owner);
    expect(back.result.ok).toBe(true);
    expect(value<{ paymentState: string }>(reg.refreshActivation(back.state)).paymentState).toBe('confirmed');
  });

  it('an unknown payment is held while the declaration is withdrawn; "nothing charged" still resolves', () => {
    const unknown = reg.resolveCheckout(open(), 'unknown').state;
    const w = reg.keepOwner(unknown, withdrawn).state;
    expect(w.checkout?.status).toBe('unknown');
    refused(reg.resolveUnknownPayment(w, 'paid'), w);
    expect(reg.resolveUnknownPayment(w, 'not_charged').state.checkout?.status).toBe('abandoned');
    const accepted = reg.keepOwner(w, owner).state;
    expect(reg.resolveUnknownPayment(accepted, 'paid').state.activation?.paymentState).toBe('confirmed');
  });

  it('a declined checkout is closed on withdrawal, so "another card works" is refused', () => {
    const declined = reg.resolveCheckout(open(), 'declined').state;
    const w = reg.keepOwner(declined, withdrawn).state;
    expect(w.checkout).toMatchObject({ status: 'abandoned', closedReason: 'owner_declaration' });
    refused(reg.resolveCheckout(w, 'paid'), w);
  });

  it('valid recovery: explicit acceptance → fresh quote → fresh consent → new checkout → paid', () => {
    const closed = reg.saveOwner(open(), withdrawn).state;
    const accepted = reg.saveOwner(closed, owner);
    expect(accepted.result.ok).toBe(true);
    // Acceptance alone doesn't reopen the closed checkout or restore consent.
    expect(accepted.state.checkout?.status).toBe('abandoned');
    expect(accepted.state.draft.consents.termsAccepted).toBe(false);
    expect(reg.resolveCheckout(accepted.state, 'paid').result.ok).toBe(false);
    let s = reg.resumeSignup(accepted.state).state;
    expect(s.checkout).toBeNull();
    s = reg.requestQuote(s, deps).state;
    // Consent is required again for the new quote.
    expect(reg.startCheckout(s, { quoteId: s.quote!.id, consents: { ...consented, termsAccepted: false }, operationKey: 'demo_key_000010' }, deps).result).toMatchObject({ ok: false, code: 'validation' });
    const started = reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: 'demo_key_000010' }, deps);
    expect(started.result.ok).toBe(true);
    // Same-operation replay of the NEW checkout is still idempotent.
    const replay = reg.startCheckout(started.state, { quoteId: s.quote!.id, consents: consented, operationKey: 'demo_key_000010' }, deps);
    expect(replay.result.ok).toBe(true);
    expect(replay.state).toBe(started.state);
    const paid = reg.resolveCheckout(started.state, 'paid').state;
    expect(paid.checkout).toMatchObject({ operationKey: 'demo_key_000010', status: 'paid' });
    expect(paid.activation?.paymentState).toBe('confirmed');
    expect(paid.draft.owner.ownerDeclarationAccepted).toBe(true);
  });

  it('completed payment history is never closed or reversed by a later draft edit', () => {
    const paid = reg.resolveCheckout(open(), 'paid').state;
    const w = reg.keepOwner(paid, withdrawn).state;
    expect(w.checkout).toEqual(paid.checkout);
    expect(w.activation).toEqual(paid.activation);
    const edited = reg.setStoreCount(paid, 2).state;
    expect(edited.checkout).toEqual(paid.checkout);
  });

  it('R2-N01: changing the store count while a checkout is open closes it (the open checkout was priced for the old count)', () => {
    const pending = open();
    const changed = reg.setStoreCount(pending, 2).state;
    expect(changed.checkout).toMatchObject({ status: 'abandoned', closedReason: 'details_changed' });
    refused(reg.resolveCheckout(changed, 'paid'), changed);
    // A pharmacy edit does the same.
    const edited = reg.savePharmacy(pending, 0, pharmacy(1, { city: 'Shelbyville' })).state;
    expect(edited.checkout).toMatchObject({ status: 'abandoned', closedReason: 'details_changed' });
  });

  it('unchanged replay and payment for a valid draft still work', () => {
    const pending = open();
    expect(reg.checkoutHold(pending.draft)).toBeNull();
    expect(reg.startCheckout(pending, { quoteId: pending.quote!.id, consents: consented, operationKey: KEY }, deps).state).toBe(pending);
    // Saving the same accepted owner again doesn't close anything.
    expect(reg.saveOwner(pending, owner).state.checkout?.status).toBe('pending');
    expect(reg.resolveCheckout(pending, 'paid').state.checkout?.status).toBe('paid');
  });
});

describe('count-driven work is bounded (R-012, CR-F02)', () => {
  /** Counts Array.prototype.push calls inside fn and aborts past a small budget (no huge allocation is ever attempted). */
  function countPushes(fn: () => void, budget = 64): { pushes: number; aborted: boolean } {
    const push = Array.prototype.push;
    const marker = new Error('push budget');
    let pushes = 0;
    let aborted = false;
    try {
      Array.prototype.push = function (this: unknown[], ...items: unknown[]) {
        pushes += items.length;
        if (pushes > budget) throw marker;
        return push.apply(this, items);
      };
      fn();
    } catch (e) {
      if (e !== marker) throw e;
      aborted = true;
    } finally {
      Array.prototype.push = push;
    }
    return { pushes, aborted };
  }
  const BILLION = 1_000_000_000;

  it('a billion-store count allocates no pharmacy entries and prices exactly', () => {
    const before = reg.createRegistration('fresh').draft.pharmacies.length;
    let s = billion();
    expect(s.draft.requestedStoreCount).toBe(BILLION);
    expect(s.draft.pharmacies.length).toBe(before);
    s = reg.saveOwner(s, owner).state;
    expect(reg.firstIncomplete(s.draft)).toEqual({ step: 'pharmacy', index: 0 });
    expect(reg.isDraftComplete(s.draft)).toBe(false);
    // 9900 + 4900 × 999,999,999 = 4,900,000,005,000 cents (literal).
    expect(value<{ newRecurringCents: number }>(reg.requestQuote(s, deps)).newRecurringCents).toBe(4_900_000_005_000);
  });

  /** setStoreCount(BILLION) inside the budget: a count-sized loop aborts instead of exhausting memory. */
  function billion(): RegistrationState {
    let s = reg.createRegistration('fresh');
    const probe = countPushes(() => {
      s = reg.setStoreCount(s, BILLION).state;
    });
    expect(probe).toEqual({ pushes: 0, aborted: false });
    return s;
  }

  it('pharmacy steps fill in order: a far index is refused without growing the array', () => {
    let s = reg.saveOwner(billion(), owner).state;
    s = reg.savePharmacy(s, 0, pharmacy(1)).state;
    for (const index of [BILLION - 1, 5, 2]) {
      expect(reg.isPharmacyStep(s.draft, index)).toBe(false);
      const step = reg.savePharmacy(s, index, pharmacy(9));
      expect(step.result).toMatchObject({ ok: false, code: 'missing_context' });
      expect(step.state.draft.pharmacies.length).toBe(1);
      expect(reg.keepPharmacy(s, index, pharmacy(9)).state.draft.pharmacies.length).toBe(1);
    }
    expect(reg.isPharmacyStep(s.draft, 1)).toBe(true);
    expect(reg.savePharmacy(s, 1, pharmacy(2)).state.draft.pharmacies.length).toBe(2);
  });

  it('the largest representable count is accepted in constant work; one more is refused', () => {
    const max = pricing.MAX_REPRESENTABLE_STORES;
    let accepted = false;
    const probe = countPushes(() => {
      accepted = reg.setStoreCount(reg.createRegistration('fresh'), max).result.ok;
    });
    expect(probe).toEqual({ pushes: 0, aborted: false });
    expect(accepted).toBe(true);
    expect(reg.setStoreCount(reg.createRegistration('fresh'), max + 1).result).toMatchObject({ ok: false, code: 'validation' });
  });

  it('a restored draft with an extreme or malformed count is handled without count-sized work', () => {
    const base = reg.createRegistration('prefilled_one_store');
    const huge: RegistrationState = { ...base, draft: { ...base.draft, requestedStoreCount: BILLION } };
    let gate: ReturnType<typeof reg.firstIncomplete> | null = null;
    let discards: string[] | null = null;
    const probe = countPushes(() => {
      gate = reg.firstIncomplete(huge.draft);
      discards = reg.storeCountDiscards(huge, 1);
    });
    expect(probe.aborted).toBe(false); // a handful of pushes for one entered pharmacy, not one per requested store
    expect(gate).toEqual({ step: 'pharmacy', index: 1 });
    expect(discards).toEqual([]);
    for (const bad of [-5, 0, 1.5, 1e300, NaN, '3', null]) {
      const d = { ...base.draft, requestedStoreCount: bad as unknown as number };
      expect(reg.firstIncomplete(d)).toEqual({ step: 'plan' });
      expect(reg.isPharmacyStep(d, 0)).toBe(false);
      expect(reg.requestQuote({ ...base, draft: d }, deps).result).toMatchObject({ ok: false, code: 'missing_context' });
    }
  });

  it('count reduction and restoration keep entered pharmacies coherent; 1/2/3 stores unchanged', () => {
    let s = completeDraft(3);
    s = reg.setStoreCount(s, 1).state;
    expect(s.draft.pharmacies.map((p) => p.name)).toEqual(['Example Test Pharmacy 1']);
    s = reg.setStoreCount(s, 3).state;
    expect(s.draft.pharmacies.length).toBe(1);
    expect(reg.firstIncomplete(s.draft)).toEqual({ step: 'pharmacy', index: 1 });
    s = reg.savePharmacy(s, 1, pharmacy(2)).state;
    s = reg.savePharmacy(s, 2, pharmacy(3)).state;
    expect(reg.isDraftComplete(s.draft)).toBe(true);
    expect([1, 2, 3].map((n) => value<{ dueNowCents: number }>(reg.requestQuote(completeDraft(n), deps)).dueNowCents)).toEqual([9900, 14800, 19700]);
  });
});

describe('a submitted payment stays bound to what it was quoted for (R-013, R2-F01)', () => {
  const consented = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
  type Mode = 'processing' | 'unknown';
  function submitted(mode: Mode, n = 1): RegistrationState {
    const s = reg.requestQuote(completeDraft(n), deps).state;
    const opened = reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: KEY }, deps).state;
    return reg.resolveCheckout(opened, mode).state;
  }
  /** The step that would confirm the in-flight payment. */
  const confirm = (mode: Mode, s: RegistrationState) => (mode === 'processing' ? reg.refreshActivation(s) : reg.resolveUnknownPayment(s, 'paid'));
  const EDITS: Record<string, (s: RegistrationState) => RegistrationState> = {
    'pharmacy name': (s) => reg.savePharmacy(s, 0, pharmacy(1, { name: 'Changed after submission' })).state,
    'store count 1 → 2 with a second pharmacy': (s) => reg.savePharmacy(reg.setStoreCount(s, 2).state, 1, pharmacy(2)).state,
    'discount code': (s) => reg.applyCode(s, pricing.DEMO_CODE, deps).state,
  };

  it('a new checkout records the pharmacies, count, code and price it was quoted for', () => {
    const s = submitted('processing', 2);
    expect(s.checkout?.scope).toEqual({
      storeCount: 2,
      pharmacies: [expect.objectContaining({ name: 'Example Test Pharmacy 1' }), expect.objectContaining({ name: 'Example Test Pharmacy 2' })],
      dueNowCents: 14800,
    });
    expect(reg.checkoutHold(s.draft, s.checkout)).toBeNull();
  });

  for (const mode of ['processing', 'unknown'] as const)
    for (const [edit, apply] of Object.entries(EDITS))
      it(`${mode}: after a ${edit} edit the original payment can't confirm the edited signup`, () => {
        const before = submitted(mode);
        const edited = apply(before);
        expect(reg.isDraftComplete(edited.draft)).toBe(true);
        // The in-flight payment is held, not closed or charged again.
        expect(edited.checkout).toMatchObject({ operationKey: KEY, status: mode === 'processing' ? 'pending' : 'unknown' });
        expect(edited.checkout?.scope).toMatchObject({ storeCount: 1, dueNowCents: 9900 });
        expect(reg.checkoutHold(edited.draft, edited.checkout)).toBe('scope_changed');
        const step = confirm(mode, edited);
        expect(step.result).toMatchObject({ ok: false });
        expect(step.state).toBe(edited);
        // No second payment can start while this one is in flight.
        const again = reg.requestQuote(edited, deps).state;
        expect(reg.startCheckout(again, { quoteId: again.quote!.id, consents: consented, operationKey: 'demo_key_000099' }, deps).result).toMatchObject({ ok: false, code: 'conflict' });
      });

  for (const mode of ['processing', 'unknown'] as const)
    it(`${mode}: "use the details I paid for" restores the submitted scope, then the payment confirms exactly that`, () => {
      const before = submitted(mode);
      const edited = EDITS['store count 1 → 2 with a second pharmacy'](before);
      const restored = reg.restoreSubmittedScope(edited);
      expect(restored.result.ok).toBe(true);
      const s = restored.state;
      expect(s.draft.requestedStoreCount).toBe(1);
      expect(s.draft.pharmacies.map((p) => p.name)).toEqual(['Example Test Pharmacy 1']);
      expect(s.draft.revision).toBeGreaterThan(edited.draft.revision);
      expect(s.checkout).toEqual(before.checkout);
      expect(reg.checkoutHold(s.draft, s.checkout)).toBeNull();
      const paid = confirm(mode, s).state;
      expect(paid.checkout).toMatchObject({ operationKey: KEY, status: 'paid', scope: { storeCount: 1, dueNowCents: 9900 } });
      expect(paid.activation?.paymentState).toBe('confirmed');
      expect(paid.draft.pharmacies.map((p) => p.name)).toEqual(['Example Test Pharmacy 1']);
    });

  it('typing the original values back in is the same scope; nothing to restore when nothing changed', () => {
    const before = submitted('processing');
    const changed = EDITS['pharmacy name'](before);
    const back = reg.savePharmacy(changed, 0, pharmacy(1)).state;
    expect(reg.checkoutHold(back.draft, back.checkout)).toBeNull();
    expect(reg.refreshActivation(back).state.activation?.paymentState).toBe('confirmed');
    expect(reg.restoreSubmittedScope(before).result).toMatchObject({ ok: false, code: 'conflict' });
    // Not for open or paid checkouts either.
    const paid = reg.refreshActivation(before).state;
    expect(reg.restoreSubmittedScope(reg.setStoreCount(paid, 2).state).result.ok).toBe(false);
  });

  it('a withdrawn declaration is reported first; after re-acceptance the scope hold remains until restored', () => {
    let s = EDITS['pharmacy name'](submitted('unknown'));
    s = reg.keepOwner(s, { ...owner, ownerDeclarationAccepted: false }).state;
    expect(reg.checkoutHold(s.draft, s.checkout)).toBe('owner_declaration');
    s = reg.saveOwner(s, owner).state;
    expect(reg.checkoutHold(s.draft, s.checkout)).toBe('scope_changed');
    s = reg.restoreSubmittedScope(s).state;
    expect(reg.resolveUnknownPayment(s, 'paid').state.checkout?.status).toBe('paid');
  });

  it('honest recovery for the edited details: "nothing charged" then a fresh quote for the new scope and a new key', () => {
    const edited = EDITS['store count 1 → 2 with a second pharmacy'](submitted('unknown'));
    let s = reg.resolveUnknownPayment(edited, 'not_charged').state;
    expect(s.checkout).toMatchObject({ status: 'abandoned', operationKey: KEY });
    s = reg.resumeSignup(s).state;
    s = reg.requestQuote(s, deps).state;
    expect(s.quote?.dueNowCents).toBe(14800);
    const fresh = reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: 'demo_key_000020' }, deps);
    expect(fresh.result.ok).toBe(true);
    expect(fresh.state.checkout?.scope).toMatchObject({ storeCount: 2, dueNowCents: 14800 });
  });

  it('a processing payment that fails still resolves while the details differ (no charge, nothing to bind)', () => {
    const edited = EDITS['pharmacy name'](submitted('processing'));
    const failed = reg.refreshActivation({ ...edited, activationPlan: 'payment_failed' }).state;
    expect(failed.activation?.paymentState).toBe('failed');
    expect(failed.checkout?.status).toBe('declined');
  });

  it('seeded submitted scenarios carry the scope of their seeded details', () => {
    for (const id of ['activation_waiting', 'checkout_unknown'] as const) {
      const s = reg.createRegistration(id);
      expect(s.checkout?.scope).toMatchObject({ storeCount: 2, dueNowCents: 14800 });
      expect(reg.checkoutHold(s.draft, s.checkout)).toBeNull();
    }
    expect(reg.refreshActivation(reg.createRegistration('activation_waiting')).state.activation?.paymentState).toBe('confirmed');
  });

  it('storage written before R-013: an unedited submitted checkout is bound to its draft; an edited one stays held', () => {
    const strip = (s: RegistrationState): RegistrationState => {
      const copy = JSON.parse(JSON.stringify(s));
      delete copy.checkout.scope;
      return copy;
    };
    const unedited = reg.bindLegacyScope(strip(submitted('processing')));
    expect(unedited.checkout?.scope).toMatchObject({ storeCount: 1, dueNowCents: 9900 });
    expect(reg.refreshActivation(unedited).state.activation?.paymentState).toBe('confirmed');
    const edited = reg.bindLegacyScope(strip(EDITS['pharmacy name'](submitted('unknown'))));
    expect(edited.checkout?.scope).toBeUndefined();
    expect(reg.checkoutHold(edited.draft, edited.checkout)).toBe('scope_changed');
    expect(reg.resolveUnknownPayment(edited, 'paid').result.ok).toBe(false);
    expect(reg.restoreSubmittedScope(edited).result.ok).toBe(false);
    expect(reg.resolveUnknownPayment(edited, 'not_charged').result.ok).toBe(true);
    // Closed or paid records are left as they are.
    const paid = strip(reg.refreshActivation(submitted('processing')).state);
    expect(reg.bindLegacyScope(paid)).toEqual(paid);
  });
});

describe('a closed checkout key is never reused (R-013, R2-F02)', () => {
  const consented = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
  const OLD = 'demo_key_old_0001';
  const NEW = 'demo_key_new_0001';
  function opened(): RegistrationState {
    const s = reg.requestQuote(completeDraft(1), deps).state;
    return reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: OLD }, deps).state;
  }
  const start = (s: RegistrationState, key: string) => reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: key }, deps);

  it("QA case: withdraw → re-accept → fresh quote and consent: the closed checkout's key is refused, a new key works", () => {
    let s = reg.keepOwner(opened(), { ...owner, ownerDeclarationAccepted: false }).state;
    s = reg.saveOwner(s, owner).state;
    expect(s.checkout).toMatchObject({ operationKey: OLD, status: 'abandoned', closedReason: 'owner_declaration' });
    s = reg.requestQuote(s, deps).state;
    const replay = start(s, OLD);
    expect(replay.result).toMatchObject({ ok: false, code: 'conflict' });
    expect(replay.state).toBe(s);
    const fresh = start(s, NEW);
    expect(fresh.result.ok).toBe(true);
    expect(fresh.state.checkout).toMatchObject({ operationKey: NEW, status: 'pending' });
    // And the closed key stays spent after the new checkout replaced its record.
    const later = reg.resumeSignup(reg.resolveCheckout(fresh.state, 'back').state).state;
    const q = reg.requestQuote(later, deps).state;
    for (const key of [OLD, NEW]) expect(start(q, key).result).toMatchObject({ ok: false, code: 'conflict' });
    expect(start(q, 'demo_key_third_01').result.ok).toBe(true);
  });

  it.each([
    ['Back from Stripe, then resume', (s: RegistrationState) => reg.resumeSignup(reg.resolveCheckout(s, 'back').state).state],
    ['declined, then resume', (s: RegistrationState) => reg.resumeSignup(reg.resolveCheckout(s, 'declined').state).state],
    ['unknown → nothing charged, then resume', (s: RegistrationState) => reg.resumeSignup(reg.resolveUnknownPayment(reg.resolveCheckout(s, 'unknown').state, 'not_charged').state).state],
    ['details changed while open', (s: RegistrationState) => reg.savePharmacy(s, 0, pharmacy(1, { city: 'Shelbyville' })).state],
  ])('%s: the old key is refused for the new checkout', (_label, close) => {
    const s = reg.requestQuote(close(opened()), deps).state;
    expect(start(s, OLD).result).toMatchObject({ ok: false, code: 'conflict' });
    expect(start(s, NEW).result.ok).toBe(true);
  });

  it('starting a new signup after expiry keeps the spent keys', () => {
    const expired = { ...opened(), checkout: { ...opened().checkout!, status: 'expired' as const } };
    let s = reg.restartSignup(expired).state;
    s = reg.requestQuote(reg.saveOwner(reg.savePharmacy(s, 0, pharmacy(1)).state, owner).state, deps).state;
    expect(start(s, OLD).result).toMatchObject({ ok: false, code: 'conflict' });
    expect(start(s, NEW).result.ok).toBe(true);
  });

  it('valid same-operation replay of an open checkout is unchanged (idempotent, no second checkout)', () => {
    const s = opened();
    const replay = reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: OLD }, deps);
    expect(replay.result.ok).toBe(true);
    expect(replay.state).toBe(s);
    // A different key while it is open is still a conflict, not a second checkout.
    expect(start(s, NEW).result).toMatchObject({ ok: false, code: 'conflict' });
  });
});
