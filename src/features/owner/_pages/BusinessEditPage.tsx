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
import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";
import { useBusiness } from "../_hooks/useBusiness";
import { updateBusiness, deleteBusiness } from "../_api/businesses";
import { BusinessFormFields } from "../_components/BusinessForm";
import {
  CrudBackButton,
  OwnerCrudTransition,
} from "../_components/OwnerCrudTransition";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
import { validateBusinessForm, hasErrors } from "../_utils/businessForm";
import type { OwnerBusiness } from "../_api/businesses";
import type { BusinessFormValues, BusinessFormErrors } from "../_utils/businessForm";

export function BusinessEditPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const businessState = useBusiness(businessId);

  if (businessState.status === "idle" || businessState.status === "loading") {
    return <OwnerPageState type="loading" title="Loading business…" />;
  }

  if (businessState.status === "error") {
    return (
      <OwnerPageState
        type="error"
        title="Could not load business"
        message={businessState.message}
      />
    );
  }

  return (
    <BusinessEditorForm
      key={businessState.business.id}
      business={businessState.business}
    />
  );
}

function businessToFormValues(business: OwnerBusiness): BusinessFormValues {
  return {
    name: business.name,
    nameKm: business.nameKm ?? "",
    slug: business.slug ?? "",
    type: business.type ?? "",
    catalogMode: business.catalogMode ?? "",
  };
}

type SubmitStatus =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

interface BusinessEditorFormProps {
  business: OwnerBusiness;
}

function BusinessEditorForm({ business }: BusinessEditorFormProps) {
  const navigate = useNavigate();

  const [values, setValues] = useState<BusinessFormValues>(() =>
    businessToFormValues(business)
  );
  const [errors, setErrors] = useState<BusinessFormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    status: "idle",
  });
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleChange<K extends keyof BusinessFormValues>(
    field: K,
    value: BusinessFormValues[K]
  ) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (field in errors) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    const next = validateBusinessForm(values);
    if (hasErrors(next)) {
      setErrors(next);
      return;
    }
    setSubmitStatus({ status: "submitting" });
    try {
      await updateBusiness(business.id, {
        name: values.name.trim(),
        ...(values.nameKm.trim() ? { nameKm: values.nameKm.trim() } : {}),
        ...(values.slug.trim() ? { slug: values.slug.trim() } : {}),
        ...(values.type.trim() ? { type: values.type.trim() } : {}),
        ...(values.catalogMode.trim()
          ? { catalogMode: values.catalogMode.trim() }
          : {}),
      });
      // Reload the store so the shell header reflects the updated name.
      useOwnerBusinessesStore.getState().clearBusinesses();
      void useOwnerBusinessesStore.getState().loadBusinesses();
      toast.success(`Business "${values.name.trim()}" updated successfully`);
      navigate("/owner/businesses", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while saving the business.";
      setSubmitStatus({ status: "error", message });
      toast.error(message);
    }
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      const wasSelected =
        business.id === useOwnerBusinessesStore.getState().selectedBusinessId;
      await deleteBusiness(business.id);
      useOwnerBusinessesStore.getState().clearBusinesses();
      void useOwnerBusinessesStore.getState().loadBusinesses();
      if (wasSelected) {
        // clearBusinesses already cleared the selected ID; loadBusinesses will
        // auto-select if only one business remains.
      }
      toast.success(`Business "${business.name}" deleted successfully`);
      navigate("/owner/businesses", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the business.";
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
          <CrudBackButton to="/owner/businesses" />

          <OwnerPageHeader title="Edit business" />

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
              <BusinessFormFields
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
                    <Link to="/owner/businesses">
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
            <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground mb-1">Delete this business?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground text-center">
              Business <span className="font-semibold text-foreground">"{business.name}"</span> will be permanently deleted.
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
              {isDeleting ? "Deleting…" : "Delete business"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
