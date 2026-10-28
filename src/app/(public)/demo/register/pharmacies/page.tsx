import { PharmacyStepView } from "@/components/portal/register/PharmacyStepView";

export const metadata = { title: "Pharmacy details — Pharmacy Books" };

// `store` is a 1-based step index; the view validates it against the draft.
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { store, notice } = await searchParams;
  const n = typeof store === "string" && /^\d{1,2}$/.test(store) ? Number(store) : 1;
  return <PharmacyStepView key={n} storeParam={n} notice={notice === "missing_context"} />;
}
