# supabase/ — historical SQL (UNVERIFIED reference)

Neither file here has been verified against any live database by this repo's work.
They are inherited from the starter kit / Mission Control lineage and are kept as
reference only. **Execute nothing from here without an explicit, separate approval.**

| File | Origin | Notes |
|---|---|---|
| `setup.sql` | Pro RBAC starter kit | `app_role` enum, `user_roles`, `profiles`, `handle_new_user()` trigger, own-row RLS |
| `migration_add_profiles.sql` | kit "Mark IV" migration (was `docs/`) | alternate `profiles` policies (superadmin-aware) and a different `handle_new_user()` body — **conflicts with `setup.sql`**; which one is live is unknown |

The retained app reads only `public.user_roles` (`src/utils/get-user-role.ts`).
The Subscription Portal schema will be specified in its own phase.
