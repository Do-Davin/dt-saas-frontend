import { useEffect, useMemo, useState } from "react";
import {
  PlusIcon,
  Trash2Icon,
  EyeIcon,
  Loader2,
  ShoppingCartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api/client";
import { toast } from "@/components/ui/toast";
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import { useSales } from "../_hooks/useSales";
import { useProducts } from "../_hooks/useProducts";
import { createSale, getSale } from "../_api/sales";
import type { Sale, SaleListItem } from "../_api/sales";
import type { Product } from "../_api/products";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(value: number): string {
  return "$" + value.toFixed(2);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── Sale detail modal ─────────────────────────────────────────────────────────

interface SaleDetailModalProps {
  businessId: string;
  saleId: string | null;
  onClose: () => void;
}

function SaleDetailModal({ businessId, saleId, onClose }: SaleDetailModalProps) {
  const [fetched, setFetched] = useState<{
    forKey: string;
    sale: Sale | null;
    error: string | null;
  } | null>(null);

  useEffect(() => {
    if (!saleId) return;
    let cancelled = false;
    const key = `${businessId}:${saleId}`;
    getSale(businessId, saleId)
      .then((sale) => {
        if (!cancelled) setFetched({ forKey: key, sale, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof ApiError ? err.message : "Failed to load sale.";
          setFetched({ forKey: key, sale: null, error: message });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [businessId, saleId]);

  const expectedKey = saleId ? `${businessId}:${saleId}` : null;
  const isLoading =
    saleId !== null && (!fetched || fetched.forKey !== expectedKey);
  const sale = isLoading ? null : (fetched?.sale ?? null);
  const error = isLoading ? null : (fetched?.error ?? null);

  return (
    <Dialog
      open={saleId !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sale Detail</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p role="alert" className="py-6 text-center text-sm text-destructive">
            {error}
          </p>
        ) : sale ? (
          <div className="space-y-4">
            {/* Totals header */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-muted/30 px-4 py-3 text-center">
                <div className="text-xs font-semibold text-muted-foreground">
                  Income
                </div>
                <div className="text-lg font-black text-foreground">
                  {fmt(sale.totalAmount)}
                </div>
              </div>
              <div className="rounded-xl border bg-muted/30 px-4 py-3 text-center">
                <div className="text-xs font-semibold text-muted-foreground">
                  Cost
                </div>
                <div className="text-lg font-black text-foreground">
                  {fmt(sale.totalCost)}
                </div>
              </div>
              <div className="rounded-xl border bg-muted/30 px-4 py-3 text-center">
                <div className="text-xs font-semibold text-muted-foreground">
                  Profit
                </div>
                <div
                  className={`text-lg font-black ${sale.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  {sale.profit >= 0 ? "+" : ""}
                  {fmt(sale.profit)}
                </div>
              </div>
            </div>

            {/* Meta */}
            <div className="text-xs text-muted-foreground">
              {formatDate(sale.saleDate)}
              {sale.note ? <span className="ml-2">· {sale.note}</span> : null}
            </div>

            {/* Items */}
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-semibold text-muted-foreground">
                    <th className="px-3 py-2 text-left">Product</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-right">Price</th>
                    <th className="px-3 py-2 text-right">Cost</th>
                    <th className="px-3 py-2 text-right">Disc</th>
                    <th className="px-3 py-2 text-right">Total</th>
                    <th className="px-3 py-2 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {sale.items.map((item) => (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="px-3 py-2 font-semibold text-foreground">
                        {item.productNameSnapshot}
                        {item.categoryNameSnapshot ? (
                          <span className="ml-1 text-xs font-normal text-muted-foreground">
                            · {item.categoryNameSnapshot}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-right">{item.quantity}</td>
                      <td className="px-3 py-2 text-right">
                        {fmt(item.unitSalesPrice)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {fmt(item.unitCostPrice)}
                      </td>
                      <td className="px-3 py-2 text-right">
                        {item.discountAmount > 0 ? fmt(item.discountAmount) : "—"}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {fmt(item.lineTotal)}
                      </td>
                      <td
                        className={`px-3 py-2 text-right font-semibold ${item.lineTotal - item.lineCost >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {fmt(item.lineTotal - item.lineCost)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}

// ── New sale modal ────────────────────────────────────────────────────────────

interface LineItem {
  key: string;
  productId: string;
  qty: string;
  unitPrice: string;
  unitCost: string;
  discount: string;
}

function emptyLine(): LineItem {
  return {
    key: Math.random().toString(36).slice(2),
    productId: "",
    qty: "1",
    unitPrice: "",
    unitCost: "",
    discount: "0",
  };
}

function calcLine(line: LineItem): { total: number; cost: number } {
  const qty = parseFloat(line.qty) || 0;
  const price = parseFloat(line.unitPrice) || 0;
  const cost = parseFloat(line.unitCost) || 0;
  const disc = parseFloat(line.discount) || 0;
  return {
    total: (price - disc) * qty,
    cost: cost * qty,
  };
}

interface NewSaleModalProps {
  businessId: string;
  products: Product[];
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function NewSaleModal({
  businessId,
  products,
  open,
  onClose,
  onSuccess,
}: NewSaleModalProps) {
  // State resets automatically on remount — parent passes a new key each open.
  const [lines, setLines] = useState<LineItem[]>(() => [emptyLine()]);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    let totalAmount = 0;
    let totalCost = 0;
    for (const line of lines) {
      const { total, cost } = calcLine(line);
      totalAmount += total;
      totalCost += cost;
    }
    return { totalAmount, totalCost, profit: totalAmount - totalCost };
  }, [lines]);

  function updateLine(key: string, patch: Partial<LineItem>) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const updated = { ...l, ...patch };
        if (patch.productId !== undefined) {
          const product = products.find((p) => p.id === patch.productId);
          if (product) {
            updated.unitPrice =
              product.salesPrice != null ? String(product.salesPrice) : "";
            updated.unitCost =
              product.purchasePrice != null
                ? String(product.purchasePrice)
                : "";
          }
        }
        return updated;
      }),
    );
    setError(null);
  }

  function removeLine(key: string) {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }

  function addLine() {
    setLines((prev) => [...prev, emptyLine()]);
  }

  function getLineProduct(line: LineItem): Product | undefined {
    return products.find((p) => p.id === line.productId);
  }

  function qtyExceedsStock(line: LineItem): boolean {
    const product = getLineProduct(line);
    if (!product) return false;
    const qty = parseInt(line.qty, 10);
    return Number.isInteger(qty) && qty > product.stockQuantity;
  }

  const hasStockError = lines.some(qtyExceedsStock);

  async function handleSubmit() {
    const validLines = lines.filter((l) => l.productId);
    if (validLines.length === 0) {
      setError("Select at least one product.");
      return;
    }
    for (const line of validLines) {
      const qty = parseInt(line.qty, 10);
      if (!qty || qty <= 0) {
        setError("Quantity must be at least 1 for every line.");
        return;
      }
      if (qtyExceedsStock(line)) {
        const product = getLineProduct(line);
        setError(
          `Quantity exceeds available stock for "${product?.name ?? line.productId}".`,
        );
        return;
      }
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await createSale(businessId, {
        note: note.trim() || undefined,
        items: validLines.map((l) => ({
          productId: l.productId,
          quantity: parseInt(l.qty, 10),
          ...(l.unitPrice !== ""
            ? { unitSalesPrice: parseFloat(l.unitPrice) }
            : {}),
          ...(l.unitCost !== ""
            ? { unitCostPrice: parseFloat(l.unitCost) }
            : {}),
          ...(parseFloat(l.discount) > 0
            ? { discountAmount: parseFloat(l.discount) }
            : {}),
        })),
      });
      toast.success("Sale recorded successfully.");
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to create sale.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>New Sale</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Note */}
          <div className="space-y-1">
            <label
              htmlFor="sale-note"
              className="text-xs font-semibold text-muted-foreground"
            >
              Note (optional)
            </label>
            <input
              id="sale-note"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
              placeholder="e.g. Table 3, Walk-in customer…"
              className="h-10 w-full rounded-xl border border-input bg-card px-3 text-sm font-semibold text-foreground outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
            />
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <div className="hidden grid-cols-[1fr_60px_90px_90px_80px_32px] gap-2 px-1 sm:grid">
              <span className="text-xs font-semibold text-muted-foreground">
                Product
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Qty
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Price
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Cost
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                Discount
              </span>
              <span />
            </div>

            {lines.map((line) => {
              const product = getLineProduct(line);
              const stockErr = qtyExceedsStock(line);
              const { total } = calcLine(line);
              return (
                <div key={line.key} className="space-y-1">
                  <div className="grid grid-cols-[1fr_60px_90px_90px_80px_32px] items-center gap-2">
                    {/* Product */}
                    <select
                      value={line.productId}
                      onChange={(e) =>
                        updateLine(line.key, { productId: e.target.value })
                      }
                      disabled={isSubmitting}
                      className="h-10 w-full appearance-none rounded-xl border border-input bg-card px-2 text-sm font-semibold text-foreground outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                    >
                      <option value="">— select —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    {/* Qty */}
                    <input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) =>
                        updateLine(line.key, { qty: e.target.value })
                      }
                      disabled={isSubmitting}
                      className={`h-10 w-full rounded-xl border bg-card px-2 text-sm font-semibold text-foreground outline-none transition-all duration-150 focus:ring-1 disabled:opacity-60 ${stockErr ? "border-destructive focus:border-destructive focus:ring-destructive/20" : "border-input hover:border-primary/40 focus:border-primary focus:ring-primary/20"}`}
                    />

                    {/* Unit price */}
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.unitPrice}
                      onChange={(e) =>
                        updateLine(line.key, { unitPrice: e.target.value })
                      }
                      disabled={isSubmitting}
                      placeholder="0.00"
                      className="h-10 w-full rounded-xl border border-input bg-card px-2 text-sm font-semibold text-foreground outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                    />

                    {/* Cost */}
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.unitCost}
                      onChange={(e) =>
                        updateLine(line.key, { unitCost: e.target.value })
                      }
                      disabled={isSubmitting}
                      placeholder="0.00"
                      className="h-10 w-full rounded-xl border border-input bg-card px-2 text-sm font-semibold text-foreground outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                    />

                    {/* Discount */}
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={line.discount}
                      onChange={(e) =>
                        updateLine(line.key, { discount: e.target.value })
                      }
                      disabled={isSubmitting}
                      placeholder="0.00"
                      className="h-10 w-full rounded-xl border border-input bg-card px-2 text-sm font-semibold text-foreground outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
                    />

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeLine(line.key)}
                      disabled={isSubmitting || lines.length === 1}
                      className="flex h-10 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-destructive disabled:opacity-30"
                    >
                      <Trash2Icon className="size-4" />
                    </button>
                  </div>

                  {/* Hints row */}
                  <div className="flex items-center gap-3 px-1 text-xs">
                    {product ? (
                      <span
                        className={
                          stockErr
                            ? "text-destructive font-semibold"
                            : "text-muted-foreground"
                        }
                      >
                        {product.stockQuantity} in stock
                      </span>
                    ) : null}
                    {line.productId && total !== 0 ? (
                      <span className="text-muted-foreground">
                        Line: {fmt(total)}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addLine}
              disabled={isSubmitting}
              className="gap-1.5 rounded-xl border-dashed text-muted-foreground"
            >
              <PlusIcon className="size-3.5" />
              Add item
            </Button>
          </div>

          {/* Totals summary */}
          <div className="flex flex-wrap justify-end gap-4 rounded-xl border bg-muted/30 px-4 py-3 text-sm">
            <div>
              <span className="text-xs font-semibold text-muted-foreground">
                Income{" "}
              </span>
              <span className="font-black text-foreground">
                {fmt(totals.totalAmount)}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">
                Cost{" "}
              </span>
              <span className="font-black text-foreground">
                {fmt(totals.totalCost)}
              </span>
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground">
                Profit{" "}
              </span>
              <span
                className={`font-black ${totals.profit >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {totals.profit >= 0 ? "+" : ""}
                {fmt(totals.profit)}
              </span>
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-xs text-destructive">
              {error}
            </p>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl border-2"
          >
            Cancel
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting || hasStockError}
            className="gap-1.5 rounded-xl border-2 border-primary font-black text-primary transition-all duration-200 ease-out hover:border-primary hover:bg-primary/10 hover:text-primary"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ShoppingCartIcon className="size-4" />
            )}
            {isSubmitting ? "Recording…" : "Record Sale"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function OwnerSalesPage() {
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const { state: salesState, refetch: refetchSales } = useSales(businessId);
  const { state: productsState, refetch: refetchProducts } = useProducts(
    businessId,
    { branchId: "", categoryId: "" },
  );

  const [showNewSale, setShowNewSale] = useState(false);
  const [newSaleKey, setNewSaleKey] = useState(0);
  const [viewSaleId, setViewSaleId] = useState<string | null>(null);

  const products: Product[] =
    productsState.status === "ready" ? productsState.items : [];

  if (!businessId) {
    return (
      <OwnerPageState
        type="empty"
        title={noBusinessTitle}
        message={noBusinessDesc}
      />
    );
  }

  if (salesState.status === "loading" || salesState.status === "idle") {
    return <OwnerPageState type="loading" title="Loading sales…" />;
  }

  if (salesState.status === "error") {
    return (
      <OwnerPageState
        type="error"
        title="Could not load sales"
        message={salesState.message}
      />
    );
  }

  const sales: SaleListItem[] = salesState.items;

  return (
    <>
      <OwnerPage>
        <OwnerPageHeader
          title="Sales"
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setNewSaleKey((k) => k + 1); setShowNewSale(true); }}
              className="rounded-xl border-2 border-primary font-black text-primary gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.07]"
            >
              <PlusIcon className="size-4" />
              New Sale
            </Button>
          }
        />

        {sales.length === 0 ? (
          <OwnerPageState
            type="empty"
            title="No sales yet"
            message="Record your first sale to start tracking income and profit."
          />
        ) : (
          <ul className="space-y-2">
            {sales.map((sale) => (
              <li
                key={sale.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card px-6 py-5 transition-all duration-200 ease-out hover:border-primary/40 hover:bg-primary/5"
              >
                {/* Left: date + meta */}
                <div className="min-w-0">
                  <div className="text-base font-black text-primary">
                    {formatDate(sale.saleDate)}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {sale.itemCount} item{sale.itemCount !== 1 ? "s" : ""}
                    </span>
                    {sale.note ? (
                      <>
                        <span>·</span>
                        <span className="max-w-40 truncate">{sale.note}</span>
                      </>
                    ) : null}
                  </div>
                </div>

                {/* Right: financials + action */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="text-right">
                    <div className="text-xs font-semibold text-muted-foreground">
                      Income
                    </div>
                    <div className="text-sm font-black text-foreground">
                      {fmt(sale.totalAmount)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-muted-foreground">
                      Cost
                    </div>
                    <div className="text-sm font-semibold text-foreground">
                      {fmt(sale.totalCost)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-semibold text-muted-foreground">
                      Profit
                    </div>
                    <div
                      className={`text-sm font-black ${sale.profit >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      {sale.profit >= 0 ? "+" : ""}
                      {fmt(sale.profit)}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl border-2 font-black transition-all duration-200 ease-out hover:scale-[1.07]"
                    onClick={() => setViewSaleId(sale.id)}
                  >
                    <EyeIcon className="size-3.5" />
                    View
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </OwnerPage>

      <NewSaleModal
        key={newSaleKey}
        businessId={businessId}
        products={products}
        open={showNewSale}
        onClose={() => setShowNewSale(false)}
        onSuccess={() => {
          setShowNewSale(false);
          refetchSales();
          refetchProducts();
        }}
      />

      <SaleDetailModal
        businessId={businessId}
        saleId={viewSaleId}
        onClose={() => setViewSaleId(null)}
      />
    </>
  );
}
