import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { toast } from "@/components/ui/toast";
import { useOwnerBusinessesStore } from "../_store/ownerBusinesses";
import { setCurrentBusinessId } from "../_store/currentBusiness";
import { createBusiness } from "../_api/businesses";
import { BusinessFormFields } from "../_components/BusinessForm";
import {
  CrudBackButton,
  OwnerCrudTransition,
} from "../_components/OwnerCrudTransition";
import {
  validateBusinessForm,
  hasErrors,
  EMPTY_BUSINESS_FORM,
} from "../_utils/businessForm";
import type { BusinessFormValues, BusinessFormErrors } from "../_utils/businessForm";

type SubmitStatus =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

export function BusinessNewPage() {
  const navigate = useNavigate();

  const [values, setValues] = useState<BusinessFormValues>(EMPTY_BUSINESS_FORM);
  const [errors, setErrors] = useState<BusinessFormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    status: "idle",
  });

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
      const created = await createBusiness({
        name: values.name.trim(),
        ...(values.nameKm.trim() ? { nameKm: values.nameKm.trim() } : {}),
        ...(values.slug.trim() ? { slug: values.slug.trim() } : {}),
        ...(values.type.trim() ? { type: values.type.trim() } : {}),
        ...(values.catalogMode.trim()
          ? { catalogMode: values.catalogMode.trim() }
          : {}),
      });
      // Pre-select the new business then force store reload.
      setCurrentBusinessId(created.id);
      useOwnerBusinessesStore.setState({
        businesses: [],
        selectedBusinessId: created.id,
        isLoading: false,
        error: null,
      });
      void useOwnerBusinessesStore.getState().loadBusinesses();
      toast.success(`Business "${created.name}" created successfully`);
      navigate("/owner/businesses", { replace: true });
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Something went wrong while creating the business.";
      setSubmitStatus({ status: "error", message });
      toast.error(message);
    }
  }

  const isSubmitting = submitStatus.status === "submitting";

  return (
    <OwnerCrudTransition>
      <div className="max-w-md space-y-6">
        <CrudBackButton to="/owner/businesses" />

        <header>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">
            New business
          </h2>
        </header>

        {submitStatus.status === "error" ? (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {submitStatus.message}
          </div>
        ) : null}

        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          <BusinessFormFields
            values={values}
            errors={errors}
            disabled={isSubmitting}
            onChange={handleChange}
          />
          <div className="mt-6 flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create business"}
            </Button>
            <Button variant="outline" asChild>
              <Link to="/owner/businesses">Cancel</Link>
            </Button>
          </div>
        </form>
      </div>
    </OwnerCrudTransition>
  );
}
