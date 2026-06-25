import { useEffect, useState } from "react";
import { PackageIcon, CheckCircle2Icon } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import { getAnalyticsOverview } from "../_api/analytics";
import type { AnalyticsOverview, AnalyticsPeriod } from "../_api/analytics";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return "$" + value.toFixed(2);
}

function profitClass(value: number): string {
  return value >= 0 ? "text-green-600" : "text-red-600";
}

// ── Period selector ───────────────────────────────────────────────────────────

const PERIOD_OPTIONS: { value: AnalyticsPeriod; label: string }[] = [
  { value: "THIS_WEEK", label: "This Week" },
  { value: "THIS_MONTH", label: "This Month" },
  { value: "LAST_30_DAYS", label: "Last 30 Days" },
  { value: "ALL_TIME", label: "All Time" },
];

interface PeriodSelectorProps {
  value: AnalyticsPeriod;
  onChange: (p: AnalyticsPeriod) => void;
  disabled?: boolean;
}

function PeriodSelector({ value, onChange, disabled }: PeriodSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {PERIOD_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(opt.value)}
          className={`rounded-xl border-2 px-3 py-1.5 text-xs font-black transition-all duration-150 disabled:opacity-50 ${
            value === opt.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-input text-muted-foreground hover:border-primary/40 hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ── KPI card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  label: string;
  value: string;
  valueClass?: string;
}

function KpiCard({ label, value, valueClass }: KpiCardProps) {
  return (
    <div className="rounded-2xl border bg-card px-5 py-4">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div
        className={`mt-1 text-2xl font-black tracking-tight ${valueClass ?? "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-black text-primary">{title}</h3>
      {children}
    </div>
  );
}

function EmptySection({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed bg-card px-6 py-8 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; data: AnalyticsOverview };

export function OwnerAnalyticsPage() {
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();

  const [period, setPeriod] = useState<AnalyticsPeriod>("THIS_MONTH");
  const [fetched, setFetched] = useState<{
    forKey: string;
    state: SettledState;
  } | null>(null);

  const fetchKey = `${businessId ?? ""}:${period}`;

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    const key = `${businessId}:${period}`;
    getAnalyticsOverview(businessId, period)
      .then((data) => {
        if (!cancelled) setFetched({ forKey: key, state: { status: "ready", data } });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof ApiError
              ? err.message
              : "Failed to load analytics.";
          setFetched({ forKey: key, state: { status: "error", message } });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, period]);

  if (!businessId) {
    return (
      <OwnerPageState
        type="empty"
        title={noBusinessTitle}
        message={noBusinessDesc}
      />
    );
  }

  const isLoading = !fetched || fetched.forKey !== fetchKey;
  const settled = !isLoading ? fetched!.state : null;
  const data = settled?.status === "ready" ? settled.data : null;
  const error = settled?.status === "error" ? settled.message : null;

  const hasNoSalesData =
    data !== null &&
    data.saleCount === 0 &&
    data.topSellingProducts.length === 0 &&
    data.salesByCategory.length === 0;

  return (
    <OwnerPage>
      <OwnerPageHeader title="Analytics" />

      {/* Period selector */}
      <PeriodSelector
        value={period}
        onChange={setPeriod}
        disabled={isLoading}
      />

      {/* Content */}
      {isLoading ? (
        <OwnerPageState type="loading" title="Loading analytics…" />
      ) : error ? (
        <OwnerPageState
          type="error"
          title="Could not load analytics"
          message={error}
        />
      ) : data ? (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard label="Income" value={fmt(data.income)} />
            <KpiCard label="Expense" value={fmt(data.cost)} />
            <KpiCard
              label="Profit"
              value={(data.profit >= 0 ? "+" : "") + fmt(data.profit)}
              valueClass={profitClass(data.profit)}
            />
            <KpiCard label="Sales" value={String(data.saleCount)} />
          </div>

          {/* Top selling products */}
          <Section title="Top Selling Products">
            {hasNoSalesData || data.topSellingProducts.length === 0 ? (
              <EmptySection message="No sales data for this period." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground">
                      <th className="px-4 py-3 text-left">Product</th>
                      <th className="px-4 py-3 text-right">Qty Sold</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topSellingProducts.map((p, i) => (
                      <tr
                        key={p.productId ?? i}
                        className="border-b last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {p.name}
                        </td>
                        <td className="px-4 py-3 text-right text-muted-foreground">
                          {p.quantity}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-foreground">
                          {fmt(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Sales by category */}
          <Section title="Sales by Category">
            {hasNoSalesData || data.salesByCategory.length === 0 ? (
              <EmptySection message="No sales data for this period." />
            ) : (
              <div className="overflow-x-auto rounded-2xl border bg-card">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground">
                      <th className="px-4 py-3 text-left">Category</th>
                      <th className="px-4 py-3 text-right">Revenue</th>
                      <th className="px-4 py-3 text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.salesByCategory.map((c, i) => (
                      <tr
                        key={c.categoryId ?? i}
                        className="border-b last:border-0 hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 font-semibold text-foreground">
                          {c.name}
                        </td>
                        <td className="px-4 py-3 text-right font-black text-foreground">
                          {fmt(c.revenue)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1">
                            <span className="font-semibold text-foreground">
                              {c.percentage.toFixed(1)}%
                            </span>
                            <span
                              className="h-1.5 rounded-full bg-primary/30"
                              style={{
                                width: `${Math.min(c.percentage, 100) * 0.5}px`,
                                minWidth: "4px",
                              }}
                            />
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          {/* Stock alerts */}
          <Section title="Stock Alerts">
            {data.stockAlerts.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border bg-card px-5 py-4">
                <CheckCircle2Icon className="size-5 shrink-0 text-green-600" />
                <span className="text-sm font-semibold text-muted-foreground">
                  Stock looks healthy.
                </span>
              </div>
            ) : (
              <ul className="space-y-2">
                {data.stockAlerts.map((alert) => {
                  const isOut = alert.stockQuantity === 0;
                  return (
                    <li
                      key={alert.productId}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <PackageIcon className="size-5 shrink-0 text-muted-foreground" />
                        <span className="truncate font-semibold text-foreground">
                          {alert.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          {alert.stockQuantity} in stock
                          {alert.lowStockThreshold != null
                            ? ` / ${alert.lowStockThreshold} min`
                            : ""}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            isOut
                              ? "bg-red-100 text-red-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {isOut ? "Out of Stock" : "Low Stock"}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </div>
      ) : null}
    </OwnerPage>
  );
}
