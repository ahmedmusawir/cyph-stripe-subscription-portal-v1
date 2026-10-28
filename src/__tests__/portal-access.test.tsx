// R-008 (2026-10-27): admin OR superadmin may enter account management;
// member / no role / signed-out are denied. Role comes from user_roles only.
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(),
}));
jest.mock('@/utils/get-user-role', () => ({
  getUserRole: jest.fn(),
}));
jest.mock('@/components/portal/Shell', () => ({
  Shell: jest.fn(() => null),
}));
jest.mock('@/app/login/LoginPageContent', () => ({
  LoginPageContent: jest.fn(() => null),
}));

import { isPortalStaffRole } from '@/services/auth/access';
import { getPortalStaffUser } from '@/services/auth/session';
import PortalLayout from '@/app/(account)/layout';
import LoginPage from '@/app/login/page';
import DashboardPage from '@/app/(account)/dashboard/page';
import { createClient } from '@/utils/supabase/server';
import { getUserRole } from '@/utils/get-user-role';
import { redirect } from 'next/navigation';

const createClientMock = createClient as jest.MockedFunction<typeof createClient>;
const getUserRoleMock = getUserRole as jest.MockedFunction<typeof getUserRole>;

function signedIn(user: Record<string, unknown> | null) {
  const getUser = jest.fn().mockResolvedValue({ data: { user } });
  createClientMock.mockResolvedValue({ auth: { getUser } } as any);
}

const AUTH_USER = {
  id: 'user-1',
  email: 'staff@example.test',
  user_metadata: { full_name: 'Staff Person' },
};

describe('isPortalStaffRole', () => {
  it.each(['superadmin', 'admin'])('allows %s', (role) => {
    expect(isPortalStaffRole(role)).toBe(true);
  });

  it.each(['member', 'owner', 'SUPERADMIN', 'Admin', '', ' admin', null, undefined, 1])(
    'denies %p',
    (role) => {
      expect(isPortalStaffRole(role)).toBe(false);
    },
  );
});

describe('getPortalStaffUser', () => {
  it('returns null when signed out without looking up a role', async () => {
    signedIn(null);
    await expect(getPortalStaffUser()).resolves.toBeNull();
    expect(getUserRoleMock).not.toHaveBeenCalled();
  });

  it('resolves an admin', async () => {
    signedIn(AUTH_USER);
    getUserRoleMock.mockResolvedValue('admin' as any);
    await expect(getPortalStaffUser()).resolves.toEqual({
      id: 'user-1',
      email: 'staff@example.test',
      displayName: 'Staff Person',
      role: 'admin',
    });
    expect(getUserRoleMock).toHaveBeenCalledWith('user-1');
  });

  it('still resolves a superadmin', async () => {
    signedIn(AUTH_USER);
    getUserRoleMock.mockResolvedValue('superadmin' as any);
    await expect(getPortalStaffUser()).resolves.toMatchObject({ role: 'superadmin' });
  });

  it('denies a member', async () => {
    signedIn(AUTH_USER);
    getUserRoleMock.mockResolvedValue('member' as any);
    await expect(getPortalStaffUser()).resolves.toBeNull();
  });

  it('denies a user with no role row', async () => {
    signedIn(AUTH_USER);
    getUserRoleMock.mockResolvedValue(null);
    await expect(getPortalStaffUser()).resolves.toBeNull();
  });

  it('ignores a forged user_metadata role', async () => {
    signedIn({ ...AUTH_USER, user_metadata: { role: 'superadmin' } });
    getUserRoleMock.mockResolvedValue('member' as any);
    await expect(getPortalStaffUser()).resolves.toBeNull();
  });
});

describe('(account) layout gate', () => {
  it.each(['admin', 'superadmin'])('renders the shell for %s', async (role) => {
    signedIn(AUTH_USER);
    getUserRoleMock.mockResolvedValue(role as any);
    const element = await PortalLayout({ children: 'page' });
    // R-009: the layout scopes the synthetic account demo to an opaque key, never the email.
    expect(element.props.accountKey).toMatch(/^[a-f0-9]{16}$/);
    expect(JSON.stringify(element.props.accountKey)).not.toContain('staff@');
    expect(element.props.children.props.user).toEqual({ displayName: 'Staff Person', role });
    expect(redirect).not.toHaveBeenCalled();
  });

  it.each([['member'], [null]])('redirects role %p to /login', async (role) => {
    signedIn(AUTH_USER);
    getUserRoleMock.mockResolvedValue(role as any);
    await expect(PortalLayout({ children: 'page' })).rejects.toThrow('NEXT_REDIRECT:/login');
  });

  it('redirects a signed-out request to /login', async () => {
    signedIn(null);
    await expect(PortalLayout({ children: 'page' })).rejects.toThrow('NEXT_REDIRECT:/login');
  });
});

describe('/login page', () => {
  it('sends an admin session straight to /dashboard', async () => {
    signedIn(AUTH_USER);
    getUserRoleMock.mockResolvedValue('admin' as any);
    await expect(LoginPage({ searchParams: Promise.resolve({}) })).rejects.toThrow('NEXT_REDIRECT:/dashboard');
  });

  it('shows the form to a member session', async () => {
    signedIn(AUTH_USER);
    getUserRoleMock.mockResolvedValue('member' as any);
    await expect(LoginPage({ searchParams: Promise.resolve({}) })).resolves.toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe('/dashboard page guard', () => {
  it.each([['member'], [null]])('redirects role %p to /login', async (role) => {
    signedIn(AUTH_USER);
    getUserRoleMock.mockResolvedValue(role as any);
    await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT:/login');
  });

  it.each(['admin', 'superadmin'])('renders for %s', async (role) => {
    signedIn(AUTH_USER);
    getUserRoleMock.mockResolvedValue(role as any);
    await expect(DashboardPage()).resolves.toBeTruthy();
    expect(redirect).not.toHaveBeenCalled();
  });
});
