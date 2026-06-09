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
import { useBranch } from "../_hooks/useBranch";
import { updateBranch, deleteBranch } from "../_api/branches";
import { BranchFormFields } from "../_components/BranchForm";
import {
  CrudBackButton,
  OwnerCrudTransition,
} from "../_components/OwnerCrudTransition";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
import { validateBranchForm, hasErrors } from "../_utils/branchForm";
import type { Branch } from "../_api/branches";
import type { BranchFormValues, BranchFormErrors } from "../_utils/branchForm";

export function BranchEditPage() {
  const { branchId } = useParams<{ branchId: string }>();
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const branchState = useBranch(businessId, branchId);

  if (!businessId) {
    return (
      <OwnerPageState type="empty" title={noBusinessTitle} message={noBusinessDesc} />
    );
  }

  if (branchState.status === "idle" || branchState.status === "loading") {
    return <OwnerPageState type="loading" title="Loading branch…" />;
  }

  if (branchState.status === "error") {
    return (
      <OwnerPageState
        type="error"
        title="Could not load branch"
        message={branchState.message}
      />
    );
  }

  return (
    <BranchEditorForm
      key={branchState.branch.id}
      branch={branchState.branch}
      businessId={businessId}
    />
  );
}

function branchToFormValues(branch: Branch): BranchFormValues {
  return {
    name: branch.name,
    nameKm: branch.nameKm ?? "",
    slug: branch.slug ?? "",
    address: branch.address ?? "",
    phone: branch.phone ?? "",
    isActive: branch.isActive,
  };
}

type SubmitStatus =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

interface BranchEditorFormProps {
  branch: Branch;
  businessId: string;
}

function BranchEditorForm({ branch, businessId }: BranchEditorFormProps) {
  const navigate = useNavigate();

  const [values, setValues] = useState<BranchFormValues>(() =>
    branchToFormValues(branch)
  );
  const [errors, setErrors] = useState<BranchFormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    status: "idle",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleChange<K extends keyof BranchFormValues>(
    field: K,
    value: BranchFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const next = validateBranchForm(values);
    if (hasErrors(next)) {
      setErrors(next);
      return;
    }
    setSubmitStatus({ status: "submitting" });
    try {
      await updateBranch(businessId, branch.id, {
        name: values.name.trim(),
        ...(values.nameKm.trim() ? { nameKm: values.nameKm.trim() } : {}),
        slug: values.slug.trim(),
        ...(values.address.trim() ? { address: values.address.trim() } : {}),
        ...(values.phone.trim() ? { phone: values.phone.trim() } : {}),
        isActive: values.isActive,
      });
      navigate("/owner/branches", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while saving the branch.";
      setSubmitStatus({ status: "error", message });
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteBranch(businessId, branch.id);
      navigate("/owner/branches", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the branch.";
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
          <CrudBackButton to="/owner/branches" />

          <OwnerPageHeader title="Edit branch" />

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
            <BranchFormFields
              values={values}
              errors={errors}
              disabled={isSubmitting || isDeleting}
              onChange={handleChange}
            />
            <div className="mt-6 flex items-center justify-between gap-3">
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting || isDeleting}>
                  {isSubmitting ? "Saving…" : "Save changes"}
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/owner/branches">Cancel</Link>
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
            <AlertDialogTitle>Delete this branch?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{branch.name}</strong> will be permanently deleted. This
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
              {isDeleting ? "Deleting…" : "Delete branch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
