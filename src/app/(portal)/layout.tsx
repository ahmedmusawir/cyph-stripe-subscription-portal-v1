import { redirect } from "next/navigation";
import { getSuperAdminUser } from "@/services/auth/session";
import { Shell } from "@/components/portal/Shell";

// Auth gate for every authenticated portal screen.
//
// TEMPORARY (cleanup 2026-10-26): this gate is still the inherited
// SUPER-ADMIN-ONLY check (getSuperAdminUser → user_roles.role === 'superadmin').
// Any other authenticated user is sent to /login. Customer authorization
// (owners / members / portal roles) is NOT implemented here on purpose — it
// will be specified in the FFM and replace this predicate in one place.
// Login stands OUTSIDE this group (no shell).
export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSuperAdminUser();
  if (!user) redirect("/login");

  return (
    <Shell user={{ displayName: user.displayName, email: user.email }}>
      {children}
    </Shell>
  );
}
