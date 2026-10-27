import { redirect } from "next/navigation";
import { getSuperAdminUser } from "@/services/auth/session";
import { LoginPageContent } from "./LoginPageContent";

// Standalone (no shell). If already a (temporary gate) super-admin session, skip straight in.
export default async function LoginPage() {
  const user = await getSuperAdminUser();
  if (user) redirect("/dashboard");
  return <LoginPageContent />;
}
