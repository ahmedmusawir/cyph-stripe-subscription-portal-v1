"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, Circle, Loader2, Mail, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Alert, DemoNotice, Placeholder } from "../Alert";
import { PageContainer, ViewSkeleton } from "../Loading";
import { PageHeader } from "../PageHeader";
import { checkoutHold, consistentActivation, formatCents, formatTime, paymentPhase, registration, useRegistration, type CheckoutScope } from "@/services/portal";

type TrackState = "done" | "busy" | "warn" | "fail" | "idle";

function Track({ label, state, text }: { label: string; state: TrackState; text: string }) {
  const icon = {
    done: <Check className="h-4 w-4" aria-hidden="true" />,
    busy: <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />,
    warn: <AlertTriangle className="h-4 w-4" aria-hidden="true" />,
    fail: <XCircle className="h-4 w-4" aria-hidden="true" />,
    idle: <Circle className="h-4 w-4" aria-hidden="true" />,
  }[state];
  const tone = { done: "border-success bg-success/10", busy: "border-info bg-info/10", warn: "border-warning bg-warning/10", fail: "border-destructive bg-destructive/10", idle: "border-border bg-muted" }[state];
  const word = { done: "Done", busy: "In progress", warn: "Delayed", fail: "Failed", idle: "Not started" }[state];
  return (
    <li className="flex min-w-0 items-start gap-3 py-3">
      <span className={`grid h-9 w-9 shrink-0 place-items-center border text-foreground ${tone}`}>{icon}</span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">
          {label} <span className="sr-only">— {word}</span>
        </p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </li>
  );
}

/**
 * R-013: a submitted payment whose signup details were changed afterwards. It
 * can only confirm what it was quoted for, so offer to go back to exactly that.
 * Shared with C14 (payment unknown).
 */
export function ScopeHold({ paidFor, reference }: { paidFor: CheckoutScope | undefined; reference: string }) {
  if (!paidFor) {
    return (
      <Alert tone="warning" title="We can't match this payment to your current details">
        Please don&apos;t pay again. Contact <Placeholder>[SUPPORT EMAIL]</Placeholder> with reference <span className="font-medium text-foreground">{reference}</span>.
      </Alert>
    );
  }
  const n = paidFor.storeCount;
  const names = paidFor.pharmacies.map((p) => p.name).filter(Boolean).join(", ");
  return (
    <Alert
      tone="warning"
      title="Your details changed after you paid"
      action={
        <Button type="button" onClick={() => registration.restoreSubmittedScope()} data-testid="restore-scope">
          Use the details I paid for
        </Button>
      }
    >
      This payment is for {n} {n === 1 ? "pharmacy" : "pharmacies"} ({names}), {formatCents(paidFor.dueNowCents)}. Changes made afterwards can&apos;t be added to it,
      and you don&apos;t need to pay again. Use the details you paid for to continue; you can add pharmacies from your account once you&apos;re set up.
    </Alert>
  );
}

// C06 Activation: three independent tracks (payment · setup · email). No
// automatic customer login; mock payment never creates a user (R-009).
export function ActivationView() {
  const router = useRouter();
  const { toast } = useToast();
  const { state, hydrated } = useRegistration();
  const [busy, setBusy] = useState<"refresh" | "resend" | null>(null);

  if (!hydrated) return <PageContainer><ViewSkeleton /></PageContainer>;

  // REPAIR_005/006: the checkout record governs what this page may offer, before the
  // activation record is read at all. A stale or missing activation flag never shows
  // Refresh, "Try payment again" or "no payment" for a payment that is paid, unknown or closed.
  const phase = paymentPhase(state);
  const a = consistentActivation(state);
  if (phase === "unknown") {
    return (
      <PageContainer>
        <DemoNotice />
        <div data-testid="activation-unknown">
          <Alert tone="warning" title="We're still checking whether a payment went through">
            Until Stripe confirms the outcome, nothing can be retried or confirmed here. Please don&apos;t pay again.{" "}
            <Link href="/demo/checkout-incomplete" className="portal-link">See checkout status</Link>
          </Alert>
        </div>
      </PageContainer>
    );
  }
  if (phase === "not_charged") {
    return (
      <PageContainer>
        <DemoNotice />
        <div data-testid="activation-not-charged">
          <Alert tone="info" title="Nothing was charged for this payment">
            This payment was closed without a charge, so there&apos;s no activation to track for it. Your details are saved.{" "}
            <Link href="/demo/checkout-incomplete" className="portal-link">Continue my signup</Link>
          </Alert>
        </div>
      </PageContainer>
    );
  }
  if (phase === "paid" && !a) {
    // R5-F01: paid, but the activation record is missing or disagrees. Setup and email
    // outcomes aren't known, so none is claimed and nothing can be retried or refreshed.
    const scope = state.checkout?.scope;
    return (
      <PageContainer>
        <DemoNotice />
        <PageHeader eyebrow="Activation" title="Payment confirmed" />
        <div className="mt-5" data-testid="activation-paid-status-unavailable">
          <Alert tone="info" title="We can't show setup or access-email status here">
            Stripe confirmed your payment{scope ? ` of ${formatCents(scope.dueNowCents)} (illustrative)` : ""}, so you don&apos;t need to pay again. Setup and access-email status aren&apos;t available on this page right now. If your access email hasn&apos;t arrived, contact <Placeholder>[SUPPORT EMAIL]</Placeholder> with reference <span className="font-medium text-foreground">demo_act_01</span>.
          </Alert>
        </div>
      </PageContainer>
    );
  }
  if (!a) {
    // No checkout, or one still open on the stand-in: no payment has been submitted.
    return (
      <PageContainer>
        <DemoNotice />
        <Alert tone="info" title="There's no payment to track yet">
          Activation starts after checkout. <Link href="/demo/register/review" className="portal-link">Go to review</Link>
        </Alert>
      </PageContainer>
    );
  }

  const { draft } = state;
  // R-013: the payment covers what its checkout was quoted for, not later edits.
  // Without a recorded scope it can't be established, so no names or amount are shown (REPAIR_004 addendum 1).
  const paidFor = state.checkout?.scope;
  const names = paidFor ? (paidFor.pharmacies.map((p) => p.name).filter(Boolean) as string[]) : null;
  // R3-F02: an invitation is claimed only for an admin the payment covered.
  const nominated = paidFor?.pharmacies.find((p) => p.adminAssignment?.kind === "other");
  const admin = nominated?.adminAssignment?.kind === "other" ? nominated.adminAssignment : null;
  const amount = paidFor ? `${formatCents(paidFor.dueNowCents)} (illustrative)` : null;
  const emailTo = a.ownerEmailMasked;

  const pay: TrackState = a.paymentState === "confirmed" ? "done" : a.paymentState === "failed" ? "fail" : "busy";
  const setup: TrackState = a.provisioningState === "ready" ? "done" : a.provisioningState === "attention" ? "warn" : a.provisioningState === "pending" ? "busy" : "idle";
  const mail: TrackState = a.emailState === "sent" ? "done" : a.emailState === "failed" ? "fail" : a.emailState === "pending" ? "busy" : "idle";

  const heading =
    a.paymentState === "failed"
      ? "Payment didn't go through"
      : a.paymentState !== "confirmed"
        ? "Waiting for payment confirmation"
        : a.provisioningState === "attention"
          ? "Paid — setup is taking longer"
          : a.provisioningState !== "ready"
            ? "Payment confirmed. Setting up your pharmacies…"
            : a.emailState === "failed"
              ? "You're set up — the access email didn't send"
              : "You're in. Check your email.";

  const canRefresh = a.paymentState === "pending" || (a.paymentState === "confirmed" && a.provisioningState !== "ready");
  // R-012: a payment still waiting for confirmation doesn't advance while prerequisites are unmet.
  const hold = a.paymentState === "pending" ? checkoutHold(draft, state.checkout) : null;

  async function refresh() {
    setBusy("refresh");
    await registration.refreshActivation();
    setBusy(null);
  }
  async function resend() {
    setBusy("resend");
    const r = await registration.resendAccessEmail();
    setBusy(null);
    if (r.ok) toast({ title: "Access email sent again", description: "Simulated — nothing was actually sent." });
  }
  async function retryPayment() {
    registration.resumeSignup();
    router.push("/demo/register/review");
  }

  return (
    <PageContainer>
      <DemoNotice />
      <PageHeader eyebrow="Activation" title={heading} lead={a.paymentState === "confirmed" && a.provisioningState === "ready" && a.emailState === "sent" ? `Payment is confirmed and your pharmacies are set up. We sent your access link to ${emailTo}.` : undefined} />

      <section aria-labelledby="tr-h" aria-live="polite" className="mt-6 border border-border bg-card p-4 sm:p-5" data-testid="activation-tracks">
        <h2 id="tr-h" className="text-base font-semibold text-foreground">Activation progress</h2>
        <ol className="mt-1 divide-y divide-border">
          <Track
            label="Payment"
            state={pay}
            text={pay === "done" ? (amount ? `Confirmed by Stripe · ${amount}` : "Confirmed by Stripe.") : pay === "fail" ? "Stripe reported the payment didn't complete." : "Waiting for Stripe's confirmation."}
          />
          <Track
            label="Pharmacy setup"
            state={setup}
            text={
              setup === "done"
                ? names
                  ? `${names.join(" and ")} ${names.length === 1 ? "is" : "are"} set up in OwedBook.`
                  : "Your pharmacies are set up in OwedBook."
                : setup === "warn"
                  ? "Paid; setup is late. You don't need to pay again."
                  : setup === "busy"
                    ? names
                      ? `Setting up ${names.join(" and ")}.`
                      : "Setting up your pharmacies."
                    : "Starts after payment is confirmed."
            }
          />
          <Track
            label="Access email"
            state={mail}
            text={
              mail === "done"
                ? `Sent to ${emailTo}${admin ? ` · a separate store invitation went to ${admin.fullName}` : ""}.`
                : mail === "fail"
                  ? "Couldn't be sent. Send it again below."
                  : "Sent once setup finishes."
            }
          />
        </ol>
        {canRefresh ? (
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">In the real app this page updates by itself. In this demo, refresh to play the next confirmation.</p>
            <Button type="button" variant="outline" onClick={refresh} disabled={busy !== null || Boolean(hold)} aria-busy={busy === "refresh" || undefined} data-testid="activation-refresh">
              {busy === "refresh" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Refresh status
            </Button>
          </div>
        ) : null}
      </section>

      <div className="mt-5 space-y-5">
        {hold === "scope_changed" ? (
          <div data-testid="activation-hold">
            <ScopeHold paidFor={paidFor} reference="demo_act_01" />
          </div>
        ) : hold ? (
          <div data-testid="activation-hold">
            <Alert tone="warning" title={hold === "owner_declaration" ? "Confirm the owner declaration to continue" : "Finish your signup details to continue"}>
              Activation can&apos;t continue until {hold === "owner_declaration" ? "the pharmacy owner confirms the owner declaration" : "every signup step is complete"}.{" "}
              <Link href="/demo/register/review" className="portal-link">Go to my details</Link>
            </Alert>
          </div>
        ) : null}
        {a.paymentState === "pending" ? (
          // R4-N01: the payment is already submitted, so there's no checkout to resume (deviates from the approved render).
          <Alert tone="info" title="Waiting for Stripe to confirm your payment">
            This usually takes a moment. Your payment has been submitted, so please don&apos;t pay again.
          </Alert>
        ) : null}
        {a.paymentState === "confirmed" && !paidFor ? (
          <div data-testid="history-unavailable">
            <Alert tone="info" title="We can't show what this payment covered">
              Your signup details changed after this payment, and its own record of them wasn&apos;t kept, so we can&apos;t show which pharmacies or what amount it covered. Your payment and setup aren&apos;t affected, and you don&apos;t need to pay again. For the details, contact <Placeholder>[SUPPORT EMAIL]</Placeholder> with reference <span className="font-medium text-foreground">demo_act_01</span>.
            </Alert>
          </div>
        ) : null}
        {a.provisioningState === "attention" ? (
          <Alert tone="warning" title="Your payment went through; setup is taking longer than usual">
            You don&apos;t need to pay again. We&apos;ll email your access link as soon as setup completes. If nothing arrives, contact <Placeholder>[SUPPORT EMAIL]</Placeholder> with reference <span className="font-medium text-foreground">demo_act_01</span>.
          </Alert>
        ) : null}
        {a.emailState === "failed" ? (
          <Alert tone="destructive" title="We couldn't send your access email">
            Your payment and setup are fine — only the email failed. Send it again below. If it keeps failing, contact <Placeholder>[SUPPORT EMAIL]</Placeholder>.
          </Alert>
        ) : null}
        {a.paymentState === "failed" ? (
          <Alert
            tone="destructive"
            title="We haven't received a payment confirmation"
            action={
              <>
                <Button type="button" onClick={retryPayment}>Try payment again</Button>
                <Button type="button" variant="outline" onClick={retryPayment}>Review my details</Button>
              </>
            }
          >
            Stripe reported the payment didn&apos;t complete (reference <span className="font-medium text-foreground">demo_decline_01</span>). Nothing is set up yet and your details are saved.
          </Alert>
        ) : null}
        {a.emailState === "sent" ? (
          <div className="flex gap-3 border border-border bg-card p-4 sm:p-5">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="font-semibold text-foreground">Open the email &ldquo;Set up your Pharmacy Books account&rdquo;</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                The link hands you to account setup. It works once and for a limited time <Placeholder>[LINK LIFETIME TBD]</Placeholder>. We don&apos;t sign you in from this page, and this demo never creates an account.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button asChild variant="outline">
                  <Link href="/demo/references/email?variant=owner">Preview the access email</Link>
                </Button>
                {admin ? (
                  <Button asChild variant="outline">
                    <Link href="/demo/references/email?variant=store_admin">Preview {admin.fullName}&apos;s invitation</Link>
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {a.paymentState === "confirmed" && a.provisioningState === "ready" ? (
          <section aria-labelledby="rs-h" className="border border-border bg-card p-4 sm:p-5">
            <h2 id="rs-h" className="text-base font-semibold text-foreground">Didn&apos;t get it?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Give it a few minutes and check your spam folder. Still nothing? Send it again.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button type="button" variant={a.emailState === "failed" ? "default" : "outline"} onClick={resend} disabled={busy !== null} aria-busy={busy === "resend" || undefined} data-testid="resend">
                {busy === "resend" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                Resend access email
              </Button>
              {state.emailResentAt ? (
                <p className="text-sm text-foreground" role="status">Sent again at {formatTime(state.emailResentAt)} (simulated). Check your inbox.</p>
              ) : null}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Wrong email address? Contact <Placeholder>[SUPPORT EMAIL]</Placeholder>. For your security we don&apos;t change it from this page.
            </p>
          </section>
        ) : null}
      </div>
    </PageContainer>
  );
}
