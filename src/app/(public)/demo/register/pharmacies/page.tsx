import { PharmacyStepView } from "@/components/portal/register/PharmacyStepView";

export const metadata = { title: "Pharmacy details — Pharmacy Books" };

// `store` is a 1-based step index; the view validates it against the draft.
// Any safe integer is accepted here: a two-digit limit silently sent step 100+
// back to step 1 (REPAIR_002 R2-N02; repeat-N has no business cap).
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { store, notice } = await searchParams;
  const parsed = typeof store === "string" && /^[1-9]\d{0,15}$/.test(store) ? Number(store) : 1;
  const n = Number.isSafeInteger(parsed) ? parsed : 1;
  return <PharmacyStepView key={n} storeParam={n} notice={notice === "missing_context"} />;
}
