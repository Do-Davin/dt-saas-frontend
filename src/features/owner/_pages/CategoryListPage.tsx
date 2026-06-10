import { useState } from "react";
import { Link } from "react-router";
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
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import { useCategories } from "../_hooks/useCategories";
import { deleteCategory } from "../_api/categories";
import { OwnerStateBlock } from "../_components/OwnerStateBlock";
import { ApiError } from "@/lib/api/client";
import { toast } from "@/components/ui/toast";
import type { Category } from "../_api/categories";

export function CategoryListPage() {
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const { state, refetch } = useCategories(businessId);

  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!businessId) {
    return (
      <OwnerStateBlock title={noBusinessTitle} description={noBusinessDesc} />
    );
  }

  if (state.status === "loading" || state.status === "idle") {
    return <OwnerStateBlock title="Loading categories…" />;
  }

  if (state.status === "error") {
    return (
      <OwnerStateBlock
        tone="error"
        title="Could not load categories"
        description={state.message}
      />
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete || !businessId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCategory(businessId, pendingDelete.id);
      toast.success(`Category "${pendingDelete.name}" deleted successfully`);
      setPendingDelete(null);
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the category.";
      setDeleteError(message);
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <div className="space-y-4">
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Categories
          </h2>
          <Button asChild size="sm">
            <Link to="/owner/categories/new">New category</Link>
          </Button>
        </header>

        {deleteError ? (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {deleteError}
          </div>
        ) : null}

        {state.items.length === 0 ? (
          <OwnerStateBlock
            title="No categories yet"
            description="Add a category to get started."
          />
        ) : (
          <ul className="space-y-2">
            {state.items.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <span className="block truncate font-medium">{cat.name}</span>
                  {cat.nameKm ? (
                    <span className="block truncate text-sm text-muted-foreground">
                      {cat.nameKm}
                    </span>
                  ) : null}
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span>Position {cat.position}</span>
                    {cat.branchId ? <span>· Branch scoped</span> : null}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={
                      cat.isActive
                        ? "text-xs font-medium text-green-700"
                        : "text-xs font-medium text-muted-foreground"
                    }
                  >
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/owner/categories/${encodeURIComponent(cat.id)}`}
                    >
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDelete(cat);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{pendingDelete?.name}</strong> will be permanently
              deleted. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
