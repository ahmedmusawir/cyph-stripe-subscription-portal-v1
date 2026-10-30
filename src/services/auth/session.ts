// Subscription Portal — session resolver (REAL Supabase auth — NOT mocked)
//
// server-only: createClient imports next/headers, so never import this from a
// client component or a client-safe barrel.
//
// TEMPORARY RULE (Director ruling R-008, 2026-10-27): resolves the operator as a
// PortalStaffUser when user_roles.role is 'admin' OR 'superadmin' (derived
// server-side via getUserRole(); never read from user_metadata). Otherwise null
// → the (portal) layout redirects to /login. Customer authorization replaces
// this later.
//
// This module is server-only by construction: createClient imports next/headers,
// which Next refuses to bundle into a client component. (No 'server-only' package
// guard — it isn't a kit dependency, and adding one is out of this sub-phase's scope.)

import { createHash } from 'node:crypto';
import { redirect } from 'next/navigation';
import type { PortalStaffUser } from '@/types/auth';
import { isPortalStaffRole } from '@/services/auth/access';
import { createClient } from '@/utils/supabase/server';
import { getUserRole } from '@/utils/get-user-role';

/**
 * Resolve the authenticated operator as a PortalStaffUser, or null.
 * Returns null when: not authenticated, or the derived role is not admin/superadmin.
 */
export async function getPortalStaffUser(): Promise<PortalStaffUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // DERIVED — the only role source is public.user_roles.
  const role = await getUserRole(user.id);
  if (!isPortalStaffRole(role)) return null;

  // Display name: best-available from auth metadata (display-only; never a role
  // signal), falling back to the email local-part. Reading full_name for display
  // is kit-sanctioned; role is NEVER read from user_metadata.
  const metadataName =
    typeof user.user_metadata?.full_name === 'string'
      ? (user.user_metadata.full_name as string)
      : undefined;
  const email = user.email ?? '';
  const displayName = metadataName?.trim() || email.split('@')[0] || 'Operator';

  return {
    id: user.id,
    email,
    displayName,
    role,
  };
}

/**
 * Server-side guard for every account-management page and account-side mode
 * (RULINGS R-009). Same predicate as the (account) layout, repeated per page so
 * soft navigation re-checks and a signed-out 307 body carries no page payload.
 */
export async function requireAccountUser(): Promise<PortalStaffUser> {
  const user = await getPortalStaffUser();
  if (!user) redirect('/login');
  return user;
}

/**
 * Opaque per-admin namespace for the synthetic account demo state in the
 * browser: first 16 hex of SHA-256(user.id). Never the email.
 */
export function accountKeyFor(userId: string): string {
  return createHash('sha256').update(userId).digest('hex').slice(0, 16);
}
