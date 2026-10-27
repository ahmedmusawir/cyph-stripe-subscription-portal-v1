// Subscription Portal — auth identity types.
//
// TEMPORARY GATE (cleanup 2026-10-26): the portal still uses the inherited
// super-admin-only gate. `SuperAdminUser` is returned ONLY when the server-side
// role check (user_roles.role === 'superadmin') passes. Customer-facing
// authorization (owner/member or portal roles) will be specified in the FFM
// and replaces this type — do not extend it ad hoc.
export interface SuperAdminUser {
  id: string; // Supabase auth.users.id (uuid)
  email: string;
  displayName: string; // best-available; falls back to email local-part
  isSuperAdmin: true; // invariant for any session that reaches the shell
}
