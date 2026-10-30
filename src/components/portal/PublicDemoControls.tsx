"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pill } from "./Pill";
import { Button } from "@/components/ui/button";
import { DEMO_HINTS, REGISTRATION_SCENARIOS, registrationHarness } from "@/services/portal";

// Public Demo controls (RULINGS R-009): registration scenarios ONLY. They can
// never reach account data, personas or the real session. Named activation
// states are chosen only through Registration scenario → Load (R-012 addendum 2:
// the separate "Next activation check" control changed nothing visible).
const LABEL: Record<(typeof REGISTRATION_SCENARIOS)[number], string> = {
  fresh: "New visitor (empty)",
  prefilled_one_store: "Prefilled · 1 pharmacy",
  prefilled_two_store: "Prefilled · 2 pharmacies",
  prefilled_three_store: "Prefilled · 3 pharmacies",
  quote_unavailable: "Price unavailable (next request)",
  checkout_abandoned: "Checkout abandoned",
  checkout_declined: "Checkout declined",
  checkout_unknown: "Payment status unknown",
  checkout_expired: "Checkout hold expired",
  activation_waiting: "Activation · waiting for payment",
  activation_provisioning: "Activation · setting up",
  activation_delayed: "Activation · setup delayed",
  activation_email_failed: "Activation · email failed",
  activation_payment_failed: "Activation · payment failed",
  activation_ready: "Activation · ready",
  link_expired: "Access link expired",
  link_used: "Access link used",
  link_request_error: "Access link · request fails",
};

const START: Partial<Record<(typeof REGISTRATION_SCENARIOS)[number], string>> = {
  fresh: "/demo/register/plan",
  prefilled_one_store: "/demo/register/review",
  prefilled_two_store: "/demo/register/review",
  prefilled_three_store: "/demo/register/review",
  quote_unavailable: "/demo/register/plan",
  checkout_abandoned: "/demo/checkout-incomplete",
  checkout_declined: "/demo/checkout-incomplete",
  checkout_unknown: "/demo/checkout-incomplete",
  checkout_expired: "/demo/checkout-incomplete",
  link_expired: "/demo/access-link",
  link_used: "/demo/access-link",
  link_request_error: "/demo/access-link",
};

export function PublicDemoControls() {
  const router = useRouter();
  const [scenario, setScenario] = useState<string>("");

  function apply() {
    const result = registrationHarness.selectScenario(scenario);
    if (!result.ok) return;
    router.push(START[result.value] ?? "/demo/activation");
  }

  return (
    <div className="border-b border-border bg-muted" data-testid="public-demo-strip">
      <div className="mx-auto max-w-6xl px-5 py-2 text-xs">
        <details className="group">
          <summary className="flex min-h-[44px] cursor-pointer list-none flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Pill tone="info">Demo</Pill>
            <span>
              <span className="font-semibold text-foreground">Public signup preview</span> · no sign-in needed · nothing is charged, sent or created
            </span>
            <span className="ml-auto font-semibold uppercase tracking-wide text-foreground underline decoration-1 underline-offset-4">Demo controls</span>
          </summary>
          <div className="mt-2 grid gap-3 border-t border-border pb-2 pt-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="demo-reg-scenario" className="font-medium text-foreground">Registration scenario</label>
              <div className="flex gap-2">
                <select id="demo-reg-scenario" value={scenario} onChange={(e) => setScenario(e.target.value)} className="h-11 min-w-0 flex-1 border border-input bg-background px-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Choose…</option>
                  {REGISTRATION_SCENARIOS.map((id) => (
                    <option key={id} value={id}>{LABEL[id]}</option>
                  ))}
                </select>
                <Button type="button" variant="outline" disabled={!scenario} onClick={apply}>Load</Button>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="font-medium text-foreground">Clock (quote expiry)</p>
              <Button type="button" variant="outline" className="w-full" onClick={() => registrationHarness.advanceClock(31 * 60 * 1000)}>
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
                  registrationHarness.reset();
                  router.push("/demo/register/plan");
                }}
              >
                Reset signup demo
              </Button>
            </div>
            <p className="text-muted-foreground sm:col-span-2 lg:col-span-3">
              Try code <span className="font-medium text-foreground">{DEMO_HINTS.code}</span>, NCPDP <span className="font-medium text-foreground">{DEMO_HINTS.duplicateNcpdp}</span> (already registered) or email <span className="break-all font-medium text-foreground">{DEMO_HINTS.existingEmail}</span> (existing account). Account management needs a real sign-in.
            </p>
          </div>
        </details>
      </div>
    </div>
  );
}
