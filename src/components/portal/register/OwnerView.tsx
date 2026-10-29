"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { OwnerDraft } from "@/types/portal/contract";
import { Alert, DemoNotice } from "../Alert";
import { ErrorSummary, summarize } from "../ErrorSummary";
import { RequiredNote, TextField } from "../FormField";
import { PageContainer, ViewSkeleton } from "../Loading";
import { PageHeader } from "../PageHeader";
import { Stepper } from "../Stepper";
import { MissingContextNotice } from "./MissingContext";
import { OWNER_DECLARATION, registration, useRegistration } from "@/services/portal";

const FIELDS = [
  { key: "firstName", fieldId: "first", label: "First name" },
  { key: "lastName", fieldId: "last", label: "Last name" },
  { key: "email", fieldId: "email", label: "Work email" },
  { key: "mobile", fieldId: "mobile", label: "Mobile phone" },
  { key: "ownerDeclaration", fieldId: "owner-declaration", label: "Owner declaration" },
] as const;

type Form = { firstName: string; lastName: string; email: string; mobile: string; ownerDeclarationAccepted: boolean; legalBusinessName: string };

// C02 Owner details (+ C16 existing-email branch).
export function OwnerView({ notice }: { notice: boolean }) {
  const router = useRouter();
  const { state, hydrated } = useRegistration();
  const [form, setForm] = useState<Form | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [existing, setExisting] = useState(false);
  const [saving, setSaving] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const [focusSummary, setFocusSummary] = useState(0);

  useEffect(() => {
    if (hydrated && !form) {
      const o = state.draft.owner;
      setForm({
        firstName: o.firstName ?? "",
        lastName: o.lastName ?? "",
        email: o.email ?? "",
        mobile: o.mobile ?? "",
        ownerDeclarationAccepted: o.ownerDeclarationAccepted === true,
        legalBusinessName: o.legalBusinessName ?? "",
      });
    }
  }, [hydrated, form, state.draft.owner]);

  useEffect(() => {
    if (focusSummary) summaryRef.current?.focus();
  }, [focusSummary]);

  if (!hydrated || !form) return <PageContainer><ViewSkeleton /></PageContainer>;

  const set = (k: Exclude<keyof Form, "ownerDeclarationAccepted">) => (v: string) => setForm({ ...form, [k]: v });

  function toOwner(f: Form): Partial<OwnerDraft> {
    return {
      firstName: f.firstName,
      lastName: f.lastName,
      email: f.email,
      mobile: f.mobile,
      ownerDeclarationAccepted: f.ownerDeclarationAccepted,
      legalBusinessName: f.legalBusinessName || undefined,
    };
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (saving || !form) return;
    setSaving(true);
    const result = await registration.saveOwner(toOwner(form));
    setSaving(false);
    if (result.ok) {
      router.push("/demo/register/pharmacies?store=1");
      return;
    }
    if (result.code === "conflict") {
      setErrors({});
      setExisting(true);
      return;
    }
    setExisting(false);
    setErrors(result.fieldErrors ?? {});
    setFocusSummary((n) => n + 1);
  }

  return (
    <PageContainer>
      <DemoNotice />
      <MissingContextNotice show={notice} />
      <Stepper current={2} />
      <PageHeader
        eyebrow="Step 2 · Owner"
        title="Tell us about you"
        lead="You will be the billing owner for this account. We send your access link to this email after payment."
      />
      <ErrorSummary ref={summaryRef} items={summarize(errors, FIELDS)} />
      {existing ? (
        <Alert
          tone="info"
          className="mt-5"
          title="This email may already have a Pharmacy Books account"
          action={
            <>
              <Button asChild>
                <Link href="/login">Sign in instead</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setExisting(false);
                  setForm({ ...form, email: "" });
                  emailRef.current?.focus();
                }}
              >
                Use a different email
              </Button>
            </>
          }
        >
          If that&apos;s you, sign in and use <span className="font-medium text-foreground">Add a store</span> — you won&apos;t need a second subscription. Otherwise use a different work email. For security we don&apos;t show whose account it is.
        </Alert>
      ) : null}

      <form className="mt-6 space-y-6" noValidate onSubmit={submit}>
        <RequiredNote />
        <div className="grid min-w-0 gap-5 border border-border bg-card p-4 sm:grid-cols-2 sm:p-5">
          <TextField id="first" label="First name" required autoComplete="given-name" value={form.firstName} onValue={set("firstName")} error={errors.firstName} />
          <TextField id="last" label="Last name" required autoComplete="family-name" value={form.lastName} onValue={set("lastName")} error={errors.lastName} />
          <TextField
            ref={emailRef}
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            label="Work email"
            required
            shellClassName="sm:col-span-2"
            value={form.email}
            onValue={set("email")}
            error={errors.email}
            help="Your sign-in and access link go here. Use an inbox you check daily."
          />
          <TextField id="mobile" type="tel" inputMode="tel" autoComplete="tel" label="Mobile phone" required value={form.mobile} onValue={set("mobile")} error={errors.mobile} />
          <TextField
            id="legal"
            label="Legal business name"
            optionalNote="(for invoices, optional)"
            autoComplete="organization"
            shellClassName="sm:col-span-2"
            value={form.legalBusinessName}
            onValue={set("legalBusinessName")}
            help="The name that should appear on receipts. Leave blank to use your pharmacy's name."
          />
        </div>
        <fieldset className="min-w-0 border border-border bg-card p-4 sm:p-5" data-testid="owner-declaration-panel">
          <legend className="sr-only">Owner declaration (required)</legend>
          <label htmlFor="owner-declaration" className="flex min-h-[44px] cursor-pointer items-start gap-3 text-sm text-foreground">
            <input
              id="owner-declaration"
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0"
              checked={form.ownerDeclarationAccepted}
              onChange={(e) => setForm({ ...form, ownerDeclarationAccepted: e.target.checked })}
              aria-required="true"
              aria-invalid={errors.ownerDeclaration ? true : undefined}
              aria-describedby={["owner-declaration-help", errors.ownerDeclaration ? "owner-declaration-err" : null].filter(Boolean).join(" ")}
            />
            <span>
              {OWNER_DECLARATION} <span className="text-destructive" aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </span>
          </label>
          <p id="owner-declaration-help" className="ml-8 mt-1 text-xs text-muted-foreground">
            Registration is for pharmacy owners only. This is your own declaration: email and payment don&apos;t prove ownership, and any ownership check happens separately. It is separate from the terms and payment agreements you&apos;ll see before checkout.
          </p>
          {errors.ownerDeclaration ? (
            <p id="owner-declaration-err" className="ml-8 mt-1 flex items-center gap-1.5 text-xs font-medium text-destructive">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {errors.ownerDeclaration}
            </p>
          ) : null}
        </fieldset>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              registration.keepOwner(toOwner(form));
              router.push("/demo/register/plan");
            }}
          >
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
              "Continue"
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Going back keeps what you&apos;ve entered. We save a draft as you go so you can return to it.</p>
      </form>
    </PageContainer>
  );
}
