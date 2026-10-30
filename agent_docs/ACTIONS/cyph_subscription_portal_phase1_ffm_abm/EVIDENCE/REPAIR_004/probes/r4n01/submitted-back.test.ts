import * as r from '../src/services/portal/registration';
// R4-N01 observation (engineering, not a QA probe): can a processing payment be closed with "back" and paid again?
const deps = { now: () => Date.parse('2026-10-29T12:00:00Z') };
const consents = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
test('observation: can a processing (submitted) payment be closed with "back" and paid again?', () => {
  let s = r.requestQuote(r.createRegistration('prefilled_one_store'), deps).state;
  s = r.startCheckout(s, { quoteId: s.quote!.id, consents, operationKey: 'probe_key_0001' }, deps).state;
  s = r.resolveCheckout(s, 'processing').state;
  const back = r.resolveCheckout(s, 'back');
  let t = r.resumeSignup(back.state).state;
  t = r.requestQuote(t, deps).state;
  const again = r.startCheckout(t, { quoteId: t.quote?.id ?? 'x', consents, operationKey: 'probe_key_0002' }, deps);
  console.log(JSON.stringify({ backOk: back.result.ok, statusAfterBack: back.state.checkout?.status, activationAfterBack: back.state.activation?.paymentState, secondCheckoutOk: again.result.ok }));
});
