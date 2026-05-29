import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useOwnerRequestDetail } from "../_hooks/useOwnerRequestDetail";
import { RequestStatusBadge } from "../_components/RequestStatusBadge";
import { RequestStatusActions } from "../_components/RequestStatusActions";
import { OwnerStateBlock } from "../_components/OwnerStateBlock";
import type {
  CustomerRequestDetail,
  CustomerRequestDetailItem,
  RequestStatus,
  RequestType,
} from "../_types/request.types";

const TYPE_LABEL: Record<RequestType, string> = {
  ORDER: "Order",
  INQUIRY: "Inquiry",
  BOOKING: "Booking",
  SERVICE_REQUEST: "Service request",
};

export function OwnerRequestDetailPage() {
  const businessId = useCurrentBusinessId();
  const { requestId } = useParams<{ requestId: string }>();
  const { state, updateStatus, isUpdatingStatus, updateError } =
    useOwnerRequestDetail(businessId, requestId);

  return (
    <PageShell>
      {!businessId ? (
        <OwnerStateBlock
          title="Current business is not selected yet"
          description={
            <span>
              For local development, set{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-xs">
                dt.owner.currentBusinessId.v1
              </code>{" "}
              in localStorage and reload.
            </span>
          }
        />
      ) : !requestId ? (
        <OwnerStateBlock
          tone="error"
          title="No request specified"
          description="The URL is missing a request ID."
        />
      ) : state.status === "loading" || state.status === "idle" ? (
        <OwnerStateBlock title="Loading request…" />
      ) : state.status === "error" ? (
        <OwnerStateBlock
          tone="error"
          title="Could not load request"
          description={state.message}
        />
      ) : (
        <DetailContent
          request={state.request}
          onUpdateStatus={updateStatus}
          isUpdatingStatus={isUpdatingStatus}
          updateError={updateError}
        />
      )}
    </PageShell>
  );
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-4">
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link to="/owner/requests" aria-label="Back to requests list">
            <ArrowLeft />
            Back to requests
          </Link>
        </Button>
      </div>
      {children}
    </div>
  );
}

interface DetailContentProps {
  request: CustomerRequestDetail;
  onUpdateStatus: (next: RequestStatus) => void;
  isUpdatingStatus: boolean;
  updateError: string | null;
}

function DetailContent({
  request,
  onUpdateStatus,
  isUpdatingStatus,
  updateError,
}: DetailContentProps) {
  const showUpdated =
    request.updatedAt && request.updatedAt !== request.createdAt;

  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Request
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
                {TYPE_LABEL[request.type] ?? request.type}
              </h2>
              <RequestStatusBadge status={request.status} />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              ID: <code className="font-mono">{request.id}</code>
            </div>
          </div>
          <dl className="text-right text-sm space-y-1">
            <div>
              <dt className="text-xs text-muted-foreground">Created</dt>
              <dd>{formatDateTime(request.createdAt)}</dd>
            </div>
            {showUpdated ? (
              <div>
                <dt className="text-xs text-muted-foreground">Updated</dt>
                <dd>{formatDateTime(request.updatedAt)}</dd>
              </div>
            ) : null}
            {request.branchName ? (
              <div>
                <dt className="text-xs text-muted-foreground">Branch</dt>
                <dd>{request.branchName}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <h3 className="text-sm font-semibold tracking-tight">Customer</h3>
        <dl className="mt-3 space-y-2 text-sm">
          <Row label="Name" value={request.customerName ?? "—"} />
          <Row
            label="Phone"
            value={
              request.customerPhone ? (
                <a
                  className="text-foreground underline-offset-2 hover:underline"
                  href={`tel:${request.customerPhone}`}
                >
                  {request.customerPhone}
                </a>
              ) : (
                "—"
              )
            }
          />
          {request.customerNote ? (
            <Row
              label="Note"
              value={
                <span className="whitespace-pre-wrap text-foreground">
                  {request.customerNote}
                </span>
              }
            />
          ) : null}
        </dl>
      </section>

      {request.items && request.items.length > 0 ? (
        <section className="rounded-lg border bg-card p-4 sm:p-6">
          <h3 className="text-sm font-semibold tracking-tight">Items</h3>
          <ul className="mt-3 divide-y">
            {request.items.map((item, idx) => (
              <li
                key={item.id ?? `${idx}-${item.productId ?? item.name ?? "item"}`}
                className="py-3 first:pt-0 last:pb-0"
              >
                <ItemRow item={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-lg border bg-card p-4 sm:p-6">
        <h3 className="text-sm font-semibold tracking-tight">Status actions</h3>
        <div className="mt-3">
          <RequestStatusActions
            currentStatus={request.status}
            isUpdating={isUpdatingStatus}
            error={updateError}
            onUpdate={onUpdateStatus}
          />
        </div>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[5rem_1fr] gap-3 sm:grid-cols-[7rem_1fr]">
      <dt className="text-xs text-muted-foreground pt-0.5">{label}</dt>
      <dd className="text-sm">{value}</dd>
    </div>
  );
}

function ItemRow({ item }: { item: CustomerRequestDetailItem }) {
  const name = item.name ?? "Item";
  const qty = item.quantity ?? 1;
  const unit = item.unitPriceSnapshot;
  const total = item.totalPriceSnapshot;
  const hasPrice = typeof unit === "number" || typeof total === "number";

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-medium">
          {name}
          {qty > 1 ? (
            <span className="text-muted-foreground"> ×{qty}</span>
          ) : null}
        </div>
        {item.nameKm ? (
          <div className="text-xs text-muted-foreground">{item.nameKm}</div>
        ) : null}
        {item.note ? (
          <div className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
            {item.note}
          </div>
        ) : null}
      </div>
      {hasPrice ? (
        <div className="shrink-0 text-right text-sm">
          {typeof total === "number" ? (
            <div className="font-medium">{formatPrice(total)}</div>
          ) : null}
          {typeof unit === "number" ? (
            <div className="text-xs text-muted-foreground">
              {formatPrice(unit)} each
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function formatDateTime(value: string | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString();
}

// Currency-less for now — the response type does not yet carry a currency
// code. When currency lands on CustomerRequestDetail (or a current-business
// hook exposes it), swap this for Intl.NumberFormat at the call sites.
function formatPrice(value: number): string {
  return value.toFixed(2);
}
