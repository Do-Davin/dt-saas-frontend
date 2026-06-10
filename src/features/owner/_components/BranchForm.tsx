import { useState } from "react";
import {
  GitBranchIcon,
  LanguagesIcon,
  LinkIcon,
  MapPinIcon,
  PhoneIcon,
} from "lucide-react";
import { OwnerTextField } from "./OwnerTextField";
import type { BranchFormValues, BranchFormErrors } from "../_utils/branchForm";

const SLUG_BACKEND_MSG =
  "Slug must use lowercase letters, numbers, and hyphens only.";

function parseBackendError(raw: string | undefined): {
  fieldErrors: Partial<BranchFormErrors>;
  generic?: string;
} {
  if (!raw) return { fieldErrors: {} };
  const lower = raw.toLowerCase();
  if (lower.includes("slug")) return { fieldErrors: { slug: SLUG_BACKEND_MSG } };
  if (lower.includes("name")) return { fieldErrors: { name: raw } };
  const generic = /validation\s*failed/i.test(raw)
    ? "Please check the form and try again."
    : raw;
  return { fieldErrors: {}, generic };
}

interface BranchFormFieldsProps {
  values: BranchFormValues;
  errors: BranchFormErrors;
  disabled: boolean;
  onChange: <K extends keyof BranchFormValues>(
    field: K,
    value: BranchFormValues[K]
  ) => void;
  submitError?: string;
}

export function BranchFormFields({
  values,
  errors,
  disabled,
  onChange,
  submitError,
}: BranchFormFieldsProps) {
  const [editedSince, setEditedSince] = useState<{
    errorKey: string | undefined;
    fields: Set<string>;
  }>({ errorKey: undefined, fields: new Set() });

  function handleFieldChange<K extends keyof BranchFormValues>(
    field: K,
    value: BranchFormValues[K]
  ) {
    if (submitError) {
      setEditedSince((prev) => {
        const isSameError = prev.errorKey === submitError;
        const next = isSameError ? new Set(prev.fields) : new Set<string>();
        next.add(field as string);
        return { errorKey: submitError, fields: next };
      });
    }
    onChange(field, value);
  }

  const editedFields =
    editedSince.errorKey === submitError ? editedSince.fields : new Set<string>();

  const { fieldErrors: backendFieldErrors, generic: genericError } =
    parseBackendError(submitError);

  const displayErrors: BranchFormErrors = {};
  const validatedFields: (keyof BranchFormErrors)[] = ["name", "slug"];
  for (const field of validatedFields) {
    if (errors[field]) {
      displayErrors[field] = errors[field];
    } else if (backendFieldErrors[field] && !editedFields.has(field)) {
      displayErrors[field] = backendFieldErrors[field];
    }
  }

  return (
    <div className="space-y-5">
      <OwnerTextField
        label="Branch Name"
        value={values.name}
        onChange={(v) => handleFieldChange("name", v)}
        name="name"
        required
        disabled={disabled}
        error={displayErrors.name}
        leadingIcon={GitBranchIcon}
      />

      <OwnerTextField
        label="Name (Khmer)"
        value={values.nameKm}
        onChange={(v) => handleFieldChange("nameKm", v)}
        name="nameKm"
        disabled={disabled}
        leadingIcon={LanguagesIcon}
      />

      <div>
        <OwnerTextField
          label="Slug"
          value={values.slug}
          onChange={(v) => handleFieldChange("slug", v)}
          name="slug"
          required
          disabled={disabled}
          error={displayErrors.slug}
          leadingIcon={LinkIcon}
        />
        {!displayErrors.slug ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Used in URLs. Use lowercase letters, numbers, and hyphens only.
          </p>
        ) : null}
      </div>

      <OwnerTextField
        label="Address"
        value={values.address}
        onChange={(v) => handleFieldChange("address", v)}
        name="address"
        disabled={disabled}
        leadingIcon={MapPinIcon}
      />

      <OwnerTextField
        label="Phone"
        value={values.phone}
        onChange={(v) => handleFieldChange("phone", v)}
        name="phone"
        type="tel"
        disabled={disabled}
        leadingIcon={PhoneIcon}
      />

      <div className="flex items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 transition-colors hover:border-primary/40">
        <input
          id="branch-active"
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => handleFieldChange("isActive", e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary"
        />
        <label
          htmlFor="branch-active"
          className="cursor-pointer select-none text-sm font-semibold text-foreground"
        >
          Active
        </label>
      </div>

      {genericError ? (
        <p role="alert" className="text-sm text-destructive">
          {genericError}
        </p>
      ) : null}
    </div>
  );
}
