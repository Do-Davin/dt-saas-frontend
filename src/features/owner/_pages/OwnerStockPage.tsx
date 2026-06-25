import { useMemo, useState } from "react";
import { PackageIcon, SlidersHorizontalIcon, Loader2 } from "lucide-react";
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
import { useProducts } from "../_hooks/useProducts";
import { useCategories } from "../_hooks/useCategories";
import { adjustStock } from "../_api/products";
import type { Product, StockAdjustmentReason } from "../_api/products";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";

// ── Stock status ──────────────────────────────────────────────────────────────

type StockStatus = "in" | "low" | "out";

function getStockStatus(qty: number, threshold: number | null): StockStatus {
  if (qty === 0) return "out";
  if (threshold !== null && qty <= threshold) return "low";
  return "in";
}

const STATUS_BADGE: Record<StockStatus, { label: string; className: string }> =
  {
    in: {
      label: "In Stock",
      className: "bg-green-100 text-green-700",
    },
    low: {
      label: "Low Stock",
      className: "bg-amber-100 text-amber-700",
    },
    out: {
      label: "Out of Stock",
      className: "bg-red-100 text-red-700",
    },
  };

// ── Adjust stock modal ────────────────────────────────────────────────────────

const REASON_OPTIONS: { value: StockAdjustmentReason; label: string }[] = [
  { value: "RESTOCK", label: "Restock" },
  { value: "CORRECTION", label: "Correction" },
  { value: "WASTE", label: "Waste" },
];

interface AdjustModalProps {
  product: Product | null;
  businessId: string;
  onClose: () => void;
  onSuccess: () => void;
}

function AdjustStockModal({
  product,
  businessId,
  onClose,
  onSuccess,
}: AdjustModalProps) {
  const [adjustment, setAdjustment] = useState("");
  const [reason, setReason] = useState<StockAdjustmentReason>("RESTOCK");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parsed = parseInt(adjustment, 10);
  const isValidAdjustment =
    adjustment.trim() !== "" && Number.isInteger(parsed);
  const newQty = product ? product.stockQuantity + (isValidAdjustment ? parsed : 0) : 0;
  const wouldGoNegative = isValidAdjustment && newQty < 0;

  async function handleSubmit() {
    if (!product) return;
    if (!isValidAdjustment) {
      setError("Enter a valid whole number.");
      return;
    }
    if (newQty < 0) {
      setError(
        `Cannot go below 0. Current: ${product.stockQuantity}, adjustment: ${parsed}.`,
      );
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await adjustStock(businessId, product.id, {
        adjustment: parsed,
        reason,
      });
      toast.success(`Stock updated for "${product.name}"`);
      onSuccess();
    } catch (err: unknown) {
      const msg =
        err instanceof ApiError ? err.message : "Failed to adjust stock.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={product !== null}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border bg-muted/30 px-4 py-3 text-sm">
            <span className="font-semibold text-foreground">
              {product?.name}
            </span>
            <span className="ml-2 text-muted-foreground">
              · Current: {product?.stockQuantity ?? 0}
            </span>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="stock-adjustment"
              className="text-xs font-semibold text-muted-foreground"
            >
              Adjustment
            </label>
            <input
              id="stock-adjustment"
              type="number"
              value={adjustment}
              onChange={(e) => {
                setAdjustment(e.target.value);
                setError(null);
              }}
              disabled={isSubmitting}
              placeholder="e.g. 10 or -3"
              className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm font-semibold text-foreground outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
            />
            {isValidAdjustment ? (
              <p
                className={`text-xs font-semibold ${wouldGoNegative ? "text-destructive" : "text-muted-foreground"}`}
              >
                New quantity: {newQty}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="stock-reason"
              className="text-xs font-semibold text-muted-foreground"
            >
              Reason
            </label>
            <select
              id="stock-reason"
              value={reason}
              onChange={(e) =>
                setReason(e.target.value as StockAdjustmentReason)
              }
              disabled={isSubmitting}
              className="h-11 w-full appearance-none rounded-xl border border-input bg-card px-3 text-sm font-semibold text-foreground outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:opacity-60"
            >
              {REASON_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
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
            disabled={isSubmitting || wouldGoNegative || !isValidAdjustment}
            className="gap-1.5 rounded-xl border-2 border-primary font-black text-primary transition-all duration-200 ease-out hover:border-primary hover:bg-primary/10 hover:text-primary"
          >
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {isSubmitting ? "Saving…" : "Apply"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function OwnerStockPage() {
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const { state, refetch } = useProducts(businessId, {
    branchId: "",
    categoryId: "",
  });
  const { state: categoryState } = useCategories(businessId);
  const [adjustingProduct, setAdjustingProduct] = useState<Product | null>(
    null,
  );

  const categoryNameById = useMemo(() => {
    if (categoryState.status !== "ready") return {} as Record<string, string>;
    return Object.fromEntries(
      categoryState.items.map((c) => [c.id, c.name] as [string, string]),
    );
  }, [categoryState]);

  if (!businessId) {
    return (
      <OwnerPageState
        type="empty"
        title={noBusinessTitle}
        message={noBusinessDesc}
      />
    );
  }

  if (state.status === "loading" || state.status === "idle") {
    return <OwnerPageState type="loading" title="Loading stock…" />;
  }

  if (state.status === "error") {
    return (
      <OwnerPageState
        type="error"
        title="Could not load stock"
        message={state.message}
      />
    );
  }

  return (
    <>
      <OwnerPage>
        <OwnerPageHeader
          title="Stock"
          description="Manage product stock levels for your business."
        />

        {state.items.length === 0 ? (
          <OwnerPageState
            type="empty"
            title="No products yet"
            message="Add products to start tracking stock."
          />
        ) : (
          <ul className="space-y-2">
            {state.items.map((product) => {
              const status = getStockStatus(
                product.stockQuantity,
                product.lowStockThreshold,
              );
              const badge = STATUS_BADGE[status];
              const categoryName = product.categoryId
                ? categoryNameById[product.categoryId]
                : null;
              return (
                <li
                  key={product.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card px-6 py-5 transition-all duration-200 ease-out hover:border-primary/40 hover:bg-primary/5"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <PackageIcon className="size-8 shrink-0 text-muted-foreground" />
                    <div className="min-w-0">
                      <span className="block truncate text-base font-black text-primary">
                        {product.name}
                      </span>
                      {categoryName ? (
                        <span className="text-xs font-semibold text-zinc-500">
                          {categoryName}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="font-black text-foreground">
                        {product.stockQuantity}
                      </span>
                      {product.lowStockThreshold !== null ? (
                        <span className="text-xs text-muted-foreground">
                          / {product.lowStockThreshold} min
                        </span>
                      ) : null}
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-xl border-2 font-black transition-all duration-200 ease-out hover:scale-[1.07]"
                      onClick={() => setAdjustingProduct(product)}
                    >
                      <SlidersHorizontalIcon className="size-3.5" />
                      Adjust
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </OwnerPage>

      <AdjustStockModal
        product={adjustingProduct}
        businessId={businessId}
        onClose={() => setAdjustingProduct(null)}
        onSuccess={() => {
          setAdjustingProduct(null);
          refetch();
        }}
      />
    </>
  );
}
