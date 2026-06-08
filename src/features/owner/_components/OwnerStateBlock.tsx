import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OwnerStateBlockProps {
  title: string;
  description?: ReactNode;
  tone?: "neutral" | "error";
  icon?: ReactNode;
}

export function OwnerStateBlock({
  title,
  description,
  tone = "neutral",
  icon,
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
      {icon ? (
        <div
          className={cn(
            "mx-auto mb-3 flex size-10 items-center justify-center rounded-full",
            isError
              ? "bg-destructive/10 text-destructive"
              : "bg-primary/10 text-primary"
          )}
        >
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {description ? (
        <div className="mt-2 text-sm text-muted-foreground">{description}</div>
      ) : null}
    </div>
  );
}
