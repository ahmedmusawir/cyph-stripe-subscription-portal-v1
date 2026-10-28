"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, DemoNotice, Placeholder } from "../Alert";
import { PageContainer, ViewSkeleton } from "../Loading";
import { RoleLabel } from "../PageHeader";
import { Crumbs } from "./AddStoreView";
import { EmailPreview } from "../references/EmailPreview";
import { INVITATION_PILL, STORE_PILL, StatusPill, SUBSCRIPTION_PILL } from "./status";
import { ADDITIONAL_STORE_CENTS, formatCents, lastOperationPharmacy, maskEmail, useAccount } from "@/services/portal";

// C11 Store added. Success copy only after a mock payment success; three
// separate axes (subscription · store activation · store admin/invitation).
export function StoreResultView() {
  const { state, hydrated, account } = useAccount();
  if (!hydrated) return <PageContainer><ViewSkeleton /></PageContainer>;

  const op = state.lastOperationKey ? state.operations[state.lastOperationKey] : null;
  const store = lastOperationPharmacy(state);
  if (!op || !store || !op.applied) {
    return (
      <PageContainer>
        <DemoNotice />
        <Alert tone="info" title="No store has been added yet" action={<Button asChild variant="outline"><Link href="/dashboard">Back to Account &amp; Billing</Link></Button>}>
          {op && !op.applied ? "The last attempt didn't complete, so nothing changed on your plan." : "Start from Add a store on Account & Billing."}
        </Alert>
      </PageContainer>
    );
  }

  const sub = state.account.subscription;
  const attention = store.activationStatus === "attention";
  const other = op.pharmacy.adminAssignment?.kind === "other" ? op.pharmacy.adminAssignment : null;
  const charged = formatCents(op.applied ? 2450 : 0);
  const plan = `${sub.coveredStoreCount} pharmacies at ${formatCents(sub.monthlyAmountCents ?? 0)} per month`;

  return (
    <PageContainer>
      <DemoNotice />
      <Crumbs trail={[{ label: "Account & Billing", href: "/dashboard" }, { label: "Add a store" }, { label: "Done" }]} />
      {attention ? (
        <div data-testid="result-attention">
          <AlertTriangle className="h-8 w-8 text-warning" aria-hidden="true" />
          <h1 className="mt-2 text-[26px] font-bold leading-tight text-foreground md:text-[32px]">Payment confirmed — setup needs attention</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your card was charged <span className="font-medium text-foreground">{charged}</span> (illustrative) and your plan now shows {sub.coveredStoreCount} pharmacies, but {store.name} didn&apos;t finish setting up in OwedBook.{" "}
            <span className="font-semibold text-foreground">Don&apos;t add it again.</span>
          </p>
          <Alert tone="info" className="mt-4" title="We're on it">
            Setup usually completes on its own. If it&apos;s still pending later, contact <Placeholder>[SUPPORT EMAIL]</Placeholder> with reference <span className="font-medium text-foreground">demo_prov_01</span>. The store admin invitation is held until setup completes. (Demo: resolve it from Demo controls.)
          </Alert>
        </div>
      ) : (
        <div data-testid="result-added">
          <CheckCircle2 className="h-8 w-8 text-success" aria-hidden="true" />
          <h1 className="mt-2 text-[26px] font-bold leading-tight text-foreground md:text-[32px]">{store.name} is added</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Payment confirmed · {charged} charged today (illustrative). Your plan now covers <span className="font-medium text-foreground">{plan}</span>. We emailed a receipt to {maskEmail(state.account.ownerEmail)} (simulated).
          </p>
        </div>
      )}

      <section aria-labelledby="st-h" className="mt-6 border border-border bg-card p-4 sm:p-5" data-testid="store-status">
        <h2 id="st-h" className="text-base font-semibold text-foreground">Store status</h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Subscription</dt>
            <dd className="mt-1 text-sm text-foreground">
              <StatusPill map={SUBSCRIPTION_PILL} value={sub.status} /> <span className="text-muted-foreground">· {sub.coveredStoreCount} pharmacies</span>
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Store activation</dt>
            <dd className="mt-1"><StatusPill map={STORE_PILL} value={store.activationStatus} /></dd>
          </div>
          <div className="min-w-0">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Store admin</dt>
            <dd className="mt-1 text-sm text-foreground">
              {store.adminName} <RoleLabel>{store.ownerIsAdmin ? "Owner · Store admin" : "Store admin"}</RoleLabel>
              <div className="mt-1"><StatusPill map={INVITATION_PILL} value={store.invitationStatus} /></div>
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Next: </span>
          {attention
            ? "setup is finishing; the invitation is held until then."
            : other
              ? store.invitationStatus === "accepted"
                ? `${other.fullName} accepted the invitation and manages ${store.name} in OwedBook. Store admins who are not the billing owner cannot manage billing.`
                : `we sent ${other.fullName} an invitation to be ${store.name}'s admin. The store shows "Invitation pending" in Account & Billing until they accept. Store admins who are not the billing owner cannot manage billing.`
              : `you're the store admin for ${store.name}. Open it in OwedBook to invite your team.`}
        </p>
        {other && store.invitationStatus === "pending" ? (
          <Button type="button" variant="outline" className="mt-3" onClick={() => account.acceptInvitation(store.id)} data-testid="accept-invitation">
            Demo: {other.fullName} accepts the invitation
          </Button>
        ) : null}
      </section>

      {other ? (
        <section aria-labelledby="inv-h" className="mt-5">
          <h2 id="inv-h" className="mb-2 text-base font-semibold text-foreground">Invitation preview</h2>
          <EmailPreview
            variant="store_admin"
            ownerName={state.account.ownerName}
            email={{
              recipientKind: "store_admin",
              recipientName: other.fullName,
              recipientEmailMasked: maskEmail(other.email),
              pharmacyNames: [store.name],
              subject: `You've been invited to manage ${store.name} in OwedBook`,
              linkState: "valid",
              expiryLabel: "[LINK LIFETIME TBD]",
            }}
          />
        </section>
      ) : null}

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Button asChild>
          <Link href="/demo/references/owedbook">Return to OwedBook</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Back to Account &amp; Billing</Link>
        </Button>
      </div>
      <p className="sr-only">Each additional store is {formatCents(ADDITIONAL_STORE_CENTS)} per month.</p>
    </PageContainer>
  );
}
