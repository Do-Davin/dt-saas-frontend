import { Input } from "@/components/ui/input";
import type { BranchFormValues, BranchFormErrors } from "../_utils/branchForm";

interface BranchFormFieldsProps {
  values: BranchFormValues;
  errors: BranchFormErrors;
  disabled: boolean;
  onChange: <K extends keyof BranchFormValues>(
    field: K,
    value: BranchFormValues[K]
  ) => void;
}

// Shared field set used by both BranchNewPage and BranchEditPage.
export function BranchFormFields({
  values,
  errors,
  disabled,
  onChange,
}: BranchFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label
          htmlFor="branch-name"
          className="block text-sm font-medium text-foreground"
        >
          Name <span aria-hidden className="text-destructive">*</span>
        </label>
        <Input
          id="branch-name"
          value={values.name}
          onChange={(e) => onChange("name", e.target.value)}
          disabled={disabled}
          placeholder="Main Branch"
          aria-required
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "branch-name-error" : undefined}
        />
        {errors.name ? (
          <p id="branch-name-error" className="text-xs text-destructive">
            {errors.name}
          </p>
        ) : null}
      </div>

      <div className="space-y-1">
        <label
          htmlFor="branch-name-km"
          className="block text-sm font-medium text-foreground"
        >
          Name (Khmer)
        </label>
        <Input
          id="branch-name-km"
          value={values.nameKm}
          onChange={(e) => onChange("nameKm", e.target.value)}
          disabled={disabled}
          placeholder="សាខាកណ្ដាល"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="branch-address"
          className="block text-sm font-medium text-foreground"
        >
          Address
        </label>
        <Input
          id="branch-address"
          value={values.address}
          onChange={(e) => onChange("address", e.target.value)}
          disabled={disabled}
          placeholder="123 Street, Phnom Penh"
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="branch-phone"
          className="block text-sm font-medium text-foreground"
        >
          Phone
        </label>
        <Input
          id="branch-phone"
          type="tel"
          value={values.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          disabled={disabled}
          placeholder="+855 12 345 678"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="branch-active"
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => onChange("isActive", e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-border accent-primary"
        />
        <label
          htmlFor="branch-active"
          className="text-sm font-medium text-foreground"
        >
          Active
        </label>
      </div>
    </div>
  );
}
