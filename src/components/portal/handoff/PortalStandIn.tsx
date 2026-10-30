"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, DemoNotice } from "../Alert";
import { DemoOutcomes, ExternalHandoffPanel } from "../ExternalHandoffPanel";
import { PageContainer, ViewSkeleton } from "../Loading";
import { Pill } from "../Pill";
import { useAccount, type BillingPurpose } from "@/services/portal";

const PURPOSE_TEXT: Record<BillingPurpose, string> = {
  manage: "Manage billing",
  cancel: "Cancel subscription",
  resume: "Resume subscription",
  change_card: "Update payment method",
  invoices: "Past invoices",
};

// Customer Portal / change-card stand-in (ACCOUNT side). The server page has
// already required a real admin/superadmin session before this renders.
// Leaving changes nothing until Account & Billing refreshes.
export function PortalStandIn({ mode, purpose }: { mode: "portal" | "card"; purpose: BillingPurpose }) {
  const router = useRouter();
  const { state, hydrated, account } = useAccount();
  const [busy, setBusy] = useState(false);

  if (!hydrated) return <PageContainer><ViewSkeleton /></PageContainer>;

  if (state.persona !== "billing_owner") {
    return (
      <PageContainer>
        <DemoNotice />
        <Alert tone="info" title="Billing is managed by the account owner">
          Only the billing owner can open Stripe&apos;s billing page. <Link href="/dashboard" className="portal-link">Back to Account &amp; Billing</Link>
        </Alert>
      </PageContainer>
    );
  }

  const status = state.account.subscription.status;

  function leave(outcome: "no_change" | "cancel_scheduled" | "canceled" | "resumed" | "card_updated") {
    setBusy(true);
    if (mode === "card") {
      router.push(`/demo/stores/confirm${outcome === "card_updated" ? "?card=updated" : "?card=unchanged"}`);
      return;
    }
    account.returnFromPortal(outcome);
    router.push("/dashboard");
  }

  return (
    <PageContainer width="6xl">
      <DemoNotice />
      <ExternalHandoffPanel title={mode === "card" ? "Stripe — change card (stand-in)" : "Stripe Customer Portal (stand-in)"} testId="portal-preview">
        <p className="text-sm text-muted-foreground">
          {mode === "card" ? (
            <>Stand-in for changing the card on Stripe&apos;s page. Your quote and store details stay saved; the store is never added from Stripe&apos;s page.</>
          ) : (
            <>Stand-in for the <span className="font-medium text-foreground">Stripe Customer Portal</span> reached from &ldquo;{PURPOSE_TEXT[purpose]}&rdquo;. Stripe owns payment method, invoices, plan changes and cancellation.</>
          )}
        </p>
        <div className="mt-4 border border-border">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted px-4 py-2 text-xs text-muted-foreground">
            <span>billing.stripe.com · hosted by Stripe</span>
            <Pill tone="muted">Secure</Pill>
          </div>
          <div className="grid gap-4 p-4 md:grid-cols-2" aria-hidden="true">
            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Stripe sections (not ours)</p>
              <div className="h-11 bg-muted" />
              <div className="h-11 bg-muted" />
              <div className="h-11 bg-muted" />
            </div>
            <div className="space-y-1 text-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Return</p>
              <p className="text-muted-foreground">
                Stripe&apos;s &ldquo;Return to Pharmacy Books&rdquo; link brings the owner back. Nothing counts as changed until the summary refreshes.
              </p>
            </div>
          </div>
        </div>
        <DemoOutcomes note="Exactly which Customer Portal features are enabled is verified at integration, not decided by this demo.">
          <Button type="button" variant="outline" disabled={busy} onClick={() => leave("no_change")} data-testid="portal-no-change">
            Return without changes
          </Button>
          {mode === "card" || status === "past_due" ? (
            <Button type="button" variant="outline" disabled={busy} onClick={() => leave("card_updated")} data-testid="portal-card-updated">
              Card updated → return
            </Button>
          ) : null}
          {mode === "portal" && (status === "active" || status === "past_due") ? (
            <>
              <Button type="button" variant="outline" disabled={busy} onClick={() => leave("cancel_scheduled")} data-testid="portal-cancel">
                Cancellation scheduled → return
              </Button>
              <Button type="button" variant="outline" disabled={busy} onClick={() => leave("canceled")}>
                Canceled now → return
              </Button>
            </>
          ) : null}
          {mode === "portal" && status === "cancel_scheduled" ? (
            <Button type="button" variant="outline" disabled={busy} onClick={() => leave("resumed")} data-testid="portal-resume">
              Subscription resumed → return
            </Button>
          ) : null}
        </DemoOutcomes>
      </ExternalHandoffPanel>
    </PageContainer>
  );
}
