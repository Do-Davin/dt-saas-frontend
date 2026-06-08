export interface CategoryFormValues {
  name: string;
  nameKm: string;
  branchId: string;
  isActive: boolean;
}

export interface CategoryFormErrors {
  name?: string;
}

export const EMPTY_CATEGORY_FORM: CategoryFormValues = {
  name: "",
  nameKm: "",
  branchId: "",
  isActive: true,
};

export function validateCategoryForm(
  values: CategoryFormValues
): CategoryFormErrors {
  const errors: CategoryFormErrors = {};
  if (!values.name.trim()) errors.name = "Name is required.";
  return errors;
}

export function hasErrors(errors: CategoryFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
