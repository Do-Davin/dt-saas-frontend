import type {
  Availability,
  Business,
  Category,
  Product,
} from "../_types/digitalMenu.types";

const WEEKDAYS_OPEN: Availability = {
  isTemporarilyUnavailable: false,
  schedule: [
    { day: "monday", isOpen: true, hours: [{ open: "11:00", close: "22:00" }] },
    { day: "tuesday", isOpen: true, hours: [{ open: "11:00", close: "22:00" }] },
    { day: "wednesday", isOpen: true, hours: [{ open: "11:00", close: "22:00" }] },
    { day: "thursday", isOpen: true, hours: [{ open: "11:00", close: "22:00" }] },
    { day: "friday", isOpen: true, hours: [{ open: "11:00", close: "23:00" }] },
    { day: "saturday", isOpen: true, hours: [{ open: "10:00", close: "23:00" }] },
    { day: "sunday", isOpen: false, hours: [] },
  ],
};

const LUNCH_ONLY: Availability = {
  isTemporarilyUnavailable: false,
  schedule: [
    { day: "monday", isOpen: true, hours: [{ open: "11:00", close: "15:00" }] },
    { day: "tuesday", isOpen: true, hours: [{ open: "11:00", close: "15:00" }] },
    { day: "wednesday", isOpen: true, hours: [{ open: "11:00", close: "15:00" }] },
    { day: "thursday", isOpen: true, hours: [{ open: "11:00", close: "15:00" }] },
    { day: "friday", isOpen: true, hours: [{ open: "11:00", close: "15:00" }] },
    { day: "saturday", isOpen: false, hours: [] },
    { day: "sunday", isOpen: false, hours: [] },
  ],
};

export const mockBusiness: Business = {
  id: "biz-001",
  slug: "dt-kitchen",
  name: "DT Kitchen",
  description: {
    en: "Fresh, seasonal dishes with a modern twist.",
    kh: "មុខម្ហូបស្រស់ ច្នៃប្រឌិតទំនើប។",
  },
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
  },
  heroImages: [
    "/mock-images/coffee.png",
    "/mock-images/fruit.png",
    "/mock-images/sushi.png",
  ],
};

export const mockCategories: Category[] = [
  {
    id: "cat-starters",
    businessId: "biz-001",
    name: { en: "Starters", kh: "អាហារចាប់ផ្ដើម" },
    description: {
      en: "Light bites to kick things off.",
      kh: "អាហារស្រាលដើម្បីចាប់ផ្ដើម។",
    },
    position: 0,
  },
  {
    id: "cat-mains",
    businessId: "biz-001",
    name: { en: "Mains", kh: "អាហារចម្បង" },
    description: {
      en: "Hearty plates built around seasonal produce.",
      kh: "ចានមុខម្ហូបធំៗពោរពេញដោយផលិតផលតាមរដូវ។",
    },
    position: 1,
  },
  {
    id: "cat-lunch",
    businessId: "biz-001",
    name: { en: "Lunch Specials", kh: "ពិសេសថ្ងៃត្រង់" },
    description: {
      en: "Available weekdays until 15:00.",
      kh: "មានលក់ថ្ងៃធ្វើការរហូតដល់ម៉ោង ១៥:០០។",
    },
    position: 2,
    availability: LUNCH_ONLY,
  },
  {
    id: "cat-desserts",
    businessId: "biz-001",
    name: { en: "Desserts", kh: "បង្អែម" },
    position: 3,
  },
  {
    id: "cat-drinks",
    businessId: "biz-001",
    name: { en: "Drinks", kh: "គ្រឿងផឹក" },
    position: 4,
  },
];

export const mockProducts: Product[] = [
  {
    id: "prod-bbq",
    categoryId: "cat-mains",
    name: { en: "Barbecue Skewers", kh: "សាច់អាំងជក់" },
    description: {
      en: "Grilled meat skewers with smoky flavor and house BBQ sauce",
      kh: "សាច់អាំងលើឈើឆ្កាង មានរសជាតិឆ្ងាញ់ជាមួយសូស BBQ",
    },
    price: 5.99,
    imageUrl: "/mock-images/barbecue.png",
    isAvailable: true,
    position: 0,
  },
  {
    id: "prod-coffee",
    categoryId: "cat-drinks",
    name: { en: "Iced Coffee", kh: "កាហ្វេទឹកកក" },
    description: {
      en: "Freshly brewed coffee served over ice with rich aroma",
      kh: "កាហ្វេថ្មីៗ ដាក់ទឹកកក មានក្លិនឈ្ងុយ",
    },
    price: 2.5,
    imageUrl: "/mock-images/coffee.png",
    isAvailable: true,
    position: 0,
  },
  {
    id: "prod-fruit",
    categoryId: "cat-desserts",
    name: { en: "Fresh Fruit Bowl", kh: "ផ្លែឈើស្រស់" },
    description: {
      en: "A mix of seasonal fresh fruits, sweet and refreshing",
      kh: "ផ្លែឈើស្រស់ជាច្រើនប្រភេទ មានរសជាតិផ្អែមត្រជាក់",
    },
    price: 3.5,
    imageUrl: "/mock-images/fruit.png",
    isAvailable: true,
    position: 0,
  },
  {
    id: "prod-matcha",
    categoryId: "cat-drinks",
    name: { en: "Matcha Latte", kh: "ម៉ាចាឡាតេ" },
    description: {
      en: "Creamy Japanese matcha blended with fresh milk",
      kh: "តែបៃតងម៉ាចា លាយជាមួយទឹកដោះគោ មានរសជាតិទន់",
    },
    price: 3.0,
    imageUrl: "/mock-images/matcha.png",
    isAvailable: true,
    position: 1,
  },
  {
    id: "prod-noodle",
    categoryId: "cat-mains",
    name: { en: "Stir-Fried Noodles", kh: "មីឆា" },
    description: {
      en: "Savory stir-fried noodles with vegetables and sauce",
      kh: "មីឆាជាមួយបន្លែ និងសូស មានរសជាតិឆ្ងាញ់",
    },
    price: 4.5,
    imageUrl: "/mock-images/noodle.png",
    isAvailable: true,
    position: 1,
  },
  {
    id: "prod-salmon",
    categoryId: "cat-mains",
    name: { en: "Grilled Salmon", kh: "ត្រីសាម៉ុនអាំង" },
    description: {
      en: "Fresh salmon grilled to perfection with light seasoning",
      kh: "ត្រីសាម៉ុនអាំង មានរសជាតិទន់ និងឆ្ងាញ់",
    },
    price: 8.99,
    imageUrl: "/mock-images/salmon.png",
    isAvailable: true,
    position: 2,
  },
  {
    id: "prod-steak",
    categoryId: "cat-mains",
    name: { en: "Beef Steak", kh: "ស្ទេកសាច់គោ" },
    description: {
      en: "Juicy grilled beef steak cooked to your preference",
      kh: "សាច់គោអាំង មានរសជាតិទន់ និងជូរជ្រាប",
    },
    price: 10.99,
    imageUrl: "/mock-images/steak.png",
    isAvailable: true,
    position: 3,
  },
  {
    id: "prod-sushi",
    categoryId: "cat-mains",
    name: { en: "Sushi Platter", kh: "ស៊ូស៊ី" },
    description: {
      en: "Assorted sushi rolls with fresh fish and rice",
      kh: "ស៊ូស៊ីជាច្រើនប្រភេទ ជាមួយត្រីស្រស់",
    },
    price: 7.5,
    imageUrl: "/mock-images/sushi.png",
    isAvailable: true,
    position: 4,
  },
  {
    id: "prod-wagyu",
    categoryId: "cat-mains",
    name: { en: "Wagyu Beef", kh: "សាច់វ៉ាគ្យូ" },
    description: {
      en: "Premium wagyu beef with rich marbling and tenderness",
      kh: "សាច់វ៉ាគ្យូគុណភាពខ្ពស់ មានជាតិខ្លាញ់ទន់ល្អ",
    },
    price: 15.99,
    imageUrl: "/mock-images/wagyu.png",
    isAvailable: true,
    position: 5,
  },
];
