import type { Language } from "../_types/digitalMenu.types";

export type UILabels = {
  allCategories: string;
  searchPlaceholder: string;
  noSearchResults: (query: string) => string;
  noCategoryItems: string;
  cartTitle: string;
  cartEmpty: string;
  cartEmptyHint: string;
  cartClearAll: string;
  cartPlaceOrder: string;
  cartTotal: string;
  cartItem: string;
  cartItems: string;
  addToOrder: string;
  soldOut: string;
  allergens: string;
};

export const uiLabels: Record<Language, UILabels> = {
  en: {
    allCategories: "All",
    searchPlaceholder: "Search menu…",
    noSearchResults: (q) => `No results for "${q}".`,
    noCategoryItems: "No items are available in this category right now.",
    cartTitle: "Your Order",
    cartEmpty: "Nothing here yet",
    cartEmptyHint: "Tap + on any item to add it to your order.",
    cartClearAll: "Clear all",
    cartPlaceOrder: "Place Order",
    cartTotal: "Total",
    cartItem: "item",
    cartItems: "items",
    addToOrder: "Add to Order",
    soldOut: "Sold Out",
    allergens: "Allergens",
  },
  kh: {
    allCategories: "ទាំងអស់",
    searchPlaceholder: "ស្វែងរកម្ហូប…",
    noSearchResults: (q) => `គ្មានលទ្ធផលសម្រាប់ "${q}"។`,
    noCategoryItems: "មិនមានទំនិញក្នុងប្រភេទនេះទេ។",
    cartTitle: "បញ្ជាទិញរបស់អ្នក",
    cartEmpty: "នៅទទេ",
    cartEmptyHint: "ចុច + លើទំនិញណាមួយ ដើម្បីបន្ថែមទៅការបញ្ជាទិញ។",
    cartClearAll: "លុបទាំងអស់",
    cartPlaceOrder: "ដាក់ការបញ្ជាទិញ",
    cartTotal: "សរុប",
    cartItem: "ទំនិញ",
    cartItems: "ទំនិញ",
    addToOrder: "បន្ថែមទៅការបញ្ជាទិញ",
    soldOut: "អស់ហើយ",
    allergens: "សារធាតុអាឡែស៊ី",
  },
};
