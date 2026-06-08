import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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

// Title shown in the AlertDialog for each destructive action.
const CONFIRM_TITLE: Partial<Record<RequestStatus, string>> = {
  REJECTED: "Reject this request?",
  CANCELLED: "Cancel this request?",
};

// Confirm button label — differs from ACTION_LABEL to avoid "Cancel" being
// used for both the action and the dismiss button in the same dialog.
const CONFIRM_ACTION_LABEL: Partial<Record<RequestStatus, string>> = {
  REJECTED: "Reject",
  CANCELLED: "Cancel request",
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
  const [pendingNext, setPendingNext] = useState<RequestStatus | null>(null);

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
      setPendingNext(next);
      return;
    }
    onUpdate(next);
  }

  return (
    <>
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

      <AlertDialog
        open={pendingNext !== null}
        onOpenChange={(open) => {
          if (!open) setPendingNext(null);
        }}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingNext
                ? (CONFIRM_TITLE[pendingNext] ?? "Are you sure?")
                : "Are you sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (pendingNext) onUpdate(pendingNext);
              }}
            >
              {pendingNext
                ? (CONFIRM_ACTION_LABEL[pendingNext] ?? ACTION_LABEL[pendingNext])
                : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
