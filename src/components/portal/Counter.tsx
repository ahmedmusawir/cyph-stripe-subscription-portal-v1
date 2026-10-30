"use client";

// Store-count control (COMPONENT_MANIFEST §2): − / value / + with 44px targets,
// output aria-live, min 1. The page decides whether a reduction needs confirm.
export function Counter({
  id,
  value,
  min = 1,
  max,
  onChange,
  labelledBy,
}: {
  id: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (next: number) => void;
  labelledBy?: string;
}) {
  return (
    <div className="inline-flex shrink-0 items-stretch self-start border border-input" role="group" aria-labelledby={labelledBy}>
      <button
        type="button"
        className="grid h-11 w-11 place-items-center text-lg text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
        aria-label="Fewer pharmacies"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
      >
        <span aria-hidden="true">−</span>
      </button>
      <output id={id} className="grid w-14 place-items-center border-x border-input text-base font-semibold tabular-nums text-foreground" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className="grid h-11 w-11 place-items-center text-lg text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-40"
        aria-label="More pharmacies"
        disabled={max !== undefined && value >= max}
        onClick={() => onChange(value + 1)}
      >
        <span aria-hidden="true">+</span>
      </button>
    </div>
  );
}
