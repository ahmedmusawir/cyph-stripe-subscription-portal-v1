import { PlanView } from "@/components/portal/register/PlanView";

export const metadata = { title: "Choose your plan — Pharmacy Books" };

// Public (R-009): no login. Only `notice=missing_context` is read from the URL.
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { notice } = await searchParams;
  return <PlanView notice={notice === "missing_context"} />;
}
