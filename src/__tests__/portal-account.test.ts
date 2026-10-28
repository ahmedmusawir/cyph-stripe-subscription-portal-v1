// Account-management engine (behind real admin/superadmin login, R-008/R-009).
// Literal expected cents: $99 → $148 → $197, add due-now 2450.
import * as acct from '@/services/portal/account';
import type { AccountState } from '@/types/portal/state';
import type { PharmacyDraft } from '@/types/portal/contract';

const T0 = Date.parse('2026-10-27T08:00:00Z');
const at = (ms: number) => ({ now: () => ms });
const deps = at(T0);

function newPharmacy(n: number, overrides: Partial<PharmacyDraft> = {}): Partial<PharmacyDraft> {
  return {
    name: `Example Added Pharmacy ${n}`,
    street: '2 Test Road',
    city: 'Springfield',
    state: 'Alabama',
    zip: '00000',
    ncpdp: `000002${n}`,
    npi: `000000002${n}`,
    phone: '(555) 010-0188',
    software: 'Pioneer',
    adminAssignment: { kind: 'other', fullName: 'Sam Ortiz', email: 'sam@demo-pharmacy.example' },
    ...overrides,
  };
}

/** Draft → quote → consent; returns the state ready to confirm. */
function readyToConfirm(s: AccountState, n: number) {
  s = acct.saveAddStoreDraft(s, newPharmacy(n)).state;
  const quoted = acct.requestAddQuote(s, deps);
  expect(quoted.result.ok).toBe(true);
  s = acct.setAddConsent(quoted.state, true).state;
  return { s, quoteId: s.quote!.id, consents: s.addDraft.consents };
}

function confirm(s: AccountState, n: number, key: string) {
  const r = readyToConfirm(s, n);
  return acct.confirmAddStore(r.s, { quoteId: r.quoteId, consents: r.consents, operationKey: key }, deps);
}

const summary = (s: AccountState) => ({
  count: s.account.subscription.coveredStoreCount,
  monthly: s.account.subscription.monthlyAmountCents,
  stores: s.account.pharmacies.length,
});

describe('add-store quote', () => {
  it('1 → 2: $99 → $148 with 2450 due now', () => {
    const s = acct.createAccount('one_store_active');
    const r = readyToConfirm(s, 1);
    expect(r.s.quote).toMatchObject({ currentRecurringCents: 9900, newRecurringCents: 14800, dueNowCents: 2450, currentStoreCount: 1, proposedStoreCount: 2 });
  });

  it('2 → 3: $148 → $197, three distinct stores', () => {
    const step = confirm(acct.createAccount('two_store_active'), 1, 'demo_key_add_01');
    expect(step.result).toMatchObject({ ok: true, value: { state: 'succeeded' } });
    expect(summary(step.state)).toEqual({ count: 3, monthly: 19700, stores: 3 });
    expect(new Set(step.state.account.pharmacies.map((p) => p.id)).size).toBe(3);
  });

  it('1 → 2 → 3 sequentially never reverts to a canned state', () => {
    let s = confirm(acct.createAccount('one_store_active'), 1, 'demo_key_add_01').state;
    expect(summary(s)).toEqual({ count: 2, monthly: 14800, stores: 2 });
    s = confirm(s, 2, 'demo_key_add_02').state;
    expect(summary(s)).toEqual({ count: 3, monthly: 19700, stores: 3 });
  });
});

describe('idempotency and outcomes', () => {
  it('the same operation key three times adds exactly one store', () => {
    const r = readyToConfirm(acct.createAccount('two_store_active'), 1);
    const input = { quoteId: r.quoteId, consents: r.consents, operationKey: 'demo_key_same_01' };
    const first = acct.confirmAddStore(r.s, input, deps);
    const second = acct.confirmAddStore(first.state, input, deps);
    const third = acct.confirmAddStore(second.state, input, deps);
    expect(summary(third.state)).toEqual({ count: 3, monthly: 19700, stores: 3 });
    expect(third.result).toEqual(first.result);
  });

  it('a definitive failure leaves count and price unchanged; a new key can retry', () => {
    let s = acct.setNextAddOutcome(acct.createAccount('two_store_active'), 'failed').state;
    const r = readyToConfirm(s, 1);
    const failed = acct.confirmAddStore(r.s, { quoteId: r.quoteId, consents: r.consents, operationKey: 'demo_key_fail_01' }, deps);
    expect(failed.result).toMatchObject({ ok: true, value: { state: 'failed' } });
    expect(summary(failed.state)).toEqual({ count: 2, monthly: 14800, stores: 2 });
    s = acct.setNextAddOutcome(failed.state, 'succeeded').state;
    const retry = acct.confirmAddStore(s, { quoteId: r.quoteId, consents: r.consents, operationKey: 'demo_key_fail_02' }, deps);
    expect(summary(retry.state)).toEqual({ count: 3, monthly: 19700, stores: 3 });
  });

  it('unknown keeps the count and blocks a second attempt until resolved', () => {
    const s = acct.setNextAddOutcome(acct.createAccount('two_store_active'), 'unknown').state;
    const r = readyToConfirm(s, 1);
    const unknown = acct.confirmAddStore(r.s, { quoteId: r.quoteId, consents: r.consents, operationKey: 'demo_key_unk_01' }, deps);
    expect(summary(unknown.state)).toEqual({ count: 2, monthly: 14800, stores: 2 });
    const second = acct.confirmAddStore(unknown.state, { quoteId: r.quoteId, consents: r.consents, operationKey: 'demo_key_unk_02' }, deps);
    expect(second.result).toMatchObject({ ok: false, code: 'conflict' });
    const resolved = acct.resolveOperation(unknown.state, 'demo_key_unk_01', 'succeeded');
    expect(summary(resolved.state)).toEqual({ count: 3, monthly: 19700, stores: 3 });
    // Resolving again cannot add another store.
    expect(acct.resolveOperation(resolved.state, 'demo_key_unk_01', 'succeeded').result.ok).toBe(false);
  });

  it('paid but setup attention: one increment, invitation held, recovery completes the same store', () => {
    const s = acct.setNextAddOutcome(acct.createAccount('two_store_active'), 'attention').state;
    const r = readyToConfirm(s, 1);
    const att = acct.confirmAddStore(r.s, { quoteId: r.quoteId, consents: r.consents, operationKey: 'demo_key_att_01' }, deps);
    expect(summary(att.state)).toEqual({ count: 3, monthly: 19700, stores: 3 });
    const added = att.state.account.pharmacies[2];
    expect(added).toMatchObject({ activationStatus: 'attention', invitationStatus: 'held' });
    expect(acct.resolveOperation(att.state, 'demo_key_att_01', 'failed').result.ok).toBe(false);
    const recovered = acct.resolveOperation(att.state, 'demo_key_att_01', 'succeeded').state;
    expect(summary(recovered)).toEqual({ count: 3, monthly: 19700, stores: 3 });
    expect(recovered.account.pharmacies[2]).toMatchObject({ id: added.id, activationStatus: 'active', invitationStatus: 'pending' });
  });
});

describe('quote freshness and consent', () => {
  it('rejects an expired quote (injected clock) without mutation', () => {
    const r = readyToConfirm(acct.createAccount('two_store_active'), 1);
    const step = acct.confirmAddStore(r.s, { quoteId: r.quoteId, consents: r.consents, operationKey: 'demo_key_exp_01' }, at(T0 + 30 * 60 * 1000));
    expect(step.result).toMatchObject({ ok: false, code: 'quote_expired' });
    expect(step.state).toBe(r.s);
  });

  it('requires price-change consent', () => {
    const r = readyToConfirm(acct.createAccount('two_store_active'), 1);
    const step = acct.confirmAddStore(r.s, { quoteId: r.quoteId, consents: { ...r.consents, priceChangeAccepted: false }, operationKey: 'demo_key_con_01' }, deps);
    expect(step.result).toMatchObject({ ok: false, code: 'validation' });
    expect(summary(step.state)).toEqual({ count: 2, monthly: 14800, stores: 2 });
  });

  it('an edit after quoting invalidates the quote and clears consent', () => {
    const r = readyToConfirm(acct.createAccount('two_store_active'), 1);
    const edited = acct.saveAddStoreDraft(r.s, newPharmacy(1, { name: 'Changed name' })).state;
    expect(edited.quote).toBeNull();
    expect(edited.addDraft.consents.priceChangeAccepted).toBe(false);
    const step = acct.confirmAddStore({ ...edited, quote: r.s.quote }, { quoteId: r.quoteId, consents: r.consents, operationKey: 'demo_key_rev_01' }, deps);
    expect(step.result).toMatchObject({ ok: false, code: 'conflict' });
  });
});

describe('persona capabilities at the service boundary', () => {
  it.each(['store_admin', 'member'] as const)('%s gets a denied payload with no financial data', (persona) => {
    const s = acct.selectPersona(acct.createAccount('two_store_active'), persona).state;
    const read = acct.loadAccount(s);
    expect(read.result).toEqual({ ok: true, value: { kind: 'denied', ownerContactLabel: 'Jordan Ellis' } });
    expect(JSON.stringify(read.result)).not.toMatch(/Cents|pharmacies|subscription|card|invoice|NCPDP/i);
  });

  it.each(['store_admin', 'member'] as const)('%s cannot add a store or open billing even by calling the service', (persona) => {
    let s = acct.createAccount('two_store_active');
    const r = readyToConfirm(s, 1); // prepared as owner
    s = acct.selectPersona(r.s, persona).state;
    expect(acct.confirmAddStore(s, { quoteId: r.quoteId, consents: r.consents, operationKey: 'demo_key_den_01' }, deps).result).toMatchObject({ ok: false, code: 'denied' });
    expect(acct.saveAddStoreDraft(s, newPharmacy(2)).result).toMatchObject({ ok: false, code: 'denied' });
    expect(acct.openBillingPreview(s, 'manage').result).toMatchObject({ ok: false, code: 'denied' });
    expect(summary(s)).toEqual({ count: 2, monthly: 14800, stores: 2 });
  });

  it('rejects persona and scenario values outside the enum', () => {
    const s = acct.createAccount();
    expect(acct.selectPersona(s, 'superadmin').result.ok).toBe(false);
    expect(acct.selectScenario(s, 'javascript:alert(1)').result.ok).toBe(false);
  });

  it('past due and scheduled cancellation pause add-store (proposed rule); canceled removes it', () => {
    expect(acct.addStoreAvailability(acct.createAccount('past_due'))).toBe('paused_past_due');
    expect(acct.addStoreAvailability(acct.createAccount('cancel_scheduled'))).toBe('paused_cancel_scheduled');
    expect(acct.addStoreAvailability(acct.createAccount('canceled'))).toBe('unavailable_canceled');
    expect(acct.saveAddStoreDraft(acct.createAccount('past_due'), newPharmacy(1)).result).toMatchObject({ ok: false, code: 'conflict' });
  });
});

describe('duplicates', () => {
  it('own store NCPDP vs another account', () => {
    const s = acct.createAccount('two_store_active');
    const own = acct.saveAddStoreDraft(s, newPharmacy(1, { ncpdp: '0000001' }));
    expect(own.result).toMatchObject({ ok: false, code: 'duplicate', message: expect.stringMatching(/your account/) });
    const other = acct.saveAddStoreDraft(s, newPharmacy(1, { ncpdp: '0000099' }));
    expect(other.result).toMatchObject({ ok: false, code: 'duplicate' });
    expect(other.state.addDraft.pharmacy.name).toBe('Example Added Pharmacy 1');
  });
});

describe('hosted billing return', () => {
  it('closing the portal stand-in changes nothing until refresh; no-change refresh is "unchanged"', () => {
    let s = acct.createAccount('two_store_active');
    s = acct.openBillingPreview(s, 'manage').state;
    s = acct.returnFromPortal(s, 'no_change').state;
    expect(s.returnStatus).toBe('refreshing');
    expect(acct.openBillingPreview(s, 'manage').result.ok).toBe(false);
    const refreshed = acct.refreshAfterHandoff(s, 'account_billing', deps).state;
    expect(refreshed.returnStatus).toBe('unchanged');
    expect(refreshed.account.subscription.status).toBe('active');
  });

  it('a scheduled cancellation applies to the whole account and invents no dates', () => {
    let s = acct.returnFromPortal(acct.openBillingPreview(acct.createAccount('two_store_active'), 'cancel').state, 'cancel_scheduled').state;
    s = acct.refreshAfterHandoff(s, 'account_billing', deps).state;
    expect(s.account.subscription.status).toBe('cancel_scheduled');
    expect(s.account.subscription.cancelAtPeriodEnd).toBeUndefined();
    expect(s.account.subscription.accessEndsAt).toBeUndefined();
  });

  it('a handoff error is reported once; retry works', () => {
    const s = acct.createAccount('handoff_error');
    const first = acct.openBillingPreview(s, 'manage');
    expect(first.result.ok).toBe(false);
    expect(acct.openBillingPreview(first.state, 'manage').result.ok).toBe(true);
  });

  it('load error then retry succeeds', () => {
    const s = acct.createAccount('load_error');
    const first = acct.loadAccount(s);
    expect(first.result.ok).toBe(false);
    expect(acct.loadAccount(first.state).result).toMatchObject({ ok: true, value: { kind: 'account' } });
  });
});
