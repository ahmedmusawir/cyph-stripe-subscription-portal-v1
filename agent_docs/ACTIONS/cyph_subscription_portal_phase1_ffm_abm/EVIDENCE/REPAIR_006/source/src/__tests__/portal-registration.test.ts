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
    // A paid record binds on the same evidence (REPAIR_004); one edited after payment does not.
    const paid = strip(reg.refreshActivation(submitted('processing')).state);
    expect(reg.bindLegacyScope(paid).checkout?.scope).toMatchObject({ storeCount: 1, dueNowCents: 9900 });
    const paidEdited = strip(EDITS['pharmacy name'](reg.refreshActivation(submitted('processing')).state));
    expect(reg.bindLegacyScope(paidEdited)).toEqual(paidEdited);
  });
});

describe('legacy storage binds a checkout only from retained evidence (REPAIR_004, R3-F01)', () => {
  const consented = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
  const unconsented = { termsAccepted: false, recurringChargeAccepted: false, priceChangeAccepted: false };
  const strip = (s: RegistrationState): RegistrationState => {
    const copy = JSON.parse(JSON.stringify(s));
    if (copy.checkout) delete copy.checkout.scope;
    return copy;
  };
  function opened(n = 1, code?: string): RegistrationState {
    let s = completeDraft(n);
    if (code) s = reg.applyCode(s, code, deps).state;
    s = reg.requestQuote(s, deps).state;
    return reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: KEY }, deps).state;
  }
  /** What the R-011 engine persisted after a count edit while a checkout was open: still pending; quote dropped; revision bumped. */
  function r011Edited(s: RegistrationState): RegistrationState {
    const copy = strip(s);
    return {
      ...copy,
      quote: null,
      draft: { ...copy.draft, requestedStoreCount: 2, pharmacies: [copy.draft.pharmacies[0], pharmacy(2)], revision: copy.draft.revision + 1, state: 'editing', consents: unconsented },
    };
  }

  it('an R-011 open checkout edited without being closed gets no scope, cannot confirm and cannot be restored', () => {
    const legacy = reg.bindLegacyScope(r011Edited(opened()));
    expect(legacy.checkout).toMatchObject({ status: 'pending', operationKey: KEY });
    expect(legacy.checkout?.scope).toBeUndefined();
    expect(reg.checkoutHold(legacy.draft, legacy.checkout)).toBe('scope_changed');
    for (const outcome of ['paid', 'processing'] as const) {
      const step = reg.resolveCheckout(legacy, outcome);
      expect(step.result.ok).toBe(false);
      expect(step.state).toBe(legacy);
    }
    expect(reg.restoreSubmittedScope(legacy).result.ok).toBe(false);
    // No second checkout opens alongside it.
    const q = reg.requestQuote(legacy, deps).state;
    expect(reg.startCheckout(q, { quoteId: q.quote!.id, consents: consented, operationKey: 'demo_key_other_01' }, deps).result).toMatchObject({ ok: false, code: 'conflict' });
  });

  it('a quote taken after the edit is not evidence for the open checkout', () => {
    const requoted = reg.requestQuote(r011Edited(opened()), deps).state;
    expect(requoted.quote?.proposedStoreCount).toBe(2);
    expect(reg.bindLegacyScope(requoted).checkout?.scope).toBeUndefined();
  });

  it('an unedited legacy open checkout binds the price of the quote it opened with, discount included', () => {
    const s = opened(2, pricing.DEMO_CODE);
    const quoted = s.quote!.dueNowCents!;
    const legacy = reg.bindLegacyScope(strip(s));
    expect(legacy.checkout?.scope).toMatchObject({ storeCount: 2, code: pricing.DEMO_CODE, dueNowCents: quoted });
    expect(quoted).toBeLessThan(14800);
    expect(reg.resolveCheckout(legacy, 'paid').result.ok).toBe(true);
  });

  it('a legacy demo seed binds to its seeded scope only while it still matches the seed', () => {
    const seed = reg.createRegistration('activation_waiting');
    const legacy = reg.bindLegacyScope(strip(seed));
    expect(legacy.checkout?.scope).toEqual(seed.checkout!.scope);
    expect(reg.refreshActivation(legacy).state.activation?.paymentState).toBe('confirmed');
    const renamed = reg.savePharmacy(seed, 0, { ...seed.draft.pharmacies[0], name: 'Renamed seed' }).state;
    const edited = reg.bindLegacyScope(strip(renamed));
    expect(edited.checkout?.scope).toBeUndefined();
    expect(reg.refreshActivation(edited).result.ok).toBe(false);
  });

  it('storage v1: the quote proves the scope before migration drops it; the declaration is still not assumed', () => {
    const v1 = strip(reg.resolveCheckout(opened(), 'processing').state);
    delete (v1.draft.owner as Record<string, unknown>).ownerDeclarationAccepted;
    const migrated = reg.migrateRegistration(v1);
    expect(migrated.quote).toBeNull();
    expect(migrated.checkout?.scope).toMatchObject({ storeCount: 1, dueNowCents: 9900 });
    expect(migrated.draft.owner.ownerDeclarationAccepted).toBe(false);
    expect(reg.refreshActivation(migrated).result.ok).toBe(false);
  });
});

describe('completed activation reads what the payment covered (REPAIR_004, R3-F02)', () => {
  const consented = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
  const replacement = { kind: 'other' as const, fullName: 'Replacement Admin', email: 'replacement@demo-pharmacy.example' };
  function completed(admin?: PharmacyDraft['adminAssignment']): RegistrationState {
    let s = completeDraft(1);
    if (admin) s = reg.savePharmacy(s, 0, pharmacy(1, { adminAssignment: admin })).state;
    s = reg.requestQuote(s, deps).state;
    s = reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: KEY }, deps).state;
    s = reg.refreshActivation(reg.resolveCheckout(s, 'paid').state).state;
    expect(s.activation).toMatchObject({ provisioningState: 'ready', emailState: 'sent' });
    return s;
  }
  const nominateLater = (s: RegistrationState) => reg.savePharmacy(s, 0, pharmacy(1, { adminAssignment: replacement })).state;

  it('an admin nominated after payment is not in the covered details or any preview; payment history is unchanged', () => {
    const before = completed();
    const s = nominateLater(before);
    expect(s.checkout).toEqual(before.checkout);
    expect(s.activation).toEqual(before.activation);
    expect(reg.coveredDetails(s)!.pharmacies[0].adminAssignment).toEqual({ kind: 'owner' });
    expect(JSON.stringify(reg.accessEmailPreviews(s))).not.toMatch(/replacement/i);
  });

  it('an admin the payment covered stays the invited admin after a later draft change', () => {
    const sam = { kind: 'other' as const, fullName: 'Sam Ortiz', email: 'sam@demo-pharmacy.example' };
    const s = nominateLater(completed(sam));
    expect(reg.accessEmailPreviews(s).store_admin).toMatchObject({ recipientName: 'Sam Ortiz', pharmacyNames: ['Example Test Pharmacy 1'] });
  });

  it('a closed checkout does not pin the previews; they follow the draft again', () => {
    let s = completeDraft(1);
    s = reg.requestQuote(s, deps).state;
    s = reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: KEY }, deps).state;
    s = reg.resumeSignup(reg.resolveCheckout(s, 'back').state).state;
    s = nominateLater(s);
    expect(reg.accessEmailPreviews(s).store_admin.recipientName).toBe('Replacement Admin');
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

describe('a submitted payment cannot be discarded or retried (REPAIR_004 addendum 1, R4-N01)', () => {
  const consented = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
  const OTHER = 'demo_key_other_0001';
  type Mode = 'processing' | 'unknown';
  function opened(): RegistrationState {
    const s = reg.requestQuote(completeDraft(1), deps).state;
    return reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: KEY }, deps).state;
  }
  const submitted = (mode: Mode) => reg.resolveCheckout(opened(), mode).state;
  const reload = (s: RegistrationState): RegistrationState => reg.bindLegacyScope(JSON.parse(JSON.stringify(s)));
  const start = (s: RegistrationState, key: string) => reg.startCheckout(s, { quoteId: s.quote?.id ?? 'none', consents: consented, operationKey: key }, deps);

  for (const mode of ['processing', 'unknown'] as const)
    it(`${mode}: no checkout outcome, resume, restart or new checkout applies, before or after a reload`, () => {
      for (const s of [submitted(mode), reload(submitted(mode))]) {
        for (const outcome of reg.CHECKOUT_OUTCOMES) {
          const step = reg.resolveCheckout(s, outcome);
          expect([outcome, step.result.ok]).toEqual([outcome, false]);
          expect(step.state).toBe(s);
        }
        // Review's "Edit my details instead" was resolveCheckout('back') then resumeSignup.
        expect(reg.resumeSignup(reg.resolveCheckout(s, 'back').state).result.ok).toBe(false);
        expect(reg.restartSignup(s).result).toMatchObject({ ok: false, code: 'conflict' });
        for (const key of [KEY, OTHER]) expect(start(reg.requestQuote(s, deps).state, key).result).toMatchObject({ ok: false, code: 'conflict' });
        expect(s.checkout).toMatchObject({ operationKey: KEY, status: mode === 'processing' ? 'pending' : 'unknown' });
      }
    });

  it('an unsubmitted open checkout can still be closed from Review and paid again with a new key', () => {
    let s = reg.resolveCheckout(opened(), 'back').state;
    s = reg.requestQuote(reg.resumeSignup(s).state, deps).state;
    expect(start(s, KEY).result.ok).toBe(false);
    expect(start(s, OTHER).result.ok).toBe(true);
  });

  it('a genuine payment failure still recovers through a fresh quote and a new key', () => {
    let s = reg.setActivationPlan(submitted('processing'), 'payment_failed').state;
    s = reg.refreshActivation(s).state;
    expect(s.activation?.paymentState).toBe('failed');
    s = reg.requestQuote(reg.resumeSignup(s).state, deps).state;
    expect(start(s, KEY).result.ok).toBe(false);
    expect(start(s, OTHER).result.ok).toBe(true);
  });

  it('unknown → Stripe confirms nothing charged still recovers through a fresh quote and a new key', () => {
    let s = reg.resolveUnknownPayment(submitted('unknown'), 'not_charged').state;
    s = reg.requestQuote(reg.resumeSignup(s).state, deps).state;
    expect(start(s, OTHER).result.ok).toBe(true);
  });

  it('a completed payment cannot be restarted or reopened', () => {
    const s = reg.refreshActivation(submitted('processing')).state;
    expect(s.checkout?.status).toBe('paid');
    expect(reg.restartSignup(s).result).toMatchObject({ ok: false, code: 'conflict' });
    expect(reg.resolveCheckout(s, 'back').result.ok).toBe(false);
    expect(start(reg.requestQuote(s, deps).state, OTHER).result.ok).toBe(false);
  });
});

describe('a completed payment whose scope cannot be established (REPAIR_004 addendum 1)', () => {
  const consented = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
  function completedThenEdited(): RegistrationState {
    let s = reg.requestQuote(completeDraft(1), deps).state;
    s = reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: KEY }, deps).state;
    s = reg.refreshActivation(reg.resolveCheckout(s, 'paid').state).state;
    s = reg.savePharmacy(s, 0, pharmacy(1, { name: 'Edited after payment', adminAssignment: { kind: 'other', fullName: 'Replacement Admin', email: 'replacement@demo-pharmacy.example' } })).state;
    const copy = JSON.parse(JSON.stringify(s));
    delete copy.checkout.scope;
    return reg.bindLegacyScope(copy);
  }

  it('keeps its completed status and history, and no covered details are invented from the edited draft', () => {
    const s = completedThenEdited();
    expect(s.checkout).toMatchObject({ status: 'paid', operationKey: KEY });
    expect(s.checkout?.scope).toBeUndefined();
    expect(s.activation).toMatchObject({ paymentState: 'confirmed', provisioningState: 'ready', emailState: 'sent' });
    expect(reg.coveredDetails(s)).toBeNull();
    const previews = reg.accessEmailPreviews(s);
    expect(previews.owner.pharmacyNames).toEqual([]);
    expect(JSON.stringify([previews.owner, previews.store_admin, previews.expired_resend])).not.toMatch(/Edited after payment|Replacement Admin/);
  });
});

describe('checkout record governs the payment (REPAIR_005, R4-F01/R4-F02)', () => {
  const consented = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
  const NEW = 'demo_key_matrix_0001';
  function opened(): RegistrationState {
    const s = reg.requestQuote(completeDraft(1), deps).state;
    return reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: KEY }, deps).state;
  }
  const processing = () => reg.resolveCheckout(opened(), 'processing').state;
  /** What the d6fe678 engine stored: it accepted "unknown" on a processing checkout and kept the activation. */
  const legacyProcessingThenUnknown = (): RegistrationState => ({ ...processing(), checkout: { ...processing().checkout!, status: 'unknown' } });
  const legacyFailedThenUnknown = (): RegistrationState => {
    const failed = reg.refreshActivation(reg.setActivationPlan(processing(), 'payment_failed').state).state;
    return { ...failed, checkout: { ...failed.checkout!, status: 'unknown' } };
  };
  const reload = (s: RegistrationState): RegistrationState => reg.bindLegacyScope(JSON.parse(JSON.stringify(s)));

  it('R4-F01: nothing charged on a legacy unknown payment is terminal; a stale refresh is refused and changes nothing', () => {
    const resolved = reg.resolveUnknownPayment(legacyProcessingThenUnknown(), 'not_charged').state;
    expect(resolved.checkout?.status).toBe('abandoned');
    expect(resolved.activation).toBeNull();
    // Cody's stored state still carries the pending activation; it must behave the same.
    const stale: RegistrationState = { ...resolved, activation: processing().activation };
    for (const s of [stale, reload(stale)]) {
      expect(reg.paymentPhase(s)).toBe('not_charged');
      const step = reg.refreshActivation(s);
      expect(step.result).toMatchObject({ ok: false, code: 'conflict' });
      expect(step.state).toBe(s);
      expect(reg.resolveCheckout(s, 'paid').result.ok).toBe(false);
      expect(reg.resolveUnknownPayment(s, 'paid').result.ok).toBe(false);
    }
    // Valid recovery: resume, fresh quote, new key.
    let s = reg.resumeSignup(stale).state;
    expect(s.activation).toBeNull();
    s = reg.requestQuote(s, deps).state;
    expect(reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: KEY }, deps).result.ok).toBe(false);
    expect(reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: NEW }, deps).result.ok).toBe(true);
  });

  it('R4-F02: an unknown checkout with a retained failed flag is still submitted; resume, restart, outcomes and new checkouts are refused', () => {
    for (const s of [legacyFailedThenUnknown(), reload(legacyFailedThenUnknown())]) {
      expect(s.activation?.paymentState).toBe('failed');
      expect(reg.paymentPhase(s)).toBe('unknown');
      expect(reg.isSubmitted(s)).toBe(true);
      for (const step of [reg.resumeSignup(s), reg.restartSignup(s), reg.refreshActivation(s), reg.resolveCheckout(s, 'back'), reg.startCheckout(reg.requestQuote(s, deps).state, { quoteId: 'x', consents: consented, operationKey: NEW }, deps)]) {
        expect(step.result).toMatchObject({ ok: false, code: 'conflict' });
      }
      expect(reg.resumeSignup(s).state).toBe(s);
      expect(reg.restartSignup(s).state).toBe(s);
      expect(reg.refreshActivation(s).state).toBe(s);
    }
    // Authoritative resolution first, then recovery.
    const paid = reg.resolveUnknownPayment(legacyFailedThenUnknown(), 'paid').state;
    expect(paid.checkout?.status).toBe('paid');
    expect(paid.activation?.paymentState).toBe('confirmed');
    let s = reg.resolveUnknownPayment(legacyFailedThenUnknown(), 'not_charged').state;
    expect(s.activation).toBeNull();
    s = reg.requestQuote(reg.resumeSignup(s).state, deps).state;
    expect(reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: NEW }, deps).result.ok).toBe(true);
  });

  it('genuine failure and genuine confirmation are unchanged', () => {
    const failed = reg.refreshActivation(reg.setActivationPlan(processing(), 'payment_failed').state).state;
    expect([failed.checkout?.status, failed.activation?.paymentState, reg.paymentPhase(failed)]).toEqual(['declined', 'failed', 'failed']);
    expect(reg.resumeSignup(failed).result.ok).toBe(true);
    const confirmed = reg.refreshActivation(processing()).state;
    expect([confirmed.checkout?.status, confirmed.activation?.paymentState, reg.paymentPhase(confirmed)]).toEqual(['paid', 'confirmed', 'paid']);
    expect(reg.refreshActivation(confirmed).state.activation?.provisioningState).toBe('ready');
  });

  // Bounded matrix: every checkout status × every activation flag × every stale or valid action.
  // Allowed cells follow the phase; refused cells must leave the state object untouched.
  it('transition matrix: allowed transitions follow the phase; refusals leave state unchanged', () => {
    const base: Record<string, () => RegistrationState> = {
      none: () => reg.requestQuote(completeDraft(1), deps).state,
      open: opened,
      declined: () => reg.resolveCheckout(opened(), 'declined').state,
      processing,
      unknown: () => reg.resolveCheckout(opened(), 'unknown').state,
      paid: () => reg.resolveCheckout(opened(), 'paid').state,
      abandoned: () => reg.resolveCheckout(opened(), 'back').state,
      expired: () => ({ ...opened(), checkout: { ...opened().checkout!, status: 'expired' as const } }),
    };
    const confirmedView = reg.resolveCheckout(opened(), 'paid').state.activation!;
    const flags: Record<string, RegistrationState['activation']> = {
      none: null,
      pending: { ...confirmedView, paymentState: 'pending', provisioningState: 'not_started' },
      failed: { ...confirmedView, paymentState: 'failed', provisioningState: 'not_started', retryAvailable: true },
      confirmed: confirmedView,
    };
    const quoted = (s: RegistrationState) => reg.requestQuote(s, deps).state;
    // Each action returns the state it was given (after any preparatory step) and the step it took.
    type Run = (s: RegistrationState) => { input: RegistrationState; step: reg.Step<unknown> };
    const direct = (fn: (s: RegistrationState) => reg.Step<unknown>): Run => (s) => ({ input: s, step: fn(s) });
    const actions: Record<string, Run> = {
      refresh: direct((s) => reg.refreshActivation(s)),
      resume: direct((s) => reg.resumeSignup(s)),
      restart: direct((s) => reg.restartSignup(s)),
      'outcome paid': direct((s) => reg.resolveCheckout(s, 'paid')),
      'unknown → paid': direct((s) => reg.resolveUnknownPayment(s, 'paid')),
      'unknown → nothing charged': direct((s) => reg.resolveUnknownPayment(s, 'not_charged')),
      'new checkout (fresh quote, new key)': (s) => {
        const q = quoted(s);
        return { input: q, step: reg.startCheckout(q, { quoteId: q.quote?.id ?? 'none', consents: consented, operationKey: NEW }, deps) };
      },
    };
    const allowed: Record<reg.PaymentPhase, string[]> = {
      none: ['restart', 'new checkout (fresh quote, new key)'],
      open: ['restart', 'outcome paid', 'new checkout (fresh quote, new key)'],
      processing: ['refresh'],
      unknown: ['unknown → paid', 'unknown → nothing charged'],
      paid: ['refresh'],
      failed: ['resume', 'restart', 'outcome paid', 'new checkout (fresh quote, new key)'],
      not_charged: ['resume', 'restart', 'new checkout (fresh quote, new key)'],
    };
    const rows: Record<string, unknown>[] = [];
    for (const [checkout, make] of Object.entries(base))
      for (const [flag, activation] of Object.entries(flags)) {
        const s: RegistrationState = { ...make(), activation };
        const phase = reg.paymentPhase(s);
        for (const [action, run] of Object.entries(actions)) {
          const { input, step } = run(s);
          let expected = allowed[phase].includes(action);
          // "open" covers two records: still on the stand-in (pending), or declined there. A pending one
          // can't be replaced or resumed while open; a declined one can be resumed and re-quoted (R-012).
          if (s.checkout?.status === 'pending' && action === 'new checkout (fresh quote, new key)') expected = false;
          if (action === 'resume') expected = s.checkout?.status === 'declined' || s.checkout?.status === 'abandoned';
          // Refresh needs a record that agrees with the phase: processing, or paid with a confirmed activation.
          if (action === 'refresh') expected = phase === 'processing' || (phase === 'paid' && flag === 'confirmed');
          rows.push({ checkout, activation: flag, phase, action, ok: step.result.ok, after: step.result.ok ? reg.paymentPhase(step.state) : phase, unchanged: step.state === input });
          expect([checkout, flag, action, step.result.ok]).toEqual([checkout, flag, action, expected]);
          if (!step.result.ok) expect(step.state).toBe(input);
        }
      }
    // Invariants across every cell.
    for (const r of rows) {
      if (r.phase === 'paid') expect(['paid']).toContain(r.after);
      if (r.phase === 'not_charged' && r.ok) expect(r.after).not.toBe('paid');
      if (r.phase === 'unknown' && r.action !== 'unknown → paid') expect(r.after).not.toBe('paid');
    }
    const fs = require('node:fs') as typeof import('node:fs');
    fs.mkdirSync('test-results', { recursive: true });
    fs.writeFileSync('test-results/transition-matrix.json', JSON.stringify({ states: Object.keys(base).length * Object.keys(flags).length, actions: Object.keys(actions), rows }, null, 1));
    expect(rows).toHaveLength(Object.keys(base).length * Object.keys(flags).length * Object.keys(actions).length);
  });
});

describe('payment-phase readers and resend (REPAIR_006, R5-F01/R5-F02)', () => {
  const consented = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
  function opened(): RegistrationState {
    const s = reg.requestQuote(completeDraft(1), deps).state;
    return reg.startCheckout(s, { quoteId: s.quote!.id, consents: consented, operationKey: KEY }, deps).state;
  }
  const ready = () => reg.refreshActivation(reg.resolveCheckout(opened(), 'paid').state).state;
  const view = ready().activation!;
  const FLAGS: Record<string, RegistrationState['activation']> = {
    absent: null,
    pending: { ...view, paymentState: 'pending', provisioningState: 'not_started', emailState: 'not_started' },
    failed: { ...view, paymentState: 'failed', provisioningState: 'not_started', emailState: 'not_started' },
    'confirmed, setup ready, email failed': { ...view, emailState: 'failed' },
  };
  const CHECKOUTS: Record<string, () => RegistrationState> = {
    none: () => ({ ...reg.requestQuote(completeDraft(1), deps).state }),
    open: opened,
    declined: () => reg.resolveCheckout(opened(), 'declined').state,
    unknown: () => reg.resolveCheckout(opened(), 'unknown').state,
    abandoned: () => reg.resolveCheckout(opened(), 'back').state,
    expired: () => ({ ...opened(), checkout: { ...opened().checkout!, status: 'expired' as const } }),
  };

  it('R5-F02: resend is refused without mutation unless the checkout is paid and its setup finished', () => {
    const rows: unknown[] = [];
    for (const [checkout, make] of Object.entries(CHECKOUTS))
      for (const [flag, activation] of Object.entries(FLAGS)) {
        const s = { ...make(), activation };
        const step = reg.resendAccessEmail(s, deps);
        rows.push({ checkout, flag, phase: reg.paymentPhase(s), ok: step.result.ok });
        expect([checkout, flag, step.result]).toEqual([checkout, flag, expect.objectContaining({ ok: false, code: 'conflict' })]);
        expect(step.state).toBe(s);
      }
    // Paid with a missing or conflicting activation: also refused, unchanged.
    for (const flag of ['absent', 'pending', 'failed']) {
      const s = { ...ready(), activation: FLAGS[flag] };
      const step = reg.resendAccessEmail(s, deps);
      expect([flag, step.result.ok]).toEqual([flag, false]);
      expect(step.state).toBe(s);
    }
    // Paid but setup not finished: refused.
    const settingUp = reg.resolveCheckout(opened(), 'paid').state;
    expect(reg.resendAccessEmail(settingUp, deps).state).toBe(settingUp);
    expect(rows).toHaveLength(Object.keys(CHECKOUTS).length * Object.keys(FLAGS).length);
  });

  it('R5-F02 preserved: a paid record whose setup finished can resend, from sent or failed email', () => {
    for (const emailState of ['sent', 'failed'] as const) {
      const s = { ...ready(), activation: { ...ready().activation!, emailState } };
      const step = reg.resendAccessEmail(s, deps);
      expect(step.result.ok).toBe(true);
      expect(step.state.activation?.emailState).toBe('sent');
      expect(step.state.emailResentAt).not.toBeNull();
      expect(step.state.checkout).toEqual(s.checkout);
    }
  });

  it('R5-F01: readers present the activation only where it agrees with the phase; paid stays paid', () => {
    for (const flag of ['absent', 'pending', 'failed']) {
      const s = { ...ready(), activation: FLAGS[flag] };
      expect(reg.paymentPhase(s)).toBe('paid');
      expect(reg.consistentActivation(s)).toBeNull();
      expect(reg.readActivation(s)).toMatchObject({ ok: false, message: expect.stringMatching(/Payment is confirmed/) });
      for (const step of [reg.refreshActivation(s), reg.resumeSignup(s), reg.restartSignup(s)]) {
        expect(step.result.ok).toBe(false);
        expect(step.state).toBe(s);
      }
    }
    const done = ready();
    expect(reg.consistentActivation(done)).toBe(done.activation);
    expect(reg.readActivation(ready()).ok).toBe(true);
    // The actual nothing-charged path leaves no activation and nothing to read.
    const terminal = reg.resolveUnknownPayment(reg.resolveCheckout(opened(), 'unknown').state, 'not_charged').state;
    expect([reg.paymentPhase(terminal), terminal.activation, reg.readActivation(terminal).ok]).toEqual(['not_charged', null, false]);
  });
});
