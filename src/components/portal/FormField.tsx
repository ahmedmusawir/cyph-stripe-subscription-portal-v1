"use client";

import { forwardRef } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// FormField helpers (COMPONENT_MANIFEST §2): visible label, required marker
// with sr-only text, help + inline error wired through aria-describedby, and
// aria-invalid. Native inputs/selects styled with tokens; no new library.
const CONTROL =
  "flex h-11 w-full border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive disabled:opacity-50";

interface FieldShellProps {
  id: string;
  label: React.ReactNode;
  required?: boolean;
  optionalNote?: string;
  help?: React.ReactNode;
  error?: string;
  className?: string;
  children: (describedBy: string | undefined) => React.ReactNode;
}

function FieldShell({ id, label, required, optionalNote, help, error, className, children }: FieldShellProps) {
  const ids = [help ? `${id}-help` : null, error ? `${id}-err` : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("min-w-0 space-y-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required ? (
          <>
            {" "}
            <span className="text-destructive" aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </>
        ) : null}
        {optionalNote ? <span className="font-normal text-muted-foreground"> {optionalNote}</span> : null}
      </label>
      {children(ids)}
      {help ? (
        <p id={`${id}-help`} className="text-xs text-muted-foreground">
          {help}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-err`} className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

type InputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "onChange" | "value"> & {
  id: string;
  label: React.ReactNode;
  value: string;
  onValue: (v: string) => void;
  help?: React.ReactNode;
  error?: string;
  optionalNote?: string;
  shellClassName?: string;
};

export const TextField = forwardRef<HTMLInputElement, InputProps>(function TextField(
  { id, label, value, onValue, help, error, required, optionalNote, shellClassName, className, ...rest },
  ref,
) {
  return (
    <FieldShell id={id} label={label} required={required} optionalNote={optionalNote} help={help} error={error} className={shellClassName}>
      {(describedBy) => (
        <input
          ref={ref}
          id={id}
          name={id}
          value={value}
          onChange={(e) => onValue(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={cn(CONTROL, className)}
          {...rest}
        />
      )}
    </FieldShell>
  );
});

type SelectProps = {
  id: string;
  label: React.ReactNode;
  value: string;
  onValue: (v: string) => void;
  options: readonly { value: string; label: string }[];
  help?: React.ReactNode;
  error?: string;
  required?: boolean;
  shellClassName?: string;
};

export function SelectField({ id, label, value, onValue, options, help, error, required, shellClassName }: SelectProps) {
  return (
    <FieldShell id={id} label={label} required={required} help={help} error={error} className={shellClassName}>
      {(describedBy) => (
        <div className="relative">
          <select
            id={id}
            name={id}
            value={value}
            onChange={(e) => onValue(e.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            className={cn(CONTROL, "appearance-none pr-9")}
          >
            <option value="">Choose…</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
    </FieldShell>
  );
}

export function RequiredNote() {
  return (
    <p className="text-xs text-muted-foreground">
      <span className="text-destructive" aria-hidden="true">*</span> Required
    </p>
  );
}
