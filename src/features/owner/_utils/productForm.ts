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
}

export interface ProductFormErrors {
  name?: string;
  salesPrice?: string;
  purchasePrice?: string;
  discount?: string;
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
};

function isValidMoney(value: string): boolean {
  if (!value.trim()) return true;
  const n = parseFloat(value);
  return Number.isFinite(n) && n >= 0;
}

export function validateProductForm(
  values: ProductFormValues
): ProductFormErrors {
  const errors: ProductFormErrors = {};
  if (!values.name.trim()) errors.name = "Name is required.";
  if (!isValidMoney(values.salesPrice))
    errors.salesPrice = "Must be a valid non-negative number.";
  if (!isValidMoney(values.purchasePrice))
    errors.purchasePrice = "Must be a valid non-negative number.";
  if (!isValidMoney(values.discount))
    errors.discount = "Must be a valid non-negative number.";
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
