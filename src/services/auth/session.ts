// Subscription Portal — session resolver (REAL Supabase auth — NOT mocked)
//
// server-only: createClient imports next/headers, so never import this from a
// client component or a client-safe barrel.
//
// TEMPORARY GATE (cleanup 2026-10-26): resolves the operator as a SuperAdminUser
// ONLY when user_roles.role === 'superadmin' (derived server-side via
// getUserRole(); never read from user_metadata). Otherwise null → the (portal)
// layout redirects to /login. Customer authorization replaces this in the FFM.
//
// This module is server-only by construction: createClient imports next/headers,
// which Next refuses to bundle into a client component. (No 'server-only' package
// guard — it isn't a kit dependency, and adding one is out of this sub-phase's scope.)

import type { SuperAdminUser } from '@/types/auth';
import { createClient } from '@/utils/supabase/server';
import { getUserRole, AppRole } from '@/utils/get-user-role';

/**
 * Resolve the authenticated operator as a SuperAdminUser, or null.
 * Returns null when: not authenticated, or the derived role is not 'superadmin'.
 */
export async function getSuperAdminUser(): Promise<SuperAdminUser | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // DERIVED — the kit-real implementation of the is_super_admin concept.
  const role = await getUserRole(user.id);
  const isSuperAdmin = role === AppRole.SUPERADMIN;
  if (!isSuperAdmin) return null;

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
    isSuperAdmin: true,
  };
}
