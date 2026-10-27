import { LayoutDashboard } from "lucide-react";
import { EmptyState } from "@/components/portal/EmptyState";

// Placeholder only. Proves the shell, theme tokens and the (temporary)
// auth gate end-to-end. Real portal screens arrive with the Designer-approved FFM.
export default function DashboardPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
      <EmptyState
        icon={LayoutDashboard}
        title="Subscription Portal foundation"
        description="No portal screens yet. This placeholder confirms the shell, theme and sign-in gate are working."
      />
    </section>
  );
}
