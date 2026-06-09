import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import { useBranches } from "../_hooks/useBranches";
import { useCategories } from "../_hooks/useCategories";
import { createProduct } from "../_api/products";
import { ProductFormFields } from "../_components/ProductForm";
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
  EMPTY_PRODUCT_FORM,
} from "../_utils/productForm";
import type { ProductFormValues, ProductFormErrors } from "../_utils/productForm";
import type { PricingType, UnitOfMeasure } from "../_api/products";

type SubmitStatus =
  | { status: "idle" }
  | { status: "submitting" }
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
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    status: "idle",
  });

  if (!businessId) {
    return (
      <OwnerPageState type="empty" title={noBusinessTitle} message={noBusinessDesc} />
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
    value: ProductFormValues[K]
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
    setSubmitStatus({ status: "submitting" });
    try {
      await createProduct(businessId, {
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
      navigate("/owner/products", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while creating the product.";
      setSubmitStatus({ status: "error", message });
    }
  }

  const isSubmitting = submitStatus.status === "submitting";

  return (
    <OwnerCrudTransition>
      <div className="max-w-lg space-y-6">
        <CrudBackButton to="/owner/products" />

        <OwnerPageHeader title="New product" />

        {submitStatus.status === "error" ? (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {submitStatus.message}
          </div>
        ) : null}

        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <ProductFormFields
            values={values}
            errors={errors}
            disabled={isSubmitting}
            branches={branches}
            categories={categories}
            onChange={handleChange}
          />
          <div className="mt-6 flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create product"}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/owner/products">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </OwnerCrudTransition>
  );
}
