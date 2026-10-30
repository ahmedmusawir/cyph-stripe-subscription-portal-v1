import { Skeleton } from "@/components/ui/skeleton";

// Shown until the per-tab demo state is read, so fixtures never flash.
export function ViewSkeleton({ label = "Loading…" }: { label?: string }) {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-4" data-testid="view-skeleton">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-9 w-72 max-w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
      <p className="sr-only">{label}</p>
    </div>
  );
}

export function PageContainer({ width = "3xl", children }: { width?: "md" | "xl" | "3xl" | "6xl"; children: React.ReactNode }) {
  const max = { md: "max-w-md", xl: "max-w-xl", "3xl": "max-w-3xl", "6xl": "max-w-6xl" }[width];
  return <div className={`mx-auto min-w-0 ${max} px-5 py-6 md:py-8`}>{children}</div>;
}
