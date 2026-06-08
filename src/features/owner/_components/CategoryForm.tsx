import { Input } from "@/components/ui/input";
import type { CategoryFormValues, CategoryFormErrors } from "../_utils/categoryForm";

export interface BranchOption {
  id: string;
  name: string;
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
}

// Shared field set used by both CategoryNewPage and CategoryEditPage.
// When `branches` is non-empty a branch selector is shown; otherwise the
// field is omitted (category is business-wide).
export function CategoryFormFields({
  values,
  errors,
  disabled,
  branches,
  onChange,
}: CategoryFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label
          htmlFor="category-name"
          className="block text-sm font-medium text-foreground"
        >
          Name <span aria-hidden className="text-destructive">*</span>
        </label>
        <Input
          id="category-name"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          disabled={disabled}
          placeholder="Drinks"
          aria-required
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "category-name-error" : undefined}
        />
        {errors.name ? (
          <p id="category-name-error" className="text-xs text-destructive">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="category-name-km"
          className="block text-sm font-medium text-foreground"
        >
          Name (Khmer)
        </label>
        <Input
          id="category-name-km"
          value={values.nameKm}
          onChange={(e) => onChange("nameKm", e.target.value)}
          disabled={disabled}
          placeholder="គ្រឿងផឹក"
        />
      </div>

      {branches.length > 0 ? (
        <div className="space-y-1">
          <label
            htmlFor="category-branch"
            className="block text-sm font-medium text-foreground"
          >
            Branch
          </label>
          <select
            id="category-branch"
            value={values.branchId}
            onChange={(e) => onChange("branchId", e.target.value)}
            disabled={disabled}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">All branches</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">
            Leave as "All branches" for a business-wide category.
          </p>
        </div>
      ) : null}

      <div className="flex items-center gap-2">
        <input
          id="category-active"
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => onChange("isActive", e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        <label
          htmlFor="category-active"
          className="text-sm font-medium text-foreground"
        >
          Active
        </label>
      </div>
    </div>
  );
}
