"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "./Pill";
import { Button } from "@/components/ui/button";
import {
  ACCOUNT_PERSONAS,
  ACCOUNT_SCENARIOS,
  ADD_OUTCOMES,
  PERSONA_PROFILE,
  useAccount,
} from "@/services/portal";

// Persistent strip: the REAL signed-in admin vs the SYNTHETIC account/persona
// being previewed, plus account Demo controls (review aid only; every journey
// also works through normal controls).
const SCENARIO_LABEL: Record<(typeof ACCOUNT_SCENARIOS)[number], string> = {
  two_store_active: "Active · 2 pharmacies",
  one_store_active: "Active · 1 pharmacy",
  past_due: "Past due",
  cancel_scheduled: "Cancellation scheduled",
  canceled: "Canceled",
  no_pharmacies: "No pharmacies yet",
  load_error: "Account load error (next load)",
  handoff_error: "Stripe launch error (next launch)",
  add_draft_restored: "Add-store draft restored",
};
const OUTCOME_LABEL: Record<(typeof ADD_OUTCOMES)[number], string> = {
  succeeded: "Payment succeeds",
  failed: "Payment fails",
  unknown: "Payment status unknown",
  attention: "Paid · setup needs attention",
};

export function AccountStrip({ realName, roleLabel }: { realName: string; roleLabel: string }) {
  const router = useRouter();
  const { state, hydrated, account } = useAccount();
  const [scenario, setScenario] = useState("");
  const persona = PERSONA_PROFILE[state.persona];
  const lastOp = state.lastOperationKey ? state.operations[state.lastOperationKey] : null;
  const resolvable = lastOp && (lastOp.state === "unknown" || lastOp.state === "pending" || lastOp.state === "attention");

  return (
    <div className="border-b border-border bg-muted" data-testid="account-demo-strip">
      <div className="mx-auto max-w-6xl px-5 py-2 text-xs">
        <details>
          <summary className="flex min-h-[44px] cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Pill tone="info">Demo</Pill>
            <span>
              Signed in as <span className="font-semibold text-foreground">{realName}</span> · {roleLabel} (real account) · Demo account{" "}
              <span className="font-semibold text-foreground">Jordan Ellis</span> (synthetic) · Viewing as{" "}
              <span className="font-semibold text-foreground" data-testid="persona-label">{hydrated ? persona.label : "…"}</span>
            </span>
            <span className="ml-auto font-semibold uppercase tracking-wide text-foreground underline decoration-1 underline-offset-4">Demo controls</span>
          </summary>
          <div className="mt-2 grid gap-3 border-t border-border pb-2 pt-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="demo-acct-scenario" className="font-medium text-foreground">Account scenario</label>
              <div className="flex gap-2">
                <select id="demo-acct-scenario" value={scenario} onChange={(e) => setScenario(e.target.value)} className="h-11 min-w-0 flex-1 border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Choose…</option>
                  {ACCOUNT_SCENARIOS.map((id) => (
                    <option key={id} value={id}>{SCENARIO_LABEL[id]}</option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!scenario}
                  onClick={() => {
                    const r = account.harness.selectScenario(scenario);
                    if (r.ok) router.push(r.value === "add_draft_restored" ? "/demo/stores/add" : "/dashboard");
                  }}
                >
                  Load
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="demo-persona" className="font-medium text-foreground">View as (synthetic persona)</label>
              <select
                id="demo-persona"
                value={state.persona}
                onChange={(e) => account.harness.selectPersona(e.target.value)}
                className="h-11 w-full border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ACCOUNT_PERSONAS.map((p) => (
                  <option key={p} value={p}>{PERSONA_PROFILE[p].label} — {PERSONA_PROFILE[p].name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="demo-next-add" className="font-medium text-foreground">Next add-store payment</label>
              <select
                id="demo-next-add"
                value={state.nextAddOutcome}
                onChange={(e) => account.harness.setNextAddOutcome(e.target.value)}
                className="h-11 w-full border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ADD_OUTCOMES.map((o) => (
                  <option key={o} value={o}>{OUTCOME_LABEL[o]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-foreground">Resolve last store addition</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" disabled={!resolvable} onClick={() => account.harness.resolveOperation("succeeded")}>
                  Succeeded
                </Button>
                <Button type="button" variant="outline" disabled={!resolvable || lastOp?.applied} onClick={() => account.harness.resolveOperation("failed")}>
                  Failed
                </Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-foreground">Clock (quote expiry)</p>
              <Button type="button" variant="outline" className="w-full" onClick={() => account.harness.advanceClock(31 * 60 * 1000)}>
                Advance 31 minutes
              </Button>
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-foreground">Reset</p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  account.harness.reset();
                  router.push("/dashboard");
                }}
              >
                Reset account demo
              </Button>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}
