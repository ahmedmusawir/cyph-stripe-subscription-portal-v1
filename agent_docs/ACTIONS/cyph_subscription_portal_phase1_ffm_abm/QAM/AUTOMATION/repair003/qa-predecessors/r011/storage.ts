// Portal FFM — per-tab demo storage namespaces (RULINGS R-009).
//
// Two separate sessionStorage namespaces, synthetic data only, versioned:
//   cyph-portal-demo:v1:public                    anonymous registration draft
//   cyph-portal-demo:v1:account:<accountKey>      account mock state of one signed-in admin
// No session token, password or real email is ever written here.

export const DEMO_PREFIX = 'cyph-portal-demo:';
export const PUBLIC_STORAGE_KEY = `${DEMO_PREFIX}v1:public`;
export const ACCOUNT_STORAGE_PREFIX = `${DEMO_PREFIX}v1:account:`;

export function accountStorageKey(accountKey: string): string {
  if (!/^[a-f0-9]{16}$/.test(accountKey)) throw new Error('invalid account key');
  return `${ACCOUNT_STORAGE_PREFIX}${accountKey}`;
}

function session(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function keys(storage: Storage): string[] {
  const out: string[] = [];
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i);
    if (k) out.push(k);
  }
  return out;
}

/** Remove demo namespaces. `keepAccountKey` spares the current admin's namespace. */
export function clearDemoStorage(scope: 'all' | 'account', keepAccountKey?: string): void {
  const storage = session();
  if (!storage) return;
  const keep = keepAccountKey ? accountStorageKey(keepAccountKey) : null;
  for (const k of keys(storage)) {
    if (!k.startsWith(DEMO_PREFIX)) continue;
    if (scope === 'account' && !k.startsWith(ACCOUNT_STORAGE_PREFIX)) continue;
    if (k === keep) continue;
    storage.removeItem(k);
  }
}
