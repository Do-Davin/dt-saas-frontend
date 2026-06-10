import type { ReactNode } from "react";
import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import { OwnerStateBlock } from "./OwnerStateBlock";

interface OwnerPageStateProps {
  type: "loading" | "error" | "empty";
  title?: string;
  message?: string;
  action?: ReactNode;
}

const DEFAULT_TITLES: Record<OwnerPageStateProps["type"], string> = {
  loading: "Loading…",
  error: "Something went wrong",
  empty: "Nothing here yet",
};

const TYPE_ICON: Record<OwnerPageStateProps["type"], ReactNode> = {
  loading: <Loader2 className="size-8 animate-spin text-muted-foreground" />,
  error: <AlertCircle className="size-8 text-destructive" />,
  empty: <Inbox className="size-8 text-muted-foreground" />,
};

export function OwnerPageState({
  type,
  title,
  message,
  action,
}: OwnerPageStateProps) {
  const description: ReactNode = action ? (
    <>
      {message ?? null}
      <div className="mt-3">{action}</div>
    </>
  ) : (
    message
  );

  return (
    <OwnerStateBlock
      tone={type === "error" ? "error" : "neutral"}
      variant={type === "empty" ? "dashed" : "solid"}
      icon={TYPE_ICON[type]}
      title={title ?? DEFAULT_TITLES[type]}
      description={description}
    />
  );
}
