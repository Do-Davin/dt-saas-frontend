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
import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";
import { useBusiness } from "../_hooks/useBusiness";
import { updateBusiness, deleteBusiness } from "../_api/businesses";
import { BusinessFormFields } from "../_components/BusinessForm";
import { validateBusinessForm, hasErrors } from "../_utils/businessForm";
import { OwnerStateBlock } from "../_components/OwnerStateBlock";
import type { OwnerBusiness } from "../_api/businesses";
import type { BusinessFormValues, BusinessFormErrors } from "../_utils/businessForm";

export function BusinessEditPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const businessState = useBusiness(businessId);

  if (businessState.status === "idle" || businessState.status === "loading") {
    return <OwnerStateBlock title="Loading business…" />;
  }

  if (businessState.status === "error") {
    return (
      <OwnerStateBlock
        tone="error"
        title="Could not load business"
        description={businessState.message}
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
      navigate("/owner/businesses", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while saving the business.";
      setSubmitStatus({ status: "error", message });
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
      navigate("/owner/businesses", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while deleting the business.";
      setDeleteError(message);
      setShowDeleteDialog(false);
    } finally {
      setIsDeleting(false);
    }
  }

  const isSubmitting = submitStatus.status === "submitting";

  return (
    <>
      <div className="max-w-md space-y-6">
        <header className="flex items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            Edit business
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/owner/businesses">Back</Link>
          </Button>
        </header>

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
          <BusinessFormFields
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
                <Link to="/owner/businesses">Cancel</Link>
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

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          if (!open) setShowDeleteDialog(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this business?</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{business.name}</strong> will be permanently deleted. This
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
              {isDeleting ? "Deleting…" : "Delete business"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
