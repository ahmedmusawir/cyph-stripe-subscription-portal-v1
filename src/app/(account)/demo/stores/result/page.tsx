import { requireAccountUser } from "@/services/auth/session";
import { StoreResultView } from "@/components/portal/account/StoreResultView";

export const metadata = { title: "Store added — Pharmacy Books" };

// Account management: real admin/superadmin required on the server (R-009).
export default async function Page() {
  await requireAccountUser();
  return <StoreResultView />;
}
