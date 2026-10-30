"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Home, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { Alert, DemoNotice, Placeholder } from "../Alert";
import { DataTable } from "../DataTable";
import { EmptyState } from "../EmptyState";
import { PageContainer } from "../Loading";
import { Initials, PageHeader, RoleLabel } from "../PageHeader";
import { Pill } from "../Pill";
import { INVITATION_PILL, STORE_PILL, StatusPill, SUBSCRIPTION_PILL } from "./status";
import {
  addStoreAvailability,
  formatCents,
  formatDate,
  formatTime,
  PERSONA_PROFILE,
  useAccount,
  type AccountReadModel,
  type BillingPurpose,
  type PharmacyListItem,
} from "@/services/portal";

type View = { kind: "loading" } | { kind: "error" } | AccountReadModel;

// C12 Account & Billing (canonical) + C13 return states. Rendered only behind
// the real admin/superadmin gate; the SYNTHETIC persona decides what the mock
// service returns (non-owners get a denied payload, not hidden data).
export function DashboardView() {
  const router = useRouter();
  const { toast } = useToast();
  const { state, hydrated, account } = useAccount();
  const [view, setView] = useState<View>({ kind: "loading" });
  const [handoffError, setHandoffError] = useState<BillingPurpose | null>(null);
  const [launching, setLaunching] = useState<BillingPurpose | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [loadedAt, setLoadedAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const seq = useRef(0);

  const refreshing = state.returnStatus === "refreshing";

  // (Re)load whenever the synthetic account, persona or return state changes.
  useEffect(() => {
    if (!hydrated) return;
    const mine = ++seq.current;
    // Returning from Stripe: show the last-known summary under the "refreshing"
    // banner (approved C13 state) instead of a blank skeleton. REPAIR_001 R1-N01.
    if (refreshing) {
      const last = account.peekAccount();
      if (last.ok) setView(last.value);
    }
    const run = refreshing ? account.refreshAfterHandoff("account_billing") : account.loadAccount();
    void run.then((r) => {
      if (mine !== seq.current) return;
      setView(r.ok ? r.value : { kind: "error" });
      if (r.ok) setLoadedAt(Date.now());
    });
  }, [hydrated, state.account, state.persona, state.scenario, refreshing, account]);

  // "Last refreshed just now" ages honestly (approved refresh line, Q2-O04).
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  async function reloadSummary() {
    setReloading(true);
    const mine = ++seq.current;
    const r = await account.loadAccount();
    setReloading(false);
    if (mine !== seq.current) return;
    setView(r.ok ? r.value : { kind: "error" });
    if (r.ok) {
      setLoadedAt(Date.now());
      setNow(Date.now());
    }
  }

  async function retryLoad() {
    setRetrying(true);
    const r = await account.retryLoadAccount();
    setRetrying(false);
    setView(r.ok ? r.value : { kind: "error" });
    if (r.ok) setLoadedAt(Date.now());
  }

  async function openBilling(purpose: BillingPurpose) {
    setLaunching(purpose);
    setHandoffError(null);
    const r = await account.openBillingPreview(purpose);
    setLaunching(null);
    if (r.ok) router.push(`/demo/stripe?mode=portal&purpose=${purpose}`);
    else setHandoffError(purpose);
  }

  if (!hydrated || view.kind === "loading") {
    return (
      <PageContainer width="6xl">
        <div aria-busy="true" aria-live="polite" className="space-y-4" data-testid="dashboard-loading">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-48 w-full" />
          <p className="text-sm text-muted-foreground">Loading your account…</p>
        </div>
      </PageContainer>
    );
  }

  if (view.kind === "error") {
    return (
      <PageContainer width="3xl">
        <DemoNotice />
        <PageHeader eyebrow="Account & Billing" title="We couldn't load your account" />
        <Alert tone="destructive" className="mt-5" title="Something went wrong on our side">
          Your subscription and pharmacies are unaffected; we just couldn&apos;t fetch the summary. Reference <span className="font-medium text-foreground">demo_err_01</span>.
        </Alert>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Button type="button" onClick={retryLoad} disabled={retrying} aria-busy={retrying || undefined} data-testid="load-retry">
            {retrying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Try again
          </Button>
          <Button asChild variant="outline">
            <Link href="/demo/references/owedbook">Back to OwedBook</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Still stuck? Contact <Placeholder>[SUPPORT EMAIL]</Placeholder>.</p>
      </PageContainer>
    );
  }

  if (view.kind === "denied") {
    const persona = PERSONA_PROFILE[state.persona];
    return (
      <PageContainer width="3xl">
        <DemoNotice />
        <PageHeader eyebrow="Account & Billing" title="Billing is managed by the account owner" />
        <div className="mt-5 border border-border bg-card p-4 sm:p-5" data-testid="denied-view">
          <p className="text-sm text-muted-foreground">
            You&apos;re viewing as <span className="font-medium text-foreground">{persona.name}</span> <RoleLabel>{persona.label}</RoleLabel> ({persona.detail}). People who are not the billing owner cannot manage billing, so plan, payment and invoice details aren&apos;t shown here.
          </p>
          <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
            <Initials name={view.ownerContactLabel} />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Account owner</p>
              <p className="text-sm font-semibold text-foreground">{view.ownerContactLabel}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link href="/demo/references/owedbook">Back to OwedBook</Link>
            </Button>
            <Button type="button" variant="outline" disabled title="Demo: no email is sent">
              Email the owner
            </Button>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Think you should be the billing owner? There&apos;s no self-service ownership transfer. Contact <Placeholder>[SUPPORT EMAIL]</Placeholder>; the transfer process is <Placeholder>[OWNERSHIP TRANSFER PROCESS TBD]</Placeholder>.
        </p>
      </PageContainer>
    );
  }

  const a = view.account;
  const sub = a.subscription;
  const availability = addStoreAvailability(state);
  const covered = sub.coveredStoreCount;
  const storeWord = covered === 1 ? "pharmacy" : "pharmacies";
  const all = covered === 1 ? "your pharmacy" : covered === 2 ? "both pharmacies" : `all ${covered} pharmacies`;
  const busy = refreshing || launching !== null;

  const monthly = (p: PharmacyListItem) =>
    p.isIncluded ? "Included" : p.monthlyAmountCents !== undefined ? formatCents(p.monthlyAmountCents) : "—";
  const sentOn = formatDate("2026-10-26").replace(/ \d{4}$/, "");
  const action = (p: PharmacyListItem) =>
    p.invitationStatus === "pending" ? (
      <button
        type="button"
        className="portal-link inline-flex min-h-[44px] items-center text-sm"
        disabled={busy}
        onClick={() => toast({ title: "Invitation resent", description: `Simulated — nothing was sent to ${p.adminName}.` })}
      >
        Resend invitation<span className="sr-only"> to {p.adminName}</span>
      </button>
    ) : (
      <Link href="/demo/references/owedbook" className="portal-link inline-flex min-h-[44px] items-center text-sm">
        Open in OwedBook<span className="sr-only"> — {p.name}</span>
      </Link>
    );

  const columns = [
    {
      key: "name",
      header: "Pharmacy",
      primary: true,
      cell: (p: PharmacyListItem) => (
        <div className="min-w-0">
          <p className="font-medium text-foreground">{p.name}</p>
          <p className="text-xs text-muted-foreground">{p.ncpdpDisplay}</p>
        </div>
      ),
    },
    {
      key: "admin",
      header: "Store admin",
      cell: (p: PharmacyListItem) => (
        <span className="text-foreground">
          {p.adminName} <RoleLabel>{p.ownerIsAdmin ? "Owner" : "Store admin"}</RoleLabel>
        </span>
      ),
    },
    { key: "monthly", header: "Monthly", cell: (p: PharmacyListItem) => <span className="tabular-nums">{monthly(p)}</span> },
    { key: "act", header: "Activation", cell: (p: PharmacyListItem) => <StatusPill map={STORE_PILL} value={p.activationStatus} checking={refreshing} /> },
    {
      key: "inv",
      header: "Invitation",
      cell: (p: PharmacyListItem) => (
        <div>
          <StatusPill map={INVITATION_PILL} value={p.invitationStatus} checking={refreshing} />
          {p.invitationStatus === "pending" && p.invitationEmailMasked ? (
            <p className="mt-1 break-all text-xs text-muted-foreground">Sent {sentOn} · {p.invitationEmailMasked}</p>
          ) : null}
        </div>
      ),
    },
    { key: "action", header: "Actions", cell: action },
  ];

  // < md card, as approved (account-billing mobile): activation pill in the
  // title row; Store admin | Monthly; Invitation | action.
  const card = (p: PharmacyListItem) => (
    <div className="min-w-0" data-testid="pharmacy-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-foreground">{p.name}</p>
          <p className="text-xs tabular-nums text-muted-foreground">{p.ncpdpDisplay}</p>
        </div>
        <span className="shrink-0" data-testid="card-activation">
          <StatusPill map={STORE_PILL} value={p.activationStatus} checking={refreshing} />
        </span>
      </div>
      <dl className="mt-3 grid min-w-0 grid-cols-2 gap-3 text-sm">
        <div className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Store admin</dt>
          <dd className="text-foreground">
            {p.adminName} <RoleLabel>{p.ownerIsAdmin ? "Owner" : "Store admin"}</RoleLabel>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Monthly</dt>
          <dd className="tabular-nums text-foreground">{monthly(p)}</dd>
        </div>
        <div className="min-w-0">
          <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Invitation</dt>
          <dd>
            <StatusPill map={INVITATION_PILL} value={p.invitationStatus} checking={refreshing} />
            {p.invitationStatus === "pending" ? <p className="mt-0.5 text-[11px] text-muted-foreground">Sent {sentOn}</p> : null}
          </dd>
        </div>
        <div className="self-end text-right">{action(p)}</div>
      </dl>
    </div>
  );

  const refreshLine = refreshing ? (
    <span>Refreshing…</span>
  ) : (
    <>
      {state.returnStatus !== "none" && state.refreshedAt
        ? `Refreshed ${formatTime(state.refreshedAt)} after returning from Stripe`
        : `Last refreshed ${loadedAt === null || now - loadedAt < 60_000 ? "just now" : `at ${formatTime(new Date(loadedAt).toISOString())}`}`}
      {" · "}
      <button type="button" className="portal-link inline-flex min-h-[44px] items-center" onClick={reloadSummary} disabled={busy || reloading} aria-busy={reloading || undefined}>
        Refresh
      </button>
    </>
  );

  const addStore =
    availability === "allowed" ? (
      <Button asChild={!busy} disabled={busy} className="w-full sm:w-auto" data-testid="add-store">
        {busy ? <span>Add a store</span> : <Link href="/demo/stores/add">Add a store</Link>}
      </Button>
    ) : availability === "unavailable_canceled" ? null : (
      <Button disabled className="w-full sm:w-auto" data-testid="add-store">Add a store</Button>
    );

  return (
    <PageContainer width="6xl">
      <DemoNotice />
      <PageHeader
        eyebrow="Account & Billing"
        title="Your subscription"
        lead={
          <>
            Billing owner <span className="font-medium text-foreground">{a.ownerName}</span> · <span className="break-all">{a.ownerEmail}</span>
          </>
        }
        meta={<p className="sm:text-right" data-testid="refresh-line" aria-live="polite">{refreshLine}</p>}
      />

      <div className="mt-5 space-y-3" data-testid="dashboard-banners">
        {refreshing ? (
          <Alert tone="info" live title="Welcome back from Stripe — refreshing your summary" icon={<Loader2 className="h-4 w-4 animate-spin text-foreground" aria-hidden="true" />}>
            We&apos;re confirming the latest billing state. The details below may be a few seconds behind; nothing here is treated as changed until Stripe confirms it.
          </Alert>
        ) : state.returnStatus === "unchanged" ? (
          <Alert tone="info" title="Welcome back from Stripe">
            Your summary was refreshed at {formatTime(state.refreshedAt)}. Nothing changed on this account. If you made a change on Stripe&apos;s page that isn&apos;t showing yet, give it a minute and refresh.
          </Alert>
        ) : state.returnStatus === "updated" ? (
          <Alert tone="success" title="Welcome back from Stripe — your summary is updated">
            Refreshed at {formatTime(state.refreshedAt)}. The status below reflects the change Stripe confirmed.
          </Alert>
        ) : null}
        {handoffError ? (
          <Alert
            tone="destructive"
            title="We couldn't open Stripe's billing page"
            action={
              <Button type="button" variant="outline" onClick={() => openBilling(handoffError)} data-testid="handoff-retry">
                Try again <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Button>
            }
          >
            Nothing on your account changed. Try again in a moment; if it keeps failing, contact <Placeholder>[SUPPORT EMAIL]</Placeholder> with reference <span className="font-medium text-foreground">demo_handoff_01</span>.
          </Alert>
        ) : null}
        {sub.status === "past_due" ? (
          <Alert
            tone="warning"
            title="We couldn't collect your last payment"
            action={
              <Button type="button" variant="outline" disabled={busy} onClick={() => openBilling("change_card")}>
                Update payment method <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Button>
            }
          >
            {sub.monthlyAmountCents !== undefined ? formatCents(sub.monthlyAmountCents) : "A payment"} due since {formatDate(sub.nextPaymentAt)}. Update your payment method on Stripe&apos;s secure billing page to keep {all} active. Access during this period: <Placeholder>[GRACE POLICY TBD]</Placeholder>.
          </Alert>
        ) : null}
        {sub.status === "cancel_scheduled" ? (
          <Alert
            tone="info"
            title="Cancellation scheduled"
            action={
              <Button type="button" variant="outline" disabled={busy} onClick={() => openBilling("resume")}>
                Resume in Stripe <ExternalLink className="h-4 w-4" aria-hidden="true" />
              </Button>
            }
          >
            This applies to {all}. When access ends, and whether any remaining charges apply, follows the cancellation policy <Placeholder>[POLICY TBD]</Placeholder>. Changed your mind? You can resume on Stripe&apos;s billing page until the cancellation takes effect.
          </Alert>
        ) : null}
        {sub.status === "canceled" ? (
          <Alert tone="destructive" role="status" title="Your subscription is canceled" action={<Button asChild variant="outline"><Link href="/demo/register/plan">Start a new subscription</Link></Button>}>
            This applies to {all}. Access after cancellation and data retention follow the cancellation policy <Placeholder>[POLICY TBD]</Placeholder>.
          </Alert>
        ) : null}
      </div>

      <section aria-labelledby="plan-h" className="mt-5 border border-border bg-card p-4 sm:p-5" data-testid="plan-summary">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:gap-10">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Plan</p>
              <StatusPill map={SUBSCRIPTION_PILL} value={sub.status} checking={refreshing} />
            </div>
            <h2 id="plan-h" className="mt-1 text-xl font-bold text-foreground">
              {sub.planName} <span className="text-sm font-normal text-muted-foreground">· monthly</span>
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Pharmacies covered</dt>
                <dd className="text-2xl font-semibold tabular-nums text-foreground" data-testid="store-count">{covered}</dd>
              </div>
              <div>
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Monthly total</dt>
                <dd className="text-2xl font-semibold tabular-nums text-foreground" data-testid="monthly-total">{sub.monthlyAmountCents !== undefined ? formatCents(sub.monthlyAmountCents) : "Price unavailable"}</dd>
                <dd className="text-xs text-muted-foreground">Illustrative · tax at checkout if it applies</dd>
              </div>
              <div className="col-span-2 sm:col-span-1">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{sub.status === "past_due" ? "Payment due since" : sub.status === "canceled" ? "Next payment" : "Next payment"}</dt>
                <dd className="text-2xl font-semibold tabular-nums text-foreground">{sub.status === "canceled" ? "None" : sub.status === "cancel_scheduled" ? "[POLICY TBD]" : formatDate(sub.nextPaymentAt)}</dd>
                <dd className="text-xs text-muted-foreground">{a.cardLabel} on file</dd>
              </div>
            </dl>
          </div>
          {/* Approved C10 actions column: divider above on mobile, beside on desktop (REPAIR_002 Q2-O04 residual). */}
          <div className="flex min-w-0 flex-col gap-3 border-t border-border pt-5 lg:w-80 lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0" data-testid="plan-actions">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Actions</p>
            <div className="flex flex-col gap-3" aria-busy={refreshing || undefined}>
              {addStore}
              {sub.status === "canceled" ? (
                <Button type="button" variant="outline" disabled={busy} onClick={() => openBilling("invoices")}>
                  Past invoices in Stripe <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button type="button" variant="outline" disabled={busy} onClick={() => openBilling("manage")} aria-busy={launching === "manage" || undefined} data-testid="manage-billing">
                  {launching === "manage" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                  Manage billing in Stripe <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </Button>
              )}
              {refreshing ? (
                <p className="text-xs text-muted-foreground">Actions unlock once the refreshed summary arrives, so nothing is started against stale data.</p>
              ) : availability === "paused_past_due" || availability === "paused_cancel_scheduled" ? (
                <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <Pill tone="info">Proposed rule</Pill>
                  <span>
                    Adding a store is paused while {availability === "paused_past_due" ? "a payment is past due" : "a cancellation is scheduled"}. Not yet approved by Tony/Coach.
                  </span>
                </p>
              ) : availability === "unavailable_canceled" ? (
                <p className="text-xs text-muted-foreground">Stores can&apos;t be added to a canceled subscription. Any outstanding amounts follow <Placeholder>[POLICY TBD]</Placeholder>.</p>
              ) : (
                <p className="text-xs text-muted-foreground">Payment method, invoices, plan changes and cancellation are handled on Stripe&apos;s secure billing page. You return here when you&apos;re done and this summary refreshes.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="ph-h" className="mt-8" data-testid="pharmacies-section">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h2 id="ph-h" className="text-xl font-bold text-foreground">Pharmacies on this plan</h2>
            <p className="text-sm text-muted-foreground">Each pharmacy has one store admin. Store admins who are not the billing owner cannot manage billing. An owner can also be a store admin.</p>
          </div>
          <span className="shrink-0 text-sm tabular-nums text-muted-foreground" data-testid="pharmacy-count">
            {a.pharmacies.length} of {covered}
          </span>
        </div>
        <DataTable
          columns={columns}
          rows={a.pharmacies}
          getRowKey={(p) => p.id}
          tableClassName="border border-border bg-card"
          renderMobileCard={card}
          mobileLabel="Pharmacies covered by this subscription"
          empty={
            <EmptyState
              icon={Home}
              title="No pharmacies on this plan yet"
              description="Your subscription is set up but no pharmacy is attached. This usually means provisioning is still finishing. If it stays empty, contact [SUPPORT EMAIL]."
              action={availability === "allowed" ? { label: "Add a store", onClick: () => router.push("/demo/stores/add") } : undefined}
            />
          }
        />
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section aria-labelledby="own-h" className="border border-border bg-card p-4 sm:p-5">
          <h2 id="own-h" className="text-base font-semibold text-foreground">Billing owner</h2>
          <div className="mt-3 flex items-center gap-3">
            <Initials name={a.ownerName} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {a.ownerName} <RoleLabel>Owner</RoleLabel>
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="break-all">{a.ownerEmail}</span> · <span className="whitespace-nowrap">{a.ownerPhone}</span>
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Only the billing owner can manage billing. You can also be a store admin of your own pharmacies; appointing someone else as store admin never transfers ownership or billing. There&apos;s no self-service ownership transfer: to change the billing owner, contact <Placeholder>[SUPPORT EMAIL]</Placeholder> (process <Placeholder>[OWNERSHIP TRANSFER PROCESS TBD]</Placeholder>).
          </p>
        </section>
        {sub.status !== "canceled" ? (
          <section aria-labelledby="can-h" className="border border-border bg-card p-4 sm:p-5">
            <h2 id="can-h" className="text-base font-semibold text-foreground">Need to cancel?</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Cancelling affects <span className="font-medium text-foreground">every pharmacy</span> on this account ({covered} {storeWord}). Cancellation is completed on Stripe&apos;s billing page; your summary here updates when you return. When access ends, any outstanding charges, refunds and data retention follow the cancellation policy <Placeholder>[POLICY TBD]</Placeholder>.
            </p>
            <Button type="button" variant="destructive-outline" className="mt-3" disabled={busy || sub.status === "cancel_scheduled"} onClick={() => openBilling("cancel")} data-testid="cancel-in-stripe">
              Cancel in Stripe <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </Button>
          </section>
        ) : null}
      </div>
    </PageContainer>
  );
}
