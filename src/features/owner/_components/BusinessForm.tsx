import { Input } from "@/components/ui/input";
import type { BusinessFormValues, BusinessFormErrors } from "../_utils/businessForm";

interface BusinessFormFieldsProps {
  values: BusinessFormValues;
  errors: BusinessFormErrors;
  disabled: boolean;
  onChange: <K extends keyof BusinessFormValues>(
    field: K,
    value: BusinessFormValues[K]
  ) => void;
}

const LABEL_CLASS = "block text-sm font-medium text-foreground";

export function BusinessFormFields({
  values,
  errors,
  disabled,
  onChange,
}: BusinessFormFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label htmlFor="business-name" className={LABEL_CLASS}>
          Name <span aria-hidden className="text-destructive">*</span>
        </label>
        <Input
          id="business-name"
          value={values.name}
          disabled={disabled}
          aria-invalid={!!errors.name}
          onChange={(e) => onChange("name", e.target.value)}
        />
        {errors.name ? (
          <p className="text-xs text-destructive">{errors.name}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="business-name-km" className={LABEL_CLASS}>
          Name (Khmer)
        </label>
        <Input
          id="business-name-km"
          value={values.nameKm}
          disabled={disabled}
          onChange={(e) => onChange("nameKm", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="business-slug" className={LABEL_CLASS}>
          Slug
        </label>
        <Input
          id="business-slug"
          value={values.slug}
          disabled={disabled}
          onChange={(e) => onChange("slug", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="business-type" className={LABEL_CLASS}>
          Type
        </label>
        <Input
          id="business-type"
          value={values.type}
          disabled={disabled}
          onChange={(e) => onChange("type", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="business-catalog-mode" className={LABEL_CLASS}>
          Catalog mode
        </label>
        <Input
          id="business-catalog-mode"
          value={values.catalogMode}
          disabled={disabled}
          onChange={(e) => onChange("catalogMode", e.target.value)}
        />
      </div>
    </div>
  );
}
