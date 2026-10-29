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
  businessRole: 'owner' as const,
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

  it('job title never grants anything: only the four self-descriptions are accepted', () => {
    const step = reg.saveOwner(reg.createRegistration('fresh'), { ...owner, businessRole: 'superadmin' as never });
    expect((step.result as { fieldErrors: Record<string, string> }).fieldErrors).toHaveProperty('businessRole');
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
