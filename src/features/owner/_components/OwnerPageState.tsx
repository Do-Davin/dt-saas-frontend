import type { ReactNode } from "react";
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
      title={title ?? DEFAULT_TITLES[type]}
      description={description}
    />
  );
}
