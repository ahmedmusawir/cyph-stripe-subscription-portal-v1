// REPAIR_001 Q2-F03: the shared /demo/stripe route. Query values can add the
// login requirement, never remove it — duplicates, order and case included.
// Roles are MOCKED (no live auth).
jest.mock('@/utils/supabase/server', () => ({ createClient: jest.fn() }));
jest.mock('@/utils/get-user-role', () => ({ getUserRole: jest.fn() }));
jest.mock('@/components/portal/handoff/CheckoutStandIn', () => ({ CheckoutStandIn: jest.fn(() => null) }));
jest.mock('@/components/portal/handoff/PortalStandIn', () => ({ PortalStandIn: jest.fn(() => null) }));

import { isValidElement, type ReactElement } from 'react';
import StripePage from '@/app/(handoff)/demo/stripe/page';
import { CheckoutStandIn } from '@/components/portal/handoff/CheckoutStandIn';
import { PortalStandIn } from '@/components/portal/handoff/PortalStandIn';
import { classifyStripeStandIn } from '@/services/portal/stripeRoute';
import { createClient } from '@/utils/supabase/server';
import { getUserRole } from '@/utils/get-user-role';
import { redirect } from 'next/navigation';

const createClientMock = createClient as jest.MockedFunction<typeof createClient>;
const getUserRoleMock = getUserRole as jest.MockedFunction<typeof getUserRole>;

function signedIn(user: Record<string, unknown> | null) {
  createClientMock.mockResolvedValue({ auth: { getUser: jest.fn().mockResolvedValue({ data: { user } }) } } as any);
}
const ADMIN = { id: 'user-1', email: 'staff@example.test', user_metadata: { full_name: 'Staff Person' } };
const page = (params: Record<string, string | string[] | undefined>) => StripePage({ searchParams: Promise.resolve(params) });

describe('classifyStripeStandIn', () => {
  it.each([
    [{}, 'public', 'checkout'],
    [{ mode: 'checkout' }, 'public', 'checkout'],
    [{ mode: ['checkout', 'checkout'] }, 'public', 'checkout'],
    [{ mode: 'portal' }, 'account', 'portal'],
    [{ mode: 'card' }, 'account', 'card'],
    [{ mode: ['checkout', 'portal'] }, 'account', 'portal'],
    [{ mode: ['portal', 'checkout'] }, 'account', 'portal'],
    [{ mode: ['card', 'card'] }, 'account', 'card'],
    [{ mode: ['checkout', 'card'] }, 'account', 'card'],
    [{ mode: ['card', 'portal'] }, 'account', 'portal'],
    [{ mode: 'Portal' }, 'account', 'portal'],
    [{ mode: ' CARD ' }, 'account', 'card'],
    [{ mode: 'portal\u0000' }, 'account', 'checkout'],
    [{ mode: 'admin' }, 'account', 'checkout'],
    [{ mode: '' }, 'account', 'checkout'],
    [{ mode: ['checkout', 'unknown'] }, 'account', 'checkout'],
  ] as const)('%j → %s/%s', (params, access, mode) => {
    expect(classifyStripeStandIn(params as never)).toMatchObject({ access, mode });
  });

  it('purpose: first allowed value, else manage; never free text', () => {
    expect(classifyStripeStandIn({ mode: 'portal', purpose: 'cancel' }).purpose).toBe('cancel');
    expect(classifyStripeStandIn({ mode: 'portal', purpose: ['bogus', 'RESUME'] }).purpose).toBe('resume');
    expect(classifyStripeStandIn({ mode: 'portal', purpose: 'https://evil.example/' }).purpose).toBe('manage');
  });
});

describe('/demo/stripe page (server)', () => {
  it.each([
    [{ mode: 'portal' }],
    [{ mode: 'card' }],
    [{ mode: ['checkout', 'portal'] }],
    [{ mode: ['portal', 'checkout'] }],
    [{ mode: ['card', 'card'] }],
    [{ mode: 'PORTAL' }],
    [{ mode: 'unknown' }],
  ])('signed-out %j → redirect /login before anything renders', async (params) => {
    signedIn(null);
    await expect(page(params)).rejects.toThrow('NEXT_REDIRECT:/login');
    expect(redirect).toHaveBeenCalledWith('/login');
    expect(CheckoutStandIn).not.toHaveBeenCalled();
    expect(PortalStandIn).not.toHaveBeenCalled();
  });

  it.each([['member'], [null]])('role %p with account mode → redirect /login', async (role) => {
    signedIn(ADMIN);
    getUserRoleMock.mockResolvedValue(role as any);
    await expect(page({ mode: ['checkout', 'portal'] })).rejects.toThrow('NEXT_REDIRECT:/login');
  });

  it.each([[{}], [{ mode: 'checkout' }]])('public checkout %j renders without any auth lookup', async (params) => {
    const el = (await page(params)) as ReactElement;
    expect(isValidElement(el) && el.type).toBe(CheckoutStandIn);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it.each([
    ['admin', { mode: ['checkout', 'portal'], purpose: 'cancel' }, 'portal', 'cancel'],
    ['superadmin', { mode: ['card', 'card'], purpose: 'change_card' }, 'card', 'change_card'],
  ] as const)('%s with %j → %s stand-in inside the account provider', async (role, params, mode, purpose) => {
    signedIn(ADMIN);
    getUserRoleMock.mockResolvedValue(role as any);
    const el = (await page(params as never)) as ReactElement<{ accountKey: string; children: ReactElement<{ mode: string; purpose: string }> }>;
    expect(el.props.accountKey).toMatch(/^[0-9a-f]{16}$/);
    expect(el.props.children.type).toBe(PortalStandIn);
    expect(el.props.children.props).toEqual({ mode, purpose });
  });
});
