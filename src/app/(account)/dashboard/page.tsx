import { requireAccountUser } from "@/services/auth/session";
import { DashboardView } from "@/components/portal/account/DashboardView";

export const metadata = { title: "Account & Billing — Pharmacy Books" };

// Account management (R-008/R-009). Page-level guard: Next renders a page in
// parallel with its layout, so the layout redirect alone still streamed this
// page's payload into the signed-out 307 body. Same predicate as the layout.
export default async function DashboardPage() {
  await requireAccountUser();
  return <DashboardView />;
}
