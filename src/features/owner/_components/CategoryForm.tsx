import { useState } from "react";
import { TagIcon, LanguagesIcon, GitBranchIcon } from "lucide-react";
import { OwnerTextField } from "./OwnerTextField";
import type { CategoryFormValues, CategoryFormErrors } from "../_utils/categoryForm";

export interface BranchOption {
  id: string;
  name: string;
}

function parseBackendError(raw: string | undefined): {
  fieldErrors: Partial<CategoryFormErrors>;
  generic?: string;
} {
  if (!raw) return { fieldErrors: {} };
  const lower = raw.toLowerCase();
  if (lower.includes("name")) return { fieldErrors: { name: raw } };
  const generic = /validation\s*failed/i.test(raw)
    ? "Please check the form and try again."
    : raw;
  return { fieldErrors: {}, generic };
}

interface CategoryFormFieldsProps {
  values: CategoryFormValues;
  errors: CategoryFormErrors;
  disabled: boolean;
  branches: BranchOption[];
  onChange: <K extends keyof CategoryFormValues>(
    field: K,
    value: CategoryFormValues[K]
  ) => void;
  submitError?: string;
}

export function CategoryFormFields({
  values,
  errors,
  disabled,
  branches,
  onChange,
  submitError,
}: CategoryFormFieldsProps) {
  const [editedSince, setEditedSince] = useState<{
    errorKey: string | undefined;
    fields: Set<string>;
  }>({ errorKey: undefined, fields: new Set() });

  function handleFieldChange<K extends keyof CategoryFormValues>(
    field: K,
    value: CategoryFormValues[K]
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

  const displayErrors: CategoryFormErrors = {};
  const validatedFields: (keyof CategoryFormErrors)[] = ["name"];
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
        label="Category Name"
        value={values.name}
        onChange={(v) => handleFieldChange("name", v)}
        name="name"
        required
        disabled={disabled}
        error={displayErrors.name}
        leadingIcon={TagIcon}
      />

      <OwnerTextField
        label="Name (Khmer)"
        value={values.nameKm}
        onChange={(v) => handleFieldChange("nameKm", v)}
        name="nameKm"
        disabled={disabled}
        leadingIcon={LanguagesIcon}
      />

      {branches.length > 0 ? (
        <div>
          <div className="relative group">
            <GitBranchIcon
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-[18px] text-muted-foreground group-focus-within:text-primary/75"
              strokeWidth={2.5}
            />
            <select
              id="category-branch"
              value={values.branchId}
              onChange={(e) => handleFieldChange("branchId", e.target.value)}
              disabled={disabled}
              className="h-14 w-full appearance-none rounded-xl border border-input bg-card pl-10 pr-3 text-sm font-semibold text-foreground outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">All branches</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <label
              htmlFor="category-branch"
              className="pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-card px-1 text-[11px] font-semibold text-muted-foreground group-focus-within:text-primary"
            >
              Branch
            </label>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Leave as "All branches" for a business-wide category.
          </p>
        </div>
      ) : null}

      <div className="flex items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 transition-colors hover:border-primary/40">
        <input
          id="category-active"
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => handleFieldChange("isActive", e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary"
        />
        <label
          htmlFor="category-active"
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
