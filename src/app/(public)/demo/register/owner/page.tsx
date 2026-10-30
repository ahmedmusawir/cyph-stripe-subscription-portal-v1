import { OwnerView } from "@/components/portal/register/OwnerView";

export const metadata = { title: "Owner details — Pharmacy Books" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { notice } = await searchParams;
  return <OwnerView notice={notice === "missing_context"} />;
}
