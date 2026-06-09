import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import { SaveIcon, ArrowLeftIcon, Trash2Icon } from "lucide-react";
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
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
import { validateCategoryForm, hasErrors } from "../_utils/categoryForm";
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
      <OwnerPageState type="empty" title={noBusinessTitle} message={noBusinessDesc} />
    );
  }

  if (categoryState.status === "idle" || categoryState.status === "loading") {
    return <OwnerPageState type="loading" title="Loading category…" />;
  }

  if (categoryState.status === "error") {
    return (
      <OwnerPageState
        type="error"
        title="Could not load category"
        message={categoryState.message}
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
        <div className="max-w-5xl space-y-4">
          <CrudBackButton to="/owner/categories" />

          <OwnerPageHeader title="Edit category" />

          <div className="rounded-2xl border bg-card px-6 py-7 space-y-4">
            {deleteError ? (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
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
                submitError={submitStatus.status === "error" ? submitStatus.message : undefined}
              />

              <div className="mt-7 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="submit"
                    variant="outline"
                    disabled={isSubmitting || isDeleting}
                    className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.07]"
                  >
                    <SaveIcon className="size-4" />
                    {isSubmitting ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    variant="outline"
                    asChild
                    className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.03]"
                  >
                    <Link to="/owner/categories">
                      <ArrowLeftIcon className="size-3.5" />
                      Cancel
                    </Link>
                  </Button>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl border-2 border-destructive/50 text-destructive font-black gap-1.5 transition-all duration-200 ease-out hover:bg-destructive/5 hover:border-destructive hover:text-destructive hover:scale-[1.03]"
                  disabled={isSubmitting || isDeleting}
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2Icon className="size-3.5" />
                  Delete
                </Button>
              </div>
            </form>
          </div>
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
