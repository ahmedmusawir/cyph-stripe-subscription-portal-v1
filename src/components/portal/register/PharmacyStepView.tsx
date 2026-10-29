"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, DemoNotice } from "../Alert";
import { ErrorSummary, summarize } from "../ErrorSummary";
import { RequiredNote } from "../FormField";
import { PageContainer, ViewSkeleton } from "../Loading";
import { Pill } from "../Pill";
import { PHARMACY_SUMMARY_FIELDS, PharmacyFields, toDraft, toForm, type PharmacyForm } from "../PharmacyFields";
import { Stepper } from "../Stepper";
import { MISSING, MissingContextNotice } from "./MissingContext";
import { firstIncomplete, registration, useRegistration } from "@/services/portal";

// C03 Pharmacy n of N (repeat for every requested store) + C16 duplicate.
export function PharmacyStepView({ storeParam, notice }: { storeParam: number; notice: boolean }) {
  const router = useRouter();
  const { state, hydrated } = useRegistration();
  const count = state.draft.requestedStoreCount;
  const index = storeParam - 1;
  const valid = Number.isInteger(index) && index >= 0 && index < count;
  const [form, setForm] = useState<PharmacyForm | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicate, setDuplicate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const dupRef = useRef<HTMLDivElement>(null);
  const [focus, setFocus] = useState<{ n: number; target: "summary" | "dup" } | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    const gate = firstIncomplete(state.draft);
    if (gate.step === "plan" || gate.step === "owner") {
      router.replace(`/demo/register/${gate.step}?notice=${MISSING}`);
      return;
    }
    if (!valid) {
      const target = gate.step === "pharmacy" ? (gate.index ?? 0) + 1 : 1;
      router.replace(`/demo/register/pharmacies?store=${target}&notice=${MISSING}`);
      return;
    }
    setForm(toForm(state.draft.pharmacies[index]));
    setErrors({});
    setDuplicate(null);
    // Reload the form only when the step changes, not on every save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, index, valid]);

  useEffect(() => {
    if (!focus) return;
    (focus.target === "dup" ? dupRef.current : summaryRef.current)?.focus();
  }, [focus]);

  if (!hydrated || !form || !valid) return <PageContainer><ViewSkeleton /></PageContainer>;

  const ownerName = [state.draft.owner.firstName, state.draft.owner.lastName].filter(Boolean).join(" ") || "you";
  const last = index === count - 1;
  const title = count === 1 ? "Your pharmacy" : `Pharmacy ${index + 1} of ${count}`;
  const chip = count === 1 ? "1 of 1" : last ? "Last one" : `${count - index - 1} more after this`;
  const cta = duplicate ? "Fix and try again" : last ? "Continue to review" : `Continue to pharmacy ${index + 2} of ${count}`;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !form) return;
    setSaving(true);
    const result = await registration.savePharmacy(index, toDraft(form));
    setSaving(false);
    if (result.ok) {
      setErrors({});
      setDuplicate(null);
      router.push(last ? "/demo/register/review" : `/demo/register/pharmacies?store=${index + 2}`);
      return;
    }
    setErrors(result.fieldErrors ?? {});
    if (result.code === "duplicate") {
      setDuplicate(form.ncpdp);
      setFocus({ n: Date.now(), target: "dup" });
    } else {
      setDuplicate(null);
      setFocus({ n: Date.now(), target: "summary" });
    }
  }

  function back() {
    if (form) registration.keepPharmacy(index, toDraft(form));
    router.push(index === 0 ? "/demo/register/owner" : `/demo/register/pharmacies?store=${index}`);
  }

  return (
    <PageContainer>
      <DemoNotice />
      <MissingContextNotice show={notice} />
      <Stepper current={3} />
      <div className="flex min-w-0 flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Step 3 · Pharmacy</p>
          <h1 className="mt-1 text-[26px] font-bold leading-tight text-foreground md:text-[32px]">{title}</h1>
        </div>
        <Pill tone="muted">{chip}</Pill>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        We use these details to identify your pharmacy and set up its store. Ownership checks are separate — entering an identifier doesn&apos;t prove ownership. You can add more stores after you&apos;re set up.
      </p>

      {duplicate ? (
        <div ref={dupRef} tabIndex={-1} className="mt-5 focus-visible:outline-none" data-testid="duplicate-alert">
          <Alert tone="destructive" title="This pharmacy is already registered">
            <p>
              A Pharmacy Books account already uses NCPDP <span className="font-medium text-foreground">{duplicate}</span>. For security we can&apos;t show whose account it is. Your details are kept below; nothing has been charged.
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>
                Already subscribed? <Link href="/login" className="portal-link">Sign in</Link> and use Add a store.
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
        <PharmacyFields form={form} onChange={setForm} errors={errors} ownerName={ownerName} context="signup" />
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="outline" onClick={back}>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back
          </Button>
          <Button type="submit" className="px-6 sm:min-w-[12rem]" disabled={saving} aria-busy={saving || undefined}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              cta
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Going back keeps what you&apos;ve entered on every pharmacy.</p>
      </form>
    </PageContainer>
  );
}
