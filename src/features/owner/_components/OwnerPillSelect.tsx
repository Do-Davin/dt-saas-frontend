import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PillOption {
  value: string;
  label: string;
}

interface OwnerPillSelectProps {
  label: string;
  options: PillOption[];
  value: string;
  onChange: (value: string) => void;
  leadingIcon?: LucideIcon;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}

export function OwnerPillSelect({
  label,
  options,
  value,
  onChange,
  leadingIcon: Icon,
  disabled = false,
  error,
  required = false,
}: OwnerPillSelectProps) {
  return (
    <div className={cn("space-y-2.5", disabled && "pointer-events-none opacity-60")}>
      <div className="flex items-center gap-1.5">
        {Icon ? (
          <Icon className={cn("size-[18px] shrink-0", error ? "text-destructive" : "text-primary")} strokeWidth={2.5} />
        ) : null}
        <span className={cn("text-sm font-black", error ? "text-destructive" : "text-primary")}>
          {label}
          {required ? (
            <span aria-hidden className="ml-0.5 text-destructive">*</span>
          ) : null}
        </span>
      </div>

      <div
        role="group"
        aria-label={label}
        className={cn(
          "flex flex-wrap gap-2 rounded-xl border-2 p-2.5 transition-colors duration-150",
          error ? "border-destructive/60 bg-destructive/5" : "border-transparent"
        )}
      >
        {options.map((opt) => {
          const selected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              disabled={disabled}
              onClick={() => onChange(opt.value)}
              aria-pressed={selected}
              className={cn(
                "rounded-xl border-2 px-3 py-1.5 text-sm font-bold",
                "transition-all duration-200 ease-out",
                selected
                  ? "border-primary bg-primary/10 text-primary shadow-sm"
                  : "border-input bg-card text-muted-foreground hover:border-primary hover:bg-primary/5 hover:text-primary hover:scale-[1.03]"
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}
