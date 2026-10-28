"use client";

import { forwardRef } from "react";

// ErrorSummary (COMPONENT_MANIFEST §2): role="alert", focus target on failed
// submit, each entry links to its field.
export interface SummaryItem {
  fieldId: string;
  label: string;
  message: string;
}

export const ErrorSummary = forwardRef<HTMLDivElement, { items: SummaryItem[]; title?: string }>(function ErrorSummary(
  { items, title },
  ref,
) {
  if (items.length === 0) return null;
  const heading = title ?? `Please fix ${items.length} field${items.length === 1 ? "" : "s"} to continue`;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      data-testid="error-summary"
      className="mt-5 border-l-[3px] border-destructive bg-destructive/10 p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <p className="font-semibold text-foreground">{heading}</p>
      <ul className="mt-1 list-inside list-disc text-sm text-foreground">
        {items.map((item) => (
          <li key={item.fieldId}>
            <a
              href={`#${item.fieldId}`}
              className="portal-link"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(item.fieldId)?.focus();
              }}
            >
              {item.label}
            </a>{" "}
            — <span className="text-muted-foreground">{item.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
});

/** Map service field errors to summary rows in form order. */
export function summarize(
  errors: Record<string, string>,
  fields: readonly { key: string; fieldId: string; label: string }[],
): SummaryItem[] {
  return fields.filter((f) => errors[f.key]).map((f) => ({ fieldId: f.fieldId, label: f.label, message: errors[f.key] }));
}
