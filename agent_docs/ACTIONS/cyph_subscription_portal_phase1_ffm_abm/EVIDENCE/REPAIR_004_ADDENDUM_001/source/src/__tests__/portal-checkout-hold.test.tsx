/**
 * @jest-environment jsdom
 */
// REPAIR_002 (R-012) component + facade layer: the real stand-in, activation
// and checkout-not-completed views on the real public registration store.
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CheckoutStandIn } from '@/components/portal/handoff/CheckoutStandIn';
import { ActivationView } from '@/components/portal/activation/ActivationView';
import { CheckoutIncompleteView } from '@/components/portal/activation/CheckoutIncompleteView';
import { ReviewView } from '@/components/portal/register/ReviewView';
import { PublicDemoControls } from '@/components/portal/PublicDemoControls';
import { registration, registrationHarness, PUBLIC_STORAGE_KEY } from '@/services/portal';
import { registrationStore } from '@/services/portal/registrationService';
import type { RegistrationState } from '@/types/portal/state';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: jest.fn(), refresh: jest.fn() }) }));

const consents = { termsAccepted: true, recurringChargeAccepted: true, priceChangeAccepted: false };
const s = () => registrationStore.getState().s;
const commit = (next: RegistrationState) => act(() => registrationStore.getState().commit(next));
const withDeclaration = (state: RegistrationState, accepted: unknown): RegistrationState => ({
  ...state,
  draft: { ...state.draft, owner: { ...state.draft.owner, ownerDeclarationAccepted: accepted as boolean } },
});

async function openCheckout(key = 'demo_hold_key_01') {
  act(() => {
    registrationHarness.selectScenario('prefilled_one_store');
  });
  await act(async () => {
    await registration.requestQuote();
  });
  await act(async () => {
    const r = await registration.startCheckout({ draftId: s().draft.id, quoteId: s().quote!.id, consents, operationKey: key });
    expect(r.ok).toBe(true);
  });
}

beforeEach(() => {
  sessionStorage.clear();
  push.mockClear();
  registrationStore.setState({ hydrated: true });
});

describe('Stripe stand-in (C05) under R-012', () => {
  it('shows payment outcomes for a valid open checkout', async () => {
    await openCheckout();
    render(<CheckoutStandIn />);
    expect(await screen.findByTestId('outcome-paid', {}, { timeout: 3000 })).toBeTruthy();
    expect(screen.queryByTestId('checkout-hold')).toBeNull();
  });

  it('a stored open checkout whose declaration is not exactly true offers no payment outcome at all', async () => {
    await openCheckout();
    for (const bad of [false, undefined, 'true', 1]) {
      commit(withDeclaration(s(), bad));
      const view = render(<CheckoutStandIn />);
      expect(screen.getByTestId('checkout-hold').textContent).toMatch(/Confirm the owner declaration before paying/);
      expect(screen.queryByTestId('outcome-paid')).toBeNull();
      expect(screen.queryByText(/Payment processing/)).toBeNull();
      view.unmount();
    }
    // The service refuses too (hiding the button is not the repair).
    const before = s();
    await act(async () => {
      expect((await registration.resolveCheckout('paid')).ok).toBe(false);
    });
    expect(s()).toBe(before);
  });

  it('after withdrawal on the owner step the checkout is closed and says so', async () => {
    await openCheckout();
    await act(async () => {
      await registration.saveOwner({ ...s().draft.owner, ownerDeclarationAccepted: false });
    });
    render(<CheckoutStandIn />);
    expect(screen.getByTestId('checkout-closed').textContent).toMatch(/owner declaration was withdrawn after checkout opened.*Nothing was charged/);
    expect(screen.queryByTestId('outcome-paid')).toBeNull();
  });
});

describe('activation and unknown payment holds', () => {
  it('a processing payment with the declaration withdrawn cannot be refreshed to confirmed', async () => {
    await openCheckout();
    await act(async () => {
      await registration.resolveCheckout('processing');
    });
    act(() => {
      registration.keepOwner({ ...s().draft.owner, ownerDeclarationAccepted: false });
    });
    render(<ActivationView />);
    expect(screen.getByTestId('activation-hold').textContent).toMatch(/Confirm the owner declaration to continue/);
    const refresh = screen.getByTestId('activation-refresh') as HTMLButtonElement;
    expect(refresh.disabled).toBe(true);
    await act(async () => {
      expect((await registration.refreshActivation()).ok).toBe(false);
    });
    expect(s().activation?.paymentState).toBe('pending');
  });

  it('unknown payment: "Stripe confirms payment" is unavailable while held; "nothing charged" stays available', async () => {
    act(() => {
      registrationHarness.selectScenario('checkout_unknown');
    });
    act(() => {
      registration.keepOwner({ ...s().draft.owner, ownerDeclarationAccepted: false });
    });
    render(<CheckoutIncompleteView />);
    expect(screen.getByTestId('unknown-hold')).toBeTruthy();
    expect((screen.getByTestId('unknown-paid') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByTestId('unknown-not-charged') as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(screen.getByTestId('unknown-not-charged'));
    await waitFor(() => expect(s().checkout?.status).toBe('abandoned'), { timeout: 3000 });
    expect(push).not.toHaveBeenCalledWith('/demo/activation');
  });
});

describe('persisted storage and the whole-draft facade', () => {
  it('a storage-v1 blob over a pending checkout rehydrates closed and unaccepted', async () => {
    await openCheckout('qa_legacy_pending');
    const legacy = JSON.parse(JSON.stringify(s()));
    delete legacy.draft.owner.ownerDeclarationAccepted;
    legacy.draft.owner.businessRole = 'owner';
    sessionStorage.setItem(PUBLIC_STORAGE_KEY, JSON.stringify({ state: { s: legacy }, version: 1 }));
    await act(async () => {
      await registrationStore.persist.rehydrate();
    });
    expect(s().draft.owner.ownerDeclarationAccepted).toBe(false);
    expect(s().checkout).toMatchObject({ status: 'abandoned', closedReason: 'owner_declaration' });
    expect(s().quote).toBeNull();
    expect(JSON.parse(sessionStorage.getItem(PUBLIC_STORAGE_KEY)!).version).toBe(3); // v3 since R-013 (checkout scope)
  });

  it('saveRegistrationDraft with a billion-store count stops at the first missing pharmacy without count-sized work', async () => {
    act(() => {
      registrationHarness.selectScenario('prefilled_one_store');
    });
    const draft = { ...s().draft, requestedStoreCount: 1_000_000_000 };
    const started = Date.now();
    // Push budget: a count-sized loop aborts here instead of exhausting memory.
    const push = Array.prototype.push;
    let pushes = 0;
    Array.prototype.push = function (this: unknown[], ...items: unknown[]) {
      pushes += items.length;
      if (pushes > 10_000) throw new Error('push budget exceeded');
      return push.apply(this, items);
    };
    let r;
    try {
      r = await registration.saveRegistrationDraft(draft);
    } finally {
      Array.prototype.push = push;
    }
    expect(pushes).toBeLessThan(10_000);
    expect(r).toMatchObject({ ok: false, code: 'validation' });
    expect(s().draft.requestedStoreCount).toBe(1_000_000_000);
    expect(s().draft.pharmacies.length).toBe(2); // the one entered + the failed attempt at step 2
    expect(Date.now() - started).toBeLessThan(2000);
  });
});

describe('C14 introduction matches the payment state (manual review, REPAIR_002 addendum)', () => {
  const UNKNOWN_INTRO = "Your details are saved. We're checking your payment status. Please don't pay again yet.";
  it('unknown payment: no "wasn\'t completed" claim; payment stays locked', () => {
    act(() => {
      registrationHarness.selectScenario('checkout_unknown');
    });
    render(<CheckoutIncompleteView />);
    expect(screen.getByText(UNKNOWN_INTRO)).toBeTruthy();
    expect(screen.queryByText(/Payment wasn't completed/)).toBeNull();
    expect(screen.getByText(/We're checking whether a payment went through/)).toBeTruthy();
    expect((screen.getByTestId('incomplete-continue') as HTMLButtonElement).disabled).toBe(true);
  });

  it.each(['checkout_abandoned', 'checkout_declined'] as const)('%s keeps the confirmed-unpaid introduction and recovery', (id) => {
    act(() => {
      registrationHarness.selectScenario(id);
    });
    render(<CheckoutIncompleteView />);
    expect(screen.getByText("Your details for 2 pharmacies are saved. Payment wasn't completed, so your account isn't active yet.")).toBeTruthy();
    expect(screen.queryByText(UNKNOWN_INTRO)).toBeNull();
    expect((screen.getByTestId('incomplete-continue') as HTMLButtonElement).disabled).toBe(false);
  });
});

describe('public demo controls (R-012 addendum 2)', () => {
  it('has no "Next activation check"; Load alone selects a named activation state, with the default plan', () => {
    render(<PublicDemoControls />);
    expect(screen.queryByText('Next activation check')).toBeNull();
    expect(document.getElementById('demo-activation-plan')).toBeNull();
    for (const id of ['activation_waiting', 'activation_provisioning', 'activation_delayed', 'activation_email_failed', 'activation_payment_failed', 'activation_ready']) {
      push.mockClear();
      fireEvent.change(screen.getByLabelText('Registration scenario'), { target: { value: id } });
      fireEvent.click(screen.getByRole('button', { name: 'Load' }));
      expect(push).toHaveBeenCalledWith('/demo/activation');
      expect(s().scenario).toBe(id);
      expect(s().activationPlan).toBe('ready');
    }
  });
});

describe('a submitted payment stays bound to its scope on screen (R-013)', () => {
  async function submit(outcome: 'processing' | 'unknown') {
    await openCheckout('demo_scope_key_01');
    await act(async () => {
      await registration.resolveCheckout(outcome);
    });
  }
  async function renamePharmacy() {
    await act(async () => {
      await registration.savePharmacy(0, { ...s().draft.pharmacies[0], name: 'Changed after submission' });
    });
  }

  it('processing: after an edit, Refresh is unavailable and the hold names what was paid for; restoring lets it confirm', async () => {
    await submit('processing');
    await renamePharmacy();
    const view = render(<ActivationView />);
    const hold = screen.getByTestId('activation-hold');
    expect(hold.textContent).toMatch(/Your details changed after you paid/);
    expect(hold.textContent).toMatch(/This payment is for 1 pharmacy \(Example Main Street Pharmacy\), \$99\.00/);
    expect((screen.getByTestId('activation-refresh') as HTMLButtonElement).disabled).toBe(true);
    await act(async () => {
      expect((await registration.refreshActivation()).ok).toBe(false);
    });
    act(() => {
      fireEvent.click(screen.getByTestId('restore-scope'));
    });
    expect(s().draft.pharmacies[0].name).toBe('Example Main Street Pharmacy');
    expect(screen.queryByTestId('activation-hold')).toBeNull();
    fireEvent.click(screen.getByTestId('activation-refresh'));
    await waitFor(() => expect(s().activation?.paymentState).toBe('confirmed'), { timeout: 3000 });
    expect(screen.getByTestId('activation-tracks').textContent).toMatch(/Confirmed by Stripe · \$99\.00/);
    expect(s().checkout).toMatchObject({ operationKey: 'demo_scope_key_01', status: 'paid' });
    view.unmount();
  });

  it('unknown: after a count edit, "Stripe confirms payment" is unavailable, "nothing charged" stays; restoring re-enables it', async () => {
    await submit('unknown');
    act(() => {
      registration.setStoreCount(2);
    });
    await act(async () => {
      await registration.savePharmacy(1, { ...s().draft.pharmacies[0], id: undefined, name: 'Added Pharmacy', ncpdp: '0000088', npi: '0000000088' });
    });
    render(<CheckoutIncompleteView />);
    expect(screen.getByTestId('unknown-hold').textContent).toMatch(/This payment is for 1 pharmacy \(Example Main Street Pharmacy\), \$99\.00/);
    expect((screen.getByTestId('unknown-paid') as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByTestId('unknown-not-charged') as HTMLButtonElement).disabled).toBe(false);
    act(() => {
      fireEvent.click(screen.getByTestId('restore-scope'));
    });
    expect(s().draft.requestedStoreCount).toBe(1);
    expect((screen.getByTestId('unknown-paid') as HTMLButtonElement).disabled).toBe(false);
  });

  it('the stand-in offers no payment outcome for a submitted payment whose details changed', async () => {
    await submit('processing');
    await renamePharmacy();
    render(<CheckoutStandIn />);
    expect(screen.getByTestId('checkout-hold').textContent).toMatch(/only go ahead for the details you submitted/);
    expect(screen.queryByTestId('outcome-paid')).toBeNull();
  });

  it('storage v2 (before R-013): an unedited submitted checkout rehydrates bound; an edited one is held with no restore', async () => {
    await submit('processing');
    const unedited = JSON.parse(JSON.stringify(s()));
    delete unedited.checkout.scope;
    sessionStorage.setItem(PUBLIC_STORAGE_KEY, JSON.stringify({ state: { s: unedited }, version: 2 }));
    await act(async () => {
      await registrationStore.persist.rehydrate();
    });
    expect(s().checkout?.scope).toMatchObject({ storeCount: 1, dueNowCents: 9900 });
    await submit('unknown');
    await renamePharmacy();
    const edited = JSON.parse(JSON.stringify(s()));
    delete edited.checkout.scope;
    sessionStorage.setItem(PUBLIC_STORAGE_KEY, JSON.stringify({ state: { s: edited }, version: 2 }));
    await act(async () => {
      await registrationStore.persist.rehydrate();
    });
    expect(s().checkout?.scope).toBeUndefined();
    render(<CheckoutIncompleteView />);
    expect(screen.getByTestId('unknown-hold').textContent).toMatch(/can't match this payment to your current details/);
    expect(screen.queryByTestId('restore-scope')).toBeNull();
    expect((screen.getByTestId('unknown-paid') as HTMLButtonElement).disabled).toBe(true);
    expect(JSON.parse(sessionStorage.getItem(PUBLIC_STORAGE_KEY)!).version).toBe(3);
  });
});

describe('REPAIR_004 on screen (R3-F01, R3-F02)', () => {
  it('R3-F01: an R-011 open checkout edited before the upgrade rehydrates unbound; the stand-in holds it with no payment outcome', async () => {
    await openCheckout('demo_legacy_key_01');
    const legacy = JSON.parse(JSON.stringify(s()));
    delete legacy.checkout.scope;
    const extra = { ...legacy.draft.pharmacies[0], id: 'demo_reg_ph_2', name: 'Legacy extra', ncpdp: '0000045', npi: '0000000045' };
    legacy.quote = null;
    legacy.draft = { ...legacy.draft, requestedStoreCount: 2, pharmacies: [legacy.draft.pharmacies[0], extra], revision: legacy.draft.revision + 1, state: 'editing' };
    sessionStorage.setItem(PUBLIC_STORAGE_KEY, JSON.stringify({ state: { s: legacy }, version: 2 }));
    await act(async () => {
      await registrationStore.persist.rehydrate();
    });
    expect(s().checkout).toMatchObject({ status: 'pending', operationKey: 'demo_legacy_key_01' });
    expect(s().checkout?.scope).toBeUndefined();
    render(<CheckoutStandIn />);
    const hold = screen.getByTestId('checkout-hold');
    expect(hold.textContent).toMatch(/can't match this payment to your current details/);
    expect(hold.textContent).not.toMatch(/after you paid/);
    expect(screen.queryByTestId('outcome-paid')).toBeNull();
    await act(async () => {
      expect((await registration.resolveCheckout('paid')).ok).toBe(false);
    });
    expect(s().checkout?.status).toBe('pending');
  });

  async function completeWith(admin?: { kind: 'other'; fullName: string; email: string }) {
    act(() => {
      registrationHarness.selectScenario('prefilled_one_store');
    });
    if (admin)
      await act(async () => {
        await registration.savePharmacy(0, { ...s().draft.pharmacies[0], adminAssignment: admin });
      });
    await act(async () => {
      await registration.requestQuote();
    });
    await act(async () => {
      await registration.startCheckout({ draftId: s().draft.id, quoteId: s().quote!.id, consents, operationKey: 'demo_done_key_01' });
      await registration.resolveCheckout('paid');
      await registration.refreshActivation();
    });
    expect(s().activation).toMatchObject({ provisioningState: 'ready', emailState: 'sent' });
    await act(async () => {
      await registration.savePharmacy(0, { ...s().draft.pharmacies[0], adminAssignment: { kind: 'other', fullName: 'Replacement Admin', email: 'replacement@demo-pharmacy.example' } });
    });
  }

  it('R3-F02: completed activation claims no invitation and offers no preview for an admin nominated after payment', async () => {
    await completeWith();
    render(<ActivationView />);
    const main = document.body.textContent ?? '';
    expect(main).toMatch(/Sent to j•••@demo-pharmacy\.example\./);
    expect(main).not.toMatch(/replacement admin/i);
    expect(main).not.toMatch(/invitation/i);
    expect(screen.getByTestId('activation-tracks').textContent).toMatch(/Example Main Street Pharmacy is set up/);
  });

  it('R3-F02: an admin the payment covered is still the one named after a later draft change', async () => {
    await completeWith({ kind: 'other', fullName: 'Sam Ortiz', email: 'sam@demo-pharmacy.example' });
    render(<ActivationView />);
    const main = document.body.textContent ?? '';
    expect(main).toMatch(/a separate store invitation went to Sam Ortiz/);
    expect(screen.getByRole('link', { name: "Preview Sam Ortiz's invitation" })).toBeTruthy();
    expect(main).not.toMatch(/replacement admin/i);
  });
});

describe('a submitted payment on screen (REPAIR_004 addendum 1, R4-N01)', () => {
  async function submit(outcome: 'processing' | 'unknown') {
    await openCheckout('demo_submitted_key_01');
    await act(async () => {
      await registration.resolveCheckout(outcome);
    });
  }

  for (const outcome of ['processing', 'unknown'] as const)
    it(`${outcome}: Review offers no way to close it or pay again, and the service refuses both`, async () => {
      await submit(outcome);
      const before = s();
      render(<ReviewView />);
      expect(screen.queryByRole('button', { name: 'Edit my details instead' })).toBeNull();
      expect(screen.queryByText('Your checkout on Stripe is still open')).toBeNull();
      const notice = screen.getByTestId('review-submitted');
      expect(notice.textContent).toMatch(/already submitted a payment/);
      expect(notice.textContent).toMatch(/don't pay again/);
      expect(screen.getByRole('link', { name: 'See payment status' }).getAttribute('href')).toBe(outcome === 'processing' ? '/demo/activation' : '/demo/checkout-incomplete');
      expect((screen.getByTestId('continue-payment') as HTMLButtonElement).disabled).toBe(true);
      await act(async () => {
        expect((await registration.resolveCheckout('back')).ok).toBe(false);
        expect(registration.resumeSignup().ok).toBe(false);
        expect(registration.restartSignup().ok).toBe(false);
      });
      expect(s()).toBe(before);
    });

  it('processing: the stand-in shows the submitted notice with no payment outcomes', async () => {
    await submit('processing');
    render(<CheckoutStandIn />);
    const notice = screen.getByTestId('checkout-submitted');
    expect(notice.textContent).toMatch(/already submitted/);
    for (const id of ['outcome-paid', 'outcome-back', 'outcome-closed', 'outcome-unknown', 'outcome-declined']) expect(screen.queryByTestId(id)).toBeNull();
  });

  it('processing: Activation no longer offers "resume checkout"', async () => {
    await submit('processing');
    render(<ActivationView />);
    expect(screen.queryByRole('link', { name: 'resume checkout' })).toBeNull();
    expect(document.body.textContent).toMatch(/don't pay again/);
  });

  it('a completed record whose paid scope cannot be established shows unavailable history, not the edited draft', async () => {
    await openCheckout('demo_legacy_done_01');
    await act(async () => {
      await registration.resolveCheckout('paid');
      await registration.refreshActivation();
      await registration.savePharmacy(0, { ...s().draft.pharmacies[0], name: 'Edited after payment' });
    });
    const legacy = JSON.parse(JSON.stringify(s()));
    delete legacy.checkout.scope;
    sessionStorage.setItem(PUBLIC_STORAGE_KEY, JSON.stringify({ state: { s: legacy }, version: 2 }));
    await act(async () => {
      await registrationStore.persist.rehydrate();
    });
    expect(s().checkout?.scope).toBeUndefined();
    render(<ActivationView />);
    const tracks = screen.getByTestId('activation-tracks').textContent ?? '';
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe("You're in. Check your email.");
    expect(tracks).toMatch(/Confirmed by Stripe/);
    expect(tracks).not.toMatch(/\$/);
    expect(document.body.textContent).not.toMatch(/Edited after payment/);
    expect(screen.getByTestId('history-unavailable').textContent).toMatch(/can't show which pharmacies or what amount/);
    expect(screen.queryByRole('button', { name: /Try payment again/ })).toBeNull();
  });
});
