import { Input } from "@/components/ui/input";
import type {
  BranchOption,
  CategoryOption,
  ProductFormValues,
  ProductFormErrors,
} from "../_utils/productForm";
import type { PricingType, UnitOfMeasure } from "../_api/products";

const PRICING_TYPE_OPTIONS: { value: PricingType | ""; label: string }[] = [
  { value: "", label: "— select —" },
  { value: "FIXED", label: "Fixed price" },
  { value: "STARTING_FROM", label: "Starting from" },
  { value: "NO_PRICE", label: "No price" },
  { value: "CONTACT_FOR_PRICE", label: "Contact for price" },
];

const UNIT_OF_MEASURE_OPTIONS: { value: UnitOfMeasure | ""; label: string }[] =
  [
    { value: "", label: "— select —" },
    { value: "EACH", label: "Each" },
    { value: "KG", label: "Kilogram (kg)" },
    { value: "GRAM", label: "Gram (g)" },
    { value: "LITER", label: "Litre (L)" },
    { value: "ML", label: "Millilitre (mL)" },
    { value: "METER", label: "Metre (m)" },
    { value: "BOX", label: "Box" },
    { value: "PACK", label: "Pack" },
    { value: "SET", label: "Set" },
    { value: "HOUR", label: "Hour" },
    { value: "DAY", label: "Day" },
  ];

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const TEXTAREA_CLASS =
  "flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[72px] resize-y";

interface ProductFormFieldsProps {
  values: ProductFormValues;
  errors: ProductFormErrors;
  disabled: boolean;
  branches: BranchOption[];
  categories: CategoryOption[];
  onChange: <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K]
  ) => void;
}

// Shared field set used by both ProductNewPage and ProductEditPage.
export function ProductFormFields({
  values,
  errors,
  disabled,
  branches,
  categories,
  onChange,
}: ProductFormFieldsProps) {
  return (
    <div className="space-y-5">
      {/* ── Basic info ──────────────────────────────────────────── */}
      <div className="space-y-4">
        <FieldRow
          id="product-name"
          label="Name"
          required
          error={errors.name}
        >
          <Input
            id="product-name"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            disabled={disabled}
            placeholder="Iced Coffee"
            aria-required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "product-name-error" : undefined}
          />
        </FieldRow>

        <FieldRow id="product-name-km" label="Name (Khmer)">
          <Input
            id="product-name-km"
            value={values.nameKm}
            onChange={(e) => onChange("nameKm", e.target.value)}
            disabled={disabled}
            placeholder="កាហ្វេទឹកកក"
          />
        </FieldRow>

        <FieldRow id="product-description" label="Description">
          <textarea
            id="product-description"
            className={TEXTAREA_CLASS}
            value={values.description}
            onChange={(e) => onChange("description", e.target.value)}
            disabled={disabled}
            placeholder="Short description shown on the menu"
          />
        </FieldRow>

        <FieldRow id="product-description-km" label="Description (Khmer)">
          <textarea
            id="product-description-km"
            className={TEXTAREA_CLASS}
            value={values.descriptionKm}
            onChange={(e) => onChange("descriptionKm", e.target.value)}
            disabled={disabled}
          />
        </FieldRow>
      </div>

      {/* ── Assignment ──────────────────────────────────────────── */}
      {(categories.length > 0 || branches.length > 0) && (
        <div className="space-y-4 border-t pt-4">
          {categories.length > 0 && (
            <FieldRow id="product-category" label="Category">
              <select
                id="product-category"
                className={SELECT_CLASS}
                value={values.categoryId}
                onChange={(e) => onChange("categoryId", e.target.value)}
                disabled={disabled}
              >
                <option value="">— no category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </FieldRow>
          )}

          {branches.length > 0 && (
            <FieldRow id="product-branch" label="Branch">
              <select
                id="product-branch"
                className={SELECT_CLASS}
                value={values.branchId}
                onChange={(e) => onChange("branchId", e.target.value)}
                disabled={disabled}
              >
                <option value="">All branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </FieldRow>
          )}
        </div>
      )}

      {/* ── Pricing ─────────────────────────────────────────────── */}
      <div className="space-y-4 border-t pt-4">
        <FieldRow
          id="product-pricing-type"
          label="Pricing type"
        >
          <select
            id="product-pricing-type"
            className={SELECT_CLASS}
            value={values.pricingType}
            onChange={(e) =>
              onChange("pricingType", e.target.value as PricingType | "")
            }
            disabled={disabled}
          >
            {PRICING_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldRow>

        <FieldRow
          id="product-sales-price"
          label="Sales price"
          error={errors.salesPrice}
        >
          <Input
            id="product-sales-price"
            type="text"
            inputMode="decimal"
            value={values.salesPrice}
            onChange={(e) => onChange("salesPrice", e.target.value)}
            disabled={disabled}
            placeholder="0.00"
            aria-invalid={!!errors.salesPrice}
            aria-describedby={
              errors.salesPrice ? "product-sales-price-error" : undefined
            }
          />
        </FieldRow>

        <FieldRow
          id="product-purchase-price"
          label="Purchase price"
          error={errors.purchasePrice}
        >
          <Input
            id="product-purchase-price"
            type="text"
            inputMode="decimal"
            value={values.purchasePrice}
            onChange={(e) => onChange("purchasePrice", e.target.value)}
            disabled={disabled}
            placeholder="0.00"
            aria-invalid={!!errors.purchasePrice}
            aria-describedby={
              errors.purchasePrice
                ? "product-purchase-price-error"
                : undefined
            }
          />
        </FieldRow>

        <FieldRow
          id="product-discount"
          label="Discount"
          error={errors.discount}
        >
          <Input
            id="product-discount"
            type="text"
            inputMode="decimal"
            value={values.discount}
            onChange={(e) => onChange("discount", e.target.value)}
            disabled={disabled}
            placeholder="0.00"
            aria-invalid={!!errors.discount}
            aria-describedby={
              errors.discount ? "product-discount-error" : undefined
            }
          />
        </FieldRow>
      </div>

      {/* ── Attributes ──────────────────────────────────────────── */}
      <div className="space-y-4 border-t pt-4">
        <FieldRow id="product-unit" label="Unit of measure">
          <select
            id="product-unit"
            className={SELECT_CLASS}
            value={values.unitOfMeasure}
            onChange={(e) =>
              onChange("unitOfMeasure", e.target.value as UnitOfMeasure | "")
            }
            disabled={disabled}
          >
            {UNIT_OF_MEASURE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </FieldRow>

        <FieldRow id="product-label" label="Label">
          <Input
            id="product-label"
            value={values.label}
            onChange={(e) => onChange("label", e.target.value)}
            disabled={disabled}
            placeholder="e.g. New, Popular, Chef's choice"
          />
        </FieldRow>
      </div>

      {/* ── Status ──────────────────────────────────────────────── */}
      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center gap-2">
          <input
            id="product-available"
            type="checkbox"
            checked={values.isAvailable}
            onChange={(e) => onChange("isAvailable", e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <label
            htmlFor="product-available"
            className="text-sm font-medium text-foreground"
          >
            Available for ordering
          </label>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="product-visible"
            type="checkbox"
            checked={values.isVisible}
            onChange={(e) => onChange("isVisible", e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          <label
            htmlFor="product-visible"
            className="text-sm font-medium text-foreground"
          >
            Visible on menu
          </label>
        </div>
      </div>
    </div>
  );
}

interface FieldRowProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FieldRow({ id, label, required, error, children }: FieldRowProps) {
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-destructive">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
