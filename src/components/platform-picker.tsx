import { cn } from "@/lib/utils";
import { BrandIcon, brandFor } from "./brand-icons";

/** Accessible radio-style platform buttons with brand logos. */
export function PlatformPicker({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string;
  label: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" aria-labelledby={id} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {options.map((o) => {
        const on = o === value;
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(o)}
            className={cn(
              "flex min-h-11 min-w-0 items-center gap-2 rounded-lg border bg-background px-3 text-left text-sm font-medium transition-all active:scale-[0.98]",
              on ? "border-orange bg-orange-soft text-foreground ring-2 ring-orange/25" : "hover:border-foreground/20 hover:bg-muted",
            )}
          >
            <BrandIcon brand={brandFor(o)} className="h-4 w-4" />
            <span className="truncate">{o}</span>
          </button>
        );
      })}
    </div>
  );
}
