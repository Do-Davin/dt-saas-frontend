import type {
  Availability,
  Business,
  Category,
  Product,
} from "../types/digitalMenu.types";

// ─── Shared helpers ───────────────────────────────────────────────────────────

const WEEKDAYS_OPEN: Availability = {
  isTemporarilyUnavailable: false,
  schedule: [
    { day: "monday",    isOpen: true,  hours: [{ open: "11:00", close: "22:00" }] },
    { day: "tuesday",   isOpen: true,  hours: [{ open: "11:00", close: "22:00" }] },
    { day: "wednesday", isOpen: true,  hours: [{ open: "11:00", close: "22:00" }] },
    { day: "thursday",  isOpen: true,  hours: [{ open: "11:00", close: "22:00" }] },
    { day: "friday",    isOpen: true,  hours: [{ open: "11:00", close: "23:00" }] },
    { day: "saturday",  isOpen: true,  hours: [{ open: "10:00", close: "23:00" }] },
    { day: "sunday",    isOpen: false, hours: [] },
  ],
};

const LUNCH_ONLY: Availability = {
  isTemporarilyUnavailable: false,
  schedule: [
    { day: "monday",    isOpen: true,  hours: [{ open: "11:00", close: "15:00" }] },
    { day: "tuesday",   isOpen: true,  hours: [{ open: "11:00", close: "15:00" }] },
    { day: "wednesday", isOpen: true,  hours: [{ open: "11:00", close: "15:00" }] },
    { day: "thursday",  isOpen: true,  hours: [{ open: "11:00", close: "15:00" }] },
    { day: "friday",    isOpen: true,  hours: [{ open: "11:00", close: "15:00" }] },
    { day: "saturday",  isOpen: false, hours: [] },
    { day: "sunday",    isOpen: false, hours: [] },
  ],
};

// ─── Business ─────────────────────────────────────────────────────────────────

export const mockBusiness: Business = {
  id: "biz-001",
  slug: "dt-kitchen",
  name: "DT Kitchen",
  description: "Fresh, seasonal dishes with a modern twist.",
  cuisineTypes: ["Modern", "International"],
  currency: "USD",
  availability: WEEKDAYS_OPEN,
  address: {
    street: "12 Flavour Street",
    city: "Cape Town",
    state: "Western Cape",
    postalCode: "8001",
    country: "ZA",
  },
  contact: {
    phone: "+27 21 000 0000",
    email: "hello@dtkitchen.co.za",
    telegram: "dtkitchen",
  },
};

// ─── Categories ───────────────────────────────────────────────────────────────

export const mockCategories: Category[] = [
  {
    id: "cat-starters",
    businessId: "biz-001",
    name: "Starters",
    description: "Light bites to kick things off.",
    position: 0,
  },
  {
    id: "cat-mains",
    businessId: "biz-001",
    name: "Mains",
    description: "Hearty plates built around seasonal produce.",
    position: 1,
  },
  {
    id: "cat-lunch",
    businessId: "biz-001",
    name: "Lunch Specials",
    description: "Available weekdays until 15:00.",
    position: 2,
    availability: LUNCH_ONLY,
  },
  {
    id: "cat-desserts",
    businessId: "biz-001",
    name: "Desserts",
    position: 3,
  },
  {
    id: "cat-drinks",
    businessId: "biz-001",
    name: "Drinks",
    position: 4,
  },
];

// ─── Products ─────────────────────────────────────────────────────────────────

export const mockProducts: Product[] = [
  // Starters
  {
    id: "prod-001",
    categoryId: "cat-starters",
    name: "Crispy Calamari",
    description: "Lightly battered rings with lemon aioli.",
    price: 9.5,
    isAvailable: true,
    allergens: ["gluten", "fish"],
    calories: 320,
    position: 0,
  },
  {
    id: "prod-002",
    categoryId: "cat-starters",
    name: "Bruschetta",
    description: "Toasted sourdough, heirloom tomatoes, fresh basil, aged balsamic.",
    price: 8.0,
    isAvailable: true,
    allergens: ["gluten"],
    dietaryTags: ["vegetarian", "vegan"],
    calories: 210,
    position: 1,
  },
  {
    id: "prod-003",
    categoryId: "cat-starters",
    name: "Soup of the Day",
    description: "Ask your server for today's selection.",
    price: 7.0,
    isAvailable: true,
    dietaryTags: ["vegetarian"],
    position: 2,
  },

  // Mains
  {
    id: "prod-004",
    categoryId: "cat-mains",
    name: "Grilled Chicken Breast",
    description: "Free-range chicken, roasted vegetables, herb butter jus.",
    price: 18.5,
    isAvailable: true,
    allergens: ["dairy"],
    calories: 520,
    position: 0,
    optionGroups: [
      {
        id: "og-chicken-side",
        name: "Choose a side",
        required: true,
        multiSelect: false,
        choices: [
          { id: "ch-fries",  name: "Fries",         priceModifier: 0 },
          { id: "ch-salad",  name: "Garden Salad",  priceModifier: 0 },
          { id: "ch-mash",   name: "Mashed Potato", priceModifier: 0 },
        ],
      },
    ],
  },
  {
    id: "prod-005",
    categoryId: "cat-mains",
    name: "Pasta Arrabbiata",
    description: "Penne in a spicy tomato and garlic sauce, fresh basil.",
    price: 14.5,
    isAvailable: true,
    allergens: ["gluten"],
    dietaryTags: ["vegetarian", "vegan", "spicy"],
    calories: 480,
    position: 1,
  },
  {
    id: "prod-006",
    categoryId: "cat-mains",
    name: "Pan-Seared Salmon",
    description: "Atlantic salmon, lemon caper butter, seasonal greens.",
    price: 22.0,
    isAvailable: true,
    allergens: ["fish", "dairy"],
    calories: 610,
    position: 2,
  },
  {
    id: "prod-007",
    categoryId: "cat-mains",
    name: "Mushroom Risotto",
    description: "Arborio rice, wild mushrooms, parmesan, truffle oil.",
    price: 16.0,
    isAvailable: false, // sold out example
    allergens: ["dairy"],
    dietaryTags: ["vegetarian", "gluten-free"],
    calories: 540,
    position: 3,
  },

  // Lunch Specials
  {
    id: "prod-008",
    categoryId: "cat-lunch",
    name: "Chicken Wrap",
    description: "Grilled chicken, lettuce, tomato, chipotle mayo.",
    price: 11.0,
    isAvailable: true,
    allergens: ["gluten", "eggs"],
    calories: 420,
    position: 0,
  },
  {
    id: "prod-009",
    categoryId: "cat-lunch",
    name: "Soup & Sandwich Combo",
    description: "Soup of the day with your choice of sandwich.",
    price: 12.5,
    isAvailable: true,
    allergens: ["gluten"],
    position: 1,
  },

  // Desserts
  {
    id: "prod-010",
    categoryId: "cat-desserts",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with a molten centre, vanilla bean ice cream.",
    price: 9.0,
    isAvailable: true,
    allergens: ["gluten", "dairy", "eggs"],
    dietaryTags: ["vegetarian"],
    calories: 480,
    position: 0,
  },
  {
    id: "prod-011",
    categoryId: "cat-desserts",
    name: "Seasonal Sorbet",
    description: "Two scoops. Ask your server for today's flavours.",
    price: 6.5,
    isAvailable: true,
    dietaryTags: ["vegan", "gluten-free", "dairy-free"],
    calories: 180,
    position: 1,
  },

  // Drinks
  {
    id: "prod-012",
    categoryId: "cat-drinks",
    name: "Fresh Lemonade",
    description: "House-made with mint and fresh lemons.",
    price: 4.5,
    isAvailable: true,
    dietaryTags: ["vegan", "gluten-free"],
    calories: 90,
    position: 0,
    optionGroups: [
      {
        id: "og-lemonade-size",
        name: "Size",
        required: true,
        multiSelect: false,
        choices: [
          { id: "ch-regular", name: "Regular (350ml)", priceModifier: 0 },
          { id: "ch-large",   name: "Large (500ml)",   priceModifier: 1.5 },
        ],
      },
    ],
  },
  {
    id: "prod-013",
    categoryId: "cat-drinks",
    name: "Sparkling Water",
    price: 3.0,
    isAvailable: true,
    dietaryTags: ["vegan", "gluten-free"],
    calories: 0,
    position: 1,
  },
  {
    id: "prod-014",
    categoryId: "cat-drinks",
    name: "Filter Coffee",
    description: "Single-origin, freshly brewed.",
    price: 3.5,
    isAvailable: true,
    allergens: ["dairy"],
    dietaryTags: ["gluten-free"],
    calories: 15,
    position: 2,
  },
];
