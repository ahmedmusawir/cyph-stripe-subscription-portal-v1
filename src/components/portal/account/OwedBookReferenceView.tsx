"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, DemoNotice, Placeholder } from "../Alert";
import { PageContainer, ViewSkeleton } from "../Loading";
import { RoleLabel } from "../PageHeader";
import { Pill } from "../Pill";
import { INVITATION_PILL, STORE_PILL, SUBSCRIPTION_PILL } from "./status";
import { addStoreAvailability, formatCents, formatDate, PERSONA_PROFILE, useAccount } from "@/services/portal";

// C08 / C15 OwedBook reference (ACCOUNT side, protected). Only the panel is
// designed; the frame stands in for OwedBook's existing shell. No SSO claim.
export function OwedBookReferenceView() {
  const { state, hydrated } = useAccount();
  if (!hydrated) return <PageContainer width="6xl"><ViewSkeleton /></PageContainer>;

  const owner = state.persona === "billing_owner";
  const sub = state.account.subscription;
  const persona = PERSONA_PROFILE[state.persona];
  const pill = SUBSCRIPTION_PILL[sub.status];
  const canAdd = owner && addStoreAvailability(state) === "allowed";

  return (
    <PageContainer width="6xl">
      <DemoNotice />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Pill tone="info">Reference · external surface (OwedBook)</Pill>
        <p className="text-xs text-muted-foreground">Only the panel is designed here. The frame stands in for OwedBook&apos;s existing shell and is not a rebuild.</p>
      </div>
      <div className="min-w-0 border-2 border-dashed border-border bg-card" data-testid={owner ? "owedbook-owner" : "owedbook-non-owner"}>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <p className="text-sm text-foreground">
            <span className="font-bold">OwedBook</span> <span className="text-muted-foreground">· Store: Example Main Street Pharmacy</span>
          </p>
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">existing shell (not designed here)</span>
        </div>
        <div className="grid min-w-0 md:grid-cols-[10rem_minmax(0,1fr)]">
          <nav aria-label="OwedBook (stand-in)" className="hidden border-r border-border p-4 text-sm text-muted-foreground md:block">
            <ul className="space-y-2">
              <li>Home</li>
              <li>Claims</li>
              <li>Reports</li>
              <li>Team</li>
              <li className="font-semibold text-foreground">Subscription</li>
            </ul>
          </nav>
          <div className="min-w-0 space-y-4 p-4 sm:p-5">
            {sub.status === "past_due" ? (
              owner ? (
                <Alert tone="warning" title={`We couldn't charge your card on ${formatDate(sub.nextPaymentAt)}`} action={<Button asChild variant="outline"><Link href="/dashboard">Update payment method <ExternalLink className="h-4 w-4" aria-hidden="true" /></Link></Button>}>
                  Update your payment method to keep your pharmacies active. Access during this period: <Placeholder>[GRACE POLICY TBD]</Placeholder>. Opens Account &amp; Billing, which hands off to Stripe&apos;s secure billing page.
                </Alert>
              ) : (
                <Alert tone="info" title="There's a billing issue on this account">
                  Your account owner, Jordan Ellis, has been notified. No action is needed from you. What you can do in the meantime: <Placeholder>[MEMBER ACCESS DURING GRACE PERIOD TBD]</Placeholder>.
                </Alert>
              )
            ) : null}
            <h1 className="text-xl font-bold text-foreground">Subscription</h1>
            {owner ? (
              <>
                <div className="flex flex-col gap-4 border border-border p-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">Standard plan</p>
                      <Pill tone={pill.tone}>{pill.label}</Pill>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {sub.coveredStoreCount} {sub.coveredStoreCount === 1 ? "pharmacy" : "pharmacies"}
                      {sub.nextPaymentAt && sub.status === "active" ? ` · Next payment ${formatDate(sub.nextPaymentAt)}` : ""} · {formatCents(sub.monthlyAmountCents ?? 0)} / month (illustrative)
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Billing owner: {state.account.ownerName} <RoleLabel>Owner</RoleLabel>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:w-56">
                    <Button asChild variant="outline">
                      <Link href="/dashboard">Manage billing <ExternalLink className="h-4 w-4" aria-hidden="true" /></Link>
                    </Button>
                    {canAdd ? (
                      <Button asChild>
                        <Link href="/demo/stores/add" data-testid="owedbook-add-store">Add a store</Link>
                      </Button>
                    ) : null}
                  </div>
                </div>
                <div className="border border-border p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your pharmacies</p>
                  <ul className="mt-2 divide-y divide-border">
                    {state.account.pharmacies.map((p) => (
                      <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
                        <span className="min-w-0 text-foreground">
                          {p.name} <span className="text-muted-foreground">· NCPDP {p.ncpdp} · {p.adminName}</span>
                        </span>
                        {p.invitationStatus === "pending" ? (
                          <Pill tone={INVITATION_PILL.pending.tone}>Invitation pending</Pill>
                        ) : (
                          <Pill tone={STORE_PILL[p.activationStatus].tone}>{STORE_PILL[p.activationStatus].label}</Pill>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <p className="text-xs text-muted-foreground">
                  Plan changes, payment methods, invoices and cancellation are handled in Account &amp; Billing (opens in Pharmacy Books; you stay signed in <Placeholder>[SSO — not proven by this design]</Placeholder>).
                </p>
              </>
            ) : (
              <div className="border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-foreground">Standard plan</p>
                  <Pill tone="muted">Covered</Pill>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">This store is covered by the account&apos;s subscription.</p>
                <div className="mt-3 border-t border-border pt-3">
                  <p className="font-semibold text-foreground">Billing is managed by the account owner</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    You&apos;re viewing as {persona.name} <RoleLabel>{persona.label}</RoleLabel>. People who are not the billing owner cannot manage billing. For plan or payment questions, contact Jordan Ellis.
                  </p>
                  <Button type="button" variant="outline" className="mt-3" disabled title="Demo: no email is sent">Email the owner</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        <Link href="/dashboard" className="portal-link">Back to Account &amp; Billing</Link>
      </p>
    </PageContainer>
  );
}
