import { requireAccountUser } from "@/services/auth/session";
import { AddStoreView } from "@/components/portal/account/AddStoreView";

export const metadata = { title: "Add a store — Pharmacy Books" };

// Account management: real admin/superadmin required on the server (R-009).
export default async function Page() {
  await requireAccountUser();
  return <AddStoreView />;
}
