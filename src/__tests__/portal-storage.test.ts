/**
 * @jest-environment jsdom
 */
// Per-tab demo namespaces (R-009): public draft vs account state; logout and identity change.
import { accountStorageKey, clearDemoStorage, PUBLIC_STORAGE_KEY } from '@/services/portal/storage';

beforeEach(() => sessionStorage.clear());

it('account keys are opaque 16-hex namespaces only', () => {
  expect(accountStorageKey('0123456789abcdef')).toBe('cyph-portal-demo:v1:account:0123456789abcdef');
  expect(() => accountStorageKey('admin@example.test')).toThrow();
});

it('identity change clears other admins’ account state but keeps public draft and theme', () => {
  sessionStorage.setItem(PUBLIC_STORAGE_KEY, '{}');
  sessionStorage.setItem(accountStorageKey('aaaaaaaaaaaaaaaa'), '{}');
  sessionStorage.setItem(accountStorageKey('bbbbbbbbbbbbbbbb'), '{}');
  sessionStorage.setItem('theme', 'dark');
  clearDemoStorage('account', 'bbbbbbbbbbbbbbbb');
  expect(Object.keys(sessionStorage).sort()).toEqual([PUBLIC_STORAGE_KEY, accountStorageKey('bbbbbbbbbbbbbbbb'), 'theme'].sort());
});

it('logout clears every demo namespace, nothing else', () => {
  sessionStorage.setItem(PUBLIC_STORAGE_KEY, '{}');
  sessionStorage.setItem(accountStorageKey('aaaaaaaaaaaaaaaa'), '{}');
  sessionStorage.setItem('theme', 'dark');
  clearDemoStorage('all');
  expect(Object.keys(sessionStorage)).toEqual(['theme']);
});
