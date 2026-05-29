import { Button } from "@/components/ui/button";
import type { RequestStatus } from "../_types/request.types";

// Backend remains source of truth for valid transitions. This map mirrors
// the allowed transitions so the UI only surfaces actions the backend will
// accept; anything the user sneaks through gets rejected server-side and
// surfaces via `error`.
const TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  NEW: ["SEEN", "ACCEPTED", "REJECTED", "CANCELLED"],
  SEEN: ["ACCEPTED", "REJECTED", "CANCELLED"],
  ACCEPTED: ["COMPLETED", "CANCELLED"],
  REJECTED: [],
  COMPLETED: [],
  CANCELLED: [],
};

const ACTION_LABEL: Record<RequestStatus, string> = {
  NEW: "Mark as new",
  SEEN: "Mark as seen",
  ACCEPTED: "Accept",
  REJECTED: "Reject",
  COMPLETED: "Mark completed",
  CANCELLED: "Cancel",
};

const DESTRUCTIVE_ACTIONS: ReadonlySet<RequestStatus> = new Set([
  "REJECTED",
  "CANCELLED",
]);

const CONFIRM_PROMPT: Partial<Record<RequestStatus, string>> = {
  REJECTED: "Reject this request? This cannot be undone.",
  CANCELLED: "Cancel this request? This cannot be undone.",
};

type ButtonVariant = "default" | "outline" | "destructive";

function variantFor(next: RequestStatus): ButtonVariant {
  if (DESTRUCTIVE_ACTIONS.has(next)) return "destructive";
  if (next === "ACCEPTED" || next === "COMPLETED") return "default";
  return "outline";
}

interface RequestStatusActionsProps {
  currentStatus: RequestStatus;
  isUpdating: boolean;
  error?: string | null;
  onUpdate: (next: RequestStatus) => void;
}

export function RequestStatusActions({
  currentStatus,
  isUpdating,
  error,
  onUpdate,
}: RequestStatusActionsProps) {
  const allowed = TRANSITIONS[currentStatus];

  if (allowed.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        No further actions available.
      </p>
    );
  }

  function handleClick(next: RequestStatus) {
    if (isUpdating) return;
    if (DESTRUCTIVE_ACTIONS.has(next)) {
      const prompt = CONFIRM_PROMPT[next] ?? "Are you sure?";
      // Browser confirm is intentional for MVP — no AlertDialog primitive in
      // the project today, and the spec forbids installing a new dialog package.
      // Replace with an inline confirmation once a primitive is added.
      if (!window.confirm(prompt)) return;
    }
    onUpdate(next);
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {allowed.map((next) => (
          <Button
            key={next}
            size="sm"
            variant={variantFor(next)}
            disabled={isUpdating}
            onClick={() => handleClick(next)}
          >
            {ACTION_LABEL[next]}
          </Button>
        ))}
      </div>
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
