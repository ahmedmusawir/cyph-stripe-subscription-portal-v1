import { redirect } from "next/navigation";
import { getPortalStaffUser } from "@/services/auth/session";
import { PublicShell } from "@/components/portal/PublicShell";
import { LoginPageContent } from "./LoginPageContent";

export const metadata = { title: "Sign in — Pharmacy Books" };

// Real login, designed sign-in presentation in the public shell (R-009).
// If already an admin/superadmin session (R-008), skip straight in. Only
// `reason=session_expired` is read from the URL (banner text, no access effect).
export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await getPortalStaffUser();
  if (user) redirect("/dashboard");
  const { reason } = await searchParams;
  return (
    <PublicShell demoControls={false}>
      <LoginPageContent sessionExpired={reason === "session_expired"} />
    </PublicShell>
  );
}
