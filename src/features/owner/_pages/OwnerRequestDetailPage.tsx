import type { ReactNode } from "react";
import { Link, useParams } from "react-router";
import { ArrowLeftIcon, ClipboardListIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import { useOwnerRequestDetail } from "../_hooks/useOwnerRequestDetail";
import { RequestStatusBadge } from "../_components/RequestStatusBadge";
import { RequestStatusActions } from "../_components/RequestStatusActions";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageState } from "../_components/OwnerPageState";
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
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const { requestId } = useParams<{ requestId: string }>();
  const { state, updateStatus, isUpdatingStatus, updateError } =
    useOwnerRequestDetail(businessId, requestId);

  return (
    <OwnerPage>
      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground hover:text-foreground">
          <Link to="/owner/requests" aria-label="Back to requests list">
            <ArrowLeftIcon className="size-4" />
            Back to requests
          </Link>
        </Button>
      </div>
      {!businessId ? (
        <OwnerPageState type="empty" title={noBusinessTitle} message={noBusinessDesc} />
      ) : !requestId ? (
        <OwnerPageState
          type="error"
          title="No request specified"
          message="The URL is missing a request ID."
        />
      ) : state.status === "loading" || state.status === "idle" ? (
        <OwnerPageState type="loading" title="Loading request…" />
      ) : state.status === "error" ? (
        <OwnerPageState
          type="error"
          title="Could not load request"
          message={state.message}
        />
      ) : (
        <DetailContent
          request={state.request}
          onUpdateStatus={updateStatus}
          isUpdatingStatus={isUpdatingStatus}
          updateError={updateError}
        />
      )}
    </OwnerPage>
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
    <div className="max-w-5xl space-y-4">
      {/* ── Request header ────────────────────────────────────────── */}
      <section className="rounded-2xl border bg-card px-6 py-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <ClipboardListIcon className="size-10 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-primary">
                  {TYPE_LABEL[request.type] ?? request.type}
                </h2>
                <RequestStatusBadge status={request.status} />
              </div>
              <div className="mt-1 text-xs font-semibold text-zinc-500">
                ID: <code className="font-mono">{request.id}</code>
              </div>
            </div>
          </div>
          <dl className="space-y-1 text-right">
            <div>
              <dt className="text-xs font-semibold text-zinc-500">Created</dt>
              <dd className="text-sm font-semibold text-foreground">{formatDateTime(request.createdAt)}</dd>
            </div>
            {showUpdated ? (
              <div>
                <dt className="text-xs font-semibold text-zinc-500">Updated</dt>
                <dd className="text-sm font-semibold text-foreground">{formatDateTime(request.updatedAt)}</dd>
              </div>
            ) : null}
            {request.branchName ? (
              <div>
                <dt className="text-xs font-semibold text-zinc-500">Branch</dt>
                <dd className="text-sm font-semibold text-foreground">{request.branchName}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </section>

      {/* ── Customer ──────────────────────────────────────────────── */}
      <section className="rounded-2xl border bg-card px-6 py-7">
        <h3 className="text-base font-black text-primary">Customer</h3>
        <dl className="mt-4 space-y-2">
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

      {/* ── Items ─────────────────────────────────────────────────── */}
      {request.items && request.items.length > 0 ? (
        <section className="rounded-2xl border bg-card px-6 py-7">
          <h3 className="text-base font-black text-primary">Items</h3>
          <ul className="mt-4 space-y-2">
            {request.items.map((item, idx) => (
              <li
                key={item.id ?? `${idx}-${item.productId ?? item.productNameSnapshot ?? "item"}`}
                className="rounded-xl border px-4 py-3"
              >
                <ItemRow item={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* ── Status ────────────────────────────────────────────────── */}
      <section className="rounded-2xl border bg-card px-6 py-7">
        <h3 className="text-base font-black text-primary">Update status</h3>
        <div className="mt-4">
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
      <dt className="text-xs font-semibold text-zinc-500 pt-0.5">{label}</dt>
      <dd className="text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function ItemRow({ item }: { item: CustomerRequestDetailItem }) {
  const name = item.productNameSnapshot ?? "Item";
  const qty = item.quantity ?? 1;
  const price = item.salesPriceSnapshot;
  const hasPrice = typeof price === "number";

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-black text-primary">
          {name}
          {qty > 1 ? (
            <span className="text-zinc-500 font-semibold"> ×{qty}</span>
          ) : null}
        </div>
        {item.pricingTypeSnapshot ? (
          <div className="text-xs font-semibold text-zinc-500">{item.pricingTypeSnapshot}</div>
        ) : null}
        {item.note ? (
          <div className="mt-1 text-xs font-semibold text-zinc-500 whitespace-pre-wrap">
            {item.note}
          </div>
        ) : null}
      </div>
      {hasPrice ? (
        <div className="shrink-0 text-right text-sm">
          <div className="font-black text-primary">{formatMoney(price)}</div>
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

// Currency-less for now — CustomerRequestDetail does not yet carry a
// currency code. When currency is added, pass it as the second argument
// and the style will switch to a full currency format automatically.
function formatMoney(value: number, currency?: string): string {
  if (currency) {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  }
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
