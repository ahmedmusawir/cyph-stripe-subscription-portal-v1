import { cn } from "@/lib/utils";

// RadioCard (COMPONENT_MANIFEST §2): native radio inside a label; selected =
// border-2 primary, focus-within ring.
export function RadioCard({
  name,
  value,
  checked,
  onSelect,
  title,
  description,
  id,
}: {
  name: string;
  value: string;
  checked: boolean;
  onSelect: (value: string) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  id?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-[44px] cursor-pointer items-start gap-3 bg-card p-4 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-card",
        checked ? "border-2 border-primary" : "border border-border",
      )}
    >
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        className="mt-1 h-4 w-4 shrink-0"
      />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-foreground">{title}</span>
        {description ? <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span> : null}
      </span>
    </label>
  );
}
