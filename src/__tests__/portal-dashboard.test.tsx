/**
 * @jest-environment jsdom
 */
// REPAIR_001 component layer: the real DashboardView inside the real
// AccountDemoProvider (per-tab sessionStorage namespace, 350ms mock latency).
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useEffect } from 'react';
import { DashboardView } from '@/components/portal/account/DashboardView';
import { AccountDemoProvider, useAccount } from '@/services/portal';

const push = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ push, replace: jest.fn(), refresh: jest.fn() }) }));
jest.mock('@/components/ui/use-toast', () => ({ useToast: () => ({ toast: jest.fn() }) }));

const KEY = 'a1b2c3d4e5f60718';

function Scenario({ id }: { id: string }) {
  const { hydrated, account } = useAccount();
  useEffect(() => {
    if (hydrated) account.harness.selectScenario(id);
  }, [hydrated, account, id]);
  return null;
}

function mount(children: React.ReactNode) {
  return render(<AccountDemoProvider accountKey={KEY}>{children}</AccountDemoProvider>);
}

beforeEach(() => sessionStorage.clear());

describe('DashboardView — account load error (Q2-F02)', () => {
  it('keeps the error view through remounts until Try again, then shows a coherent account', async () => {
    const first = mount(
      <>
        <Scenario id="load_error" />
        <DashboardView />
      </>,
    );
    expect(await screen.findByTestId('load-retry', {}, { timeout: 3000 })).toBeTruthy();
    // Let any further load the effect could start settle; the error must remain.
    await act(() => new Promise((r) => setTimeout(r, 800)));
    expect(screen.getByTestId('load-retry')).toBeTruthy();
    first.unmount();

    // Remount = route change back to /dashboard, or a reload (state persists per tab).
    mount(<DashboardView />);
    expect(await screen.findByTestId('load-retry', {}, { timeout: 3000 })).toBeTruthy();
    expect(screen.queryByTestId('monthly-total')).toBeNull();

    fireEvent.click(screen.getByTestId('load-retry'));
    expect(screen.getByTestId('load-retry').getAttribute('aria-busy')).toBe('true');
    expect((await screen.findByTestId('monthly-total', {}, { timeout: 3000 })).textContent).toBe('$148.00');
    expect(screen.getByTestId('store-count').textContent).toBe('2');
  });
});

describe('DashboardView — return from Stripe (R1-N01)', () => {
  it('shows the last-known summary under the refreshing banner, then the refreshed result', async () => {
    function Returned() {
      const { hydrated, account } = useAccount();
      useEffect(() => {
        if (hydrated) account.returnFromPortal('no_change');
      }, [hydrated, account]);
      return null;
    }
    mount(
      <>
        <Returned />
        <DashboardView />
      </>,
    );
    expect(await screen.findByText('Welcome back from Stripe — refreshing your summary', {}, { timeout: 3000 })).toBeTruthy();
    expect(screen.getByTestId('monthly-total').textContent).toBe('$148.00');
    expect(screen.getByTestId('refresh-line').textContent).toBe('Refreshing…');
    expect(await screen.findByText(/Nothing changed on this account/, {}, { timeout: 3000 })).toBeTruthy();
    expect(screen.getByTestId('refresh-line').textContent).toMatch(/after returning from Stripe/);
  });
});
