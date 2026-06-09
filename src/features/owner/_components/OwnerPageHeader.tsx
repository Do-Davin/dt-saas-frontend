import type { ReactNode } from "react";

interface OwnerPageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function OwnerPageHeader({
  title,
  description,
  actions,
}: OwnerPageHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
