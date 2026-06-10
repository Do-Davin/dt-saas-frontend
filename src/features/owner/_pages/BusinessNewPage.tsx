import { useState } from "react";
import { useNavigate } from "react-router";
import { PlusCircleIcon } from "lucide-react";
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
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
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
      <div className="max-w-5xl space-y-4">
        <CrudBackButton to="/owner/businesses" />

        <OwnerPageHeader title="New business" />

        <div className="rounded-2xl border bg-card px-6 py-7 space-y-4">
          <form onSubmit={(e) => void handleSubmit(e)} noValidate>
            <BusinessFormFields
              values={values}
              errors={errors}
              disabled={isSubmitting}
              onChange={handleChange}
              submitError={submitStatus.status === "error" ? submitStatus.message : undefined}
            />

            <div className="mt-7 flex justify-center">
              <Button
                type="submit"
                variant="outline"
                disabled={isSubmitting}
                className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.07]"
              >
                <PlusCircleIcon className="size-4" />
                {isSubmitting ? "Creating…" : "Create business"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </OwnerCrudTransition>
  );
}
