import { Button } from "@/components/ui/button";
import { useBusinesses } from "../_hooks/useBusinesses";
import type { OwnerBusiness } from "../_api/businesses";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number, decimals = 2): string {
  return n.toFixed(decimals);
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function isActive(b: OwnerBusiness): boolean {
  return (b.subscriptionStatus ?? "").toUpperCase() === "ACTIVE";
}

function isExpiringSoon(b: OwnerBusiness): boolean {
  if (!b.subscriptionExpiresAt) return false;
  const diff = new Date(b.subscriptionExpiresAt).getTime() - Date.now();
  return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
}

function planLabel(plan: string | null | undefined): string {
  if (!plan) return "Unknown";
  const map: Record<string, string> = {
    MONTHLY: "Monthly",
    ANNUALLY: "Annually",
    CUSTOM: "Custom",
  };
  return map[plan.toUpperCase()] ?? plan;
}

function statusBadge(status: string | null | undefined): string {
  switch ((status ?? "").toUpperCase()) {
    case "ACTIVE":    return "bg-green-50 text-green-700 ring-1 ring-green-200";
    case "TRIAL":     return "bg-blue-50 text-blue-700 ring-1 ring-blue-200";
    case "EXPIRED":   return "bg-red-50 text-red-700 ring-1 ring-red-200";
    case "CANCELLED": return "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200";
    default:          return "bg-muted text-muted-foreground";
  }
}

// ─── Metric card ──────────────────────────────────────────────────────────────

function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-5 py-4 ${
        highlight
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-card"
      }`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </p>
      <p
        className={`text-2xl font-black ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </p>
      {sub && (
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      )}
    </div>
  );
}

// ─── Plan pill ────────────────────────────────────────────────────────────────

function PlanPill({ plan, count }: { plan: string; count: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
      <span className="text-sm font-medium text-foreground">{plan}</span>
      <span className="text-sm font-black text-foreground tabular-nums">{count}</span>
    </div>
  );
}

// ─── Recent row ───────────────────────────────────────────────────────────────

function RecentRow({ biz }: { biz: OwnerBusiness }) {
  const status = biz.subscriptionStatus ?? null;
  return (
    <tr className="border-t border-border hover:bg-accent/30 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-medium text-foreground">{biz.name}</p>
        {biz.slug && (
          <p className="text-xs text-muted-foreground">{biz.slug}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusBadge(status)}`}
        >
          {status ?? "Unknown"}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {planLabel(biz.subscriptionPlan)}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground text-right tabular-nums">
        {biz.monthlyPrice != null ? `$${fmt(biz.monthlyPrice)}` : "—"}
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {fmtDate(biz.subscriptionStartDate)}
      </td>
      <td className={`px-4 py-3 text-sm ${isExpiringSoon(biz) ? "text-amber-600 font-medium" : "text-muted-foreground"}`}>
        {fmtDate(biz.subscriptionExpiresAt)}
        {isExpiringSoon(biz) && (
          <span className="ml-1.5 inline-flex items-center rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 ring-1 ring-amber-200">
            Soon
          </span>
        )}
      </td>
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AdminAnalyticsPage() {
  const { state, refetch } = useBusinesses();

  if (state.status !== "ready") {
    return (
      <OwnerPage>
        <OwnerPageHeader
          title="Finance Analytics"
          description="Estimated subscription finance overview."
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

  // ── Core metrics ──────────────────────────────────────────────────────────
  const activeList    = businesses.filter(isActive);
  const expiredCount  = businesses.filter((b) => (b.subscriptionStatus ?? "").toUpperCase() === "EXPIRED").length;
  const otherCount    = businesses.filter((b) => {
    const s = (b.subscriptionStatus ?? "").toUpperCase();
    return s !== "ACTIVE" && s !== "EXPIRED";
  }).length;

  const estMonthly    = activeList.reduce((sum, b) => sum + (b.monthlyPrice ?? 0), 0);
  const estAnnual     = estMonthly * 12;
  const avgRevenue    = activeList.length > 0 ? estMonthly / activeList.length : 0;
  const expiringSoon  = businesses.filter(isExpiringSoon);

  // ── Plan breakdown ────────────────────────────────────────────────────────
  const planCounts: Record<string, number> = {};
  for (const b of activeList) {
    const key = planLabel(b.subscriptionPlan);
    planCounts[key] = (planCounts[key] ?? 0) + 1;
  }
  const unknownActive = planCounts["Unknown"] ?? 0;
  const planEntries = Object.entries(planCounts).filter(([k]) => k !== "Unknown");

  // ── Recent (sorted by subscriptionStartDate desc, top 10) ────────────────
  const recent = [...businesses]
    .filter((b) => b.subscriptionStartDate)
    .sort((a, b) =>
      new Date(b.subscriptionStartDate!).getTime() -
      new Date(a.subscriptionStartDate!).getTime()
    )
    .slice(0, 10);

  return (
    <OwnerPage>
      <OwnerPageHeader
        title="Finance Analytics"
        description="Estimated subscription revenue overview. Figures are based on active subscription records — not confirmed payment receipts."
      />

      {/* ── Primary metrics ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
        <MetricCard
          label="Est. Monthly Revenue"
          value={`$${fmt(estMonthly)}`}
          sub="active subscriptions only"
          highlight
        />
        <MetricCard
          label="Est. Annual Revenue"
          value={`$${fmt(estAnnual)}`}
          sub="monthly × 12"
        />
        <MetricCard
          label="Active Subscriptions"
          value={activeList.length}
          sub={`avg $${fmt(avgRevenue)}/business`}
        />
        <MetricCard
          label="Expiring in 30 Days"
          value={expiringSoon.length}
          sub={expiringSoon.length > 0 ? "action needed" : "none upcoming"}
        />
      </div>

      {/* ── Secondary metrics ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-8">
        <MetricCard label="Expired"       value={expiredCount}   sub="need renewal" />
        <MetricCard label="Other / Trial" value={otherCount}     sub="trial, cancelled, unknown" />
        <MetricCard label="Total Businesses" value={businesses.length} />
        <MetricCard
          label="Avg Revenue / Active"
          value={activeList.length > 0 ? `$${fmt(avgRevenue)}` : "—"}
          sub="per active business"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">

        {/* ── Recent subscriptions table ──────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">
            Recent Subscriptions
          </p>
          {recent.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-6 py-8 text-center text-sm text-muted-foreground">
              No subscription start dates recorded yet.
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[640px]">
                  <thead>
                    <tr className="bg-muted/40">
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Business</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground text-right">$/mo</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Started</th>
                      <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((biz) => (
                      <RecentRow key={biz.id} biz={biz} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* ── Plans breakdown ─────────────────────────────────────────── */}
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">
            Active Plans Breakdown
          </p>
          {activeList.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
              No active subscriptions.
            </div>
          ) : (
            <div className="space-y-2">
              {planEntries.map(([plan, count]) => (
                <PlanPill key={plan} plan={plan} count={count} />
              ))}
              {unknownActive > 0 && (
                <PlanPill plan="No plan set" count={unknownActive} />
              )}
              <div className="mt-4 rounded-lg bg-muted/40 px-4 py-3 text-xs text-muted-foreground leading-relaxed">
                Revenue figures are estimated from subscription records.
                Actual collected amounts may differ.
              </div>
            </div>
          )}
        </div>
      </div>
    </OwnerPage>
  );
}
