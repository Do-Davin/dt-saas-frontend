// ─── Availability ────────────────────────────────────────────────────────────

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

/** A single open/close window within a day, using 24-hour "HH:MM" strings. */
export interface TimeRange {
  open: string;
  close: string;
}

/** Hours for one day; supports split sessions (e.g. lunch + dinner). */
export interface DaySchedule {
  day: DayOfWeek;
  isOpen: boolean;
  hours: TimeRange[];
}

/** Weekly schedule plus an optional temporary override (e.g. holiday closure). */
export interface Availability {
  schedule: DaySchedule[];
  isTemporarilyUnavailable: boolean;
  unavailableUntil?: string; // ISO 8601 date string
  unavailableMessage?: string;
}

// ─── Business ────────────────────────────────────────────────────────────────

export interface BusinessAddress {
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
}

export interface BusinessContact {
  phone?: string;
  email?: string;
  website?: string;
  /** Telegram username without the @ prefix (e.g. "dtkitchen"). */
  telegram?: string;
}

/** Public-facing business information shown on the digital menu. */
export interface Business {
  id: string;
  /** URL-friendly identifier used in public menu routes (e.g. /menu/dt-kitchen). */
  slug: string;
  name: string;
  logoUrl?: string;
  coverImageUrl?: string;
  description?: string;
  cuisineTypes?: string[];
  /** ISO 4217 currency code (e.g. "USD"). */
  currency: string;
  availability: Availability;
  address?: BusinessAddress;
  contact?: BusinessContact;
}

// ─── Category ────────────────────────────────────────────────────────────────

/** A menu section visible to customers (e.g. Starters, Mains, Drinks). */
export interface Category {
  id: string;
  businessId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  /** Zero-based display order within the menu. */
  position: number;
  /** Optional time restriction for this category (e.g. breakfast only). */
  availability?: Availability;
}

// ─── Product ─────────────────────────────────────────────────────────────────

export type Allergen =
  | "gluten"
  | "dairy"
  | "eggs"
  | "nuts"
  | "peanuts"
  | "soy"
  | "fish"
  | "shellfish"
  | "sesame";

export type DietaryTag =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "dairy-free"
  | "halal"
  | "kosher"
  | "spicy";

/** A single selectable option within an option group (e.g. "Large" for a "Size" group). */
export interface ProductChoice {
  id: string;
  name: string;
  /** Additional cost on top of the base price; 0 means no change. */
  priceModifier: number;
}

/** A named group of choices presented to the customer at order time. */
export interface ProductOptionGroup {
  id: string;
  name: string;
  required: boolean;
  /** When true, the customer may select more than one choice. */
  multiSelect: boolean;
  choices: ProductChoice[];
}

/** A single menu item visible to customers. */
export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  /** Base price in the business's currency. */
  price: number;
  imageUrl?: string;
  isAvailable: boolean;
  /** Optional time restriction for this product (e.g. happy-hour only). */
  availability?: Availability;
  allergens?: Allergen[];
  dietaryTags?: DietaryTag[];
  calories?: number;
  optionGroups?: ProductOptionGroup[];
  /** Zero-based display order within its category. */
  position: number;
}
