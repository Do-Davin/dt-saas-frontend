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
import { ApiError } from "@/lib/api/client";
import { toast } from "@/components/ui/toast";
import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";
import { useBusinesses } from "../_hooks/useBusinesses";
import { deleteBusiness } from "../_api/businesses";
import { OwnerStateBlock } from "../_components/OwnerStateBlock";
import type { OwnerBusiness } from "../_api/businesses";

export function BusinessListPage() {
  const { state, refetch } = useBusinesses();
  const selectedBusinessId = useOwnerBusinessesStore(
    (s) => s.selectedBusinessId
  );

  const [pendingDelete, setPendingDelete] = useState<OwnerBusiness | null>(
    null
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (state.status === "loading") {
    return <OwnerStateBlock title="Loading businesses…" />;
  }

  if (state.status === "error") {
    return (
      <OwnerStateBlock
        tone="error"
        title="Could not load businesses"
        description={state.message}
      />
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteBusiness(pendingDelete.id);
      const wasSelected =
        pendingDelete.id === useOwnerBusinessesStore.getState().selectedBusinessId;
      setPendingDelete(null);
      refetch();
      if (wasSelected) {
        useOwnerBusinessesStore.getState().clearBusinesses();
        void useOwnerBusinessesStore.getState().loadBusinesses();
      }
      toast.success(`Business "${pendingDelete.name}" deleted successfully`);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the business.";
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
            Businesses
          </h2>
          <Button asChild size="sm">
            <Link to="/owner/businesses/new">New business</Link>
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
            title="No businesses yet"
            description="Create a business to get started."
          />
        ) : (
          <ul className="space-y-2">
            {state.items.map((business) => (
              <li
                key={business.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="block truncate font-medium">
                      {business.name}
                    </span>
                    {business.id === selectedBusinessId ? (
                      <span className="shrink-0 rounded bg-primary px-1.5 py-0.5 text-xs font-medium text-primary-foreground">
                        Selected
                      </span>
                    ) : null}
                  </div>
                  {business.nameKm ? (
                    <span className="block truncate text-sm text-muted-foreground">
                      {business.nameKm}
                    </span>
                  ) : null}
                  {business.slug ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {business.slug}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {business.type ? (
                    <span className="text-xs text-muted-foreground">
                      {business.type}
                    </span>
                  ) : null}
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/owner/businesses/${encodeURIComponent(business.id)}`}
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
                      setPendingDelete(business);
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
            <AlertDialogTitle>Delete this business?</AlertDialogTitle>
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
