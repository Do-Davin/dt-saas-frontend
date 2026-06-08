export interface BranchFormValues {
  name: string;
  nameKm: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface BranchFormErrors {
  name?: string;
}

export const EMPTY_BRANCH_FORM: BranchFormValues = {
  name: "",
  nameKm: "",
  address: "",
  phone: "",
  isActive: true,
};

export function validateBranchForm(
  values: BranchFormValues
): BranchFormErrors {
  const errors: BranchFormErrors = {};
  if (!values.name.trim()) errors.name = "Name is required.";
  return errors;
}

export function hasErrors(errors: BranchFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
