import { cn } from "@/lib/utils";

// Generic status pill. Semantic four: success / warning / destructive / info,
// plus muted. Coral (brand) is NEVER a status. Token-tinted bg + token text,
// flat, uppercase. Domain→tone mappers belong next to the domain that owns
// them (none exist yet — they arrive with the FFM).
export type PillTone = "success" | "warning" | "destructive" | "info" | "muted";

const TONE: Record<PillTone, string> = {
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
  destructive: "bg-destructive/15 text-destructive",
  info: "bg-info/15 text-info",
  muted: "bg-muted text-muted-foreground",
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
        "inline-flex items-center px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        TONE[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
