"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, DemoNotice, Placeholder } from "../Alert";
import { ExternalHandoffPanel } from "../ExternalHandoffPanel";
import { PageContainer, ViewSkeleton } from "../Loading";
import { Pill } from "../Pill";
import { useOperationKey } from "../hooks";
import { AccountGate } from "./AccountGate";
import { Crumbs } from "./AddStoreView";
import { formatCents, formatTime, isAddQuoteExpired, useAccount } from "@/services/portal";

// C10 Confirm your new price. One consent; a current quote (same draft
// revision, unexpired) is required; one operation key per attempt so repeated
// clicks or refreshes cannot add twice.
export function ConfirmStoreView({ quoteError: initialError, card }: { quoteError: boolean; card: "updated" | "unchanged" | null }) {
  const router = useRouter();
  const { state, hydrated, deps, account } = useAccount();
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [quoteError, setQuoteError] = useState(initialError);
  const [consentErr, setConsentErr] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [changeCard, setChangeCard] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const consentRef = useRef<HTMLDivElement>(null);
  const opKey = useOperationKey("add_store");
  const [, setTick] = useState(0);

  const op = state.lastOperationKey ? state.operations[state.lastOperationKey] : null;
  const pending = op && (op.state === "pending" || op.state === "unknown") ? op : null;
  const draftReady = state.addDraft.revision > 1 && Boolean(state.addDraft.pharmacy.name);

  // No draft to confirm: either the store was just added (→ result) or nothing was started (→ add).
  useEffect(() => {
    if (!hydrated || confirming || pending || draftReady) return;
    router.replace(op?.applied ? "/demo/stores/result" : "/demo/stores/add");
  }, [hydrated, confirming, pending, draftReady, op, router]);

  useEffect(() => {
    if (!hydrated || !draftReady || pending || quoteBusy || quoteError) return;
    if (state.quote && state.quote.draftRevision === state.addDraft.revision) return;
    setQuoteBusy(true);
    void account.requestQuote().then((r) => {
      setQuoteBusy(false);
      setQuoteError(!r.ok);
    });
  }, [hydrated, draftReady, pending, state.quote, state.addDraft.revision, quoteBusy, quoteError, account]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (consentErr) consentRef.current?.focus();
  }, [consentErr]);

  if (!hydrated || (!draftReady && !pending)) return <PageContainer><ViewSkeleton /></PageContainer>;

  const sub = state.account.subscription;
  const quote = state.quote && state.quote.draftRevision === state.addDraft.revision ? state.quote : null;
  const expired = quote ? isAddQuoteExpired(quote, deps) : false;
  const ready = Boolean(quote) && !expired && !quoteBusy && !pending;
  const p = pending ? pending.pharmacy : state.addDraft.pharmacy;
  const admin = p.adminAssignment?.kind === "other" ? p.adminAssignment : null;
  const accepted = state.addDraft.consents.priceChangeAccepted;

  async function refresh() {
    setQuoteError(false);
    setQuoteBusy(true);
    const r = await account.requestQuote();
    setQuoteBusy(false);
    setQuoteError(!r.ok);
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || confirming || !quote) return;
    setMessage(null);
    if (!accepted) {
      setConsentErr(false);
      requestAnimationFrame(() => setConsentErr(true));
      return;
    }
    setConsentErr(false);
    setFailed(false);
    setConfirming(true);
    const r = await account.confirmAddStore({ draftId: state.addDraft.id, quoteId: quote.id, consents: state.addDraft.consents, operationKey: opKey.current() });
    setConfirming(false);
    if (!r.ok) {
      if (r.code === "validation") setConsentErr(true);
      else setMessage(r.message);
      return;
    }
    if (r.value.state === "succeeded" || r.value.state === "attention" || r.value.state === "paid_provisioning") {
      router.push("/demo/stores/result");
    } else if (r.value.state === "failed") {
      setFailed(true);
      opKey.renew(); // a definitive failure may be retried deliberately with a new key
    }
  }

  return (
    <AccountGate>
      <PageContainer>
        <DemoNotice />
        <Crumbs trail={[{ label: "Account & Billing", href: "/dashboard" }, { label: "Add a store", href: "/demo/stores/add" }, { label: "Confirm" }]} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Add a store · Step 2 of 2</p>
        <h1 className="mt-1 text-[26px] font-bold leading-tight text-foreground md:text-[32px]">Confirm your new price</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Adding <span className="font-medium text-foreground">{p.name}</span> · store admin {admin ? `${admin.fullName} (invited after confirmation)` : `${state.account.ownerName} (you)`}.
        </p>

        {consentErr ? (
          <div ref={consentRef} tabIndex={-1} role="alert" className="mt-5 border-l-[3px] border-destructive bg-destructive/10 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="consent-error">
            <p className="font-semibold text-foreground">Please approve the new price to continue</p>
            <p className="text-sm text-muted-foreground">
              Tick <a href="#pc" className="portal-link" onClick={(e) => { e.preventDefault(); document.getElementById("pc")?.focus(); }}>the price approval</a> below.
            </p>
          </div>
        ) : null}
        {failed ? (
          <Alert tone="destructive" className="mt-5" title="Your card on file was declined">
            The store was <span className="font-semibold text-foreground">not</span> added and your plan is unchanged (still {sub.coveredStoreCount} {sub.coveredStoreCount === 1 ? "pharmacy" : "pharmacies"}, {formatCents(sub.monthlyAmountCents ?? 0)}). Update the card on Stripe&apos;s secure billing page, then confirm again. Reference <span className="font-medium text-foreground">demo_add_decline_01</span>.
          </Alert>
        ) : null}
        {pending ? (
          <Alert tone="warning" live className="mt-5" title="Payment pending with Stripe" icon={<Loader2 className="h-4 w-4 animate-spin text-foreground" aria-hidden="true" />}>
            We haven&apos;t received a confirmation for this store yet, so it isn&apos;t added and your plan is unchanged. Don&apos;t confirm again — one confirmation, one operation. (Demo: resolve it from Demo controls.)
          </Alert>
        ) : null}
        {card === "updated" ? <Alert tone="success" className="mt-5" title="Card updated on Stripe (demo)">Your quote and store details were kept. Confirm below to add the store.</Alert> : null}
        {message ? <Alert tone="destructive" className="mt-5" title="We couldn't confirm this">{message}</Alert> : null}

        <form noValidate onSubmit={confirm} className="mt-6 space-y-5">
          <section aria-labelledby="q-h" aria-live="polite" className="border border-border bg-card p-4 sm:p-5" data-testid="add-quote">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 id="q-h" className="text-base font-semibold text-foreground">Price change</h2>
              <Pill tone="info">Illustrative quote</Pill>
            </div>
            {quoteBusy ? (
              <div className="mt-3 space-y-2" aria-busy="true">
                <p className="text-sm text-muted-foreground">Getting your quote from the billing system…</p>
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ) : quoteError ? (
              <Alert tone="destructive" className="mt-3" title="Price unavailable" action={<Button type="button" variant="outline" onClick={refresh}>Try again</Button>}>
                We couldn&apos;t get a quote, so nothing can be confirmed. Your store details are saved and nothing has been charged.
              </Alert>
            ) : quote && expired ? (
              <Alert tone="warning" className="mt-3" title="This quote expired" action={<Button type="button" variant="outline" onClick={refresh}>Refresh quote</Button>}>
                Prices are held for a limited time. Refresh for a current quote — you&apos;ll approve the refreshed amount before anything is charged.
              </Alert>
            ) : quote ? (
              <>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Current monthly price ({quote.currentStoreCount} {quote.currentStoreCount === 1 ? "pharmacy" : "pharmacies"})</dt><dd className="tabular-nums text-foreground">{formatCents(quote.currentRecurringCents)}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="min-w-0 text-muted-foreground">Add {p.name}</dt><dd className="shrink-0 tabular-nums text-foreground">+ {formatCents(quote.newRecurringCents - quote.currentRecurringCents)} / mo</dd></div>
                  <div className="flex justify-between gap-3 border-t border-border pt-2"><dt className="font-semibold text-foreground">New monthly price ({quote.proposedStoreCount} pharmacies)</dt><dd className="font-semibold tabular-nums text-foreground" data-testid="new-monthly">{formatCents(quote.newRecurringCents)}</dd></div>
                  <div className="flex items-baseline justify-between gap-3"><dt className="font-semibold text-foreground">Charged today</dt><dd className="text-2xl font-semibold tabular-nums text-foreground" data-testid="charged-today">{formatCents(quote.dueNowCents ?? 0)}</dd></div>
                </dl>
                <p className="mt-2 text-xs text-muted-foreground">
                  Today&apos;s amount covers the rest of this billing period <Placeholder>[PRORATION RULE TBD]</Placeholder>; it comes from the billing system, not a local formula. The new price starts <Placeholder>[EFFECTIVE DATE RULE TBD]</Placeholder>. Tax applies if applicable. Quote valid until {formatTime(quote.expiresAt)}.
                </p>
              </>
            ) : null}
          </section>

          <section aria-labelledby="pm-h" className="border border-border bg-card p-4 sm:p-5">
            <h2 id="pm-h" className="text-base font-semibold text-foreground">Payment</h2>
            {changeCard ? (
              <div className="mt-3">
                <ExternalHandoffPanel label="Preview" title="Leaving for Stripe">
                  <p className="text-sm font-medium text-foreground">Update your card on Stripe&apos;s billing page</p>
                  <p className="mt-1 text-sm text-muted-foreground">This quote and your store details stay saved. When you return, the quote is checked and you confirm the add here — the store is never added from the Stripe page itself.</p>
                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                    <Button asChild>
                      <Link href="/demo/stripe?mode=card&purpose=change_card">Continue to Stripe <ExternalLink className="h-4 w-4" aria-hidden="true" /></Link>
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setChangeCard(false)}>Keep card on file</Button>
                  </div>
                </ExternalHandoffPanel>
              </div>
            ) : (
              <>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-foreground">Pay with card on file: <span className="font-medium">{state.account.cardLabel}</span></p>
                  <Button type="button" variant="outline" onClick={() => setChangeCard(true)} disabled={confirming}>
                    Use a different card <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Card changes happen on Stripe&apos;s secure billing page; you return here to confirm. We never collect card details in Pharmacy Books.</p>
              </>
            )}
          </section>

          <section className="border border-border bg-card p-4 sm:p-5">
            <label className="flex min-h-[44px] cursor-pointer items-start gap-3 text-sm text-foreground">
              <input
                id="pc"
                type="checkbox"
                className="mt-0.5 h-5 w-5 shrink-0"
                checked={accepted}
                onChange={(e) => account.setConsent(e.target.checked)}
                aria-invalid={consentErr && !accepted ? true : undefined}
                aria-describedby={consentErr && !accepted ? "pc-err" : undefined}
                disabled={!ready}
              />
              <span>
                I approve the new monthly price of <span className="font-semibold tabular-nums">{quote ? formatCents(quote.newRecurringCents) : "[amount pending]"}</span> and today&apos;s charge of{" "}
                <span className="font-semibold tabular-nums">{quote ? formatCents(quote.dueNowCents ?? 0) : "[amount pending]"}</span> to Pharmacy Books (illustrative amounts).
              </span>
            </label>
            {consentErr && !accepted ? (
              <p id="pc-err" className="ml-8 flex items-center gap-1.5 text-xs font-medium text-destructive">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Required to continue.
              </p>
            ) : null}
            <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button asChild variant="outline">
                <Link href="/demo/stores/add">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Back
                </Link>
              </Button>
              <Button type="submit" className="px-6 sm:min-w-[14rem]" disabled={!ready || confirming} aria-busy={confirming || undefined} data-testid="confirm-add">
                {confirming ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Confirming…
                  </>
                ) : (
                  "Confirm and add store"
                )}
              </Button>
            </div>
            {!ready && !confirming ? <p className="mt-2 text-xs text-muted-foreground">{pending ? "Waiting for the pending payment to resolve." : "Needs a current quote."}</p> : null}
            <p className="mt-3 text-xs text-muted-foreground">
              If the payment doesn&apos;t go through, the store isn&apos;t added and nothing changes. Clicking twice can&apos;t add the store twice — one confirmation, one operation.
            </p>
            {confirming ? <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">Payment pending with Stripe. Keep this page open; the store is added only once payment is confirmed.</p> : null}
          </section>
        </form>
      </PageContainer>
    </AccountGate>
  );
}
