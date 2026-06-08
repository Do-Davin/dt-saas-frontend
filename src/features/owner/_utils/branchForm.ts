export interface BranchFormValues {
  name: string;
  nameKm: string;
  slug: string;
  address: string;
  phone: string;
  isActive: boolean;
}

export interface BranchFormErrors {
  name?: string;
  slug?: string;
}

export const EMPTY_BRANCH_FORM: BranchFormValues = {
  name: "",
  nameKm: "",
  slug: "",
  address: "",
  phone: "",
  isActive: true,
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function validateBranchForm(
  values: BranchFormValues
): BranchFormErrors {
  const errors: BranchFormErrors = {};
  if (!values.name.trim()) errors.name = "Name is required.";
  const slug = values.slug.trim();
  if (!slug) {
    errors.slug = "Slug is required.";
  } else if (!SLUG_PATTERN.test(slug)) {
    errors.slug =
      "Use lowercase letters, numbers, and single hyphens between words.";
  }
  return errors;
}

export function hasErrors(errors: BranchFormErrors): boolean {
  return Object.values(errors).some(Boolean);
}
