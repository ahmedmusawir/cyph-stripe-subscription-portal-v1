"use client";

import type { PharmacyDraft } from "@/types/portal/contract";
import { SelectField, TextField } from "./FormField";
import { RadioCard } from "./RadioCard";
import { US_STATE_NAMES } from "@/services/portal";

// Shared pharmacy form (C03 signup, C09 add-store): same fields, validation
// lives in the service. Identifiers stay strings (leading zeros kept).
export interface PharmacyForm {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  ncpdp: string;
  npi: string;
  phone: string;
  software: string;
  softwareOther: string;
  admin: "owner" | "other";
  adminName: string;
  adminEmail: string;
}

export function toForm(p: Partial<PharmacyDraft> | undefined): PharmacyForm {
  const a = p?.adminAssignment;
  return {
    name: p?.name ?? "",
    street: p?.street ?? "",
    city: p?.city ?? "",
    state: p?.state ?? "",
    zip: p?.zip ?? "",
    ncpdp: p?.ncpdp ?? "",
    npi: p?.npi ?? "",
    phone: p?.phone ?? "",
    software: p?.software ?? "",
    softwareOther: p?.softwareOther ?? "",
    admin: a?.kind === "owner" ? "owner" : a?.kind === "other" ? "other" : "owner",
    adminName: a?.kind === "other" ? a.fullName : "",
    adminEmail: a?.kind === "other" ? a.email : "",
  };
}

export function toDraft(f: PharmacyForm): Partial<PharmacyDraft> {
  return {
    name: f.name,
    street: f.street,
    city: f.city,
    state: f.state,
    zip: f.zip.trim(),
    ncpdp: f.ncpdp.trim(),
    npi: f.npi.trim(),
    phone: f.phone,
    software: (f.software || undefined) as PharmacyDraft["software"] | undefined,
    softwareOther: f.software === "Other" ? f.softwareOther : undefined,
    adminAssignment: f.admin === "owner" ? { kind: "owner" } : { kind: "other", fullName: f.adminName, email: f.adminEmail.trim() },
  };
}

export const PHARMACY_SUMMARY_FIELDS = [
  { key: "name", fieldId: "ph-name", label: "Pharmacy name" },
  { key: "street", fieldId: "ph-street", label: "Street address" },
  { key: "city", fieldId: "ph-city", label: "City" },
  { key: "state", fieldId: "ph-state", label: "State" },
  { key: "zip", fieldId: "ph-zip", label: "ZIP" },
  { key: "ncpdp", fieldId: "ph-ncpdp", label: "NCPDP number" },
  { key: "npi", fieldId: "ph-npi", label: "NPI" },
  { key: "phone", fieldId: "ph-phone", label: "Store phone" },
  { key: "software", fieldId: "ph-software", label: "Pharmacy software" },
  { key: "softwareOther", fieldId: "ph-software-other", label: "Software name" },
  { key: "adminName", fieldId: "ph-admin-name", label: "Admin's full name" },
  { key: "adminEmail", fieldId: "ph-admin-email", label: "Admin's email" },
] as const;

const SOFTWARE = [
  { value: "Liberty", label: "Liberty" },
  { value: "Pioneer", label: "Pioneer" },
  { value: "Other", label: "Other" },
] as const;
const STATES = US_STATE_NAMES.map((s) => ({ value: s, label: s }));

export function PharmacyFields({
  form,
  onChange,
  errors,
  ownerName,
  context,
}: {
  form: PharmacyForm;
  onChange: (next: PharmacyForm) => void;
  errors: Record<string, string>;
  ownerName: string;
  context: "signup" | "add";
}) {
  const set = (k: keyof PharmacyForm) => (v: string) => onChange({ ...form, [k]: v });
  return (
    <>
      <fieldset className="grid min-w-0 gap-5 border border-border bg-card p-4 sm:grid-cols-6 sm:p-5">
        <legend className="sr-only">Pharmacy details</legend>
        <p className="text-sm font-semibold text-foreground sm:col-span-6" aria-hidden="true">Pharmacy details</p>
        <TextField id="ph-name" label="Pharmacy name" required shellClassName="sm:col-span-6" value={form.name} onValue={set("name")} error={errors.name} />
        <TextField id="ph-street" label="Street address" required autoComplete="street-address" shellClassName="sm:col-span-6" value={form.street} onValue={set("street")} error={errors.street} />
        <TextField id="ph-city" label="City" required shellClassName="sm:col-span-3" value={form.city} onValue={set("city")} error={errors.city} />
        <SelectField id="ph-state" label="State" required shellClassName="sm:col-span-2" value={form.state} onValue={set("state")} options={STATES} error={errors.state} />
        <TextField id="ph-zip" label="ZIP" required inputMode="numeric" autoComplete="postal-code" maxLength={5} shellClassName="sm:col-span-1" value={form.zip} onValue={set("zip")} error={errors.zip} />
        <TextField
          id="ph-ncpdp"
          label="NCPDP number"
          required
          inputMode="numeric"
          maxLength={7}
          shellClassName="sm:col-span-3"
          value={form.ncpdp}
          onValue={set("ncpdp")}
          error={errors.ncpdp}
          help="7 digits. Identifies the pharmacy; not proof of ownership."
        />
        <TextField id="ph-npi" label="NPI" required inputMode="numeric" maxLength={10} shellClassName="sm:col-span-3" value={form.npi} onValue={set("npi")} error={errors.npi} help="10 digits." />
        <TextField id="ph-phone" label="Store phone" required type="tel" inputMode="tel" shellClassName="sm:col-span-3" value={form.phone} onValue={set("phone")} error={errors.phone} />
        <SelectField
          id="ph-software"
          label="Pharmacy software"
          required
          shellClassName="sm:col-span-3"
          value={form.software}
          onValue={set("software")}
          options={SOFTWARE}
          error={errors.software}
          help="We connect to your software after setup. We never ask for your software password here."
        />
        {form.software === "Other" ? (
          <TextField id="ph-software-other" label="Software name" required shellClassName="sm:col-span-6" value={form.softwareOther} onValue={set("softwareOther")} error={errors.softwareOther} />
        ) : null}
      </fieldset>

      <fieldset className="min-w-0 space-y-3 border border-border bg-card p-4 sm:p-5">
        <legend className="sr-only">Who will be this store&apos;s admin? (required)</legend>
        <p className="text-sm font-semibold text-foreground" aria-hidden="true">
          Who will be this store&apos;s admin? <span className="text-destructive">*</span>
        </p>
        <p className="text-xs text-muted-foreground">
          Each store has one designated admin, who invites the team and manages the store in OwedBook. Either way, you keep account ownership and billing.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <RadioCard
            name="admin"
            value="owner"
            checked={form.admin === "owner"}
            onSelect={() => onChange({ ...form, admin: "owner" })}
            title={`Me (${ownerName})`}
            description="You also manage this store as its admin, in addition to owning the account."
          />
          <RadioCard
            name="admin"
            value="other"
            checked={form.admin === "other"}
            onSelect={() => onChange({ ...form, admin: "other" })}
            title="Someone else"
            description={
              context === "signup"
                ? "You appoint a store admin and we'll ask for their name and email. They get a separate store invitation after payment; you still get your own access link. This doesn't transfer ownership, billing or permission to buy more stores."
                : "You appoint a store admin; they get a store invitation once the store is added. Ownership, billing and adding stores stay with you."
            }
          />
        </div>
        {form.admin === "other" ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField id="ph-admin-name" label="Admin's full name" required value={form.adminName} onValue={set("adminName")} error={errors.adminName} />
            <TextField id="ph-admin-email" label="Admin's email" required type="email" inputMode="email" value={form.adminEmail} onValue={set("adminEmail")} error={errors.adminEmail} />
          </div>
        ) : null}
      </fieldset>

      <div className="border-l-[3px] border-info bg-info/10 p-3 text-sm" role="note">
        <p className="font-semibold text-foreground">Business details only</p>
        <p className="text-muted-foreground">Never enter patient names or prescription information here.</p>
      </div>
    </>
  );
}
