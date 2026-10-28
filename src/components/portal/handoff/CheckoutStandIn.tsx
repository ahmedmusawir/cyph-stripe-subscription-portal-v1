"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, DemoNotice } from "../Alert";
import { DemoOutcomes, ExternalHandoffPanel } from "../ExternalHandoffPanel";
import { PageContainer, ViewSkeleton } from "../Loading";
import { Pill } from "../Pill";
import { formatCents, registration, useRegistration, type CheckoutOutcome } from "@/services/portal";

// C05 initial-checkout boundary (PUBLIC). Our "leaving" page, then a labelled
// stand-in for Stripe Checkout with NO editable card fields. Only the explicit
// demo-outcome buttons change state; visiting this route never does.
export function CheckoutStandIn() {
  const router = useRouter();
  const { state, hydrated } = useRegistration();
  const [phase, setPhase] = useState<"leaving" | "preview">("leaving");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setPhase("preview"), 900);
    return () => clearTimeout(t);
  }, []);

  if (!hydrated) return <PageContainer><ViewSkeleton /></PageContainer>;

  const { checkout, quote, draft } = state;
  if (!checkout) {
    return (
      <PageContainer>
        <DemoNotice />
        <Alert tone="info" title="There's no checkout open">
          Start from the review step to continue to payment. Nothing has been charged.{" "}
          <Link href="/demo/register/review" className="portal-link">Go to review</Link>
        </Alert>
      </PageContainer>
    );
  }
  if (checkout.status !== "pending" && checkout.status !== "declined") {
    const next = checkout.status === "paid" ? "/demo/activation" : "/demo/checkout-incomplete";
    return (
      <PageContainer>
        <DemoNotice />
        <Alert tone="info" title="This checkout already has an outcome">
          <Link href={next} className="portal-link">{checkout.status === "paid" ? "See activation status" : "See checkout status"}</Link>
        </Alert>
      </PageContainer>
    );
  }

  const n = draft.requestedStoreCount;
  const due = quote?.dueNowCents !== undefined ? formatCents(quote.dueNowCents) : "[amount pending]";
  const recurring = quote ? formatCents(quote.newRecurringCents) : "[amount pending]";

  async function outcome(kind: CheckoutOutcome | "closed", label: string) {
    setBusy(label);
    if (kind === "back") {
      await registration.resolveCheckout("back");
      registration.resumeSignup();
      router.push("/demo/register/review");
      return;
    }
    const r = await registration.resolveCheckout(kind === "closed" ? "back" : kind);
    setBusy(null);
    if (!r.ok) return;
    if (kind === "paid" || kind === "processing") router.push("/demo/activation");
    else if (kind === "closed" || kind === "unknown") router.push("/demo/checkout-incomplete");
  }

  if (phase === "leaving" && checkout.status === "pending") {
    return (
      <PageContainer>
        <DemoNotice />
        <div className="border border-border bg-card p-5" aria-live="polite" data-testid="checkout-leaving">
          <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            Opening Stripe&apos;s secure checkout…
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;re leaving Pharmacy Books for a moment. Stripe handles the card details; we never see your card number. Standard plan · {n} {n === 1 ? "pharmacy" : "pharmacies"} · {due} due today (illustrative).
          </p>
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">What happens next</p>
            <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-foreground">
              <li>Stripe&apos;s page opens in this tab.</li>
              <li>Pay, or use Stripe&apos;s back link to return here with everything saved.</li>
              <li>After payment you come back to an activation page and we email your access link.</li>
            </ol>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Not redirected?{" "}
            <button type="button" className="portal-link" onClick={() => setPhase("preview")}>Continue to Stripe</button> ·{" "}
            <Link href="/demo/register/review" className="portal-link">Back to review</Link>
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="6xl">
      <DemoNotice />
      {checkout.status === "declined" ? (
        <ExternalHandoffPanel title="Stripe Checkout (stand-in)" testId="checkout-declined">
          <p className="text-sm text-muted-foreground">A declined card is handled on Stripe&apos;s page. Nothing in Pharmacy Books changes.</p>
          <Alert tone="destructive" className="mt-3" title="Your card was declined (Stripe)">
            Stripe asks for another card on its own page. Reference <span className="font-medium text-foreground">demo_decline_01</span>.
          </Alert>
          <DemoOutcomes note="If the owner gives up here, the next thing they see from us is Checkout not completed, with the payment status reported honestly.">
            <Button type="button" variant="outline" disabled={Boolean(busy)} onClick={() => outcome("paid", "retry")}>Another card works → activation</Button>
            <Button type="button" variant="outline" disabled={Boolean(busy)} onClick={() => router.push("/demo/checkout-incomplete")}>Owner gives up → checkout not completed</Button>
          </DemoOutcomes>
        </ExternalHandoffPanel>
      ) : (
        <ExternalHandoffPanel title="Stripe Checkout (stand-in)" testId="checkout-preview">
          <p className="text-sm text-muted-foreground">
            Stand-in for <span className="font-medium text-foreground">Stripe Checkout</span>. Stripe draws the real page; we don&apos;t design it. Shown so the demo journey is complete.
          </p>
          <div className="mt-4 border border-border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted px-4 py-2 text-xs text-muted-foreground">
              <span>checkout.stripe.com · hosted by Stripe</span>
              <Pill tone="muted">Secure</Pill>
            </div>
            <div className="grid gap-4 p-4 md:grid-cols-2">
              <div className="min-w-0 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Order (sent by Pharmacy Books)</p>
                <p className="font-semibold text-foreground">Standard plan</p>
                <p className="text-sm text-muted-foreground">
                  {n === 1 ? "1 pharmacy" : `1 included + ${n - 1} additional ${n - 1 === 1 ? "pharmacy" : "pharmacies"}`} · monthly · then {recurring} / month
                </p>
                <p className="text-2xl font-semibold tabular-nums text-foreground" data-testid="stripe-due">
                  {due} <span className="text-sm font-normal text-muted-foreground">due today · illustrative</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  We pass: plan, store count, any approved code, the owner&apos;s email and a return reference. Stripe can show the Pharmacy Books logo and brand color through its own branding settings.
                </p>
              </div>
              <div className="min-w-0 space-y-2" aria-hidden="true">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Stripe&apos;s form (not ours)</p>
                <div className="h-11 bg-muted" />
                <div className="h-11 bg-muted" />
                <div className="grid grid-cols-2 gap-2"><div className="h-11 bg-muted" /><div className="h-11 bg-muted" /></div>
                <div className="h-11 bg-muted" />
                <p className="text-xs text-muted-foreground">No editable card fields are reproduced in this demo.</p>
              </div>
            </div>
          </div>
          <DemoOutcomes note="Chooses which return state the mock journey plays. Access is never granted from the browser return alone; the real app waits for Stripe's signed payment confirmation before provisioning.">
            <Button type="button" variant="outline" disabled={Boolean(busy)} onClick={() => outcome("paid", "paid")} data-testid="outcome-paid">Payment succeeds → activation</Button>
            <Button type="button" variant="outline" disabled={Boolean(busy)} onClick={() => outcome("processing", "processing")}>Payment processing → activation (waiting)</Button>
            <Button type="button" variant="outline" disabled={Boolean(busy)} onClick={() => outcome("back", "back")} data-testid="outcome-back">Owner clicks Back → review (saved)</Button>
            <Button type="button" variant="outline" disabled={Boolean(busy)} onClick={() => outcome("closed", "closed")} data-testid="outcome-closed">Owner closes tab → checkout not completed</Button>
            <Button type="button" variant="outline" disabled={Boolean(busy)} onClick={() => outcome("unknown", "unknown")} data-testid="outcome-unknown">Return before confirmation → status unknown</Button>
            <Button type="button" variant="outline" disabled={Boolean(busy)} onClick={() => outcome("declined", "declined")} data-testid="outcome-declined">Card declined → stays on Stripe</Button>
          </DemoOutcomes>
        </ExternalHandoffPanel>
      )}
    </PageContainer>
  );
}
