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
import { useBranches } from "../_hooks/useBranches";
import { deleteBranch } from "../_api/branches";
import { OwnerPage } from "../_components/OwnerPage";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
import { ApiError } from "@/lib/api/client";
import type { Branch } from "../_api/branches";

export function BranchListPage() {
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const { state, refetch } = useBranches(businessId);

  const [pendingDelete, setPendingDelete] = useState<Branch | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!businessId) {
    return (
      <OwnerPageState type="empty" title={noBusinessTitle} message={noBusinessDesc} />
    );
  }

  if (state.status === "loading" || state.status === "idle") {
    return <OwnerPageState type="loading" title="Loading branches…" />;
  }

  if (state.status === "error") {
    return (
      <OwnerPageState
        type="error"
        title="Could not load branches"
        message={state.message}
      />
    );
  }

  async function handleConfirmDelete() {
    if (!pendingDelete || !businessId) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteBranch(businessId, pendingDelete.id);
      setPendingDelete(null);
      refetch();
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the branch.";
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <OwnerPage>
        <OwnerPageHeader
          title="Branches"
          actions={
            <Button asChild size="sm">
              <Link to="/owner/branches/new">New branch</Link>
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
            title="No branches yet"
            message="Add a branch to get started."
          />
        ) : (
          <ul className="space-y-2">
            {state.items.map((branch) => (
              <li
                key={branch.id}
                className="flex items-center justify-between gap-3 rounded-lg border bg-card px-4 py-4 transition-colors hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <span className="block truncate font-medium">
                    {branch.name}
                  </span>
                  {branch.nameKm ? (
                    <span className="block truncate text-sm text-muted-foreground">
                      {branch.nameKm}
                    </span>
                  ) : null}
                  {branch.address ? (
                    <span className="block truncate text-xs text-muted-foreground">
                      {branch.address}
                    </span>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={
                      branch.isActive
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                        : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    {branch.isActive ? "Active" : "Inactive"}
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link
                      to={`/owner/branches/${encodeURIComponent(branch.id)}`}
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
                      setPendingDelete(branch);
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
            <AlertDialogTitle>Delete this branch?</AlertDialogTitle>
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
