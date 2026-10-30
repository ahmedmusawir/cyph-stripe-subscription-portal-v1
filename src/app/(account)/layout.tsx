import { redirect } from "next/navigation";
import { accountKeyFor, getPortalStaffUser } from "@/services/auth/session";
import { Shell } from "@/components/portal/Shell";
import { AccountDemoProvider } from "@/services/portal";

// Auth gate for every account-management screen (RULINGS R-008/R-009):
// a real admin OR superadmin session (getPortalStaffUser → user_roles.role).
// Members, role-less users and anonymous visitors go to /login. Each page ALSO
// calls requireAccountUser(): Next renders a page in parallel with its layout,
// so this redirect alone would still stream the page payload.
// Public registration lives in the separate (public) group and never inherits
// this layout. Login stands outside both groups.
export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getPortalStaffUser();
  if (!user) redirect("/login");

  return (
    <AccountDemoProvider accountKey={accountKeyFor(user.id)}>
      <Shell user={{ displayName: user.displayName, role: user.role }}>{children}</Shell>
    </AccountDemoProvider>
  );
}
