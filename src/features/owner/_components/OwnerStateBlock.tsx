import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OwnerStateBlockProps {
  title: string;
  description?: ReactNode;
  tone?: "neutral" | "error";
}

// Lightweight shared block for loading / empty / error / setup messaging on
// the owner dashboard. Intentionally small — when more variants are needed
// (icons, retry actions), promote rather than expand this in-place.
export function OwnerStateBlock({
  title,
  description,
  tone = "neutral",
}: OwnerStateBlockProps) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "rounded-lg border p-6 text-center",
        isError
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-card"
      )}
    >
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {description ? (
        <div className="mt-2 text-sm text-muted-foreground">{description}</div>
      ) : null}
    </div>
  );
}
