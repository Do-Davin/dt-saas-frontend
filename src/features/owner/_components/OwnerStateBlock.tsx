import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface OwnerStateBlockProps {
  title: string;
  description?: ReactNode;
  tone?: "neutral" | "error";
  icon?: ReactNode;
  variant?: "solid" | "dashed";
}

export function OwnerStateBlock({
  title,
  description,
  tone = "neutral",
  icon,
  variant = "solid",
}: OwnerStateBlockProps) {
  const isError = tone === "error";
  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live="polite"
      className={cn(
        "rounded-lg border px-6 py-12 text-center",
        variant === "dashed" && "border-dashed",
        isError
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-card"
      )}
    >
      {icon ? (
        <div className="mb-4 flex justify-center">{icon}</div>
      ) : null}
      <h3 className="text-sm font-medium tracking-tight text-foreground">
        {title}
      </h3>
      {description ? (
        <div className="mt-1.5 text-sm text-muted-foreground">{description}</div>
      ) : null}
    </div>
  );
}
