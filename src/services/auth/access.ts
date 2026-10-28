// Subscription Portal — who may enter account management.
//
// TEMPORARY RULE (Director ruling R-008, 2026-10-27): existing `admin` and
// `superadmin` accounts may enter; `member` (and no role) stays denied. The role
// always comes from public.user_roles via the server — never user_metadata.
//
// Pure and import-free so the login form (client) and the session resolver
// (server) share one predicate. Do not import server code here.
import type { PortalStaffRole } from '@/types/auth';

export const PORTAL_STAFF_ROLES: readonly PortalStaffRole[] = ['superadmin', 'admin'];

export function isPortalStaffRole(role: unknown): role is PortalStaffRole {
  return typeof role === 'string' && (PORTAL_STAFF_ROLES as readonly string[]).includes(role);
}
