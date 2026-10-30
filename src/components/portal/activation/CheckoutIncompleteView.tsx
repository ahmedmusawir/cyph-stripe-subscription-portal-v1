"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, DemoNotice, Placeholder } from "../Alert";
import { DemoOutcomes } from "../ExternalHandoffPanel";
import { PageContainer, ViewSkeleton } from "../Loading";
import { PageHeader } from "../PageHeader";
import { Pill } from "../Pill";
import { checkoutHold, formatCents, initialRecurringCents, isSubmitted, registration, useRegistration } from "@/services/portal";
import { ScopeHold } from "./ActivationView";

// C14 Checkout not completed: resumable · payment_unknown · declined · expired.
// Unknown pauses payment ("don't pay again") without declaring no charge.
export function CheckoutIncompleteView() {
  const router = useRouter();
  const { state, hydrated } = useRegistration();
  const [busy, setBusy] = useState(false);

  if (!hydrated) return <PageContainer><ViewSkeleton /></PageContainer>;

  const status = state.checkout?.status;
  const { draft, quote } = state;
  if (!status || status === "pending" || status === "paid") {
    return (
      <PageContainer>
        <DemoNotice />
        <Alert tone="info" title="There's no unfinished checkout">
          {status === "paid" ? (
            <Link href="/demo/activation" className="portal-link">See activation status</Link>
          ) : status === "pending" && isSubmitted(state) ? (
            // R4-N01: a submitted payment isn't an open checkout.
            <Link href="/demo/activation" className="portal-link">See payment status</Link>
          ) : status === "pending" ? (
            <Link href="/demo/stripe" className="portal-link">Back to the open checkout</Link>
          ) : (
            <Link href="/demo/register/plan" className="portal-link">Start a subscription</Link>
          )}
        </Alert>
      </PageContainer>
    );
  }

  const n = draft.requestedStoreCount;
  const hold = checkoutHold(draft, state.checkout);
  const names = draft.pharmacies.slice(0, n).map((p) => p.name).filter(Boolean).join(" · ");
  const due = quote?.dueNowCents ?? initialRecurringCents(n);

  function resume() {
    registration.resumeSignup();
    router.push("/demo/register/review");
  }
  async function resolveUnknown(outcome: "paid" | "not_charged") {
    setBusy(true);
    const r = await registration.resolveUnknownPayment(outcome);
    setBusy(false);
    if (r.ok && outcome === "paid") router.push("/demo/activation");
  }

  return (
    <PageContainer>
      <DemoNotice />
      <PageHeader
        eyebrow="Signup"
        title={status === "expired" ? "This saved signup has expired" : "Welcome back. Let's finish your signup."}
        lead={
          status === "expired"
            ? undefined
            : status === "unknown"
              ? // The outcome isn't known yet, so don't say payment failed (manual review, REPAIR_002 addendum).
                "Your details are saved. We're checking your payment status. Please don't pay again yet."
              : `Your details for ${n} ${n === 1 ? "pharmacy are" : "pharmacies are"} saved. Payment wasn't completed, so your account isn't active yet.`
        }
      />
      <div className="mt-5" data-testid={`incomplete-${status}`}>
        {status === "abandoned" && state.checkout?.closedReason ? (
          <Alert tone="info" title="Nothing has been charged">
            {state.checkout.closedReason === "owner_declaration" ? "The owner declaration was withdrawn" : "Your signup details changed"} after checkout opened, so we closed that checkout. Confirm your details and get a fresh quote whenever you&apos;re ready.
          </Alert>
        ) : status === "abandoned" ? (
          <Alert tone="info" title="Nothing has been charged">Stripe confirmed no payment was taken for this signup. Pick up where you left off whenever you&apos;re ready.</Alert>
        ) : status === "unknown" ? (
          <Alert tone="warning" live title="We're checking whether a payment went through" icon={<Loader2 className="h-4 w-4 animate-spin text-foreground" aria-hidden="true" />}>
            You returned from Stripe before we got a confirmation. Please don&apos;t pay again until this resolves — it usually takes a moment. If it stays here, contact <Placeholder>[SUPPORT EMAIL]</Placeholder> with reference <span className="font-medium text-foreground">demo_ck_01</span>.
          </Alert>
        ) : status === "declined" ? (
          <Alert tone="destructive" title="Your card was declined on Stripe's page">No payment was taken. Try another card, or contact your bank, then continue below.</Alert>
        ) : (
          <Alert tone="info" title="This saved signup has expired">
            Drafts are kept for a limited time <Placeholder>[HOLD PERIOD TBD]</Placeholder>. Nothing was charged. Start again — it only takes a few minutes.
          </Alert>
        )}
      </div>

      {status !== "expired" ? (
        <section aria-labelledby="sv-h" className="mt-5 border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="sv-h" className="text-base font-semibold text-foreground">What we saved</h2>
            <Pill tone="muted">Saved until [HOLD PERIOD TBD]</Pill>
          </div>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Plan</dt><dd className="text-foreground">Standard · monthly</dd></div>
            <div className="min-w-0"><dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Pharmacies</dt><dd className="text-foreground">{names}</dd></div>
            <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Due today</dt><dd className="tabular-nums text-foreground">{formatCents(due)} · illustrative</dd></div>
          </dl>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={resume} disabled={status === "unknown"} data-testid="incomplete-continue">Continue to payment</Button>
            <Button type="button" variant="outline" onClick={resume} disabled={status === "unknown"}>Review my details first</Button>
          </div>
          {status === "unknown" ? (
            <>
              <p className="mt-2 text-xs text-muted-foreground">Payment is paused until we know whether the earlier attempt went through.</p>
              {hold === "scope_changed" ? (
                <div className="mt-3" data-testid="unknown-hold">
                  <ScopeHold paidFor={state.checkout?.scope} reference="demo_ck_01" />
                </div>
              ) : hold ? (
                <p className="mt-2 text-xs text-muted-foreground" data-testid="unknown-hold">
                  Activation also waits for {hold === "owner_declaration" ? "the owner declaration" : "your remaining signup details"}.{" "}
                  <Link href="/demo/register/review" className="portal-link">Go to my details</Link>
                </p>
              ) : null}
              <DemoOutcomes>
                <Button type="button" variant="outline" disabled={busy || Boolean(hold)} onClick={() => resolveUnknown("paid")} data-testid="unknown-paid">Stripe confirms payment → activation</Button>
                <Button type="button" variant="outline" disabled={busy} onClick={() => resolveUnknown("not_charged")} data-testid="unknown-not-charged">Stripe confirms nothing charged</Button>
              </DemoOutcomes>
            </>
          ) : null}
        </section>
      ) : (
        <div className="mt-5">
          <Button
            type="button"
            onClick={() => {
              registration.restartSignup();
              router.push("/demo/register/plan");
            }}
          >
            Start a new signup
          </Button>
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        We also email this link to the owner when a checkout is left unfinished (<Link href="/demo/references/email?variant=checkout_unfinished" className="portal-link">preview</Link>). Already subscribed? <Link href="/login" className="portal-link">Sign in</Link>.
      </p>
    </PageContainer>
  );
}
