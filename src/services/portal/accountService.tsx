"use client";

// Portal FFM — account-management facade (client). Rendered only inside the
// server-protected (account) layout (RULINGS R-008/R-009). State lives in the
// signed-in admin's own per-tab namespace; it is never read by public pages.
import { createContext, useContext, useEffect, useMemo } from 'react';
import { createStore, useStore, type StoreApi } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  AddStoreDraft,
  ConsentView,
  HandoffView,
  OperationView,
  PharmacyDraft,
  PortalServices,
  PortalSessionView,
  QuoteView,
  Result,
  ReturnContext,
} from '@/types/portal/contract';
import type { AccountState, PortalOutcome, ServiceDeps } from '@/types/portal/state';
import * as engine from './account';
import { accountStorageKey, clearDemoStorage } from './storage';
import { demoDelay } from './latency';

interface AccountStore {
  s: AccountState;
  hydrated: boolean;
  commit(next: AccountState): void;
}

function makeStore(accountKey: string) {
  const store = createStore<AccountStore>()(
    persist(
      (set) => ({ s: engine.createAccount(), hydrated: false, commit: (next) => set({ s: next }) }),
      {
        name: accountStorageKey(accountKey),
        version: 1,
        storage: createJSONStorage(() => sessionStorage),
        partialize: (x) => ({ s: x.s }),
        skipHydration: true,
        onRehydrateStorage: () => () => store.setState({ hydrated: true }),
      },
    ),
  );
  return store;
}

const depsFor = (s: AccountState): ServiceDeps => ({ now: () => Date.now() + s.clockOffsetMs });

type PersistedAccountStore = ReturnType<typeof makeStore>;

export function createAccountFacade(store: StoreApi<AccountStore>) {
  const sync = <T,>(fn: (s: AccountState, d: ServiceDeps) => engine.Step<T>): Result<T> => {
    const current = store.getState().s;
    const step = fn(current, depsFor(current));
    store.getState().commit(step.state);
    return step.result;
  };
  const later = async <T,>(fn: (s: AccountState, d: ServiceDeps) => engine.Step<T>): Promise<Result<T>> => {
    await demoDelay();
    return sync(fn);
  };

  type AccountServices = Pick<
    PortalServices,
    'getSession' | 'getAddStoreDraft' | 'saveAddStoreDraft' | 'confirmAddStore' | 'readOperation' | 'openBillingPreview'
  >;
  const services: AccountServices = {
    async getSession(): Promise<PortalSessionView> {
      return engine.getSession(store.getState().s);
    },
    async getAddStoreDraft(): Promise<AddStoreDraft> {
      return store.getState().s.addDraft;
    },
    saveAddStoreDraft: (input: AddStoreDraft) => later((s) => engine.saveAddStoreDraft(s, input.pharmacy)),
    confirmAddStore: (input) => later((s, d) => engine.confirmAddStore(s, input, d)),
    async readOperation(operationId: string): Promise<Result<OperationView>> {
      return engine.readOperation(store.getState().s, operationId);
    },
    openBillingPreview: (purpose): Promise<Result<HandoffView>> => later((s) => engine.openBillingPreview(s, purpose)),
  };

  return {
    ...services,
    loadAccount: () => later((s) => engine.loadAccount(s)),
    retryLoadAccount: () => later((s) => engine.retryLoadAccount(s)),
    /** Last-known summary, read synchronously (no latency, no state change). */
    peekAccount: () => engine.loadAccount(store.getState().s).result,
    refreshAfterHandoff: (context: ReturnContext) => later((s, d) => engine.refreshAfterHandoff(s, context, d)),
    savePharmacy: (pharmacy: Partial<PharmacyDraft>) => later((s) => engine.saveAddStoreDraft(s, pharmacy)),
    keepDraft: (pharmacy: Partial<PharmacyDraft>) => sync((s) => engine.keepAddStoreDraft(s, pharmacy)),
    startOver: () => sync((s) => engine.startOverAddStore(s)),
    requestQuote: (): Promise<Result<QuoteView>> => later((s, d) => engine.requestAddQuote(s, d)),
    setConsent: (accepted: boolean): Result<ConsentView> => sync((s) => engine.setAddConsent(s, accepted)),
    returnFromPortal: (outcome: PortalOutcome) => sync((s) => engine.returnFromPortal(s, outcome)),
    acceptInvitation: (pharmacyId: string) => sync((s) => engine.acceptInvitation(s, pharmacyId)),
    harness: {
      selectScenario: (id: string) => sync((s) => engine.selectScenario(s, id)),
      selectPersona: (persona: string) => sync((s) => engine.selectPersona(s, persona)),
      setNextAddOutcome: (outcome: string) => sync((s) => engine.setNextAddOutcome(s, outcome)),
      resolveOperation: (outcome: 'failed' | 'unknown' | 'paid_provisioning' | 'attention' | 'succeeded') =>
        sync((s) => engine.resolveOperation(s, s.lastOperationKey, outcome)),
      advanceClock: (ms: number) => sync((s) => engine.advanceClock(s, ms)),
      reset: () => sync((s) => engine.selectScenario(engine.createAccount('two_store_active', 'billing_owner'), 'two_store_active')),
    },
  };
}

export type AccountFacade = ReturnType<typeof createAccountFacade>;

interface AccountContextValue {
  store: PersistedAccountStore;
  facade: AccountFacade;
  accountKey: string;
}
const AccountContext = createContext<AccountContextValue | null>(null);

export function AccountDemoProvider({ accountKey, children }: { accountKey: string; children: React.ReactNode }) {
  const value = useMemo(() => {
    const store = makeStore(accountKey);
    return { store, facade: createAccountFacade(store), accountKey };
  }, [accountKey]);

  useEffect(() => {
    // Identity change: another admin's namespace in this tab is discarded.
    clearDemoStorage('account', accountKey);
    void value.store.persist.rehydrate();
  }, [accountKey, value]);

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount(): { state: AccountState; hydrated: boolean; deps: ServiceDeps; account: AccountFacade } {
  const ctx = useContext(AccountContext);
  if (!ctx) throw new Error('useAccount must be used inside AccountDemoProvider');
  const state = useStore(ctx.store, (x) => x.s);
  const hydrated = useStore(ctx.store, (x) => x.hydrated);
  return { state, hydrated, deps: depsFor(state), account: ctx.facade };
}
