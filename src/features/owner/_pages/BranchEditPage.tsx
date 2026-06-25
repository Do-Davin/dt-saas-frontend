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
import { toast } from "@/components/ui/toast";
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
      toast.success(`Branch "${values.name.trim()}" updated successfully`);
      navigate("/admin/branches", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while saving the branch.";
      setSubmitStatus({ status: "error", message });
      toast.error(message);
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteBranch(businessId, branch.id);
      toast.success(`Branch "${branch.name}" deleted successfully`);
      navigate("/admin/branches", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the branch.";
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
          <CrudBackButton to="/admin/branches" />

          <OwnerPageHeader title="Edit branch" />

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
              <BranchFormFields
                values={values}
                errors={errors}
                disabled={isSubmitting || isDeleting}
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
                    <Link to="/admin/branches">
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
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground mb-1">Delete this branch?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-center">
              Branch <span className="font-semibold text-foreground">"{branch.name}"</span> will be permanently deleted.
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
              {isDeleting ? "Deleting…" : "Delete branch"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
