import { useState } from "react";
import { useNavigate } from "react-router";
import { SaveIcon, ArrowLeftIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { toast } from "@/components/ui/toast";
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import { useBranches } from "../_hooks/useBranches";
import { useCategories } from "../_hooks/useCategories";
import { createProduct } from "../_api/products";
import { uploadProductImage } from "../_api/productImages";
import { ProductFormFields } from "../_components/ProductForm";
import { CreateProductImageField } from "../_components/CreateProductImageField";
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
  parsePositiveInt,
  EMPTY_PRODUCT_FORM,
} from "../_utils/productForm";
import type {
  ProductFormValues,
  ProductFormErrors,
} from "../_utils/productForm";
import type { PricingType, UnitOfMeasure } from "../_api/products";

type SubmitStatus =
  | { status: "idle" }
  | { status: "creating" }
  | { status: "uploading"; index: number; total: number }
  | { status: "error"; message: string };

export function ProductNewPage() {
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const { state: branchState } = useBranches(businessId);
  const { state: categoryState } = useCategories(businessId);
  const navigate = useNavigate();

  const [values, setValues] = useState<ProductFormValues>(EMPTY_PRODUCT_FORM);
  const [errors, setErrors] = useState<ProductFormErrors>({});
  const [stagedImages, setStagedImages] = useState<File[]>([]);
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    status: "idle",
  });

  if (!businessId) {
    return (
      <OwnerPageState
        type="empty"
        title={noBusinessTitle}
        message={noBusinessDesc}
      />
    );
  }

  const branches =
    branchState.status === "ready"
      ? branchState.items.map((b) => ({ id: b.id, name: b.name }))
      : [];

  const categories =
    categoryState.status === "ready"
      ? categoryState.items.map((c) => ({ id: c.id, name: c.name }))
      : [];

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
    if (!businessId) return;
    const next = validateProductForm(values);
    if (hasErrors(next)) {
      setErrors(next);
      return;
    }

    setSubmitStatus({ status: "creating" });
    setFailedIndices(new Set());

    let newProductId: string;
    try {
      const newProduct = await createProduct(businessId, {
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
        ...(parsePositiveInt(values.stockQuantity) !== undefined
          ? { stockQuantity: parsePositiveInt(values.stockQuantity) }
          : {}),
        ...(parsePositiveInt(values.lowStockThreshold) !== undefined
          ? { lowStockThreshold: parsePositiveInt(values.lowStockThreshold) }
          : {}),
      });
      newProductId = newProduct.id;
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while creating the product.";
      setSubmitStatus({ status: "error", message });
      toast.error(message);
      return;
    }

    // Product exists. Never roll back on image failure.
    if (stagedImages.length === 0) {
      toast.success("Product created.");
      navigate(`/owner/products/${newProductId}`, { replace: true });
      return;
    }

    const failed: { index: number; name: string }[] = [];
    for (let i = 0; i < stagedImages.length; i++) {
      setSubmitStatus({
        status: "uploading",
        index: i,
        total: stagedImages.length,
      });
      try {
        await uploadProductImage(businessId, newProductId, stagedImages[i]!);
      } catch {
        failed.push({ index: i, name: stagedImages[i]!.name });
        setFailedIndices((prev) => {
          const next = new Set(prev);
          next.add(i);
          return next;
        });
      }
    }

    const failedNames = failed.map((f) => f.name);
    if (failed.length === 0) {
      toast.success("Product created with images.");
      navigate(`/owner/products/${newProductId}`, { replace: true });
    } else if (failed.length === stagedImages.length) {
      toast.error(
        `Product created but all ${failed.length} image${failed.length === 1 ? "" : "s"} failed to upload.`,
      );
      navigate(`/owner/products/${newProductId}`, {
        replace: true,
        state: { imageUploadFailure: { kind: "all", failedNames } },
      });
    } else {
      toast.success(
        `Product created. ${failed.length} of ${stagedImages.length} image${stagedImages.length === 1 ? "" : "s"} failed.`,
      );
      navigate(`/owner/products/${newProductId}`, {
        replace: true,
        state: { imageUploadFailure: { kind: "partial", failedNames } },
      });
    }
  }

  const isCreating = submitStatus.status === "creating";
  const isUploading = submitStatus.status === "uploading";
  const isBusy = isCreating || isUploading;
  const uploadingIndex = isUploading ? submitStatus.index : null;

  const submitLabel = isCreating
    ? "Creating…"
    : isUploading
      ? `Uploading ${submitStatus.index + 1}/${submitStatus.total}…`
      : "Create product";

  return (
    <OwnerCrudTransition>
      <div className="space-y-3 pb-24 sm:pb-0">
        <CrudBackButton to="/owner/products" />
        <OwnerPageHeader title="New product" />

        <div className="rounded-2xl border bg-card px-4 py-4 sm:px-5 sm:py-5">
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
              imageSlot={
                <CreateProductImageField
                  files={stagedImages}
                  onChange={setStagedImages}
                  disabled={isBusy}
                  uploadingIndex={uploadingIndex}
                  failedIndices={failedIndices}
                />
              }
            />

            {/* Desktop footer */}
            <div className="mt-4 hidden items-center justify-end gap-2 border-t pt-3 sm:flex">
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => navigate("/owner/products", { replace: true })}
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
                {isBusy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <SaveIcon className="size-4" />
                )}
                {submitLabel}
              </Button>
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
                {isBusy ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <SaveIcon className="size-4" />
                )}
                {isCreating
                  ? "Creating…"
                  : isUploading
                    ? `${submitStatus.index + 1}/${submitStatus.total}`
                    : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </OwnerCrudTransition>
  );
}
