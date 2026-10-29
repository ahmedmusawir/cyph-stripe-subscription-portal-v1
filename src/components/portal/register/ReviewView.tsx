"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, ExternalLink, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, DemoNotice, Placeholder } from "../Alert";
import { PageContainer, ViewSkeleton } from "../Loading";
import { PageHeader, RoleLabel } from "../PageHeader";
import { Pill } from "../Pill";
import { Stepper } from "../Stepper";
import { useOperationKey } from "../hooks";
import { MISSING } from "./MissingContext";
import {
  ADDITIONAL_STORE_CENTS,
  BASE_CENTS,
  firstIncomplete,
  formatCents,
  isQuoteExpired,
  registration,
  useRegistration,
} from "@/services/portal";


// C04 Review, code and consent. The CTA needs a current quote (same draft
// revision, unexpired) and both consents; the service re-checks all of it.
export function ReviewView() {
  const router = useRouter();
  const { state, hydrated, deps } = useRegistration();
  const [quoteBusy, setQuoteBusy] = useState(false);
  const [quoteError, setQuoteError] = useState(false);
  const [code, setCode] = useState("");
  const [codeBusy, setCodeBusy] = useState(false);
  const [codeMsg, setCodeMsg] = useState<"none" | "invalid">("none");
  const [consentErr, setConsentErr] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [, setTick] = useState(0);
  const consentRef = useRef<HTMLDivElement>(null);
  const opKey = useOperationKey("reg_checkout");
  const requested = useRef<number | null>(null);

  const { draft, quote, checkout } = state;

  // Route guard and checkout state.
  useEffect(() => {
    if (!hydrated) return;
    if (checkout?.status === "paid") return router.replace("/demo/activation");
    if (checkout?.status === "unknown" || checkout?.status === "expired") return router.replace("/demo/checkout-incomplete");
    const gate = firstIncomplete(draft);
    if (gate.step !== "review") {
      const target =
        gate.step === "pharmacy" ? `/demo/register/pharmacies?store=${(gate.index ?? 0) + 1}&notice=${MISSING}` : `/demo/register/${gate.step}?notice=${MISSING}`;
      router.replace(target);
    }
  }, [hydrated, checkout?.status, draft, router]);

  // Fetch a quote for the current revision (once per revision).
  useEffect(() => {
    if (!hydrated || leaving) return;
    if (firstIncomplete(draft).step !== "review" || checkout) return;
    if (quote && quote.draftRevision === draft.revision) return;
    if (requested.current === draft.revision || quoteBusy || quoteError) return;
    requested.current = draft.revision;
    setQuoteBusy(true);
    void registration.requestQuote().then((r) => {
      setQuoteBusy(false);
      setQuoteError(!r.ok);
    });
  }, [hydrated, draft, quote, quoteBusy, quoteError, checkout, leaving]);

  // Re-evaluate expiry periodically.
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (consentErr) consentRef.current?.focus();
  }, [consentErr]);

  useEffect(() => {
    if (hydrated) setCode(draft.code ?? "");
    // only on first hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!hydrated || firstIncomplete(draft).step !== "review") return <PageContainer width="6xl"><ViewSkeleton /></PageContainer>;

  const current = quote && quote.draftRevision === draft.revision ? quote : null;
  const expired = current ? isQuoteExpired(current, deps) : false;
  const ready = Boolean(current) && !expired && !quoteBusy && !codeBusy;
  const consents = draft.consents;
  const n = draft.requestedStoreCount;
  const owner = draft.owner;
  const ownerName = [owner.firstName, owner.lastName].filter(Boolean).join(" ");

  async function refresh() {
    setQuoteError(false);
    setQuoteBusy(true);
    const r = await registration.requestQuote();
    setQuoteBusy(false);
    setQuoteError(!r.ok);
  }

  async function apply() {
    setCodeBusy(true);
    setCodeMsg("none");
    const r = await registration.applyCode({ draftId: draft.id, code });
    setCodeBusy(false);
    if (!r.ok) {
      if (r.code === "quote_unavailable") setQuoteError(true);
      else setCodeMsg("invalid");
    }
  }

  async function remove() {
    setCodeBusy(true);
    const r = await registration.removeCode();
    setCodeBusy(false);
    setCode("");
    setCodeMsg("none");
    if (!r.ok) setQuoteError(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!ready || leaving || !current) return;
    setServiceError(null);
    if (!consents.termsAccepted || !consents.recurringChargeAccepted) {
      setConsentErr(false);
      requestAnimationFrame(() => setConsentErr(true));
      return;
    }
    setConsentErr(false);
    setLeaving(true);
    const r = await registration.startCheckout({ draftId: draft.id, quoteId: current.id, consents, operationKey: opKey.current() });
    if (r.ok) {
      router.push("/demo/stripe");
      return;
    }
    setLeaving(false);
    if (r.code === "validation") setConsentErr(true);
    else setServiceError(r.message);
  }

  const offReason = quoteBusy || codeBusy ? "Available once the quote loads." : quoteError ? "Payment is paused until the price loads." : expired ? "Refresh the quote to continue." : "Available once the quote loads.";

  return (
    <PageContainer width="6xl">
      <DemoNotice />
      <div className="max-w-3xl">
        <Stepper current={4} />
      </div>
      <PageHeader eyebrow="Step 4 · Review & pay" title="Review and pay" lead="Check everything, then continue to Stripe's secure checkout. Nothing is charged on this page." />

      {checkout?.status === "pending" ? (
        <Alert
          tone="info"
          className="mt-5"
          title="Your checkout on Stripe is still open"
          action={
            <>
              <Button asChild>
                <Link href="/demo/stripe">Back to checkout</Link>
              </Button>
              <Button type="button" variant="outline" onClick={() => void registration.resolveCheckout("back").then(() => registration.resumeSignup())}>
                Edit my details instead
              </Button>
            </>
          }
        >
          Finish on Stripe, or edit your details here (that closes the open checkout; nothing has been charged).
        </Alert>
      ) : null}
      {checkout?.status === "abandoned" || checkout?.status === "declined" ? (
        <Alert tone="info" className="mt-5" title="Welcome back — your details are saved" action={<Button type="button" variant="outline" onClick={() => registration.resumeSignup()}>Get a fresh quote</Button>}>
          Payment wasn&apos;t completed. Get a current quote and confirm again to continue.
        </Alert>
      ) : null}
      {consentErr ? (
        <div ref={consentRef} tabIndex={-1} role="alert" className="mt-5 border-l-[3px] border-destructive bg-destructive/10 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="consent-error">
          <p className="font-semibold text-foreground">Two confirmations are needed before payment</p>
          <p className="text-sm text-muted-foreground">
            Tick <a href="#c1" className="portal-link" onClick={(e) => { e.preventDefault(); document.getElementById("c1")?.focus(); }}>the terms agreement</a> and{" "}
            <a href="#c2" className="portal-link" onClick={(e) => { e.preventDefault(); document.getElementById("c2")?.focus(); }}>the recurring-payment authorization</a> to continue.
          </p>
        </div>
      ) : null}
      {serviceError ? <Alert tone="destructive" className="mt-5" title="Checkout couldn't start">{serviceError}</Alert> : null}

      <form noValidate onSubmit={submit} className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="min-w-0 space-y-5">
          <section aria-labelledby="own-h" className="border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 id="own-h" className="text-base font-semibold text-foreground">Billing owner</h2>
              <Link href="/demo/register/owner" className="portal-link text-sm">Edit<span className="sr-only"> billing owner</span></Link>
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">
              {ownerName} <RoleLabel>Owner</RoleLabel>
            </p>
            <p className="text-sm text-muted-foreground">
              <span className="break-all">{owner.email}</span> · <span className="whitespace-nowrap">{owner.mobile}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground" data-testid="review-owner-declaration">
              {owner.ownerDeclarationAccepted === true
                ? "Owner declaration confirmed (your own statement; ownership isn't verified by email or payment)."
                : "Owner declaration not confirmed — edit the owner step."}
            </p>
            {owner.legalBusinessName ? <p className="text-sm text-muted-foreground">Invoices to: {owner.legalBusinessName}</p> : null}
          </section>

          {draft.pharmacies.slice(0, n).map((p, i) => {
            const a = p.adminAssignment;
            return (
              <section key={p.id ?? i} aria-labelledby={`p${i}-h`} className="border border-border bg-card p-4 sm:p-5" data-testid="review-pharmacy">
                <div className="flex items-center justify-between gap-3">
                  <h2 id={`p${i}-h`} className="min-w-0 text-base font-semibold text-foreground">
                    Pharmacy {i + 1} · {p.name}
                  </h2>
                  <Link href={`/demo/register/pharmacies?store=${i + 1}`} className="portal-link shrink-0 text-sm">
                    Edit<span className="sr-only"> pharmacy {i + 1}</span>
                  </Link>
                </div>
                <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                  <div className="min-w-0 sm:col-span-2"><dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Address</dt><dd className="text-foreground">{p.street}, {p.city}, {p.state} {p.zip}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">NCPDP</dt><dd className="tabular-nums text-foreground">{p.ncpdp}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">NPI</dt><dd className="tabular-nums text-foreground">{p.npi}</dd></div>
                  <div><dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Software</dt><dd className="text-foreground">{p.software === "Other" ? p.softwareOther : p.software}</dd></div>
                  <div className="min-w-0">
                    <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Store admin</dt>
                    <dd className="text-foreground">
                      {a?.kind === "other" ? (
                        <>
                          {a.fullName} <RoleLabel>Store admin</RoleLabel> · <span className="break-all">{a.email}</span> · invitation sent after payment
                        </>
                      ) : (
                        <>
                          {ownerName} <RoleLabel>Owner · Store admin</RoleLabel>
                        </>
                      )}
                    </dd>
                  </div>
                </dl>
              </section>
            );
          })}

          <fieldset className="border border-border bg-card p-4 sm:p-5">
            <legend className="sr-only">Before you pay</legend>
            <p className="text-base font-semibold text-foreground" aria-hidden="true">Before you pay</p>
            <p className="text-xs text-muted-foreground">
              Both boxes are separate and start unticked.{!current || expired ? " They unlock once a current price is shown, because you agree to that price." : ""}
            </p>
            <div className="mt-3 space-y-3">
              <label className="flex min-h-[44px] cursor-pointer items-start gap-3 text-sm text-foreground">
                <input
                  id="c1"
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0"
                  checked={consents.termsAccepted}
                  disabled={!ready}
                  onChange={(e) => registration.setConsents({ termsAccepted: e.target.checked, recurringChargeAccepted: consents.recurringChargeAccepted })}
                  aria-invalid={consentErr && !consents.termsAccepted ? true : undefined}
                  aria-describedby={consentErr && !consents.termsAccepted ? "c1-err" : undefined}
                />
                <span>
                  I agree to the Terms of Service <Placeholder>[LINK TBD]</Placeholder> and Privacy Policy <Placeholder>[LINK TBD]</Placeholder>.
                </span>
              </label>
              {consentErr && !consents.termsAccepted ? <ConsentError id="c1-err" /> : null}
              <label className="flex min-h-[44px] cursor-pointer items-start gap-3 text-sm text-foreground">
                <input
                  id="c2"
                  type="checkbox"
                  className="mt-0.5 h-5 w-5 shrink-0"
                  checked={consents.recurringChargeAccepted}
                  disabled={!ready}
                  onChange={(e) => registration.setConsents({ termsAccepted: consents.termsAccepted, recurringChargeAccepted: e.target.checked })}
                  aria-invalid={consentErr && !consents.recurringChargeAccepted ? true : undefined}
                  aria-describedby={consentErr && !consents.recurringChargeAccepted ? "c2-err" : undefined}
                />
                <span>
                  I authorize Pharmacy Books to charge my card{" "}
                  <span className="font-semibold tabular-nums" data-testid="recurring-inline">{current ? formatCents(current.newRecurringCents) : "[amount pending]"}</span> each month until I cancel. I can cancel from Account &amp; Billing; what happens after cancellation follows <Placeholder>[CANCELLATION TERMS TBD]</Placeholder>.
                </span>
              </label>
              {consentErr && !consents.recurringChargeAccepted ? <ConsentError id="c2-err" /> : null}
            </div>
          </fieldset>
        </div>

        <aside aria-labelledby="sum-h" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-4 border border-border bg-card p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <h2 id="sum-h" className="text-base font-semibold text-foreground">Order summary</h2>
              <Pill tone="info">Illustrative</Pill>
            </div>
            <div aria-live="polite" data-testid="order-summary">
              {quoteBusy ? (
                <div className="space-y-2" aria-busy="true">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                  <p className="sr-only">Loading your quote…</p>
                </div>
              ) : quoteError ? (
                <Alert tone="destructive" title="Price unavailable">
                  We couldn&apos;t load your quote, so payment is paused. Nothing has been charged and your details are saved.{" "}
                  <button type="button" className="portal-link" onClick={refresh}>Try again</button>
                </Alert>
              ) : current && expired ? (
                <Alert tone="warning" title="Your quote expired" action={<Button type="button" variant="outline" onClick={refresh}>Refresh quote</Button>}>
                  Prices are held for a limited time. Refresh to get a current quote; you&apos;ll re-confirm the amount before paying.
                </Alert>
              ) : current ? (
                <>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Standard plan, 1 pharmacy</dt><dd className="tabular-nums text-foreground">{formatCents(BASE_CENTS)}</dd></div>
                    {n > 1 ? (
                      <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Additional stores ({n - 1})</dt><dd className="tabular-nums text-foreground">{formatCents(ADDITIONAL_STORE_CENTS * (n - 1))}</dd></div>
                    ) : null}
                    {current.discountCents > 0 ? (
                      <div className="flex justify-between gap-3"><dt className="text-muted-foreground">Code {draft.code}</dt><dd className="tabular-nums text-foreground">{formatCents(-current.discountCents)}</dd></div>
                    ) : null}
                    <div className="flex items-baseline justify-between gap-3 border-t border-border pt-2">
                      <dt className="font-semibold text-foreground">Due today</dt>
                      <dd className="text-2xl font-semibold tabular-nums text-foreground" data-testid="due-today">{formatCents(current.dueNowCents ?? 0)}</dd>
                    </div>
                  </dl>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Then <span className="font-medium text-foreground" data-testid="recurring">{formatCents(current.newRecurringCents)}</span> every month. Tax calculated at checkout if it applies.
                  </p>
                </>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="code" className="text-sm font-medium text-foreground">
                Discount or APA member code <span className="font-normal text-muted-foreground">(optional)</span>
              </label>
              <div className="flex gap-2">
                <input
                  id="code"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value);
                    setCodeMsg("none");
                  }}
                  disabled={Boolean(draft.code) || codeBusy}
                  aria-invalid={codeMsg === "invalid" ? true : undefined}
                  aria-describedby="code-msg"
                  className="flex h-11 min-w-0 flex-1 border border-input bg-background px-3 text-sm uppercase text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive disabled:opacity-60"
                />
                {draft.code ? (
                  <Button type="button" variant="outline" onClick={remove} disabled={codeBusy}>Remove</Button>
                ) : (
                  <Button type="button" variant="outline" onClick={apply} disabled={codeBusy || !code.trim() || quoteBusy}>Apply</Button>
                )}
              </div>
              <p id="code-msg" className="text-xs" aria-live="polite">
                {codeBusy ? (
                  <span className="text-muted-foreground">Checking code…</span>
                ) : draft.code && current?.discountCents ? (
                  <span className="text-foreground">Code applied: {formatCents(-current.discountCents)} on today&apos;s payment. Demo code; this doesn&apos;t establish APA membership.</span>
                ) : codeMsg === "invalid" ? (
                  <span className="font-medium text-destructive">That code isn&apos;t valid. Check it or continue without one.</span>
                ) : (
                  <span className="text-muted-foreground">Applying a code refreshes the quote.</span>
                )}
              </p>
            </div>

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={!ready || leaving || checkout?.status === "pending"} aria-busy={leaving || undefined} data-testid="continue-payment">
                {leaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    Opening Stripe…
                  </>
                ) : (
                  <>
                    Continue to secure payment
                    <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </>
                )}
              </Button>
              {!ready && !leaving ? <p className="text-xs text-muted-foreground">{offReason}</p> : null}
              <p className="flex gap-2 text-xs text-muted-foreground">
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                <span>You&apos;ll finish on Stripe&apos;s secure checkout page. Pharmacy Books never sees your card number. Your access link arrives by email once payment is confirmed.</span>
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="mt-4">
            <Link href={`/demo/register/pharmacies?store=${n}`}>
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back
            </Link>
          </Button>
        </aside>
      </form>
    </PageContainer>
  );
}

function ConsentError({ id }: { id: string }) {
  return (
    <p id={id} className="ml-8 flex items-center gap-1.5 text-xs font-medium text-destructive">
      <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
      Required to continue.
    </p>
  );
}
