import { useState } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router";
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
import { toast } from "@/components/ui/toast";
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
  const { pathname } = useLocation();
  const base = pathname.startsWith("/admin") ? "/admin" : "/owner";

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
      toast.success(`Category "${values.name.trim()}" updated successfully`);
      navigate(`${base}/categories`, { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while saving the category.";
      setSubmitStatus({ status: "error", message });
      toast.error(message);
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCategory(businessId, category.id);
      toast.success(`Category "${category.name}" deleted successfully`);
      navigate(`${base}/categories`, { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the category.";
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
        <div className="max-w-5xl space-y-4">
          <CrudBackButton to={`${base}/categories`} />

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
                    <Link to={`${base}/categories`}>
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
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader align="center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5 dark:bg-destructive/20 dark:ring-destructive/10 mb-4">
              <Trash2Icon className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground mb-1">Delete this category?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-center">
              Category <span className="font-semibold text-foreground">"{category.name}"</span> will be permanently deleted.
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
              {isDeleting ? "Deleting…" : "Delete category"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
