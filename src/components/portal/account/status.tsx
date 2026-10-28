import type { InvitationStatus, StoreStatus, SubscriptionStatus } from "@/types/portal/contract";
import { Pill, type PillTone } from "../Pill";

// One axis per pill (UI_SPEC §3): subscription, store activation and
// invitation are never merged into one status.
export const SUBSCRIPTION_PILL: Record<SubscriptionStatus, { tone: PillTone; label: string }> = {
  pending: { tone: "warning", label: "Pending" },
  active: { tone: "success", label: "Active" },
  past_due: { tone: "warning", label: "Past due" },
  cancel_scheduled: { tone: "info", label: "Cancellation scheduled" },
  canceled: { tone: "destructive", label: "Canceled" },
};

export const STORE_PILL: Record<StoreStatus, { tone: PillTone; label: string }> = {
  draft: { tone: "muted", label: "Draft" },
  payment_pending: { tone: "warning", label: "Payment pending" },
  provisioning: { tone: "warning", label: "Setting up" },
  active: { tone: "success", label: "Active" },
  attention: { tone: "destructive", label: "Setup pending" },
};

export const INVITATION_PILL: Record<InvitationStatus, { tone: PillTone; label: string }> = {
  not_required: { tone: "muted", label: "Not required" },
  pending: { tone: "warning", label: "Pending" },
  accepted: { tone: "success", label: "Accepted" },
  expired: { tone: "warning", label: "Expired" },
  held: { tone: "muted", label: "Held" },
};

export function StatusPill<K extends string>({ map, value, checking }: { map: Record<K, { tone: PillTone; label: string }>; value: K; checking?: boolean }) {
  if (checking) return <Pill tone="muted">Checking…</Pill>;
  const { tone, label } = map[value];
  return <Pill tone={tone}>{label}</Pill>;
}
