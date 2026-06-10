import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
import { validateProductForm, hasErrors, parseMoney } from "../_utils/productForm";
import type { Product, PricingType, UnitOfMeasure } from "../_api/products";
import type {
  BranchOption,
  CategoryOption,
  ProductFormValues,
  ProductFormErrors,
} from "../_utils/productForm";

export function ProductEditPage() {
  const { productId } = useParams<{ productId: string }>();
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const productState = useProduct(businessId, productId);
  const { state: branchState } = useBranches(businessId);
  const { state: categoryState } = useCategories(businessId);

  if (!businessId) {
    return (
      <OwnerPageState type="empty" title={noBusinessTitle} message={noBusinessDesc} />
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

  return (
    <ProductEditorForm
      key={productState.product.id}
      product={productState.product}
      businessId={businessId}
      branches={branches}
      categories={categories}
    />
  );
}

function productToFormValues(product: Product): ProductFormValues {
  return {
    name: product.name,
    nameKm: product.nameKm ?? "",
    description: product.description ?? "",
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
}

function ProductEditorForm({
  product,
  businessId,
  branches,
  categories,
}: ProductEditorFormProps) {
  const navigate = useNavigate();

  const [values, setValues] = useState<ProductFormValues>(() =>
    productToFormValues(product)
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
    value: ProductFormValues[K]
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

  return (
    <>
      <OwnerCrudTransition>
        <>
          <div className="max-w-lg space-y-4">
            <CrudBackButton to="/owner/products" />

            <OwnerPageHeader title="Edit product" />

            <div className="rounded-lg border bg-card p-6 space-y-4">
              {submitStatus.status === "error" ? (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  {submitStatus.message}
                </div>
              ) : null}

              {deleteError ? (
                <div
                  role="alert"
                  className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
                >
                  {deleteError}
                </div>
              ) : null}

              <form onSubmit={(e) => void handleSubmit(e)} noValidate>
                <ProductFormFields
                  values={values}
                  errors={errors}
                  disabled={isSubmitting || isDeleting}
                  branches={branches}
                  categories={categories}
                  onChange={handleChange}
                />
                <div className="mt-6 flex items-center justify-between gap-3">
                  <div className="flex gap-3">
                    <Button type="submit" disabled={isSubmitting || isDeleting}>
                      {isSubmitting ? "Saving…" : "Save changes"}
                    </Button>
                    <Button variant="outline" asChild>
                      <Link to="/owner/products">Cancel</Link>
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    disabled={isSubmitting || isDeleting}
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    Delete
                  </Button>
                </div>
              </form>
            </div>
          </div>

          <Separator className="my-8 max-w-lg" />

          <ProductImageManager
            businessId={businessId}
            productId={product.id}
          />
        </>
      </OwnerCrudTransition>

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) setShowDeleteDialog(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{product.name}</strong> will be permanently deleted. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? "Deleting…" : "Delete product"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
