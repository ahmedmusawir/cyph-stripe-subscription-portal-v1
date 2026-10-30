// Subscription Portal — auth identity types.
//
// TEMPORARY RULE (Director ruling R-008, 2026-10-27): account management is open
// to existing `admin` OR `superadmin` accounts (user_roles.role, checked
// server-side). `member` stays denied. Customer-facing authorization will be
// specified later and replaces this type — do not extend it ad hoc.
export type PortalStaffRole = 'superadmin' | 'admin';

export interface PortalStaffUser {
  id: string; // Supabase auth.users.id (uuid)
  email: string;
  displayName: string; // best-available; falls back to email local-part
  role: PortalStaffRole; // from user_roles, never user_metadata
}
