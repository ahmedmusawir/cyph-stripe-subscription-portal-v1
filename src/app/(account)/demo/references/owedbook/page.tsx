import { requireAccountUser } from "@/services/auth/session";
import { OwedBookReferenceView } from "@/components/portal/account/OwedBookReferenceView";

export const metadata = { title: "OwedBook reference — Pharmacy Books" };

// Account management: real admin/superadmin required on the server (R-009).
export default async function Page() {
  await requireAccountUser();
  return <OwedBookReferenceView />;
}
