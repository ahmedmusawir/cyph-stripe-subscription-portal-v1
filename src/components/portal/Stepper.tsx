import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// Wizard progress (COMPONENT_MANIFEST §2): numbered steps at sm+, "Step n of 4"
// plus bar below sm.
const STEPS = ["Plan", "Owner", "Pharmacy", "Review & pay"] as const;

export function Stepper({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <nav aria-label="Signup progress" className="mb-6">
      <ol className="hidden items-center gap-2 text-sm sm:flex">
        {STEPS.map((label, i) => {
          const n = i + 1;
          const state = n < current ? "done" : n === current ? "current" : "upcoming";
          return (
            <li key={label} className="flex items-center gap-2" aria-current={state === "current" ? "step" : undefined}>
              {i > 0 ? <span className="h-px w-8 bg-border" aria-hidden="true" /> : null}
              <span
                className={cn(
                  "grid h-6 w-6 place-items-center text-[11px] font-bold",
                  state === "done" && "border border-success bg-success/10 text-foreground",
                  state === "current" && "border border-foreground/25 bg-primary text-primary-foreground",
                  state === "upcoming" && "border border-border text-muted-foreground",
                )}
              >
                {state === "done" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : n}
              </span>
              <span className={state === "upcoming" ? "text-muted-foreground" : "font-medium text-foreground"}>
                {label}
                {state === "done" ? <span className="sr-only"> (done)</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
      <div className="sm:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Step {current} of 4 · <span className="text-foreground">{STEPS[current - 1]}</span>
        </p>
        <div className="mt-2 h-1 w-full bg-muted">
          <div className="h-1 bg-primary" style={{ width: `${current * 25}%` }} />
        </div>
      </div>
    </nav>
  );
}
