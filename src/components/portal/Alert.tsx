import { cn } from "@/lib/utils";

// Alert (COMPONENT_MANIFEST §2; placed under portal/ per the contract's edit
// lane). Tone border + 10% tint; destructive defaults to role="alert".
export type AlertTone = "info" | "warning" | "destructive" | "success";

const TONE: Record<AlertTone, string> = {
  info: "border-info bg-info/10",
  warning: "border-warning bg-warning/10",
  destructive: "border-destructive bg-destructive/10",
  success: "border-success bg-success/10",
};

export function Alert({
  tone,
  title,
  children,
  action,
  role,
  live,
  className,
  id,
  tabIndex,
  icon,
}: {
  tone: AlertTone;
  title?: React.ReactNode;
  children?: React.ReactNode;
  action?: React.ReactNode;
  role?: "status" | "alert" | "note" | "alertdialog";
  live?: boolean;
  className?: string;
  id?: string;
  tabIndex?: number;
  icon?: React.ReactNode;
}) {
  // R3-O03: on a dark tint over a card the shared ring measured 2.99:1 against the
  // tint; a lighter dark-only ring inside alerts clears 3:1 on every tone.
  return (
    <div
      id={id}
      tabIndex={tabIndex}
      role={role ?? (tone === "destructive" ? "alert" : "status")}
      aria-live={live ? "polite" : undefined}
      className={cn("min-w-0 border-l-[3px] p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring dark:[--ring:12_93%_68%]", TONE[tone], className)}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 gap-3">
          {icon ? <span className="mt-0.5 shrink-0">{icon}</span> : null}
          <div className="min-w-0">
            {title ? <p className="font-semibold text-foreground">{title}</p> : null}
            {children ? <div className="mt-0.5 text-sm text-muted-foreground">{children}</div> : null}
          </div>
        </div>
        {action ? <div className="flex shrink-0 flex-col gap-2 sm:flex-row">{action}</div> : null}
      </div>
    </div>
  );
}

/** Persistent "Demo · Illustrative pricing" notice on every app screen. */
export function DemoNotice({ children }: { children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-l-[3px] border-info bg-info/10 px-3 py-2 text-xs" role="note">
      <span className="inline-flex items-center whitespace-nowrap border border-info bg-info/10 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-foreground">Demo</span>
      <span className="font-semibold text-foreground">Illustrative pricing.</span>
      <span className="text-muted-foreground">
        {children ?? "Amounts are engineering fixtures; final prices are pending Coach/Frank. Nothing here charges a card, sends email or creates an account."}
      </span>
    </div>
  );
}

export function Placeholder({ children }: { children: React.ReactNode }) {
  return <span className="font-medium text-foreground">{children}</span>;
}
