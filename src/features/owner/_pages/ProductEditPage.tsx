import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router";
import { SaveIcon, ArrowLeftIcon, Trash2Icon, Loader2 } from "lucide-react";
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
import { useProduct } from "../_hooks/useProduct";
import { useBranches } from "../_hooks/useBranches";
import { useCategories } from "../_hooks/useCategories";
import { updateProduct, deleteProduct } from "../_api/products";
import { ProductFormFields } from "../_components/ProductForm";
import { ProductImageManager } from "../_components/ProductImageManager";
import {
  CrudBackButton,
  OwnerCrudTransition,
} from "../_components/OwnerCrudTransition";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
import {
  validateProductForm,
  hasErrors,
  parseMoney,
} from "../_utils/productForm";
import type { Product, PricingType, UnitOfMeasure } from "../_api/products";
import type {
  BranchOption,
  CategoryOption,
  ProductFormValues,
  ProductFormErrors,
} from "../_utils/productForm";

// Optional router state shape passed from ProductNewPage after image
// upload partial/full failure. ProductEditPage must render correctly when
// this is absent (e.g. after refresh or direct navigation).
interface ImageUploadFailureState {
  kind: "partial" | "all";
  failedNames: string[];
}

function readFailureState(state: unknown): ImageUploadFailureState | null {
  if (!state || typeof state !== "object") return null;
  const raw = (state as { imageUploadFailure?: unknown }).imageUploadFailure;
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  if (r.kind !== "partial" && r.kind !== "all") return null;
  if (!Array.isArray(r.failedNames)) return null;
  return {
    kind: r.kind,
    failedNames: r.failedNames.filter((n): n is string => typeof n === "string"),
  };
}

export function ProductEditPage() {
  const { productId } = useParams<{ productId: string }>();
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const productState = useProduct(businessId, productId);
  const { state: branchState } = useBranches(businessId);
  const { state: categoryState } = useCategories(businessId);
  const location = useLocation();

  if (!businessId) {
    return (
      <OwnerPageState
        type="empty"
        title={noBusinessTitle}
        message={noBusinessDesc}
      />
    );
  }

  if (productState.status === "idle" || productState.status === "loading") {
    return <OwnerPageState type="loading" title="Loading product…" />;
  }

  if (productState.status === "error") {
    return (
      <OwnerPageState
        type="error"
        title="Could not load product"
        message={productState.message}
      />
    );
  }

  const branches: BranchOption[] =
    branchState.status === "ready"
      ? branchState.items.map((b) => ({ id: b.id, name: b.name }))
      : [];

  const categories: CategoryOption[] =
    categoryState.status === "ready"
      ? categoryState.items.map((c) => ({ id: c.id, name: c.name }))
      : [];

  const failureNotice = readFailureState(location.state);

  return (
    <ProductEditorForm
      key={productState.product.id}
      product={productState.product}
      businessId={businessId}
      branches={branches}
      categories={categories}
      initialFailure={failureNotice}
    />
  );
}

function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    nameKm: product.nameKm ?? "",
    description: product.description ?? "",
    // descriptionKm has no UI but must round-trip so editing other fields
    // never erases an existing Khmer description.
    descriptionKm: product.descriptionKm ?? "",
    categoryId: product.categoryId ?? "",
    branchId: product.branchId ?? "",
    salesPrice:
      product.salesPrice != null ? String(product.salesPrice) : "",
    purchasePrice:
      product.purchasePrice != null ? String(product.purchasePrice) : "",
    discount: product.discount != null ? String(product.discount) : "",
    label: product.label ?? "",
    unitOfMeasure: product.unitOfMeasure ?? "",
    pricingType: product.pricingType ?? "",
    isAvailable: product.isAvailable,
    isVisible: product.isVisible,
  };
}

type SubmitStatus =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

interface ProductEditorFormProps {
  product: Product;
  businessId: string;
  branches: BranchOption[];
  categories: CategoryOption[];
  initialFailure: ImageUploadFailureState | null;
}

function ProductEditorForm({
  product,
  businessId,
  branches,
  categories,
  initialFailure,
}: ProductEditorFormProps) {
  const navigate = useNavigate();

  const [values, setValues] = useState<ProductFormValues>(() =>
    productToFormValues(product),
  );
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    status: "idle",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleChange<K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const next = validateProductForm(values);
    if (hasErrors(next)) {
      setErrors(next);
      return;
    }
    setSubmitStatus({ status: "submitting" });
    try {
      await updateProduct(businessId, product.id, {
        name: values.name.trim(),
        ...(values.nameKm.trim() ? { nameKm: values.nameKm.trim() } : {}),
        ...(values.description.trim()
          ? { description: values.description.trim() }
          : {}),
        ...(values.descriptionKm.trim()
          ? { descriptionKm: values.descriptionKm.trim() }
          : {}),
        ...(values.categoryId ? { categoryId: values.categoryId } : {}),
        ...(values.branchId ? { branchId: values.branchId } : {}),
        ...(values.pricingType
          ? { pricingType: values.pricingType as PricingType }
          : {}),
        ...(values.unitOfMeasure
          ? { unitOfMeasure: values.unitOfMeasure as UnitOfMeasure }
          : {}),
        ...(values.label.trim() ? { label: values.label.trim() } : {}),
        ...(parseMoney(values.salesPrice) !== undefined
          ? { salesPrice: parseMoney(values.salesPrice) }
          : {}),
        ...(parseMoney(values.purchasePrice) !== undefined
          ? { purchasePrice: parseMoney(values.purchasePrice) }
          : {}),
        ...(parseMoney(values.discount) !== undefined
          ? { discount: parseMoney(values.discount) }
          : {}),
        isAvailable: values.isAvailable,
        isVisible: values.isVisible,
      });
      toast.success(`Product "${values.name.trim()}" updated successfully`);
      navigate("/owner/products", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while saving the product.";
      setSubmitStatus({ status: "error", message });
      toast.error(message);
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteProduct(businessId, product.id);
      toast.success(`Product "${product.name}" deleted successfully`);
      navigate("/owner/products", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the product.";
      setDeleteError(message);
      toast.error(message);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  }

  const isSubmitting = submitStatus.status === "submitting";
  const isBusy = isSubmitting || isDeleting;

  return (
    <>
      <OwnerCrudTransition>
        <div className="space-y-3 pb-24 sm:pb-0">
          <CrudBackButton to="/owner/products" />
          <OwnerPageHeader title="Edit product" />

          <div className="rounded-2xl border bg-card px-4 py-4 sm:px-5 sm:py-5">
            {deleteError ? (
              <div
                role="alert"
                className="mb-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
              >
                {deleteError}
              </div>
            ) : null}

            <form onSubmit={(e) => void handleSubmit(e)} noValidate>
              <ProductFormFields
                values={values}
                errors={errors}
                disabled={isBusy}
                branches={branches}
                categories={categories}
                onChange={handleChange}
                submitError={
                  submitStatus.status === "error"
                    ? submitStatus.message
                    : undefined
                }
              />

              {/* Desktop footer */}
              <div className="mt-4 hidden flex-wrap items-center justify-between gap-2 border-t pt-3 sm:flex">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-2 border-destructive/50 text-destructive font-black gap-1.5 transition-all duration-200 ease-out hover:bg-destructive/5 hover:border-destructive hover:text-destructive"
                  disabled={isBusy}
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2Icon className="size-3.5" />
                  Delete
                </Button>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isBusy}
                    onClick={() =>
                      navigate("/owner/products", { replace: true })
                    }
                    className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary"
                  >
                    <ArrowLeftIcon className="size-3.5" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isBusy}
                    className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <SaveIcon className="size-4" />
                    )}
                    {isSubmitting ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </div>

              {/* Mobile sticky footer */}
              <div className="fixed inset-x-0 bottom-0 z-10 flex items-center gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/85 sm:hidden">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => navigate("/owner/products", { replace: true })}
                  className="h-11 flex-1 rounded-xl border-2 border-primary text-primary font-black gap-1.5"
                >
                  <ArrowLeftIcon className="size-3.5" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isBusy}
                  className="h-11 flex-1 rounded-xl border-2 border-primary text-primary font-black gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <SaveIcon className="size-4" />
                  )}
                  {isSubmitting ? "Saving…" : "Save"}
                </Button>
              </div>
            </form>
          </div>

          <ProductImageManager
            businessId={businessId}
            productId={product.id}
            notice={initialFailure ?? undefined}
          />
        </div>
      </OwnerCrudTransition>

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) setShowDeleteDialog(false);
        }}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader align="center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5 dark:bg-destructive/20 dark:ring-destructive/10 mb-4">
              <Trash2Icon className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground mb-1">
              Delete this product?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-center">
              Product{" "}
              <span className="font-semibold text-foreground">
                "{product.name}"
              </span>{" "}
              will be permanently deleted.
              <span className="block mt-1 text-xs text-destructive/80 font-medium">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center justify-center gap-3 mt-4">
            <AlertDialogCancel
              disabled={isDeleting}
              className="mt-0 sm:mt-0 flex-1"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
              className="flex-1"
            >
              {isDeleting ? "Deleting…" : "Delete product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
