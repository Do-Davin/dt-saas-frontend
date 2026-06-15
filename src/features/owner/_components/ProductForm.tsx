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
import { OwnerTextField } from "./OwnerTextField";
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

function parseBackendError(raw: string | undefined): {
  fieldErrors: Partial<ProductFormErrors>;
  generic?: string;
} {
  if (!raw) return { fieldErrors: {} };
  const lower = raw.toLowerCase();
  if (lower.includes("discount")) return { fieldErrors: { discount: raw } };
  if (lower.includes("purchase"))
    return { fieldErrors: { purchasePrice: raw } };
  if (lower.includes("sales") || lower.includes("price"))
    return { fieldErrors: { salesPrice: raw } };
  if (lower.includes("name")) return { fieldErrors: { name: raw } };
  const generic = /validation\s*failed/i.test(raw)
    ? "Please check the form and try again."
    : raw;
  return { fieldErrors: {}, generic };
}

// ── Styled select — matches OwnerTextField height/look ──────────────────────

interface StyledSelectProps {
  label: string;
  id: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  leadingIcon: LucideIcon;
  hint?: string;
  children: ReactNode;
}

function StyledSelect({
  label,
  id,
  value,
  onChange,
  disabled,
  leadingIcon: Icon,
  hint,
  children,
}: StyledSelectProps) {
  return (
    <div className={disabled ? "pointer-events-none opacity-60" : ""}>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-[18px] text-muted-foreground"
          strokeWidth={2.5}
        />
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="h-14 w-full appearance-none rounded-xl border border-input bg-card pl-10 pr-3 text-sm font-semibold text-primary outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20"
        >
          {children}
        </select>
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-card px-1 text-[11px] font-semibold text-zinc-500"
        >
          {label}
        </label>
      </div>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

// ── Styled textarea — matches OwnerTextField visual style ────────────────────

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
    <div className={disabled ? "pointer-events-none opacity-60" : ""}>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-4 size-[18px] text-muted-foreground"
          strokeWidth={2.5}
        />
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="min-h-[88px] w-full resize-y rounded-xl border border-input bg-card py-4 pl-10 pr-3 text-sm font-semibold text-primary outline-none transition-all duration-150 hover:border-primary/40 focus:border-primary focus:ring-1 focus:ring-primary/20"
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3 top-0 -translate-y-1/2 bg-card px-1 text-[11px] font-semibold text-zinc-500"
        >
          {label}
        </label>
      </div>
    </div>
  );
}

// ── Main form component ──────────────────────────────────────────────────────

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
  submitError?: string;
}

export function ProductFormFields({
  values,
  errors,
  disabled,
  branches,
  categories,
  onChange,
  submitError,
}: ProductFormFieldsProps) {
  const [editedSince, setEditedSince] = useState<{
    errorKey: string | undefined;
    fields: Set<string>;
  }>({ errorKey: undefined, fields: new Set() });

  function handleFieldChange<K extends keyof ProductFormValues>(
    field: K,
    value: ProductFormValues[K]
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

  const displayErrors: ProductFormErrors = {};
  const validatedFields: (keyof ProductFormErrors)[] = [
    "name",
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

  return (
    <div className="space-y-5">
      {/* ── Basic info ─────────────────────────────────────────────────── */}
      <div className="space-y-5">
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

        <StyledTextarea
          label="Description"
          id="product-description"
          value={values.description}
          onChange={(v) => handleFieldChange("description", v)}
          disabled={disabled}
          leadingIcon={AlignLeftIcon}
        />

        <StyledTextarea
          label="Description (Khmer)"
          id="product-description-km"
          value={values.descriptionKm}
          onChange={(v) => handleFieldChange("descriptionKm", v)}
          disabled={disabled}
          leadingIcon={AlignLeftIcon}
        />
      </div>

      {/* ── Assignment ─────────────────────────────────────────────────── */}
      {(categories.length > 0 || branches.length > 0) && (
        <div className="space-y-5 border-t pt-5">
          {categories.length > 0 && (
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
          )}

          {branches.length > 0 && (
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
          )}
        </div>
      )}

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <div className="space-y-5 border-t pt-5">
        <StyledSelect
          label="Pricing type"
          id="product-pricing-type"
          value={values.pricingType}
          onChange={(v) =>
            handleFieldChange("pricingType", v as PricingType | "")
          }
          disabled={disabled}
          leadingIcon={WalletIcon}
        >
          {PRICING_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </StyledSelect>

        <OwnerTextField
          label="Sales price"
          value={values.salesPrice}
          onChange={(v) => handleFieldChange("salesPrice", v)}
          name="salesPrice"
          disabled={disabled}
          error={displayErrors.salesPrice}
          leadingIcon={DollarSignIcon}
        />

        <OwnerTextField
          label="Purchase price"
          value={values.purchasePrice}
          onChange={(v) => handleFieldChange("purchasePrice", v)}
          name="purchasePrice"
          disabled={disabled}
          error={displayErrors.purchasePrice}
          leadingIcon={DollarSignIcon}
        />

        <OwnerTextField
          label="Discount"
          value={values.discount}
          onChange={(v) => handleFieldChange("discount", v)}
          name="discount"
          disabled={disabled}
          error={displayErrors.discount}
          leadingIcon={PercentIcon}
        />
      </div>

      {/* ── Attributes ─────────────────────────────────────────────────── */}
      <div className="space-y-5 border-t pt-5">
        <StyledSelect
          label="Unit of measure"
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

        <OwnerTextField
          label="Label"
          value={values.label}
          onChange={(v) => handleFieldChange("label", v)}
          name="label"
          disabled={disabled}
          leadingIcon={TagIcon}
        />
      </div>

      {/* ── Status ─────────────────────────────────────────────────────── */}
      <div className="space-y-3 border-t pt-5">
        <div className="flex items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 transition-colors hover:border-primary/40">
          <input
            id="product-available"
            type="checkbox"
            checked={values.isAvailable}
            onChange={(e) => handleFieldChange("isAvailable", e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary"
          />
          <label
            htmlFor="product-available"
            className="cursor-pointer select-none text-sm font-semibold text-foreground"
          >
            Available for ordering
          </label>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-input bg-card px-4 py-3 transition-colors hover:border-primary/40">
          <input
            id="product-visible"
            type="checkbox"
            checked={values.isVisible}
            onChange={(e) => handleFieldChange("isVisible", e.target.checked)}
            disabled={disabled}
            className="h-4 w-4 shrink-0 cursor-pointer rounded border-border accent-primary"
          />
          <label
            htmlFor="product-visible"
            className="cursor-pointer select-none text-sm font-semibold text-foreground"
          >
            Visible on menu
          </label>
        </div>
      </div>

      {genericError ? (
        <p role="alert" className="text-sm text-destructive">
          {genericError}
        </p>
      ) : null}
    </div>
  );
}
