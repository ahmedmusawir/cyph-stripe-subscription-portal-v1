import { cn } from "@/lib/utils";

// Generic status pill. Semantic four: success / warning / destructive / info,
// plus muted. Coral (brand) is NEVER a status. Foreground text + status border
// + 10% tint (COMPONENT_MANIFEST §4), flat, uppercase, never wraps. Domain→tone mappers belong next to the domain that owns
// them (none exist yet — they arrive with the FFM).
export type PillTone = "success" | "warning" | "destructive" | "info" | "muted";

const TONE: Record<PillTone, string> = {
  success: "border-success bg-success/10 text-foreground",
  warning: "border-warning bg-warning/10 text-foreground",
  destructive: "border-destructive bg-destructive/10 text-foreground",
  info: "border-info bg-info/10 text-foreground",
  muted: "border-border bg-muted text-foreground",
};

export function Pill({
  tone,
  children,
  className,
}: {
  tone: PillTone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
