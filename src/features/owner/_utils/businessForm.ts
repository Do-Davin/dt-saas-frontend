export interface BusinessFormValues {
  name: string;
  nameKm: string;
  slug: string;
  type: string;
  catalogMode: string;
}

export interface BusinessFormErrors {
  name?: string;
  slug?: string;
  type?: string;
  catalogMode?: string;
}

export const EMPTY_BUSINESS_FORM: BusinessFormValues = {
  name: "",
  nameKm: "",
  slug: "",
  type: "",
  catalogMode: "",
};

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateBusinessForm(
  values: BusinessFormValues
): BusinessFormErrors {
  const errors: BusinessFormErrors = {};
  if (!values.name.trim()) errors.name = "Business Name is required.";
  if (!values.slug.trim()) {
    errors.slug = "Slug is required.";
  } else if (!SLUG_REGEX.test(values.slug.trim())) {
    errors.slug = "Slug must use lowercase letters, numbers, and hyphens only.";
  }
  if (!values.type.trim()) errors.type = "Business type is required.";
  if (!values.catalogMode.trim()) errors.catalogMode = "Catalog mode is required.";
  return errors;
}

export function hasErrors(errors: BusinessFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
