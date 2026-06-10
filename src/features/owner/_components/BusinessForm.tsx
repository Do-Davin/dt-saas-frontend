import { useState } from "react";
import {
  Building2Icon,
  LanguagesIcon,
  LinkIcon,
  BriefcaseIcon,
  LayoutGridIcon,
} from "lucide-react";
import { OwnerTextField } from "./OwnerTextField";
import { OwnerPillSelect } from "./OwnerPillSelect";
import type { BusinessFormValues, BusinessFormErrors } from "../_utils/businessForm";

const BUSINESS_TYPE_OPTIONS = [
  { value: "COFFEE_SHOP",       label: "Coffee Shop"      },
  { value: "RESTAURANT",        label: "Restaurant"       },
  { value: "BAKERY",            label: "Bakery"           },
  { value: "BUFFET",            label: "Buffet"           },
  { value: "CAR_WASH",          label: "Car Wash"         },
  { value: "GARAGE",            label: "Garage"           },
  { value: "ONLINE_SELLER",     label: "Online Seller"    },
  { value: "RETAIL_STORE",      label: "Retail Store"     },
  { value: "SERVICE_BUSINESS",  label: "Service Business" },
];

const CATALOG_MODE_OPTIONS = [
  { value: "MENU",             label: "Menu"             },
  { value: "PRODUCT_CATALOG",  label: "Product Catalog"  },
  { value: "SERVICE_CATALOG",  label: "Service Catalog"  },
];

const SLUG_BACKEND_MSG = "Slug must use lowercase letters, numbers, and hyphens only.";

function parseBackendError(raw: string | undefined): {
  fieldErrors: Partial<BusinessFormErrors>;
  generic?: string;
} {
  if (!raw) return { fieldErrors: {} };
  const lower = raw.toLowerCase();
  if (lower.includes("slug")) return { fieldErrors: { slug: SLUG_BACKEND_MSG } };
  if (lower.includes("name")) return { fieldErrors: { name: raw } };
  if (lower.includes("type")) return { fieldErrors: { type: raw } };
  if (
    lower.includes("catalogmode") ||
    lower.includes("catalog mode") ||
    lower.includes("catalog_mode")
  ) {
    return { fieldErrors: { catalogMode: raw } };
  }
  const generic = /validation\s*failed/i.test(raw)
    ? "Please check the form and try again."
    : raw;
  return { fieldErrors: {}, generic };
}

interface BusinessFormFieldsProps {
  values: BusinessFormValues;
  errors: BusinessFormErrors;
  disabled: boolean;
  onChange: <K extends keyof BusinessFormValues>(
    field: K,
    value: BusinessFormValues[K]
  ) => void;
  submitError?: string;
}

export function BusinessFormFields({
  values,
  errors,
  disabled,
  onChange,
  submitError,
}: BusinessFormFieldsProps) {
  // Track which fields the user has edited since a given submitError was set.
  // Keyed by the submitError string so the set automatically resets when a new
  // error arrives (different key) or the error clears (key becomes undefined).
  const [editedSince, setEditedSince] = useState<{
    errorKey: string | undefined;
    fields: Set<string>;
  }>({ errorKey: undefined, fields: new Set() });

  function handleFieldChange<K extends keyof BusinessFormValues>(
    field: K,
    value: BusinessFormValues[K]
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

  // Fields edited under a different (or cleared) error are irrelevant.
  const editedFields =
    editedSince.errorKey === submitError ? editedSince.fields : new Set<string>();

  const { fieldErrors: backendFieldErrors, generic: genericError } =
    parseBackendError(submitError);

  // Frontend errors win; backend field errors only show for fields not yet edited.
  const displayErrors: BusinessFormErrors = {};
  const fields: (keyof BusinessFormErrors)[] = ["name", "slug", "type", "catalogMode"];
  for (const field of fields) {
    if (errors[field]) {
      displayErrors[field] = errors[field];
    } else if (backendFieldErrors[field] && !editedFields.has(field)) {
      displayErrors[field] = backendFieldErrors[field];
    }
  }

  return (
    <div className="space-y-5">
      <OwnerTextField
        label="Business Name"
        value={values.name}
        onChange={(v) => handleFieldChange("name", v)}
        name="name"
        required
        disabled={disabled}
        error={displayErrors.name}
        leadingIcon={Building2Icon}
      />

      <OwnerTextField
        label="Name (Khmer)"
        value={values.nameKm}
        onChange={(v) => handleFieldChange("nameKm", v)}
        name="nameKm"
        disabled={disabled}
        leadingIcon={LanguagesIcon}
      />

      <OwnerTextField
        label="Slug"
        value={values.slug}
        onChange={(v) => handleFieldChange("slug", v)}
        name="slug"
        required
        disabled={disabled}
        error={displayErrors.slug}
        leadingIcon={LinkIcon}
      />

      <OwnerPillSelect
        label="Business type"
        options={BUSINESS_TYPE_OPTIONS}
        value={values.type}
        onChange={(v) => handleFieldChange("type", v)}
        leadingIcon={BriefcaseIcon}
        required
        disabled={disabled}
        error={displayErrors.type}
      />

      <OwnerPillSelect
        label="Catalog mode"
        options={CATALOG_MODE_OPTIONS}
        value={values.catalogMode}
        onChange={(v) => handleFieldChange("catalogMode", v)}
        leadingIcon={LayoutGridIcon}
        required
        disabled={disabled}
        error={displayErrors.catalogMode}
      />

      {genericError ? (
        <p role="alert" className="text-sm text-destructive">
          {genericError}
        </p>
      ) : null}
    </div>
  );
}
