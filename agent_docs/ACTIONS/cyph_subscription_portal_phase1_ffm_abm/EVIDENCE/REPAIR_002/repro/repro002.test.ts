// REPAIR_002 BEFORE-repair service reproduction (owned scratch copy of 24cf075 only; not committed).
import { writeFileSync } from 'node:fs';
import * as r from '@/services/portal/registration';
const OUT = process.env.REPRO_OUT!;
const deps = { now: () => Date.parse('2026-10-29T00:00:00Z') };
const consents = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
const log: Record<string, unknown> = {};

function pending(key = 'op_r002_a') {
  let s = r.requestQuote(r.createRegistration('prefilled_one_store'), deps).state;
  s = r.startCheckout(s, { quoteId: s.quote!.id, consents, operationKey: key }, deps).state;
  return s;
}

test('A service: withdraw declaration via saveOwner, then replay + resolve', () => {
  const s0 = pending();
  const w = r.saveOwner(s0, { ...s0.draft.owner, ownerDeclarationAccepted: false });
  const replay = r.startCheckout(w.state, { quoteId: s0.quote!.id, consents, operationKey: 'op_r002_a' }, deps);
  const paid = r.resolveCheckout(w.state, 'paid');
  const proc = r.resolveCheckout(w.state, 'processing');
  const confirmed = proc.result.ok ? r.refreshActivation(proc.state) : null;
  log.A = {
    saveOwnerOk: w.result.ok, accepted: w.state.draft.owner.ownerDeclarationAccepted, checkoutAfterWithdraw: w.state.checkout?.status,
    sameKeyReplayOk: replay.result.ok, resolvePaidOk: paid.result.ok, checkoutAfter: paid.state.checkout?.status, payment: paid.state.activation?.paymentState,
    processingThenRefresh: confirmed?.state.activation?.paymentState ?? null,
  };
});

test('B service: legacy migration over pending checkout', () => {
  const s = pending('op_r002_b');
  delete (s.draft.owner as Record<string, unknown>).ownerDeclarationAccepted;
  (s.draft.owner as Record<string, unknown>).businessRole = 'owner';
  const m = r.migrateRegistration(JSON.parse(JSON.stringify(s)));
  const paid = r.resolveCheckout(m, 'paid');
  log.B = { accepted: m.draft.owner.ownerDeclarationAccepted, quoteCleared: m.quote === null, checkoutBefore: m.checkout?.status, resolvePaidOk: paid.result.ok, checkoutAfter: paid.state.checkout?.status };
});

test('unknown status + withdrawn declaration → resolveUnknownPayment(paid)', () => {
  const s = r.createRegistration('checkout_unknown');
  const w = r.keepOwner(s, { ...s.draft.owner, ownerDeclarationAccepted: false }).state;
  const x = r.resolveUnknownPayment(w, 'paid');
  log.unknown = { accepted: w.draft.owner.ownerDeclarationAccepted, ok: x.result.ok, checkoutAfter: x.state.checkout?.status, payment: x.state.activation?.paymentState };
});

test('CR-F02 allocation instrument (budget 64 pushes)', () => {
  const n = 1_000_000_000;
  const push = Array.prototype.push;
  let pushes = 0;
  const marker = new Error('budget');
  let aborted = false;
  try {
    Array.prototype.push = function (...items: unknown[]) {
      pushes += items.length;
      if (pushes > 64) throw marker;
      return push.apply(this, items);
    };
    r.setStoreCount(r.createRegistration('fresh'), n);
  } catch (e) {
    if (e !== marker) throw e;
    aborted = true;
  } finally {
    Array.prototype.push = push;
  }
  log.allocation = { requested: n, pushesObserved: pushes, abortedByInstrument: aborted };
  // 1→21 materializes how many entries?
  const s21 = r.setStoreCount(r.createRegistration('fresh'), 21).state;
  log.allocation21 = { pharmaciesLength: s21.draft.pharmacies.length };
});

afterAll(() => writeFileSync(`${OUT}/before-service.json`, JSON.stringify(log, null, 2)));
