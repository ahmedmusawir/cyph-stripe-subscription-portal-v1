"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { DemoNotice } from "../Alert";
import { PageContainer, ViewSkeleton } from "../Loading";
import { PageHeader } from "../PageHeader";
import { EmailPreview } from "./EmailPreview";
import { accessEmailPreviews, coveredDetails, EMAIL_VARIANTS, formatCents, initialRecurringCents, useRegistration, type EmailVariant } from "@/services/portal";

const TAB: Record<EmailVariant, string> = {
  owner: "Owner access",
  store_admin: "Store admin invitation",
  checkout_unfinished: "Checkout unfinished",
  expired_resend: "New link after expiry",
};
const HREF: Record<EmailVariant, string | undefined> = {
  owner: "/demo/access-link",
  store_admin: undefined,
  checkout_unfinished: "/demo/checkout-incomplete",
  expired_resend: "/demo/access-link",
};

// C07 email reference (PUBLIC, registration draft only — R-009). Inert previews.
export function EmailReferenceView({ variant }: { variant: EmailVariant }) {
  const { state, hydrated } = useRegistration();
  if (!hydrated) return <PageContainer><ViewSkeleton /></PageContainer>;

  const emails = accessEmailPreviews(state);
  const draft = state.draft;
  const covered = coveredDetails(state);
  const n = covered.storeCount;
  const owner = [draft.owner.firstName, draft.owner.lastName].filter(Boolean).join(" ") || "Jordan Ellis";
  const nominated = covered.pharmacies.find((p) => p.adminAssignment?.kind === "other");
  const admin = nominated?.adminAssignment?.kind === "other" ? nominated.adminAssignment : null;
  const planLine = `Standard plan · ${n} ${n === 1 ? "pharmacy" : "pharmacies"} · ${formatCents(initialRecurringCents(n))} / month (illustrative)`;
  const adminNote = admin ? `${admin.fullName} received a separate invitation to administer ${nominated?.name}.` : undefined;

  return (
    <PageContainer>
      <DemoNotice />
      <PageHeader eyebrow="Reference" title="Email previews" lead="What the owner and a nominated store admin receive. Built from this signup's details; nothing is sent." />
      <nav aria-label="Email variants" className="mt-5 flex flex-wrap gap-2">
        {EMAIL_VARIANTS.map((v) => (
          <Link
            key={v}
            href={`/demo/references/email?variant=${v}`}
            aria-current={v === variant ? "page" : undefined}
            className={cn(
              "inline-flex min-h-[44px] items-center border px-3 text-sm font-medium",
              v === variant ? "border-primary text-foreground" : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {TAB[v]}
          </Link>
        ))}
      </nav>
      <div className="mt-5">
        <EmailPreview variant={variant} email={emails[variant]} ownerName={owner} planLine={planLine} adminNote={adminNote} actionHref={HREF[variant]} />
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        <Link href="/demo/activation" className="portal-link">Back to activation</Link>
      </p>
    </PageContainer>
  );
}
