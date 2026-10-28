import { accountKeyFor, requireAccountUser } from "@/services/auth/session";
import { AccountDemoProvider, BILLING_PURPOSES, type BillingPurpose } from "@/services/portal";
import { CheckoutStandIn } from "@/components/portal/handoff/CheckoutStandIn";
import { PortalStandIn } from "@/components/portal/handoff/PortalStandIn";

export const metadata = { title: "Stripe (stand-in) — Pharmacy Books" };
export const dynamic = "force-dynamic";

// Shared stand-in route (RULINGS R-009):
//   mode=checkout (default)  → PUBLIC initial-checkout stand-in (registration draft only)
//   mode=portal | mode=card  → ACCOUNT management: real admin/superadmin required
//                              BEFORE anything renders or the account store mounts.
// Query values only select a mode; they can add the login requirement, never remove it.
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const mode = params.mode === "portal" || params.mode === "card" ? params.mode : "checkout";
  if (mode === "checkout") return <CheckoutStandIn />;

  const user = await requireAccountUser();
  const purpose: BillingPurpose = (BILLING_PURPOSES as readonly string[]).includes(String(params.purpose))
    ? (params.purpose as BillingPurpose)
    : "manage";
  return (
    <AccountDemoProvider accountKey={accountKeyFor(user.id)}>
      <PortalStandIn mode={mode} purpose={purpose} />
    </AccountDemoProvider>
  );
}
