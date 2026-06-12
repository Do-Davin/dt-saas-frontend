import { useState } from "react";
import { Link } from "react-router";
<<<<<<< HEAD
import { PlusIcon, Trash2Icon } from "lucide-react";
=======
import { PackageIcon, PencilIcon, Trash2Icon } from "lucide-react";
>>>>>>> feature/001-dev
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
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import { useBranches } from "../_hooks/useBranches";
import { useCategories } from "../_hooks/useCategories";
import { useProducts } from "../_hooks/useProducts";
import { deleteProduct } from "../_api/products";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
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
      <OwnerPageState type="empty" title={noBusinessTitle} message={noBusinessDesc} />
    );
  }

  const branches =
    branchState.status === "ready" ? branchState.items : [];
  const categories: Category[] =
    categoryState.status === "ready" ? categoryState.items : [];

  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const SELECT_CLASS =
    "w-full sm:w-auto flex h-9 rounded-xl border border-input bg-card px-3 py-1 text-sm font-medium transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50";

  async function handleConfirmDelete() {
    if (!pendingDelete || !businessId) return;
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
    <>
      <OwnerPage>
        <OwnerPageHeader
          title="Products"
          actions={
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.07]"
            >
              <Link to="/owner/products/new">
                <PackageIcon className="size-4" />
                New product
              </Link>
            </Button>
          }
        />

        {/* Filters — only rendered when at least one filter has options */}
        {(branches.length > 0 || categories.length > 0) && (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
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
        )}

        {deleteError ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {deleteError}
          </div>
        ) : null}

        {productState.status === "loading" ||
          productState.status === "idle" ? (
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
          <ul className="space-y-2">
            {productState.items.map((product) => (
              <li
                key={product.id}
<<<<<<< HEAD
                className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 rounded-lg border bg-card px-4 py-4 transition-all duration-200 ease-out hover:bg-muted/40 hover:-translate-y-0.5 hover:scale-[1.01]"
              >
                <div className="min-w-0 flex-1 w-full">
                  <span className="block truncate font-medium text-foreground">
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
=======
                className="flex items-center justify-between gap-4 rounded-2xl border bg-card px-6 py-8 transition-all duration-200 ease-out hover:bg-primary/5 hover:border-primary hover:scale-[1.01]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <PackageIcon className="size-10 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <span className="block min-w-0 truncate text-base font-black text-primary">
                      {product.name}
                    </span>
                    {product.nameKm ? (
                      <span className="block truncate text-sm font-semibold text-zinc-500">
                        {product.nameKm}
>>>>>>> feature/001-dev
                      </span>
                    ) : null}
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-semibold text-zinc-500">
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
                </div>

<<<<<<< HEAD
                <div className="flex w-full sm:w-auto flex-col items-end gap-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0 border-border/40">
                  <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end sm:flex-col sm:items-end gap-1.5">
                    <ProductPrice product={product} />
                    <StatusChips product={product} />
                  </div>
                  <div className="flex w-full sm:w-auto items-center justify-end gap-1.5 mt-1 sm:mt-0">
                    <Button variant="outline" size="sm" asChild>
=======
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <ProductPrice product={product} />
                  <StatusChips product={product} />
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-1.5 rounded-xl border-2 font-black transition-all duration-200 ease-out hover:scale-[1.07]"
                    >
>>>>>>> feature/001-dev
                      <Link
                        to={`/owner/products/${encodeURIComponent(product.id)}`}
                      >
                        <PencilIcon className="size-3.5" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-xl border-2 border-destructive/50 text-destructive font-black transition-all duration-200 ease-out hover:bg-destructive/5 hover:border-destructive hover:text-destructive hover:scale-[1.07]"
                      onClick={() => {
                        setDeleteError(null);
                        setPendingDelete(product);
                      }}
                    >
                      <Trash2Icon className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </OwnerPage>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader align="center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5 dark:bg-destructive/20 dark:ring-destructive/10 mb-4">
              <Trash2Icon className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground mb-1">Delete this product?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-center">
              Product <span className="font-semibold text-foreground">"{pendingDelete?.name}"</span> will be permanently deleted.
              <span className="block mt-1 text-xs text-destructive/80 font-medium">This action cannot be undone.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-center gap-3 mt-4">
            <AlertDialogCancel disabled={isDeleting} className="mt-0 sm:mt-0 flex-1">Cancel</AlertDialogCancel>
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
      <span className="text-xs font-semibold text-zinc-500">{label}</span>
    );
  }
  if (product.salesPrice != null) {
    const prefix =
      product.pricingType === "STARTING_FROM" ? "From " : "";
    return (
      <span className="text-sm font-black text-primary">
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
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
          Available
        </span>
      ) : (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          Unavailable
        </span>
      )}
      {!product.isVisible ? (
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          Hidden
        </span>
      ) : null}
    </div>
  );
}
