import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { toast } from "@/components/ui/toast";
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import { useBranches } from "../_hooks/useBranches";
import { createCategory } from "../_api/categories";
import { CategoryFormFields } from "../_components/CategoryForm";
import {
  CrudBackButton,
  OwnerCrudTransition,
} from "../_components/OwnerCrudTransition";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
import {
  validateCategoryForm,
  hasErrors,
  EMPTY_CATEGORY_FORM,
} from "../_utils/categoryForm";
import type { CategoryFormValues, CategoryFormErrors } from "../_utils/categoryForm";

type SubmitStatus =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

export function CategoryNewPage() {
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const { state: branchState } = useBranches(businessId);
  const navigate = useNavigate();

  const [values, setValues] = useState<CategoryFormValues>(EMPTY_CATEGORY_FORM);
  const [errors, setErrors] = useState<CategoryFormErrors>({});
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

  function handleChange<K extends keyof CategoryFormValues>(
    field: K,
    value: CategoryFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!businessId) return;
    const next = validateCategoryForm(values);
    if (hasErrors(next)) {
      setErrors(next);
      return;
    }
    setSubmitStatus({ status: "submitting" });
    try {
      await createCategory(businessId, {
        name: values.name.trim(),
        ...(values.nameKm.trim() ? { nameKm: values.nameKm.trim() } : {}),
        ...(values.branchId ? { branchId: values.branchId } : {}),
        isActive: values.isActive,
      });
      toast.success(`Category "${values.name.trim()}" created successfully`);
      navigate("/owner/categories", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while creating the category.";
      setSubmitStatus({ status: "error", message });
      toast.error(message);
    }
  }

  const isSubmitting = submitStatus.status === "submitting";

  return (
    <OwnerCrudTransition>
      <div className="max-w-md space-y-4">
        <CrudBackButton to="/owner/categories" />

        <OwnerPageHeader title="New category" />

        <div className="rounded-lg border bg-card p-6 space-y-4">
          {submitStatus.status === "error" ? (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {submitStatus.message}
            </div>
          ) : null}

          <form onSubmit={(e) => void handleSubmit(e)} noValidate>
            <CategoryFormFields
              values={values}
              errors={errors}
              disabled={isSubmitting}
              branches={branches}
              onChange={handleChange}
            />
            <div className="mt-6 flex gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating…" : "Create category"}
              </Button>
              <Button variant="outline" asChild>
                <Link to="/owner/categories">Cancel</Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </OwnerCrudTransition>
  );
}
