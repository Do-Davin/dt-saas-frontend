import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { PlusCircleIcon, ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { useCurrentBusinessId } from "../_hooks/useCurrentBusinessId";
import { useBusinessContextMessage } from "../_hooks/useBusinessContextMessage";
import { createBranch } from "../_api/branches";
import { BranchFormFields } from "../_components/BranchForm";
import {
  CrudBackButton,
  OwnerCrudTransition,
} from "../_components/OwnerCrudTransition";
import { OwnerPageHeader } from "../_components/OwnerPageHeader";
import { OwnerPageState } from "../_components/OwnerPageState";
import {
  validateBranchForm,
  hasErrors,
  EMPTY_BRANCH_FORM,
} from "../_utils/branchForm";
import type { BranchFormValues, BranchFormErrors } from "../_utils/branchForm";

type SubmitStatus =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "error"; message: string };

export function BranchNewPage() {
  const businessId = useCurrentBusinessId();
  const { title: noBusinessTitle, description: noBusinessDesc } =
    useBusinessContextMessage();
  const navigate = useNavigate();

  const [values, setValues] = useState<BranchFormValues>(EMPTY_BRANCH_FORM);
  const [errors, setErrors] = useState<BranchFormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>({
    status: "idle",
  });

  if (!businessId) {
    return (
      <OwnerPageState type="empty" title={noBusinessTitle} message={noBusinessDesc} />
    );
  }

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
    if (!businessId) return;
    const next = validateBranchForm(values);
    if (hasErrors(next)) {
      setErrors(next);
      return;
    }
    setSubmitStatus({ status: "submitting" });
    try {
      await createBranch(businessId, {
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
          : "Something went wrong while creating the branch.";
      setSubmitStatus({ status: "error", message });
    }
  }

  const isSubmitting = submitStatus.status === "submitting";

  return (
    <OwnerCrudTransition>
      <div className="max-w-5xl space-y-4">
        <CrudBackButton to="/owner/branches" />

        <OwnerPageHeader title="New branch" />

        <div className="rounded-2xl border bg-card px-6 py-7 space-y-4">
          <form onSubmit={(e) => void handleSubmit(e)} noValidate>
            <BranchFormFields
              values={values}
              errors={errors}
              disabled={isSubmitting}
              onChange={handleChange}
              submitError={submitStatus.status === "error" ? submitStatus.message : undefined}
            />

            <div className="mt-7 flex justify-center gap-3">
              <Button
                type="submit"
                variant="outline"
                disabled={isSubmitting}
                className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.07]"
              >
                <PlusCircleIcon className="size-4" />
                {isSubmitting ? "Creating…" : "Create branch"}
              </Button>
              <Button
                variant="outline"
                asChild
                className="rounded-xl border-2 border-primary text-primary font-black gap-1.5 transition-all duration-200 ease-out hover:bg-primary/10 hover:text-primary hover:border-primary hover:scale-[1.03]"
              >
                <Link to="/owner/branches">
                  <ArrowLeftIcon className="size-3.5" />
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </div>
      </div>
    </OwnerCrudTransition>
  );
}
