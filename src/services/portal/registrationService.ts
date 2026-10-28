"use client";

// Portal FFM — public registration facade (client). Binds the pure engine to a
// per-tab zustand store persisted in the PUBLIC namespace only. It can never
// read or write account state (RULINGS R-009).
import { useEffect } from 'react';
import { createStore, useStore } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  AccessEmailView,
  ActivationView,
  ConsentView,
  HandoffView,
  OwnerDraft,
  PharmacyDraft,
  PortalServices,
  QuoteView,
  RegistrationDraft,
  Result,
} from '@/types/portal/contract';
import type { ActivationPlan, RegistrationState, ServiceDeps } from '@/types/portal/state';
import * as engine from './registration';
import { PUBLIC_STORAGE_KEY } from './storage';
import { demoDelay } from './latency';

interface RegistrationStore {
  s: RegistrationState;
  hydrated: boolean;
  commit(next: RegistrationState): void;
}

export const registrationStore = createStore<RegistrationStore>()(
  persist(
    (set) => ({
      s: engine.createRegistration('fresh'),
      hydrated: false,
      commit: (next) => set({ s: next }),
    }),
    {
      name: PUBLIC_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (store) => ({ s: store.s }),
      skipHydration: true,
      onRehydrateStorage: () => () => registrationStore.setState({ hydrated: true }),
    },
  ),
);

const depsFor = (s: RegistrationState): ServiceDeps => ({ now: () => Date.now() + s.clockOffsetMs });

function sync<T>(fn: (s: RegistrationState, d: ServiceDeps) => engine.Step<T>): Result<T> {
  const current = registrationStore.getState().s;
  const step = fn(current, depsFor(current));
  registrationStore.getState().commit(step.state);
  return step.result;
}

async function later<T>(fn: (s: RegistrationState, d: ServiceDeps) => engine.Step<T>): Promise<Result<T>> {
  await demoDelay();
  return sync(fn);
}

type RegistrationServices = Pick<
  PortalServices,
  'getRegistrationDraft' | 'saveRegistrationDraft' | 'applyCode' | 'startCheckout' | 'readActivation' | 'requestAccessEmailPreview'
>;

/** Contract-named methods (portal-contract.ts) for the public surface. */
export const registrationServices: RegistrationServices = {
  async getRegistrationDraft() {
    return registrationStore.getState().s.draft;
  },
  async saveRegistrationDraft(input: RegistrationDraft) {
    // Whole-draft save: owner + each pharmacy validated through the same step rules.
    let result: Result<RegistrationDraft> = sync((s) => engine.setStoreCount(s, input.requestedStoreCount));
    if (!result.ok) return result;
    result = sync((s) => engine.saveOwner(s, input.owner));
    if (!result.ok) return result;
    for (let i = 0; i < input.requestedStoreCount; i++) {
      const pharmacy = input.pharmacies[i] ?? {};
      result = sync((s) => engine.savePharmacy(s, i, pharmacy));
      if (!result.ok) return result;
    }
    return result;
  },
  applyCode: ({ code }) => later((s, d) => engine.applyCode(s, code, d)),
  startCheckout: (input) => later((s, d) => engine.startCheckout(s, input, d)),
  async readActivation() {
    return engine.readActivation(registrationStore.getState().s);
  },
  async requestAccessEmailPreview(contextId: string) {
    await demoDelay();
    const s = registrationStore.getState().s;
    const variant = engine.isEmailVariant(contextId) ? contextId : 'owner';
    const email: AccessEmailView = engine.accessEmailPreviews(s)[variant];
    return { ok: true, value: { status: 'request_received', email } } as const;
  },
};

/** Step-level actions used by the registration screens. */
export const registration = {
  ...registrationServices,
  storeCountDiscards: (n: number) => engine.storeCountDiscards(registrationStore.getState().s, n),
  setStoreCount: (n: number) => sync((s) => engine.setStoreCount(s, n)),
  retryPricing: () => later((s) => engine.retryPricing(s)),
  saveOwner: (owner: Partial<OwnerDraft>) => later((s) => engine.saveOwner(s, owner)),
  keepOwner: (owner: Partial<OwnerDraft>) => sync((s) => engine.keepOwner(s, owner)),
  keepPharmacy: (index: number, pharmacy: Partial<PharmacyDraft>) => sync((s) => engine.keepPharmacy(s, index, pharmacy)),
  savePharmacy: (index: number, pharmacy: Partial<PharmacyDraft>) => later((s) => engine.savePharmacy(s, index, pharmacy)),
  requestQuote: (): Promise<Result<QuoteView>> => later((s, d) => engine.requestQuote(s, d)),
  removeCode: () => later((s, d) => engine.removeCode(s, d)),
  setConsents: (c: Pick<ConsentView, 'termsAccepted' | 'recurringChargeAccepted'>) => sync((s) => engine.setConsents(s, c)),
  resolveCheckout: (outcome: engine.CheckoutOutcome) => later((s) => engine.resolveCheckout(s, outcome)),
  resolveUnknownPayment: (outcome: 'paid' | 'not_charged') => later((s) => engine.resolveUnknownPayment(s, outcome)),
  resumeSignup: () => sync((s) => engine.resumeSignup(s)),
  restartSignup: () => sync((s) => engine.restartSignup(s)),
  refreshActivation: (): Promise<Result<ActivationView>> => later((s) => engine.refreshActivation(s)),
  resendAccessEmail: () => later((s, d) => engine.resendAccessEmail(s, d)),
  useAccessLink: () => later((s) => engine.useAccessLink(s)),
  requestNewAccessLink: () => later((s) => engine.requestNewAccessLink(s)),
};

/** Public demo controls (registration scenarios only; DemoHarness subset). */
export const registrationHarness = {
  selectScenario: (id: string) => sync((s) => engine.selectScenario(s, id)),
  setActivationPlan: (plan: ActivationPlan) => sync((s) => engine.setActivationPlan(s, plan)),
  setLinkState: (link: RegistrationState['accessLink']) => sync((s) => engine.setLinkState(s, link)),
  advanceClock: (ms: number) => sync((s) => engine.advanceClock(s, ms)),
  reset: () => sync(() => engine.selectScenario(engine.createRegistration('fresh'), 'fresh')),
};

export type { HandoffView };

/** Read the public state; `hydrated` is false until sessionStorage has been read. */
export function useRegistration(): { state: RegistrationState; hydrated: boolean; deps: ServiceDeps } {
  const state = useStore(registrationStore, (x) => x.s);
  const hydrated = useStore(registrationStore, (x) => x.hydrated);
  useEffect(() => {
    if (!registrationStore.getState().hydrated) void registrationStore.persist.rehydrate();
  }, []);
  return { state, hydrated, deps: depsFor(state) };
}
