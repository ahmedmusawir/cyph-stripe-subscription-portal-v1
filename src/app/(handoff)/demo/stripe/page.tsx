import { accountKeyFor, requireAccountUser } from "@/services/auth/session";
import { AccountDemoProvider, classifyStripeStandIn } from "@/services/portal";
import { CheckoutStandIn } from "@/components/portal/handoff/CheckoutStandIn";
import { PortalStandIn } from "@/components/portal/handoff/PortalStandIn";

export const metadata = { title: "Stripe (stand-in) — Pharmacy Books" };
export const dynamic = "force-dynamic";

// Shared stand-in route (RULINGS R-009):
//   mode absent / checkout  → PUBLIC initial-checkout stand-in (registration draft only)
//   mode=portal | mode=card → ACCOUNT management: real admin/superadmin required
//                             BEFORE anything renders or the account store mounts.
// Query values only select a mode; they can add the login requirement, never
// remove it. Repeated, re-ordered, mixed-case or unknown `mode` values are
// classified in classifyStripeStandIn and fail closed (REPAIR_001 Q2-F03).
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const route = classifyStripeStandIn(await searchParams);
  if (route.access === "public") return <CheckoutStandIn />;

  const user = await requireAccountUser();
  if (route.mode === "checkout") return <CheckoutStandIn />;
  return (
    <AccountDemoProvider accountKey={accountKeyFor(user.id)}>
      <PortalStandIn mode={route.mode} purpose={route.purpose} />
    </AccountDemoProvider>
  );
}
