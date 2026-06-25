import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { PlusCircleIcon, ArrowLeftIcon } from "lucide-react";
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
  const { pathname } = useLocation();
  const base = pathname.startsWith("/admin") ? "/admin" : "/owner";

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
      navigate(`${base}/categories`, { replace: true });
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
      <div className="max-w-5xl space-y-4">
        <CrudBackButton to={`${base}/categories`} />

        <OwnerPageHeader title="New category" />

        <div className="rounded-2xl border bg-card px-6 py-7 space-y-4">
          <form onSubmit={(e) => void handleSubmit(e)} noValidate>
            <CategoryFormFields
              values={values}
              errors={errors}
              disabled={isSubmitting}
              branches={branches}
              onChange={handleChange}
              submitError={submitStatus.status === "error" ? submitStatus.message : undefined}
            />

            <div className="mt-7 flex justify-center gap-3">
              <Button
                type="submit"
                variant="outline"
                disabled={isSubmitting}
                className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.07]"
              >
                <PlusCircleIcon className="size-4" />
                {isSubmitting ? "Creating…" : "Create category"}
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.03]"
              >
                <Link to={`${base}/categories`}>
                  <ArrowLeftIcon className="size-3.5" />
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </OwnerCrudTransition>
  );
}
