export type PlanId = 'MONTHLY' | 'ANNUALLY' | 'CUSTOM';

export type BusinessTypeId =
  | 'CAFE_SHOP'
  | 'CLOTHING_STORE'
  | 'RESTAURANT'
  | 'BAKERY'
  | 'BUFFET'
  | 'CAR_WASH'
  | 'GARAGE'
  | 'ONLINE_SELLER'
  | 'RETAIL_STORE'
  | 'SERVICE_BUSINESS';

export interface TemplateCategory {
  name: string;
  products: string[];
}

export const BUSINESS_TYPES: { id: BusinessTypeId; label: string; emoji: string }[] = [
  { id: 'CAFE_SHOP',        label: 'Cafe Shop',        emoji: '☕' },
  { id: 'CLOTHING_STORE',   label: 'Clothing Store',   emoji: '👗' },
  { id: 'RESTAURANT',       label: 'Restaurant',       emoji: '🍽️' },
  { id: 'BAKERY',           label: 'Bakery',           emoji: '🥐' },
  { id: 'BUFFET',           label: 'Buffet',           emoji: '🍱' },
  { id: 'CAR_WASH',         label: 'Car Wash',         emoji: '🚗' },
  { id: 'GARAGE',           label: 'Garage',           emoji: '🔧' },
  { id: 'ONLINE_SELLER',    label: 'Online Seller',    emoji: '📦' },
  { id: 'RETAIL_STORE',     label: 'Retail Store',     emoji: '🏪' },
  { id: 'SERVICE_BUSINESS', label: 'Service Business', emoji: '💼' },
];

export const BUSINESS_TYPE_TEMPLATES: Record<BusinessTypeId, TemplateCategory[]> = {
  CAFE_SHOP: [
    { name: 'Iced Coffee', products: ['Iced Latte', 'Iced Vanilla', 'Iced Americano'] },
    { name: 'Hot Coffee',  products: ['Hot Latte', 'Hot Americano', 'Hot Mocha'] },
    { name: 'Tea & Milk',  products: ['Thai Milk Tea', 'Brown Sugar Milk', 'Green Tea Latte'] },
    { name: 'Food',        products: ['Sandwich', 'Croissant', 'Egg Toast'] },
    { name: 'Snack',       products: ['Muffin', 'Cookie', 'Donut'] },
  ],
  CLOTHING_STORE: [
    { name: 'New Arrivals', products: ['T-Shirt', 'Jeans', 'Dress'] },
    { name: 'Men',          products: ['Polo Shirt', 'Shorts', 'Jacket'] },
    { name: 'Women',        products: ['Blouse', 'Skirt', 'Leggings'] },
    { name: 'Accessories',  products: ['Belt', 'Bag', 'Hat'] },
  ],
  RESTAURANT: [
    { name: 'Starters',     products: ['Spring Rolls', 'Soup', 'Salad'] },
    { name: 'Main Course',  products: ['Fried Rice', 'Noodles', 'Grilled Chicken'] },
    { name: 'Desserts',     products: ['Ice Cream', 'Cake', 'Fruit Salad'] },
    { name: 'Drinks',       products: ['Water', 'Juice', 'Soda'] },
  ],
  BAKERY: [
    { name: 'Breads',     products: ['Baguette', 'Sourdough', 'Whole Wheat'] },
    { name: 'Pastries',   products: ['Croissant', 'Danish', 'Pain au Chocolat'] },
    { name: 'Cakes',      products: ['Birthday Cake', 'Cheesecake', 'Chocolate Cake'] },
    { name: 'Beverages',  products: ['Coffee', 'Tea', 'Hot Chocolate'] },
  ],
  BUFFET: [
    { name: 'Hot Station',    products: ['Stir Fry', 'Curry', 'Roast Meat'] },
    { name: 'Cold Station',   products: ['Sushi', 'Salad Bar', 'Cold Cuts'] },
    { name: 'Dessert Corner', products: ['Fruit Station', 'Pudding', 'Cake'] },
    { name: 'Drinks',         products: ['Juice', 'Soft Drink', 'Water'] },
  ],
  CAR_WASH: [
    { name: 'Basic Wash',  products: ['Exterior Wash', 'Interior Vacuum', 'Window Clean'] },
    { name: 'Full Detail', products: ['Full Interior Detail', 'Polish', 'Wax Coat'] },
    { name: 'Add-Ons',     products: ['Tire Shine', 'Air Freshener', 'Engine Clean'] },
  ],
  GARAGE: [
    { name: 'Maintenance', products: ['Oil Change', 'Filter Replace', 'Fluid Top-up'] },
    { name: 'Repair',      products: ['Brake Service', 'Tire Change', 'Battery Replace'] },
    { name: 'Parts',       products: ['Engine Parts', 'Electrical Parts', 'Body Parts'] },
  ],
  ONLINE_SELLER: [
    { name: 'Featured',     products: ['Best Seller 1', 'Best Seller 2', 'Best Seller 3'] },
    { name: 'New Arrivals', products: ['New Item 1', 'New Item 2', 'New Item 3'] },
    { name: 'Sale',         products: ['Discount Item 1', 'Discount Item 2', 'Discount Item 3'] },
  ],
  RETAIL_STORE: [
    { name: 'New Arrivals', products: ['New Product 1', 'New Product 2', 'New Product 3'] },
    { name: 'Best Sellers', products: ['Top Seller 1', 'Top Seller 2', 'Top Seller 3'] },
    { name: 'Clearance',    products: ['Clearance 1', 'Clearance 2', 'Clearance 3'] },
  ],
  SERVICE_BUSINESS: [
    { name: 'Packages',      products: ['Basic Package', 'Standard Package', 'Premium Package'] },
    { name: 'Add-Ons',       products: ['Extra Service 1', 'Extra Service 2', 'Extra Service 3'] },
    { name: 'Consultations', products: ['30-min Consult', '1-hr Consult', 'Full Assessment'] },
  ],
};

export interface PlanInfo {
  id: PlanId;
  name: string;
  monthlyPrice: number | null;
  billingNote: string;
  highlight?: boolean;
}

export const PLANS: PlanInfo[] = [
  {
    id: 'MONTHLY',
    name: 'Monthly',
    monthlyPrice: 24.99,
    billingNote: 'Billed monthly. Cancel anytime.',
    highlight: true,
  },
  {
    id: 'ANNUALLY',
    name: 'Annually',
    monthlyPrice: 19.99,
    billingNote: 'Billed $239.88/year. Save 20%.',
  },
  {
    id: 'CUSTOM',
    name: 'Custom',
    monthlyPrice: null,
    billingNote: 'Contact us for enterprise pricing.',
  },
];

export const ADDON_ITEM_PRICE = 9;
export const ADDON_USER_PRICE = 15;
export const ADDON_ITEM_PACK_SIZE = 100;
export const ADDON_USER_PACK_SIZE = 5;
export const BASE_ITEMS = 50;
export const BASE_USERS = 1;
