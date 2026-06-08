import { useState } from "react";
import { Link } from "react-router";
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
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import { useBranches } from "../_hooks/useBranches";
import { useCategories } from "../_hooks/useCategories";
import { useProducts } from "../_hooks/useProducts";
import { deleteProduct } from "../_api/products";
import { OwnerStateBlock } from "../_components/OwnerStateBlock";
import type { Product } from "../_api/products";
import type { Category } from "../_api/categories";

const PRICING_LABEL: Record<string, string> = {
  FIXED: "Fixed",
  NO_PRICE: "No price",
  STARTING_FROM: "From",
  CONTACT_FOR_PRICE: "Contact",
};

export function ProductListPage() {
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();

  const [filterBranchId, setFilterBranchId] = useState("");
  const [filterCategoryId, setFilterCategoryId] = useState("");

  const { state: branchState } = useBranches(businessId);
  const { state: categoryState } = useCategories(businessId);
  const { state: productState, refetch } = useProducts(businessId, {
    branchId: filterBranchId,
    categoryId: filterCategoryId,
  });

  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!businessId) {
    return (
      <OwnerStateBlock title={noBusinessTitle} description={noBusinessDesc} />
    );
  }

  const branches =
    branchState.status === "ready" ? branchState.items : [];
  const categories: Category[] =
    categoryState.status === "ready" ? categoryState.items : [];

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const SELECT_CLASS =
    "flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  async function handleConfirmDelete() {
    if (!pendingDelete || !businessId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(businessId, pendingDelete.id);
      setPendingDelete(null);
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the product.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Products
          </h2>
          <Button asChild size="sm">
            <Link to="/owner/products/new">New product</Link>
          </Button>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {branches.length > 0 && (
            <select
              aria-label="Filter by branch"
              className={SELECT_CLASS}
              value={filterBranchId}
              onChange={(e) => setFilterBranchId(e.target.value)}
            >
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          )}

          {categories.length > 0 && (
            <select
              aria-label="Filter by category"
              className={SELECT_CLASS}
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {deleteError ? (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {deleteError}
          </div>
        ) : null}

        {productState.status === "loading" ||
        productState.status === "idle" ? (
          <OwnerStateBlock title="Loading products…" />
        ) : productState.status === "error" ? (
          <OwnerStateBlock
            tone="error"
            title="Could not load products"
            description={productState.message}
          />
        ) : productState.items.length === 0 ? (
          <OwnerStateBlock
            title="No products yet"
            description="Add a product to get started."
          />
        ) : (
          <ul className="space-y-2">
            {productState.items.map((product) => (
              <li
                key={product.id}
                className="flex items-start justify-between gap-3 rounded-lg border bg-card px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {product.name}
                  </span>
                  {product.nameKm ? (
                    <span className="block truncate text-sm text-muted-foreground">
                      {product.nameKm}
                    </span>
                  ) : null}
                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    {product.categoryId &&
                    categoryById.has(product.categoryId) ? (
                      <span>{categoryById.get(product.categoryId)!.name}</span>
                    ) : null}
                    {product.label ? (
                      <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
                        {product.label}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <ProductPrice product={product} />
                  <StatusChips product={product} />
                  <div className="flex items-center gap-1.5 mt-1">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        to={`/owner/products/${encodeURIComponent(product.id)}`}
                      >
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(product);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{pendingDelete?.name}</strong> will be permanently
              deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function ProductPrice({ product }: { product: Product }) {
  const label = product.pricingType
    ? PRICING_LABEL[product.pricingType]
    : null;

  if (
    product.pricingType === "NO_PRICE" ||
    product.pricingType === "CONTACT_FOR_PRICE"
  ) {
    return (
      <span className="text-xs text-muted-foreground">{label}</span>
    );
  }
  if (product.salesPrice != null) {
    const prefix =
      product.pricingType === "STARTING_FROM" ? "From " : "";
    return (
      <span className="text-sm font-medium">
        {prefix}
        {product.salesPrice.toFixed(2)}
      </span>
    );
  }
  return null;
}

function StatusChips({ product }: { product: Product }) {
  return (
    <div className="flex items-center gap-1">
      {product.isAvailable ? (
        <span className="rounded bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-800">
          Available
        </span>
      ) : (
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          Unavailable
        </span>
      )}
      {!product.isVisible ? (
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
          Hidden
        </span>
      ) : null}
    </div>
  );
}
