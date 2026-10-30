"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, DemoNotice } from "../Alert";
import { PageContainer } from "../Loading";
import { Pill } from "../Pill";
import { addStoreAvailability, PERSONA_PROFILE, useAccount } from "@/services/portal";

// Add-store screens for a synthetic non-owner or a paused subscription. The
// service enforces the same rules; this is the readable outcome, not the control.
export function AccountGate({ children }: { children: React.ReactNode }) {
  const { state } = useAccount();
  if (state.persona !== "billing_owner") {
    const p = PERSONA_PROFILE[state.persona];
    return (
      <PageContainer>
        <DemoNotice />
        <Alert tone="info" title="Only the billing owner can add a store" action={<Button asChild variant="outline"><Link href="/dashboard">Back to Account &amp; Billing</Link></Button>}>
          You&apos;re viewing as {p.name} ({p.label}). Adding a store changes the account&apos;s billing, so it&apos;s limited to the billing owner, Jordan Ellis.
        </Alert>
      </PageContainer>
    );
  }
  const availability = addStoreAvailability(state);
  if (availability !== "allowed") {
    return (
      <PageContainer>
        <DemoNotice />
        <Alert tone="info" title="Adding a store isn't available right now" action={<Button asChild variant="outline"><Link href="/dashboard">Back to Account &amp; Billing</Link></Button>}>
          <span className="flex flex-wrap items-center gap-2">
            {availability === "unavailable_canceled" ? (
              "Stores can't be added to a canceled subscription."
            ) : (
              <>
                <Pill tone="info">Proposed rule</Pill>
                Adding a store is paused while {availability === "paused_past_due" ? "a payment is past due" : "a cancellation is scheduled"}.
              </>
            )}
          </span>
        </Alert>
      </PageContainer>
    );
  }
  return <>{children}</>;
}
