import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import { useOwnerRequests } from "../_hooks/useOwnerRequests";
import { RequestStatusBadge } from "../_components/RequestStatusBadge";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
import type {
  CustomerRequestItemSummary,
  RequestType,
} from "../_types/request.types";

const TYPE_LABEL: Record<RequestType, string> = {
  ORDER: "Order",
  INQUIRY: "Inquiry",
  BOOKING: "Booking",
  SERVICE_REQUEST: "Service request",
};

export function OwnerRequestListPage() {
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const requests = useOwnerRequests(businessId);

  if (!businessId) {
    return (
      <OwnerPageState type="empty" title={noBusinessTitle} message={noBusinessDesc} />
    );
  }

  if (requests.status === "loading" || requests.status === "idle") {
    return <OwnerPageState type="loading" title="Loading requests…" />;
  }

  if (requests.status === "error") {
    return (
      <OwnerPageState
        type="error"
        title="Could not load requests"
        message={requests.message}
      />
    );
  }

  if (requests.items.length === 0) {
    return (
      <OwnerPageState
        type="empty"
        title="No customer requests yet"
        message="New customer requests will appear here."
      />
    );
  }

  return (
    <OwnerPage>
      <OwnerPageHeader
        title="Customer requests"
        actions={
          <span className="text-xs text-muted-foreground">
            {requests.items.length} total
          </span>
        }
      />
      <ul className="space-y-2">
        {requests.items.map((req) => (
          <li key={req.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">
                    {TYPE_LABEL[req.type] ?? req.type}
                  </span>
                  <RequestStatusBadge status={req.status} />
                </div>
                <div className="mt-1 text-sm text-foreground">
                  {req.customerName ?? "Unknown customer"}
                  {req.customerPhone ? ` · ${req.customerPhone}` : ""}
                </div>
                {req.items && req.items.length > 0 ? (
                  <div className="mt-1 text-xs text-muted-foreground truncate">
                    {summarizeItems(req.items)}
                  </div>
                ) : null}
              </div>
              <div className="shrink-0 text-right">
                <div className="text-xs text-muted-foreground">
                  {formatCreatedAt(req.createdAt)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="mt-2"
                >
                  <Link
                    to={`/owner/requests/${encodeURIComponent(req.id)}`}
                    aria-label={`View request ${req.id}`}
                  >
                    View
                  </Link>
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </OwnerPage>
  );
}

function summarizeItems(items: CustomerRequestItemSummary[]): string {
  const head = items
    .slice(0, 3)
    .map((it) => {
      const name = it.name ?? "Item";
      return it.quantity && it.quantity > 1 ? `${name} ×${it.quantity}` : name;
    })
    .join(", ");
  return items.length > 3 ? `${head} +${items.length - 3} more` : head;
}

function formatCreatedAt(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}
