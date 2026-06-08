import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
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
import { useCategory } from "../_hooks/useCategory";
import { useBranches } from "../_hooks/useBranches";
import { updateCategory, deleteCategory } from "../_api/categories";
import { CategoryFormFields } from "../_components/CategoryForm";
import {
  CrudBackButton,
  OwnerCrudTransition,
} from "../_components/OwnerCrudTransition";
import { validateCategoryForm, hasErrors } from "../_utils/categoryForm";
import { OwnerStateBlock } from "../_components/OwnerStateBlock";
import type { Category } from "../_api/categories";
import type { BranchOption } from "../_components/CategoryForm";
import type { CategoryFormValues, CategoryFormErrors } from "../_utils/categoryForm";

export function CategoryEditPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const categoryState = useCategory(businessId, categoryId);
  const { state: branchState } = useBranches(businessId);

  if (!businessId) {
    return (
      <OwnerStateBlock title={noBusinessTitle} description={noBusinessDesc} />
    );
  }

  if (categoryState.status === "idle" || categoryState.status === "loading") {
    return <OwnerStateBlock title="Loading category…" />;
  }

  if (categoryState.status === "error") {
    return (
      <OwnerStateBlock
        tone="error"
        title="Could not load category"
        description={categoryState.message}
      />
    );
  }

  const branches: BranchOption[] =
    branchState.status === "ready"
      ? branchState.items.map((b) => ({ id: b.id, name: b.name }))
      : [];

  return (
    <CategoryEditorForm
      key={categoryState.category.id}
      category={categoryState.category}
      businessId={businessId}
      branches={branches}
    />
  );
}

function categoryToFormValues(category: Category): CategoryFormValues {
  return {
    name: category.name,
    nameKm: category.nameKm ?? "",
    branchId: category.branchId ?? "",
    isActive: category.isActive,
  };
}

type SubmitStatus =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

interface CategoryEditorFormProps {
  category: Category;
  businessId: string;
  branches: BranchOption[];
}

function CategoryEditorForm({
  category,
  businessId,
  branches,
}: CategoryEditorFormProps) {
  const navigate = useNavigate();

  const [values, setValues] = useState<CategoryFormValues>(() =>
    categoryToFormValues(category)
  );
  const [errors, setErrors] = useState<CategoryFormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    status: "idle",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    const next = validateCategoryForm(values);
    if (hasErrors(next)) {
      setErrors(next);
      return;
    }
    setSubmitStatus({ status: "submitting" });
    try {
      await updateCategory(businessId, category.id, {
        name: values.name.trim(),
        ...(values.nameKm.trim() ? { nameKm: values.nameKm.trim() } : {}),
        ...(values.branchId ? { branchId: values.branchId } : {}),
        isActive: values.isActive,
      });
      navigate("/owner/categories", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while saving the category.";
      setSubmitStatus({ status: "error", message });
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCategory(businessId, category.id);
      navigate("/owner/categories", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the category.";
      setDeleteError(message);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  }

  const isSubmitting = submitStatus.status === "submitting";

  return (
    <>
      <OwnerCrudTransition>
        <div className="max-w-md space-y-6">
          <CrudBackButton to="/owner/categories" />

          <header>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
              Edit category
            </h2>
          </header>

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
            <CategoryFormFields
              values={values}
              errors={errors}
              disabled={isSubmitting || isDeleting}
              branches={branches}
              onChange={handleChange}
            />
            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting || isDeleting}>
                  {isSubmitting ? "Saving…" : "Save changes"}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/owner/categories">Cancel</Link>
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
      </OwnerCrudTransition>

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) setShowDeleteDialog(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{category.name}</strong> will be permanently deleted. This
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
              {isDeleting ? "Deleting…" : "Delete category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
