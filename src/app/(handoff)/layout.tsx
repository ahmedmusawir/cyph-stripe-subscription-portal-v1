import { HandoffShell } from "@/components/portal/HandoffShell";

// Stripe boundary group. Deliberately NOT a protected parent: checkout mode is
// public registration; the page guards account-side modes itself (R-009).
export default function HandoffLayout({ children }: { children: React.ReactNode }) {
  return <HandoffShell>{children}</HandoffShell>;
}
