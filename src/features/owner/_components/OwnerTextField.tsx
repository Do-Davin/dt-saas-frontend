import { useState, useId } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface OwnerTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  name?: string;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  leadingIcon?: LucideIcon;
}

export function OwnerTextField({
  label,
  value,
  onChange,
  name,
  type = "text",
  required = false,
  disabled = false,
  error,
  leadingIcon: Icon,
}: OwnerTextFieldProps) {
  const id = useId();
  const [isFocused, setIsFocused] = useState(false);
  const isFloated = isFocused || value.length > 0;

  return (
    <div className={cn(disabled && "pointer-events-none opacity-60")}>
      <div className="relative">
        {/*
          Input background is bg-card (white) so the floating label's bg-card
          mask seamlessly cuts through the border with no color mismatch.
          No pt/pb override — text is naturally vertically centered by the browser.
        */}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "h-14 w-full rounded-xl border bg-card text-sm font-semibold text-primary outline-none",
            "transition-all duration-150",
            Icon ? "pl-10 pr-3" : "px-3",
            error
              ? "border-destructive ring-1 ring-destructive/20"
              : isFocused
              ? "border-primary ring-1 ring-primary/20"
              : "border-input hover:border-primary/40"
          )}
        />

        {/* Icon stays locked to the vertical center of the input at all times */}
        {Icon ? (
          <div
            className={cn(
              "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-150",
              error
                ? "text-destructive"
                : isFocused
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            <Icon className="size-[18px]" strokeWidth={2.5} />
          </div>
        ) : null}

        {/*
          Label mechanics:
          - Normal: sits at the vertical center beside the icon (left-10 when
            icon present, left-3 otherwise), acting like a placeholder.
          - Floated: slides diagonally up-left to left-3 top-0 so its center
            sits on the top border line, near the icon's left edge.
            bg-card px-1 masks the border to create the embedded-gap effect.
          - transition-all animates top, left, font-size, and background together.
        */}
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute select-none transition-all duration-150",
            isFloated
              ? "left-3 top-0 -translate-y-1/2 bg-card px-1 text-[11px] font-semibold"
              : cn(
                  "top-1/2 -translate-y-1/2 text-sm font-normal",
                  Icon ? "left-10" : "left-3"
                ),
            error
              ? "text-destructive"
              : isFocused
              ? "text-primary"
              : isFloated
              ? "text-zinc-500"
              : "text-muted-foreground"
          )}
        >
          {label}
          {required ? (
            <span aria-hidden className="ml-0.5 text-destructive">
              *
            </span>
          ) : null}
        </label>
      </div>

      {error ? (
        <p id={`${id}-err`} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
