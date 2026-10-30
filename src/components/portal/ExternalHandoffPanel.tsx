import { Pill } from "./Pill";

// ExternalHandoffPanel (COMPONENT_MANIFEST §2): labelled dashed frame for
// stand-ins of external surfaces. Demo-outcome buttons inside are review-only.
export function ExternalHandoffPanel({
  label = "Preview · external surface",
  title,
  children,
  testId,
}: {
  label?: string;
  title?: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <section data-testid={testId} className="min-w-0 border-2 border-dashed border-border bg-card p-4 sm:p-5" aria-label={typeof title === "string" ? title : label}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Pill tone="info">{label}</Pill>
        {title ? <span className="text-sm font-semibold text-foreground">{title}</span> : null}
      </div>
      {children}
    </section>
  );
}

/** Review-only outcome buttons on a stand-in, always labelled. */
export function DemoOutcomes({ children, note }: { children: React.ReactNode; note?: string }) {
  return (
    <div className="mt-4 border-t border-dashed border-border pt-4" role="group" aria-label="Demo outcomes">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Demo outcome · review control</p>
      {note ? <p className="mt-1 text-xs text-muted-foreground">{note}</p> : null}
      <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:flex-wrap [&>a]:h-auto [&>a]:min-h-[44px] [&>a]:whitespace-normal [&>button]:h-auto [&>button]:min-h-[44px] [&>button]:whitespace-normal [&>button]:py-2 [&>button]:text-left">{children}</div>
    </div>
  );
}
