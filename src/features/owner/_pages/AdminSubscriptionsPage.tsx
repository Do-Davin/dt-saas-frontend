import { Button } from "@/components/ui/button";
import { useBusinesses } from "../_hooks/useBusinesses";
import type { OwnerBusiness } from "../_api/businesses";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatBusinessType(type: string | null | undefined): string {
  if (!type) return "—";
  return type
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}

function statusClasses(status: string | null | undefined): string {
  switch ((status ?? "").toUpperCase()) {
    case "ACTIVE":    return "bg-green-50 text-green-700 ring-1 ring-green-200";
    case "TRIAL":     return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    case "EXPIRED":   return "bg-red-50 text-red-700 ring-1 ring-red-200";
    case "CANCELLED": return "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200";
    default:          return "bg-muted text-muted-foreground";
  }
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-5 py-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </p>
      <p className="text-2xl font-black text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────

function SubscriptionRow({ biz }: { biz: OwnerBusiness }) {
  const status = biz.subscriptionStatus ?? null;
  const isExpired =
    biz.subscriptionExpiresAt
      ? new Date(biz.subscriptionExpiresAt) < new Date()
      : false;

  return (
    <tr className="border-t border-border hover:bg-accent/30 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-foreground">{biz.name}</p>
        {biz.slug && (
          <p className="text-xs text-muted-foreground">{biz.slug}</p>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatBusinessType(biz.type)}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClasses(status)}`}
        >
          {status ?? "Unknown"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {biz.subscriptionPlan ?? "—"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {formatDate(biz.subscriptionStartDate)}
      </td>
      <td className={`px-4 py-3 text-sm ${isExpired ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
        {formatDate(biz.subscriptionExpiresAt)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground text-right tabular-nums">
        {biz.userLimit != null ? biz.userLimit : "—"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground text-right tabular-nums">
        {biz.menuItemLimit != null ? biz.menuItemLimit : "—"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground text-right tabular-nums">
        {biz.monthlyPrice != null ? `$${biz.monthlyPrice.toFixed(2)}` : "—"}
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminSubscriptionsPage() {
  const { state, refetch } = useBusinesses();

  if (state.status !== "ready") {
    return (
      <OwnerPage>
        <OwnerPageHeader
          title="Subscriptions"
          description="Customer subscription plans and billing overview."
        />
        <OwnerPageState
          type={state.status === "error" ? "error" : "loading"}
          message={state.status === "error" ? state.message : undefined}
          action={
            state.status === "error" ? (
              <Button size="sm" variant="outline" onClick={refetch}>
                Retry
              </Button>
            ) : undefined
          }
        />
      </OwnerPage>
    );
  }

  const businesses = state.items;

  // Summary metrics
  const active    = businesses.filter((b) => (b.subscriptionStatus ?? "").toUpperCase() === "ACTIVE").length;
  const expired   = businesses.filter((b) => (b.subscriptionStatus ?? "").toUpperCase() === "EXPIRED").length;
  const suspended = businesses.filter((b) =>
    ["CANCELLED", "TRIAL"].includes((b.subscriptionStatus ?? "").toUpperCase())
  ).length;
  const monthlyRevenue = businesses
    .filter((b) => (b.subscriptionStatus ?? "").toUpperCase() === "ACTIVE" && b.monthlyPrice != null)
    .reduce((sum, b) => sum + (b.monthlyPrice ?? 0), 0);

  return (
    <OwnerPage>
      <OwnerPageHeader
        title="Subscriptions"
        description="Customer subscription plans, expiry dates, and estimated monthly revenue."
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <SummaryCard label="Active" value={active} sub="paying customers" />
        <SummaryCard label="Expired" value={expired} sub="need renewal" />
        <SummaryCard label="Other" value={suspended} sub="trial or cancelled" />
        <SummaryCard
          label="Est. Monthly"
          value={`$${monthlyRevenue.toFixed(2)}`}
          sub="active subscriptions"
        />
      </div>

      {/* Table */}
      {businesses.length === 0 ? (
        <div className="rounded-xl border border-border bg-card px-6 py-10 text-center text-sm text-muted-foreground">
          No businesses yet.
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="bg-muted/40">
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Business</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expires</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">Users</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">Items</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">$/mo</th>
                </tr>
              </thead>
              <tbody>
                {businesses.map((biz) => (
                  <SubscriptionRow key={biz.id} biz={biz} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </OwnerPage>
  );
}
