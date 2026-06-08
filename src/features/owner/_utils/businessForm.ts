export interface BusinessFormValues {
  name: string;
  nameKm: string;
  slug: string;
  type: string;
  catalogMode: string;
}

export interface BusinessFormErrors {
  name?: string;
}

export const EMPTY_BUSINESS_FORM: BusinessFormValues = {
  name: "",
  nameKm: "",
  slug: "",
  type: "",
  catalogMode: "",
};

export function validateBusinessForm(
  values: BusinessFormValues
): BusinessFormErrors {
  const errors: BusinessFormErrors = {};
  if (!values.name.trim()) {
    errors.name = "Name is required.";
  }
  return errors;
}

export function hasErrors(errors: BusinessFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
