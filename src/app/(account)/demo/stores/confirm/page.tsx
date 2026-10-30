import { requireAccountUser } from "@/services/auth/session";
import { ConfirmStoreView } from "@/components/portal/account/ConfirmStoreView";

export const metadata = { title: "Confirm your new price — Pharmacy Books" };

// Account management: real admin/superadmin required on the server (R-009).
// Enum-validated query only: `quote=error` and `card=updated|unchanged`.
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAccountUser();
  const { quote, card } = await searchParams;
  return <ConfirmStoreView quoteError={quote === "error"} card={card === "updated" || card === "unchanged" ? card : null} />;
}
