import { useState } from "react";
import { Link } from "react-router";
import { Building2Icon, PencilIcon, Trash2Icon } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { ApiError } from "@/lib/api/client";
import { toast } from "@/components/ui/toast";
import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";
import { useBusinesses } from "../_hooks/useBusinesses";
import { deleteBusiness } from "../_api/businesses";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
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
    return <OwnerPageState type="loading" title="Loading businesses…" />;
  }

  if (state.status === "error") {
    return (
      <OwnerPageState
        type="error"
        title="Could not load businesses"
        message={state.message}
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
      <OwnerPage>
        <OwnerPageHeader
          title="Businesses"
          actions={
            <Button
              variant="outline"
              size="sm"
              asChild
              className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.07]"
            >
              <Link to="/owner/businesses/new">
                <Building2Icon className="size-4" />
                New business
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
            title="No businesses yet"
            message="Create a business to get started."
          />
        ) : (
          <ul className="space-y-2">
            {state.items.map((business) => (
              <li
                key={business.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border bg-card p-6 sm:px-6 sm:py-8 transition-all duration-200 ease-out hover:bg-primary/5 hover:border-primary hover:scale-[1.01]"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <Building2Icon className="size-10 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="block min-w-0 truncate text-base font-black text-primary">
                        {business.name}
                      </span>
                      {business.id === selectedBusinessId ? (
                        <Badge className="shrink-0">Selected</Badge>
                      ) : null}
                    </div>
                    {business.slug ? (
                      <span className="block truncate text-sm font-semibold text-zinc-500">
                        {business.slug}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 mt-2 sm:mt-0 border-border/40">
                  {business.type ? (
                    <span className="text-xs text-muted-foreground">
                      {business.type}
                    </span>
                  ) : (
                    <span />
                  )}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="gap-1.5 rounded-xl border-2 font-black transition-all duration-200 ease-out hover:scale-[1.07]"
                    >
                      <Link
                        to={`/owner/businesses/${encodeURIComponent(business.id)}`}
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
                        setPendingDelete(business);
                      }}
                    >
                      <Trash2Icon className="size-3.5" />
                      Delete
                    </Button>
                  </div>
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
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground mb-1">Delete this business?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-center">
              Business <span className="font-semibold text-foreground">"{pendingDelete?.name}"</span> will be permanently deleted.
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
