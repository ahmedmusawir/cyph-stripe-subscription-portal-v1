import { EmailReferenceView } from "@/components/portal/references/EmailReferenceView";
import { isEmailVariant } from "@/services/portal";

export const metadata = { title: "Email previews — Pharmacy Books" };

// Public reference (R-009): renders from the registration draft only. Unknown
// `variant` values fall back to the owner email.
export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { variant } = await searchParams;
  return <EmailReferenceView variant={isEmailVariant(variant) ? variant : "owner"} />;
}
