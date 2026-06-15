import { useState } from "react";
import { Link } from "react-router";
import {
  BuildingIcon,
  PackageIcon,
  PencilIcon,
  TagIcon,
  Trash2Icon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ApiError } from "@/lib/api/client";
import { toast } from "@/components/ui/toast";
import { useBranches } from "../_hooks/useBranches";
import { useCategories } from "../_hooks/useCategories";
import { useProducts } from "../_hooks/useProducts";
import { deleteProduct } from "../_api/products";
import { OwnerPageState } from "./OwnerPageState";
import type { Product } from "../_api/products";

const PRICING_LABEL: Record<string, string> = {
  FIXED: "Fixed",
  NO_PRICE: "No price",
  STARTING_FROM: "From",
  CONTACT_FOR_PRICE: "Contact",
};

// Narrow shapes: only the fields this panel actually reads.
interface PrefetchedBranch {
  id: string;
  name: string;
}
interface PrefetchedCategory {
  id: string;
  name: string;
  branchId?: string | null;
}

interface ProductBrowserPanelProps {
  businessId: string;
  // When provided by a parent that already called useBranches/useCategories,
  // the panel skips its own fetch to avoid duplicate network requests.
  // Pass `null` while the parent data is still loading; pass the items once ready.
  // Omit entirely (undefined) to have the panel fetch its own data.
  prefetchedBranches?: PrefetchedBranch[] | null;
  prefetchedCategories?: PrefetchedCategory[] | null;
}

export function ProductBrowserPanel({
  businessId,
  prefetchedBranches,
  prefetchedCategories,
}: ProductBrowserPanelProps) {
  const [filterBranchId, setFilterBranchId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");

  // Pass null to suppress the hook's own fetch when the parent manages the data.
  // Passing null makes useBranches/useCategories return {status:"idle"} with no request.
  const { state: ownBranchState } = useBranches(
    prefetchedBranches !== undefined ? null : businessId,
  );
  const { state: ownCategoryState } = useCategories(
    prefetchedCategories !== undefined ? null : businessId,
  );
  const { state: productState, refetch } = useProducts(businessId, {
    branchId: filterBranchId,
    categoryId: filterCategoryId,
  });

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const branches =
    prefetchedBranches ??
    (ownBranchState.status === "ready" ? ownBranchState.items : []);
  const allCategories =
    prefetchedCategories ??
    (ownCategoryState.status === "ready" ? ownCategoryState.items : []);

  const visibleCategories =
    filterBranchId === ""
      ? allCategories
      : allCategories.filter(
          (c) => c.branchId == null || c.branchId === filterBranchId,
        );

  function handleBranchChange(branchId: string) {
    setFilterBranchId(branchId);
    if (branchId !== "" && filterCategoryId !== "") {
      const sel = allCategories.find((c) => c.id === filterCategoryId);
      if (sel?.branchId != null && sel.branchId !== branchId) {
        setFilterCategoryId("");
      }
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(businessId, pendingDelete.id);
      toast.success(`Product "${pendingDelete.name}" deleted successfully`);
      setPendingDelete(null);
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the product.";
      setDeleteError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Horizontal filter strips */}
      {(branches.length > 0 || allCategories.length > 0) && (
        <div className="space-y-3">
          {branches.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Branch
              </p>
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                <FilterTile
                  label="All branches"
                  icon={<BuildingIcon className="size-4" />}
                  active={filterBranchId === ""}
                  onClick={() => handleBranchChange("")}
                />
                {branches.map((b) => (
                  <FilterTile
                    key={b.id}
                    label={b.name}
                    initial={b.name.charAt(0).toUpperCase()}
                    active={filterBranchId === b.id}
                    onClick={() => handleBranchChange(b.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {allCategories.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Category
              </p>
              <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                <FilterTile
                  label="All categories"
                  icon={<TagIcon className="size-4" />}
                  active={filterCategoryId === ""}
                  onClick={() => setFilterCategoryId("")}
                />
                {visibleCategories.map((c) => (
                  <FilterTile
                    key={c.id}
                    label={c.name}
                    initial={c.name.charAt(0).toUpperCase()}
                    active={filterCategoryId === c.id}
                    onClick={() => setFilterCategoryId(c.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {deleteError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {deleteError}
        </div>
      ) : null}

      {productState.status === "loading" || productState.status === "idle" ? (
        <OwnerPageState type="loading" title="Loading products…" />
      ) : productState.status === "error" ? (
        <OwnerPageState
          type="error"
          title="Could not load products"
          message={productState.message}
        />
      ) : productState.items.length === 0 ? (
        <OwnerPageState
          type="empty"
          title="No products yet"
          message="Add a product to get started."
        />
      ) : (
        <>
          {/* ── Mobile dense table with sticky Product + Price ─────── */}
          <MobileProductTable
            items={productState.items}
            onRequestDelete={(product) => {
              setDeleteError(null);
              setPendingDelete(product);
            }}
          />

          {/* ── Desktop table ──────────────────────────────────────── */}
          <div className="hidden md:block overflow-hidden rounded-2xl border-[1.5px] bg-card">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b-[1.5px]">
                  <th className="py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Product
                  </th>
                  <th className="w-28 py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Price
                  </th>
                  <th className="w-24 py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Discount
                  </th>
                  <th className="w-20 py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Menu
                  </th>
                  <th className="w-28 py-2.5 px-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                  <th className="w-10 py-2.5 px-3" aria-hidden="true" />
                  <th className="w-10 py-2.5 pl-3 pr-3" aria-hidden="true" />
                </tr>
              </thead>
              <tbody>
                {productState.items.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b-[1.5px] transition-colors last:border-b-0 hover:bg-primary/5"
                  >
                    <td className="py-2.5 px-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <ProductThumbnail product={product} />
                        <p className="min-w-0 truncate text-[13px] font-semibold text-primary">
                          {product.name}
                        </p>
                      </div>
                    </td>

                    <td className="py-2.5 px-3">
                      <ProductPrice product={product} />
                    </td>

                    <td className="py-2.5 px-3 tabular-nums font-semibold text-zinc-600">
                      {product.discount != null
                        ? product.discount.toFixed(2)
                        : "—"}
                    </td>

                    <td className="py-2.5 px-3">
                      {product.isVisible ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                          Shown
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Hidden
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      {product.isAvailable ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700">
                          Available
                        </span>
                      ) : (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Unavailable
                        </span>
                      )}
                    </td>

                    <td className="py-2.5 px-3">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        aria-label={`Edit ${product.name}`}
                        className="size-8 rounded-xl border-2 font-black transition-all duration-200 ease-out hover:scale-[1.07]"
                      >
                        <Link
                          to={`/owner/products/${encodeURIComponent(product.id)}`}
                        >
                          <PencilIcon className="size-3.5" />
                        </Link>
                      </Button>
                    </td>

                    <td className="py-2.5 pl-3 pr-3">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={`Delete ${product.name}`}
                        className="size-8 rounded-xl border-2 border-destructive/50 text-destructive font-black transition-all duration-200 ease-out hover:scale-[1.07] hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
                        onClick={() => {
                          setDeleteError(null);
                          setPendingDelete(product);
                        }}
                      >
                        <Trash2Icon className="size-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader align="center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5 dark:bg-destructive/20 dark:ring-destructive/10">
              <Trash2Icon className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="mb-1 text-xl font-bold tracking-tight text-foreground">
              Delete this product?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-sm text-muted-foreground">
              Product{" "}
              <span className="font-semibold text-foreground">
                &ldquo;{pendingDelete?.name}&rdquo;
              </span>{" "}
              will be permanently deleted.
              <span className="mt-1 block text-xs font-medium text-destructive/80">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 flex flex-row items-center justify-center gap-3">
            <AlertDialogCancel
              disabled={isDeleting}
              className="mt-0 flex-1 sm:mt-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
              className="flex-1"
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Filter tile ──────────────────────────────────────────────────────────────

interface FilterTileProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: ReactNode;
  initial?: string;
}

function FilterTile({ label, active, onClick, icon, initial }: FilterTileProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex shrink-0 cursor-pointer flex-col items-center gap-1 rounded-xl border-2 px-3 py-2 transition-all duration-150",
        active
          ? "border-primary bg-primary/10 text-primary"
          : "border-transparent bg-muted/50 text-zinc-500 hover:border-primary/30 hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg text-sm font-black",
          active ? "bg-primary/20" : "bg-muted",
        )}
      >
        {icon ?? initial ?? "?"}
      </span>
      <span className="max-w-[72px] truncate text-xs font-semibold">
        {label}
      </span>
    </button>
  );
}

// ─── Product thumbnail ────────────────────────────────────────────────────────

function ProductThumbnail({ product }: { product: Product }) {
  // Store the URL that failed rather than a plain boolean so that when a
  // query refetch delivers a new presigned URL, failedUrl !== url and the
  // browser automatically retries the fresh URL — no effect required.
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = product.primaryImage?.url ?? null;
  const failed = url !== null && url === failedUrl;

  if (product.primaryImage != null && !failed) {
    return (
      <img
        src={url ?? undefined}
        alt={product.primaryImage.alt ?? product.name}
        className="size-12 shrink-0 rounded-lg bg-muted object-cover"
        onError={() => setFailedUrl(url)}
      />
    );
  }

  return (
    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-muted">
      <PackageIcon className="size-6 text-muted-foreground" />
    </span>
  );
}

// ─── Price cell ───────────────────────────────────────────────────────────────

function ProductPrice({ product }: { product: Product }) {
  const label = product.pricingType ? PRICING_LABEL[product.pricingType] : null;

  if (
    product.pricingType === "NO_PRICE" ||
    product.pricingType === "CONTACT_FOR_PRICE"
  ) {
    return <span className="text-xs font-semibold text-zinc-500">{label}</span>;
  }
  if (product.salesPrice != null) {
    const prefix = product.pricingType === "STARTING_FROM" ? "From " : "";
    return (
      <span className="tabular-nums font-black text-primary">
        {prefix}
        {product.salesPrice.toFixed(2)}
      </span>
    );
  }
  return null;
}

// ─── Mobile dense table with sticky Product + Price columns ──────────────────
//
// Renders a real <table> on mobile. The first two columns (Product, Price)
// stick to the left of the horizontal scroll container; Discount, Menu,
// Status, Actions scroll out from under them.
//
// Column widths are shared between <th> and <td> via CSS custom properties
// (--m-prod-w, --m-price-w) declared on the wrapper, so sticky offsets and
// column widths never drift apart. Sticky cells use bg-card so scrolling
// columns never bleed through. A 1px inset shadow on the right of the Price
// column hints that more columns continue under it.

const MOBILE_PRODUCT_W = "140px";
const MOBILE_PRICE_W = "58px";
// Sum of all column widths: 140 + 58 + 72 + 66 + 82 + 88 = 506. Set the table
// min-width to that sum so columns hit their target widths exactly with no
// extra blank space distributed to any cell.
const MOBILE_TABLE_MIN_W = "506px";

interface MobileProductTableProps {
  items: Product[];
  onRequestDelete: (product: Product) => void;
}

function MobileProductTable({
  items,
  onRequestDelete,
}: MobileProductTableProps) {
  // CSS variables let <th> and <td> share width / sticky-left values so they
  // can never go out of sync. Cast required because TS does not model
  // custom-property keys on CSSProperties.
  const cssVars = {
    "--m-prod-w": MOBILE_PRODUCT_W,
    "--m-price-w": MOBILE_PRICE_W,
  } as React.CSSProperties;

  const headerStyle = "px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted/40";

  return (
    <div
      className="md:hidden -mx-4 overflow-x-auto border-y-[1.5px] bg-card"
      style={cssVars}
    >
      <table
        className="w-full border-collapse text-xs"
        style={{ minWidth: MOBILE_TABLE_MIN_W }}
      >
        <thead>
          <tr className="border-b-[1.5px]">
            <th
              scope="col"
              className={cn(
                headerStyle,
                "sticky left-0 z-30 text-left pl-3",
              )}
              style={{
                width: "var(--m-prod-w)",
                minWidth: "var(--m-prod-w)",
                maxWidth: "var(--m-prod-w)",
              }}
            >
              Product
            </th>
            <th
              scope="col"
              className={cn(
                headerStyle,
                "sticky z-30 text-right",
                "shadow-[inset_-1.5px_0_0_var(--border)]",
              )}
              style={{
                left: "var(--m-prod-w)",
                width: "var(--m-price-w)",
                minWidth: "var(--m-price-w)",
                maxWidth: "var(--m-price-w)",
              }}
            >
              Price
            </th>
            <th
              scope="col"
              className={cn(headerStyle, "text-right")}
              style={{ width: "72px", minWidth: "72px" }}
            >
              Discount
            </th>
            <th
              scope="col"
              className={cn(headerStyle, "text-left")}
              style={{ width: "66px", minWidth: "66px" }}
            >
              Menu
            </th>
            <th
              scope="col"
              className={cn(headerStyle, "text-left")}
              style={{ width: "82px", minWidth: "82px" }}
            >
              Status
            </th>
            <th
              scope="col"
              className={cn(headerStyle, "text-right pr-2")}
              style={{ width: "88px", minWidth: "88px" }}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((product) => (
            <MobileProductTableRow
              key={product.id}
              product={product}
              onDelete={() => onRequestDelete(product)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface MobileProductTableRowProps {
  product: Product;
  onDelete: () => void;
}

function MobileProductTableRow({
  product,
  onDelete,
}: MobileProductTableRowProps) {
  // Hover background is applied per-cell (not on the <tr>) because sticky
  // cells need their own opaque bg and a tr-level background does not paint
  // beneath sticky positioning. Using a `group` class on the row lets every
  // cell react to the same hover.
  const bodyCell = "px-2 py-2 align-middle text-xs group-hover:bg-primary/5";

  return (
    <tr className="group border-t-[1.5px]">
      {/* Sticky Product cell — left:0, opaque bg, name only (no Khmer) */}
      <td
        className={cn(
          bodyCell,
          "sticky left-0 z-20 bg-card pl-3",
        )}
        style={{
          width: "var(--m-prod-w)",
          minWidth: "var(--m-prod-w)",
          maxWidth: "var(--m-prod-w)",
        }}
      >
        <p className="line-clamp-2 text-xs font-semibold leading-tight text-primary">
          {product.name}
        </p>
      </td>

      {/* Sticky Price cell — left:var(--m-prod-w), 1.5px inset shadow */}
      <td
        className={cn(
          bodyCell,
          "sticky z-20 bg-card text-right whitespace-nowrap",
          "shadow-[inset_-1.5px_0_0_var(--border)]",
        )}
        style={{
          left: "var(--m-prod-w)",
          width: "var(--m-price-w)",
          minWidth: "var(--m-price-w)",
          maxWidth: "var(--m-price-w)",
        }}
      >
        <ProductPrice product={product} />
      </td>

      <td
        className={cn(
          bodyCell,
          "text-right tabular-nums font-semibold text-zinc-600",
        )}
      >
        {product.discount != null ? `−${product.discount.toFixed(2)}` : "—"}
      </td>

      <td className={bodyCell}>
        <CompactBadge
          on={product.isVisible}
          onLabel="Shown"
          offLabel="Hidden"
        />
      </td>

      <td className={bodyCell}>
        <CompactBadge
          on={product.isAvailable}
          onLabel="Available"
          offLabel="Unavail."
        />
      </td>

      <td
        className={cn(
          bodyCell,
          "pr-2 text-right whitespace-nowrap",
        )}
      >
        <div className="inline-flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            asChild
            aria-label={`Edit ${product.name}`}
            className="size-9 rounded-lg border-2 font-black transition-colors hover:border-primary hover:text-primary"
          >
            <Link to={`/owner/products/${encodeURIComponent(product.id)}`}>
              <PencilIcon className="size-3.5" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label={`Delete ${product.name}`}
            className="size-9 rounded-lg border-2 border-destructive/50 text-destructive font-black transition-colors hover:border-destructive hover:bg-destructive/5 hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2Icon className="size-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

// ─── Compact status badge ────────────────────────────────────────────────────

interface CompactBadgeProps {
  on: boolean;
  onLabel: string;
  offLabel: string;
}

function CompactBadge({ on, onLabel, offLabel }: CompactBadgeProps) {
  return (
    <span
      className={cn(
        "inline-block whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
        on
          ? "bg-green-100 text-green-700"
          : "bg-muted text-muted-foreground",
      )}
    >
      {on ? onLabel : offLabel}
    </span>
  );
}
