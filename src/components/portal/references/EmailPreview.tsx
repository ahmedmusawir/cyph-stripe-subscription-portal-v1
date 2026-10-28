import Link from "next/link";
import type { AccessEmailView } from "@/types/portal/contract";
import { Placeholder } from "../Alert";
import { Pill } from "../Pill";
import { BRAND } from "../brand";

export type EmailVariantKey = "owner" | "store_admin" | "checkout_unfinished" | "expired_resend";

function list(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "your pharmacy";
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

// C07 email preview: envelope + 600px body. Rendered locally; nothing is sent,
// no token exists, recipients are masked synthetic addresses.
export function EmailPreview({
  variant,
  email,
  ownerName,
  planLine,
  adminNote,
  actionHref,
}: {
  variant: EmailVariantKey;
  email: AccessEmailView;
  ownerName: string;
  planLine?: string;
  adminNote?: string;
  actionHref?: string;
}) {
  const first = email.recipientName.split(" ")[0];
  const stores = list(email.pharmacyNames);
  const action = (label: string) =>
    actionHref ? (
      <Link href={actionHref} className="mt-4 inline-flex h-11 items-center border border-foreground/25 bg-primary px-5 text-sm font-semibold uppercase tracking-wide text-primary-foreground hover:bg-primary/90">
        {label}
      </Link>
    ) : (
      <span className="mt-4 inline-flex h-11 items-center border border-foreground/25 bg-primary px-5 text-sm font-semibold uppercase tracking-wide text-primary-foreground" aria-disabled="true">
        {label}
      </span>
    );

  return (
    <div className="min-w-0 border border-border bg-card" data-testid={`email-${variant}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
        <Pill tone="info">Reference · email preview</Pill>
        <p className="text-xs text-muted-foreground">Rendered preview only. Nothing is sent; links are illustrative.</p>
      </div>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-1 border-b border-border px-4 py-3 text-sm">
        <dt className="text-muted-foreground">From</dt>
        <dd className="min-w-0 break-words text-foreground">{BRAND.name} &lt;[SENDING ADDRESS TBD]&gt;</dd>
        <dt className="text-muted-foreground">To</dt>
        <dd className="min-w-0 break-all text-foreground" data-testid="email-to">{email.recipientEmailMasked}</dd>
        <dt className="text-muted-foreground">Subject</dt>
        <dd className="min-w-0 text-foreground">{email.subject}</dd>
      </dl>
      <div className="mx-auto max-w-[600px] px-4 py-6">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-color.svg" alt="" className="h-7 w-7" />
          <span className="text-sm font-bold uppercase tracking-wide text-foreground">{BRAND.name}</span>
        </div>
        {variant === "owner" ? (
          <div className="mt-5">
            <h2 className="text-xl font-bold text-foreground">Welcome, {first}. Your account is ready.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your payment went through and <span className="font-medium text-foreground">{stores}</span> {email.pharmacyNames.length === 1 ? "is" : "are"} set up in OwedBook. Use the button below to start account setup.
            </p>
            {action("Set up my account")}
            <p className="mt-3 text-xs text-muted-foreground">
              This link works once and expires in <Placeholder>{email.expiryLabel}</Placeholder>.
            </p>
            {planLine ? (
              <div className="mt-5 border border-border p-4 text-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Your subscription</p>
                <p className="mt-1 text-foreground">{planLine}</p>
                <p className="mt-1 text-muted-foreground">You&apos;re the billing owner. Manage billing any time from Account &amp; Billing.{adminNote ? ` ${adminNote}` : ""}</p>
              </div>
            ) : null}
          </div>
        ) : variant === "store_admin" ? (
          <div className="mt-5">
            <h2 className="text-xl font-bold text-foreground">{first}, you&apos;ve been invited to manage {stores}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{ownerName}</span> set you up as the store admin for {stores} in OwedBook. Accept the invitation to set up your sign-in and start inviting your team.
            </p>
            {action("Accept invitation")}
            <p className="mt-3 text-xs text-muted-foreground">
              This link works once and expires in <Placeholder>{email.expiryLabel}</Placeholder>. Didn&apos;t expect this? You can ignore it; nothing happens unless you accept.
            </p>
            <div className="mt-5 border border-border p-4 text-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">What a store admin does</p>
              <p className="mt-1 text-muted-foreground">
                Manages {stores} and its team in OwedBook. Billing stays with the account owner, {ownerName} — store admins who are not the billing owner cannot manage billing.
              </p>
            </div>
          </div>
        ) : variant === "checkout_unfinished" ? (
          <div className="mt-5">
            <h2 className="text-xl font-bold text-foreground">{first}, your Pharmacy Books signup is waiting</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You entered details for {email.pharmacyNames.length} {email.pharmacyNames.length === 1 ? "pharmacy" : "pharmacies"} but didn&apos;t complete payment, so nothing has been charged and your account isn&apos;t active yet. Your details are saved until <Placeholder>{email.expiryLabel}</Placeholder>.
            </p>
            {action("Finish signing up")}
            <p className="mt-3 text-xs text-muted-foreground">If your card was declined, try another card or contact your bank, then use the link above. Didn&apos;t start a signup? Ignore this email.</p>
          </div>
        ) : (
          <div className="mt-5">
            <h2 className="text-xl font-bold text-foreground">Here&apos;s a new access link</h2>
            <p className="mt-2 text-sm text-muted-foreground">You asked for a new link to set up your Pharmacy Books account. Your account and pharmacies are unchanged.</p>
            {action("Set up my account")}
            <p className="mt-3 text-xs text-muted-foreground">
              This link works once and expires in <Placeholder>{email.expiryLabel}</Placeholder>. Earlier links no longer work. Didn&apos;t request this? Ignore it, or contact <Placeholder>[SUPPORT EMAIL]</Placeholder>.
            </p>
          </div>
        )}
        <div className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
          <p>You received this because of Pharmacy Books account activity for this address. Questions? Write to [SUPPORT EMAIL].</p>
          <p className="mt-1">[COMPANY MAILING ADDRESS TBD] · {BRAND.footer}</p>
        </div>
      </div>
    </div>
  );
}
