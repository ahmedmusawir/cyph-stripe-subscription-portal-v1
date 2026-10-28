export function PageHeader({
  eyebrow,
  title,
  lead,
  meta,
  titleId,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  meta?: React.ReactNode;
  titleId?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
        <h1 id={titleId} className="mt-1 text-[26px] font-bold leading-tight text-foreground md:text-[32px]">
          {title}
        </h1>
        {lead ? <p className="mt-1 text-sm text-muted-foreground">{lead}</p> : null}
      </div>
      {meta ? <div className="shrink-0 text-xs text-muted-foreground">{meta}</div> : null}
    </div>
  );
}


export function RoleLabel({ children }: { children: React.ReactNode }) {
  return <span className="ml-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{children}</span>;
}

export function Initials({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const letters = name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <span aria-hidden="true" className={`grid shrink-0 place-items-center bg-primary font-bold text-primary-foreground ${size === "sm" ? "h-7 w-7 text-[11px]" : "h-10 w-10 text-xs"}`}>
      {letters}
    </span>
  );
}
