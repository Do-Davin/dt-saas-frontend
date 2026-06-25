import type { PricingType, UnitOfMeasure } from "../_api/products";

export interface BranchOption {
  id: string;
  name: string;
}

export interface CategoryOption {
  id: string;
  name: string;
}

export interface ProductFormValues {
  name: string;
  nameKm: string;
  description: string;
  // Preserved for round-trip on Edit; not rendered in the form UI.
  descriptionKm: string;
  categoryId: string;
  branchId: string;
  salesPrice: string;
  purchasePrice: string;
  discount: string;
  label: string;
  unitOfMeasure: UnitOfMeasure | "";
  pricingType: PricingType | "";
  isAvailable: boolean;
  isVisible: boolean;
  stockQuantity: string;
  lowStockThreshold: string;
}

export interface ProductFormErrors {
  name?: string;
  pricingType?: string;
  salesPrice?: string;
  purchasePrice?: string;
  discount?: string;
  stockQuantity?: string;
  lowStockThreshold?: string;
}

export const EMPTY_PRODUCT_FORM: ProductFormValues = {
  name: "",
  nameKm: "",
  description: "",
  descriptionKm: "",
  categoryId: "",
  branchId: "",
  salesPrice: "",
  purchasePrice: "",
  discount: "",
  label: "",
  unitOfMeasure: "",
  pricingType: "FIXED",
  isAvailable: true,
  isVisible: true,
  stockQuantity: "",
  lowStockThreshold: "",
};

// Only these pricing types require a numeric sales price.
const PRICING_TYPES_REQUIRING_SALES_PRICE = new Set<PricingType>([
  "FIXED",
  "STARTING_FROM",
]);

export function isSalesPriceRequired(
  pricingType: PricingType | "",
): boolean {
  return (
    pricingType !== "" &&
    PRICING_TYPES_REQUIRING_SALES_PRICE.has(pricingType as PricingType)
  );
}

function isValidMoney(value: string): boolean {
  if (!value.trim()) return true;
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= 0;
}

function isValidPositiveInt(value: string): boolean {
  if (!value.trim()) return true;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0;
}

export function parsePositiveInt(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

export function validateProductForm(
  values: ProductFormValues,
): ProductFormErrors {
  const errors: ProductFormErrors = {};
  if (!values.name.trim()) errors.name = "Name is required.";

  if (!values.pricingType) {
    errors.pricingType = "Pricing type is required.";
  }

  const salesRequired = isSalesPriceRequired(values.pricingType);
  if (salesRequired && !values.salesPrice.trim()) {
    errors.salesPrice = "Sales price is required.";
  } else if (!isValidMoney(values.salesPrice)) {
    errors.salesPrice = "Must be a valid non-negative number.";
  }

  if (!isValidMoney(values.purchasePrice))
    errors.purchasePrice = "Must be a valid non-negative number.";
  if (!isValidMoney(values.discount))
    errors.discount = "Must be a valid non-negative number.";
  if (!isValidPositiveInt(values.stockQuantity))
    errors.stockQuantity = "Must be a non-negative whole number.";
  if (!isValidPositiveInt(values.lowStockThreshold))
    errors.lowStockThreshold = "Must be a non-negative whole number.";
  return errors;
}

export function hasErrors(errors: ProductFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}

// Converts a money string to a number, or undefined if empty/invalid.
export function parseMoney(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : undefined;
}
