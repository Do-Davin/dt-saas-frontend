import { useState } from "react";
import { Link } from "react-router";
import { PlusIcon } from "lucide-react";
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
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
import { ApiError } from "@/lib/api/client";
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
      <OwnerPageState type="empty" title={noBusinessTitle} message={noBusinessDesc} />
    );
  }

  if (state.status === "loading" || state.status === "idle") {
    return <OwnerPageState type="loading" title="Loading categories…" />;
  }

  if (state.status === "error") {
    return (
      <OwnerPageState
        type="error"
        title="Could not load categories"
        message={state.message}
      />
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete || !businessId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteCategory(businessId, pendingDelete.id);
      setPendingDelete(null);
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the category.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <OwnerPage>
        <OwnerPageHeader
          title="Categories"
          actions={
            <Button asChild size="sm">
              <Link to="/owner/categories/new">
                <PlusIcon className="size-3.5" />
                New category
              </Link>
            </Button>
          }
        />

        {deleteError ? (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {deleteError}
          </div>
        ) : null}

        {state.items.length === 0 ? (
          <OwnerPageState
            type="empty"
            title="No categories yet"
            message="Add a category to get started."
          />
        ) : (
          <ul className="space-y-2">
            {state.items.map((cat) => (
              <li
                key={cat.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-4 transition-all duration-200 ease-out hover:bg-muted/40 hover:-translate-y-0.5 hover:scale-[1.01]"
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
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                        : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
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
      </OwnerPage>

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
