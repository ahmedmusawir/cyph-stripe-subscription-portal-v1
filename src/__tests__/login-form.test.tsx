/**
 * @jest-environment jsdom
 */
// R-008 (2026-10-27): the login form lets admin and superadmin through and
// signs a member straight back out. Network is mocked; no Supabase call.
import { act, fireEvent, render, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import { LoginPageContent } from '@/app/login/LoginPageContent';

const router = { push: jest.fn(), replace: jest.fn(), refresh: jest.fn() };

function mockLoginResponse(role: string | null) {
  const fetchMock = jest.fn((url: string) =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(url === '/api/auth/login' ? { data: { role } } : {}),
    }),
  );
  global.fetch = fetchMock as any;
  return fetchMock;
}

async function submit() {
  render(<LoginPageContent sessionExpired={false} />);
  fireEvent.change(screen.getByLabelText('Work email'), { target: { value: 'staff@example.test' } });
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'not-a-real-password' } });
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  });
}

beforeEach(() => {
  (useRouter as jest.Mock).mockReturnValue(router);
});

it.each(['admin', 'superadmin'])('%s goes to /dashboard', async (role) => {
  const fetchMock = mockLoginResponse(role);
  await submit();
  expect(router.push).toHaveBeenCalledWith('/dashboard');
  expect(fetchMock).not.toHaveBeenCalledWith('/api/auth/logout', expect.anything());
});

it.each([['member'], [null]])('role %p is signed out and shown an error', async (role) => {
  const fetchMock = mockLoginResponse(role);
  await submit();
  expect(router.push).not.toHaveBeenCalled();
  expect(fetchMock).toHaveBeenCalledWith('/api/auth/logout', { method: 'POST' });
  expect(screen.getByRole('alert').textContent).toBe(
    'This account does not have access to account management.',
  );
});

it('invalid credentials show the designed message (network mocked; no real auth call)', async () => {
  global.fetch = jest.fn(() =>
    Promise.resolve({ ok: false, json: () => Promise.resolve({ error: 'Invalid login credentials' }) }),
  ) as any;
  await submit();
  expect(router.push).not.toHaveBeenCalled();
  expect(screen.getByRole('alert').textContent).toContain("That email and password don't match");
});

it('session-expired banner renders only when asked', () => {
  render(<LoginPageContent sessionExpired />);
  expect(screen.getByText('Your session expired')).toBeTruthy();
});
