import { useEffect, useRef, useState } from "react";
import { RefreshCwIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import {
  getSalesSummary,
  getSalesByCategory,
  getSalesByProduct,
} from "../_api/reports";
import type {
  SalesSummary,
  CategoryRevenue,
  ProductRevenue,
} from "../_api/reports";
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

// ── Summary card ──────────────────────────────────────────────────────────────

interface SummaryCardProps {
  label: string;
  value: string;
  valueClass?: string;
}

function SummaryCard({ label, value, valueClass }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border bg-card px-5 py-4">
      <div className="text-xs font-semibold text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-black tracking-tight ${valueClass ?? "text-foreground"}`}>
        {value}
      </div>
    </div>
  );
}

// ── Revenue table ─────────────────────────────────────────────────────────────

interface RevenueRow {
  name: string;
  quantity: number;
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
}

interface RevenueTableProps {
  title: string;
  rows: RevenueRow[];
  nameLabel: string;
}

function RevenueTable({ title, rows, nameLabel }: RevenueTableProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-black text-primary">{title}</h3>
      {rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card px-6 py-8 text-center text-sm text-muted-foreground">
          No data for this period.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground">
                <th className="px-4 py-3 text-left">{nameLabel}</th>
                <th className="px-4 py-3 text-right">Qty</th>
                <th className="px-4 py-3 text-right">Income</th>
                <th className="px-4 py-3 text-right">Cost</th>
                <th className="px-4 py-3 text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 font-semibold text-foreground">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {row.quantity}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {fmt(row.totalRevenue)}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {fmt(row.totalCost)}
                  </td>
                  <td className={`px-4 py-3 text-right font-black ${profitClass(row.totalProfit)}`}>
                    {row.totalProfit >= 0 ? "+" : ""}
                    {fmt(row.totalProfit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

interface ReportData {
  summary: SalesSummary;
  categories: CategoryRevenue[];
  products: ProductRevenue[];
}

type SettledState =
  | { status: "error"; message: string }
  | { status: "ready"; data: ReportData };

export function OwnerReportsPage() {
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loadKey, setLoadKey] = useState(0);

  // Params are captured at click time via ref so they don't create extra deps.
  const paramsRef = useRef<{ from?: string; to?: string }>({});

  const [fetched, setFetched] = useState<{
    forKey: number;
    state: SettledState;
  } | null>(null);

  useEffect(() => {
    if (!businessId) return;
    let cancelled = false;
    const params = paramsRef.current;
    Promise.all([
      getSalesSummary(businessId, params),
      getSalesByCategory(businessId, params),
      getSalesByProduct(businessId, params),
    ])
      .then(([summary, categories, products]) => {
        if (!cancelled)
          setFetched({
            forKey: loadKey,
            state: { status: "ready", data: { summary, categories, products } },
          });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof ApiError
              ? err.message
              : "Failed to load report data.";
          setFetched({ forKey: loadKey, state: { status: "error", message } });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, loadKey]);

  function handleRefresh() {
    paramsRef.current = {
      from: fromDate ? `${fromDate}T00:00:00.000Z` : undefined,
      to: toDate ? `${toDate}T23:59:59.999Z` : undefined,
    };
    setLoadKey((k) => k + 1);
  }

  if (!businessId) {
    return (
      <OwnerPageState
        type="empty"
        title={noBusinessTitle}
        message={noBusinessDesc}
      />
    );
  }

  const isLoading = !fetched || fetched.forKey !== loadKey;
  const settled = !isLoading ? fetched!.state : null;
  const reportData = settled?.status === "ready" ? settled.data : null;
  const reportError = settled?.status === "error" ? settled.message : null;

  const isEmpty =
    reportData !== null &&
    reportData.summary.saleCount === 0 &&
    reportData.categories.length === 0 &&
    reportData.products.length === 0;

  return (
    <OwnerPage>
      <OwnerPageHeader title="Reports" />

      {/* Date range controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">
            From
          </label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-sm font-semibold text-foreground outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">
            To
          </label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-10 rounded-xl border border-input bg-card px-3 text-sm font-semibold text-foreground outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20"
          />
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={isLoading}
          className="h-10 gap-1.5 rounded-xl border-2 border-primary font-black text-primary transition-all duration-200 ease-out hover:border-primary hover:bg-primary/10 hover:text-primary"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCwIcon className="size-4" />
          )}
          {isLoading ? "Loading…" : "Refresh"}
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <OwnerPageState type="loading" title="Loading report data…" />
      ) : reportError ? (
        <OwnerPageState
          type="error"
          title="Could not load reports"
          message={reportError}
        />
      ) : isEmpty ? (
        <OwnerPageState
          type="empty"
          title="No sales data yet"
          message="Record your first sale to see reports here."
        />
      ) : reportData ? (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SummaryCard
              label="Total Income"
              value={fmt(reportData.summary.totalRevenue)}
            />
            <SummaryCard
              label="Total Cost"
              value={fmt(reportData.summary.totalCost)}
            />
            <SummaryCard
              label="Total Profit"
              value={
                (reportData.summary.totalProfit >= 0 ? "+" : "") +
                fmt(reportData.summary.totalProfit)
              }
              valueClass={profitClass(reportData.summary.totalProfit)}
            />
            <SummaryCard
              label="Sales"
              value={String(reportData.summary.saleCount)}
            />
          </div>

          {/* By category */}
          <RevenueTable
            title="Sales by Category"
            nameLabel="Category"
            rows={reportData.categories.map((c) => ({
              name: c.categoryName ?? "Uncategorized",
              quantity: c.quantity,
              totalRevenue: c.totalRevenue,
              totalCost: c.totalCost,
              totalProfit: c.totalProfit,
            }))}
          />

          {/* By product */}
          <RevenueTable
            title="Sales by Product"
            nameLabel="Product"
            rows={reportData.products.map((p) => ({
              name: p.productName,
              quantity: p.quantity,
              totalRevenue: p.totalRevenue,
              totalCost: p.totalCost,
              totalProfit: p.totalProfit,
            }))}
          />
        </div>
      ) : null}
    </OwnerPage>
  );
}
