"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, DemoNotice, Placeholder } from "../Alert";
import { Counter } from "../Counter";
import { PageContainer, ViewSkeleton } from "../Loading";
import { PageHeader } from "../PageHeader";
import { Pill } from "../Pill";
import { Stepper } from "../Stepper";
import { MissingContextNotice } from "./MissingContext";
import {
  ADDITIONAL_STORE_CENTS,
  BASE_CENTS,
  estimateAvailable,
  formatCents,
  initialRecurringCents,
  MAX_STORES,
  PLAN_VIEW,
  registration,
  useRegistration,
} from "@/services/portal";

// C01 Choose plan (UI_SPEC §5). Count >= 1; lowering it past entered
// pharmacies asks before discarding them.
export function PlanView({ notice }: { notice: boolean }) {
  const router = useRouter();
  const { state, hydrated } = useRegistration();
  const [confirm, setConfirm] = useState<{ to: number; names: string[] } | null>(null);
  const [retrying, setRetrying] = useState(false);

  if (!hydrated) return <PageContainer><ViewSkeleton /></PageContainer>;

  const count = state.draft.requestedStoreCount;
  const available = estimateAvailable(state);

  function change(next: number) {
    if (next < count) {
      const names = registration.storeCountDiscards(next);
      if (names.length) {
        setConfirm({ to: next, names });
        return;
      }
    }
    setConfirm(null);
    registration.setStoreCount(next);
  }

  async function retry() {
    setRetrying(true);
    await registration.retryPricing();
    setRetrying(false);
  }

  const extra = count - 1;

  return (
    <PageContainer>
      <DemoNotice />
      <MissingContextNotice show={notice} />
      <Stepper current={1} />
      <PageHeader
        eyebrow="Get started"
        title="Choose your plan"
        lead="One subscription covers your pharmacy account. You can add more stores later from inside the app."
      />
      <form
        className="mt-6 space-y-6"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (!confirm) router.push("/demo/register/owner");
        }}
      >
        <fieldset className="min-w-0">
          <legend className="mb-2 text-sm font-medium text-foreground">Plan</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="relative flex cursor-pointer flex-col gap-2 border-2 border-primary bg-card p-4 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background">
              <input type="radio" name="plan" className="sr-only" checked readOnly value={PLAN_VIEW.id} />
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{PLAN_VIEW.name}</span>
                <span className="inline-flex items-center whitespace-nowrap border border-foreground/25 bg-primary px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary-foreground">Selected</span>
              </span>
              <span className="text-2xl font-semibold tabular-nums text-foreground">
                {formatCents(BASE_CENTS)} <span className="text-sm font-normal text-muted-foreground">/ month</span>
              </span>
              <span className="text-xs text-muted-foreground">
                Includes 1 pharmacy · each additional store {formatCents(ADDITIONAL_STORE_CENTS)} / month · <Placeholder>[What&apos;s included: TBD]</Placeholder>
              </span>
              <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Provisional plan · commercial details pending</span>
            </label>
            <div className="flex flex-col gap-2 border border-dashed border-border bg-card p-4 text-muted-foreground" aria-hidden="true">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">[Second plan TBD]</span>
                <Pill tone="muted">Pending</Pill>
              </span>
              <span className="text-2xl font-semibold tabular-nums">[PRICE TBD]</span>
              <span className="text-xs">No tier names are invented. This slot only shows how a second option would sit.</span>
            </div>
          </div>
        </fieldset>

        <div className="min-w-0 border border-border bg-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p id="stores-label" className="text-sm font-medium text-foreground">How many pharmacies will you manage?</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Each additional store is {formatCents(ADDITIONAL_STORE_CENTS)} / month (illustrative). Start with one if you&apos;re unsure — you can add stores any time. You&apos;ll enter details for each pharmacy before payment.
              </p>
            </div>
            <Counter id="stores" value={confirm ? count : count} max={MAX_STORES} onChange={change} labelledBy="stores-label" />
          </div>
          {confirm ? (
            <div className="mt-4 border-l-[3px] border-warning bg-warning/10 p-3 text-sm" role="alertdialog" aria-labelledby="rc-h" aria-describedby="rc-d" data-testid="reduce-confirm">
              <p id="rc-h" className="font-semibold text-foreground">
                Remove {confirm.names.join(" and ")} from this signup?
              </p>
              <p id="rc-d" className="mt-0.5 text-muted-foreground">
                You already entered details for {confirm.names.length === 1 ? "this pharmacy" : "these pharmacies"}. Reducing the count to {confirm.to} discards them. Nothing has been charged.
              </p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="destructive-outline"
                  onClick={() => {
                    registration.setStoreCount(confirm.to);
                    setConfirm(null);
                  }}
                >
                  Remove and continue with {confirm.to}
                </Button>
                <Button type="button" variant="outline" onClick={() => setConfirm(null)} autoFocus>
                  Keep {count} pharmacies
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="min-w-0 border border-border bg-card p-4 sm:p-5" aria-live="polite">
          {available ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Estimated recurring total</p>
                <p className="mt-0.5 text-2xl font-semibold tabular-nums text-foreground" data-testid="estimate-total">
                  {formatCents(initialRecurringCents(count))} <span className="text-sm font-normal text-muted-foreground">/ month</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  {extra === 0
                    ? `${PLAN_VIEW.name}, 1 pharmacy`
                    : `${PLAN_VIEW.name}, 1 included + ${extra} additional (${formatCents(ADDITIONAL_STORE_CENTS)} each)`}{" "}
                  · tax calculated at checkout if it applies · illustrative pricing
                </p>
              </div>
              <Pill tone="info" className="self-start sm:self-auto">Estimate · not a charge</Pill>
            </div>
          ) : (
            <Alert tone="destructive" title="Price unavailable">
              We couldn&apos;t load current pricing, so there&apos;s no estimate to show. Nothing has been charged.{" "}
              <button type="button" className="portal-link" onClick={retry} disabled={retrying} aria-busy={retrying || undefined}>
                {retrying ? "Trying…" : "Try again"}
              </button>{" "}
              or continue — you&apos;ll see the full price before paying.
            </Alert>
          )}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            Already subscribed? <Link href="/login" className="portal-link">Sign in</Link> and use Add a store instead.
          </p>
          <Button type="submit" className="px-6 sm:min-w-[12rem]" disabled={Boolean(confirm)}>
            Continue
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">You will not be charged until the final step. Payment is handled on Stripe&apos;s secure checkout page.</p>
      </form>
    </PageContainer>
  );
}
