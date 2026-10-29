"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, DemoNotice } from "../Alert";
import { ErrorSummary, summarize } from "../ErrorSummary";
import { RequiredNote } from "../FormField";
import { PageContainer, ViewSkeleton } from "../Loading";
import { Pill } from "../Pill";
import { PHARMACY_SUMMARY_FIELDS, PharmacyFields, toDraft, toForm, type PharmacyForm } from "../PharmacyFields";
import { AccountGate } from "./AccountGate";
import { useAccount } from "@/services/portal";

export function Crumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {trail.map((t, i) => (
          <li key={t.label} className="flex items-center gap-1">
            {i > 0 ? <span aria-hidden="true">›</span> : null}
            {t.href ? (
              <Link href={t.href} className="portal-link inline-flex min-h-[44px] items-center">{t.label}</Link>
            ) : (
              <span aria-current="page" className="text-foreground">{t.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

// C09 Add a store (+ C16 duplicate). Synthetic capability check happens in the
// service; this view is reachable only behind the real admin/superadmin gate.
export function AddStoreView() {
  const router = useRouter();
  const { state, hydrated, account } = useAccount();
  const [form, setForm] = useState<PharmacyForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicate, setDuplicate] = useState<{ ncpdp: string; own: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const [denied, setDenied] = useState<string | null>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const dupRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<{ n: number; target: "summary" | "dup" } | null>(null);

  useEffect(() => {
    if (hydrated && !form) setForm(toForm(state.addDraft.pharmacy));
  }, [hydrated, form, state.addDraft.pharmacy]);

  useEffect(() => {
    if (focus) (focus.target === "dup" ? dupRef.current : summaryRef.current)?.focus();
  }, [focus]);

  if (!hydrated || !form) return <PageContainer><ViewSkeleton /></PageContainer>;

  const ownerName = state.account.ownerName;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !form) return;
    setBusy(true);
    const r = await account.savePharmacy(toDraft(form));
    if (r.ok) {
      const q = await account.requestQuote();
      setBusy(false);
      router.push(q.ok ? "/demo/stores/confirm" : "/demo/stores/confirm?quote=error");
      return;
    }
    setBusy(false);
    if (r.code === "denied" || r.code === "conflict") {
      setDenied(r.message);
      return;
    }
    setErrors(r.fieldErrors ?? {});
    if (r.code === "duplicate") {
      setDuplicate({ ncpdp: form.ncpdp, own: /your account/.test(r.message) });
      setFocus({ n: Date.now(), target: "dup" });
    } else {
      setDuplicate(null);
      setFocus({ n: Date.now(), target: "summary" });
    }
  }

  function cancel() {
    if (form) account.keepDraft(toDraft(form));
    router.push("/dashboard");
  }

  return (
    <AccountGate>
      <PageContainer>
        <DemoNotice />
        <Crumbs trail={[{ label: "Account & Billing", href: "/dashboard" }, { label: "Add a store" }]} />
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Add a store · Step 1 of 2</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
          <h1 className="text-[26px] font-bold leading-tight text-foreground md:text-[32px]">Add a pharmacy to your account</h1>
          <Pill tone="info">Joins your existing subscription</Pill>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          It joins your existing Standard subscription. You&apos;ll see the exact price change on the next step before anything is charged. Identifiers identify the pharmacy; ownership checks are separate.
        </p>

        {state.addDraftRestored ? (
          <Alert
            tone="info"
            className="mt-5"
            title="We restored your unfinished store"
            action={
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  account.startOver();
                  setForm(toForm(undefined));
                  setErrors({});
                }}
              >
                Start over
              </Button>
            }
          >
            Details you entered earlier are filled in below. Nothing has been quoted or charged.
          </Alert>
        ) : null}
        {denied ? <Alert tone="destructive" className="mt-5" title="This store can't be added right now">{denied}</Alert> : null}
        {duplicate ? (
          <div ref={dupRef} tabIndex={-1} className="mt-5 focus-visible:outline-none" data-testid="duplicate-alert">
            <Alert tone="destructive" title="This pharmacy is already registered">
              <p>
                A Pharmacy Books account already uses NCPDP <span className="font-medium text-foreground">{duplicate.ncpdp}</span> — that may be a store already on your own plan, or another account. For security we can&apos;t say which. Your details are kept below; nothing has been quoted or charged.
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>
                  Check <Link href="/dashboard" className="portal-link">Pharmacies on this plan</Link> in Account &amp; Billing.
                </li>
                <li>Believe this pharmacy is yours? Contact [SUPPORT EMAIL] and we&apos;ll review it (ownership review process [TBD]).</li>
                <li>Typo? Check the number and try again.</li>
              </ul>
            </Alert>
          </div>
        ) : (
          <ErrorSummary ref={summaryRef} items={summarize(errors, PHARMACY_SUMMARY_FIELDS)} />
        )}

        <form className="mt-6 space-y-6" noValidate onSubmit={submit}>
          <RequiredNote />
          <PharmacyFields form={form} onChange={setForm} errors={errors} ownerName={ownerName} context="add" />
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button type="button" variant="outline" onClick={cancel}>Cancel</Button>
            <Button type="submit" className="px-6 sm:min-w-[12rem]" disabled={busy} aria-busy={busy || undefined} data-testid="review-price">
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Getting your quote…
                </>
              ) : duplicate ? (
                "Fix and try again"
              ) : (
                "Review price change"
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Cancel keeps a draft so you can come back. Nothing is quoted or charged until you confirm on the next step.</p>
        </form>
      </PageContainer>
    </AccountGate>
  );
}
