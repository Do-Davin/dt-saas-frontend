import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RequestStatus } from "../_types/request.types";

const STATUS_LABEL: Record<RequestStatus, string> = {
  NEW: "New",
  SEEN: "Seen",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

// Mapped to the small set of variants the project already ships. Terminal
// statuses (COMPLETED, CANCELLED) use the muted `outline` look so active rows
// remain visually dominant; REJECTED uses `destructive` to read at a glance.
const STATUS_VARIANT: Record<RequestStatus, BadgeVariant> = {
  NEW: "default",
  SEEN: "secondary",
  ACCEPTED: "default",
  REJECTED: "destructive",
  COMPLETED: "outline",
  CANCELLED: "outline",
};

const TERMINAL_MUTE_CLASS = "text-muted-foreground";

export function RequestStatusBadge({ status }: { status: RequestStatus }) {
  const label = STATUS_LABEL[status];
  const variant = STATUS_VARIANT[status];
  const isTerminal = status === "COMPLETED" || status === "CANCELLED";
  return (
    <Badge
      variant={variant}
      className={cn(isTerminal && TERMINAL_MUTE_CLASS)}
      aria-label={`Status: ${label}`}
    >
      {label}
    </Badge>
  );
}
