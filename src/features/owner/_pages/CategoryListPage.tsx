import { useState } from "react";
import { Link } from "react-router";
<<<<<<< HEAD
import { PlusIcon, Trash2Icon } from "lucide-react";
=======
import { TagIcon, PencilIcon, Trash2Icon } from "lucide-react";
>>>>>>> feature/001-dev
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
      <OwnerPage>
        <OwnerPageHeader
          title="Categories"
          actions={
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.07]"
            >
              <Link to="/owner/categories/new">
                <TagIcon className="size-4" />
                New category
              </Link>
            </Button>
          }
        />

        {deleteError ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
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
<<<<<<< HEAD
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border bg-card px-4 py-4 transition-all duration-200 ease-out hover:bg-muted/40 hover:-translate-y-0.5 hover:scale-[1.01]"
              >
                <div className="min-w-0 flex-1 w-full">
                  <span className="block truncate font-medium text-foreground">{cat.name}</span>
                  {cat.nameKm ? (
                    <span className="block truncate text-sm text-muted-foreground">
                      {cat.nameKm}
=======
                className="flex items-center justify-between gap-4 rounded-2xl border bg-card px-6 py-8 transition-all duration-200 ease-out hover:bg-primary/5 hover:border-primary hover:scale-[1.01]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <TagIcon className="size-10 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <span className="block min-w-0 truncate text-base font-black text-primary">
                      {cat.name}
>>>>>>> feature/001-dev
                    </span>
                    {cat.nameKm ? (
                      <span className="block truncate text-sm font-semibold text-zinc-500">
                        {cat.nameKm}
                      </span>
                    ) : null}
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs font-semibold text-zinc-500">
                      <span>Position {cat.position}</span>
                      {cat.branchId ? <span>· Branch scoped</span> : null}
                    </div>
                  </div>
                </div>
                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 mt-2 sm:mt-0 border-border/40">
                  <span
                    className={
                      cat.isActive
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                        : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {cat.isActive ? "Active" : "Inactive"}
                  </span>
<<<<<<< HEAD
                  <div className="flex items-center gap-2">
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
=======
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-1.5 rounded-xl border-2 font-black transition-all duration-200 ease-out hover:scale-[1.07]"
                  >
                    <Link
                      to={`/owner/categories/${encodeURIComponent(cat.id)}`}
                    >
                      <PencilIcon className="size-3.5" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 rounded-xl border-2 border-destructive/50 text-destructive font-black transition-all duration-200 ease-out hover:bg-destructive/5 hover:border-destructive hover:text-destructive hover:scale-[1.07]"
                    onClick={() => {
                      setDeleteError(null);
                      setPendingDelete(cat);
                    }}
                  >
                    <Trash2Icon className="size-3.5" />
                    Delete
                  </Button>
>>>>>>> feature/001-dev
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
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader align="center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive ring-8 ring-destructive/5 dark:bg-destructive/20 dark:ring-destructive/10 mb-4">
              <Trash2Icon className="h-6 w-6" />
            </div>
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground mb-1">Delete this category?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-center">
              Category <span className="font-semibold text-foreground">"{pendingDelete?.name}"</span> will be permanently deleted.
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
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
