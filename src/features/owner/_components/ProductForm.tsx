import { useState } from "react";
import type { ReactNode } from "react";
import {
  PackageIcon,
  LanguagesIcon,
  AlignLeftIcon,
  DollarSignIcon,
  PercentIcon,
  TagIcon,
  GitBranchIcon,
  LayersIcon,
  ScaleIcon,
  WalletIcon,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { OwnerTextField } from "./OwnerTextField";
import {
  isSalesPriceRequired,
  type BranchOption,
  type CategoryOption,
  type ProductFormValues,
  type ProductFormErrors,
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

function parseBackendError(raw: string | undefined): Partial<ProductFormErrors> {
  if (!raw) return {};
  const lower = raw.toLowerCase();
  if (lower.includes("discount")) return { discount: raw };
  if (lower.includes("purchase")) return { purchasePrice: raw };
  if (lower.includes("sales") || lower.includes("price"))
    return { salesPrice: raw };
  if (lower.includes("name")) return { name: raw };
  return {};
}

// ── Styled select — compact (h-11) variant used in the new form layout ──────

interface StyledSelectProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  leadingIcon: LucideIcon;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

function StyledSelect({
  label,
  id,
  value,
  onChange,
  disabled,
  leadingIcon: Icon,
  required = false,
  error,
  children,
}: StyledSelectProps) {
  return (
    <div className={cn(disabled && "pointer-events-none opacity-60")}>
      <div className="relative group">
        <Icon
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-[18px]",
            error
              ? "text-destructive"
              : "text-muted-foreground group-focus-within:text-primary/75",
          )}
          strokeWidth={2.5}
        />
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          aria-invalid={!!error}
          className={cn(
            "h-11 w-full appearance-none rounded-xl border bg-card pl-10 pr-3 text-sm font-semibold text-foreground outline-none transition-all duration-150",
            error
              ? "border-destructive ring-1 ring-destructive/20"
              : "border-input hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20",
          )}
        >
          {children}
        </select>
        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-card px-1 text-[11px] font-semibold",
            error
              ? "text-destructive"
              : "text-muted-foreground group-focus-within:text-primary",
          )}
        >
          {label}
          {required ? (
            <span aria-hidden className="ml-0.5 text-destructive">
              *
            </span>
          ) : null}
        </label>
      </div>
      {error ? (
        <p className="mt-1 text-xs text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

// ── Styled textarea — compact 2-row default ─────────────────────────────────

interface StyledTextareaProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  leadingIcon: LucideIcon;
}

function StyledTextarea({
  label,
  id,
  value,
  onChange,
  disabled,
  leadingIcon: Icon,
}: StyledTextareaProps) {
  return (
    <div className={cn(disabled && "pointer-events-none opacity-60")}>
      <div className="relative group">
        <Icon
          className="pointer-events-none absolute left-3 top-3 size-[18px] text-muted-foreground group-focus-within:text-primary/75"
          strokeWidth={2.5}
        />
        <textarea
          id={id}
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="min-h-[64px] w-full resize-y rounded-xl border border-input bg-card py-2.5 pl-10 pr-3 text-sm font-semibold text-foreground outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-card px-1 text-[11px] font-semibold text-muted-foreground group-focus-within:text-primary"
        >
          {label}
        </label>
      </div>
    </div>
  );
}

// ── Toggle row ──────────────────────────────────────────────────────────────

interface ToggleProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
}

function Toggle({ id, label, checked, onChange, disabled }: ToggleProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-input bg-card px-3 transition-colors hover:border-primary/40",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary"
      />
      <span className="select-none text-sm font-semibold text-foreground">
        {label}
      </span>
    </label>
  );
}

// ── Main form component ─────────────────────────────────────────────────────

interface ProductFormFieldsProps {
  values: ProductFormValues;
  errors: ProductFormErrors;
  disabled: boolean;
  branches: BranchOption[];
  categories: CategoryOption[];
  onChange: <K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
  ) => void;
  submitError?: string;
  imageSlot?: ReactNode;
}

export function ProductFormFields({
  values,
  errors,
  disabled,
  branches,
  categories,
  onChange,
  submitError,
  imageSlot,
}: ProductFormFieldsProps) {
  const [editedSince, setEditedSince] = useState<{
    errorKey: string | undefined;
    fields: Set<string>;
  }>({ errorKey: undefined, fields: new Set() });

  function handleFieldChange<K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K],
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
    editedSince.errorKey === submitError
      ? editedSince.fields
      : new Set<string>();

  const backendFieldErrors = parseBackendError(submitError);

  const displayErrors: ProductFormErrors = {};
  const validatedFields: (keyof ProductFormErrors)[] = [
    "name",
    "pricingType",
    "salesPrice",
    "purchasePrice",
    "discount",
  ];
  for (const field of validatedFields) {
    if (errors[field]) {
      displayErrors[field] = errors[field];
    } else if (backendFieldErrors[field] && !editedFields.has(field)) {
      displayErrors[field] = backendFieldErrors[field];
    }
  }

  const salesRequired = isSalesPriceRequired(values.pricingType);
  const hasAssignment = branches.length > 0 || categories.length > 0;

  const wrapperClass = imageSlot
    ? "grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"
    : "block";
  const leftColClass = imageSlot
    ? "order-2 min-w-0 space-y-3 lg:order-1"
    : "space-y-3";

  return (
    <div className={wrapperClass}>
      {/* ── Left column: form fields ─────────────────────────────────── */}
      <div className={leftColClass}>
        <div className="grid gap-3 sm:grid-cols-2">
          <OwnerTextField
            label="Product Name"
            value={values.name}
            onChange={(v) => handleFieldChange("name", v)}
            name="name"
            required
            disabled={disabled}
            error={displayErrors.name}
            leadingIcon={PackageIcon}
          />
          <OwnerTextField
            label="Name (Khmer)"
            value={values.nameKm}
            onChange={(v) => handleFieldChange("nameKm", v)}
            name="nameKm"
            disabled={disabled}
            leadingIcon={LanguagesIcon}
          />
        </div>

        <StyledTextarea
          label="Description"
          id="product-description"
          value={values.description}
          onChange={(v) => handleFieldChange("description", v)}
          disabled={disabled}
          leadingIcon={AlignLeftIcon}
        />

        {hasAssignment ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {branches.length > 0 ? (
              <StyledSelect
                label="Branch"
                id="product-branch"
                value={values.branchId}
                onChange={(v) => handleFieldChange("branchId", v)}
                disabled={disabled}
                leadingIcon={GitBranchIcon}
              >
                <option value="">All branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </StyledSelect>
            ) : null}
            {categories.length > 0 ? (
              <StyledSelect
                label="Category"
                id="product-category"
                value={values.categoryId}
                onChange={(v) => handleFieldChange("categoryId", v)}
                disabled={disabled}
                leadingIcon={LayersIcon}
              >
                <option value="">— no category —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </StyledSelect>
            ) : null}
            <StyledSelect
              label="Unit"
              id="product-unit"
              value={values.unitOfMeasure}
              onChange={(v) =>
                handleFieldChange("unitOfMeasure", v as UnitOfMeasure | "")
              }
              disabled={disabled}
              leadingIcon={ScaleIcon}
            >
              {UNIT_OF_MEASURE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </StyledSelect>
          </div>
        ) : (
          <StyledSelect
            label="Unit"
            id="product-unit"
            value={values.unitOfMeasure}
            onChange={(v) =>
              handleFieldChange("unitOfMeasure", v as UnitOfMeasure | "")
            }
            disabled={disabled}
            leadingIcon={ScaleIcon}
          >
            {UNIT_OF_MEASURE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </StyledSelect>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <StyledSelect
            label="Pricing Type"
            id="product-pricing-type"
            value={values.pricingType}
            onChange={(v) =>
              handleFieldChange("pricingType", v as PricingType | "")
            }
            disabled={disabled}
            leadingIcon={WalletIcon}
            required
            error={displayErrors.pricingType}
          >
            {PRICING_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </StyledSelect>
          <OwnerTextField
            label="Purchase Price"
            value={values.purchasePrice}
            onChange={(v) => handleFieldChange("purchasePrice", v)}
            name="purchasePrice"
            disabled={disabled}
            error={displayErrors.purchasePrice}
            leadingIcon={DollarSignIcon}
          />
          <OwnerTextField
            label="Sales Price"
            value={values.salesPrice}
            onChange={(v) => handleFieldChange("salesPrice", v)}
            name="salesPrice"
            disabled={disabled}
            required={salesRequired}
            error={displayErrors.salesPrice}
            leadingIcon={DollarSignIcon}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <OwnerTextField
            label="Discount"
            value={values.discount}
            onChange={(v) => handleFieldChange("discount", v)}
            name="discount"
            disabled={disabled}
            error={displayErrors.discount}
            leadingIcon={PercentIcon}
          />
          <OwnerTextField
            label="Label"
            value={values.label}
            onChange={(v) => handleFieldChange("label", v)}
            name="label"
            disabled={disabled}
            leadingIcon={TagIcon}
          />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Toggle
            id="product-available"
            label="Available for ordering"
            checked={values.isAvailable}
            onChange={(v) => handleFieldChange("isAvailable", v)}
            disabled={disabled}
          />
          <Toggle
            id="product-visible"
            label="Visible on menu"
            checked={values.isVisible}
            onChange={(v) => handleFieldChange("isVisible", v)}
            disabled={disabled}
          />
        </div>
      </div>

      {/* ── Right column: image picker ───────────────────────────────── */}
      {imageSlot ? (
        <div className="order-1 lg:order-2">{imageSlot}</div>
      ) : null}
    </div>
  );
}
