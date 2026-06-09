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

  // Request form (Phase 1.8I)
  sendRequest: string;
  back: string;
  yourName: string;
  phoneNumber: string;
  quantity: string;
  itemNote: string;
  noteToBusiness: string;
  sending: string;
  cancel: string;
  close: string;
  requestSentSuccessfully: string;
  requestSuccessDescription: string;
  validationNameRequired: string;
  validationPhoneRequired: string;
  validationQuantityMin: string;
  genericRequestError: string;

  // Cart order success (Phase: order-success-ux)
  orderSuccessTitle: string;
  orderSuccessDescription: string;
  continueShopping: string;
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

    sendRequest: "Send request",
    back: "Back",
    yourName: "Your name",
    phoneNumber: "Phone number",
    quantity: "Quantity",
    itemNote: "Item note (optional)",
    noteToBusiness: "Note to the business (optional)",
    sending: "Sending…",
    cancel: "Cancel",
    close: "Close",
    requestSentSuccessfully: "Request sent successfully.",
    requestSuccessDescription:
      "Thanks for your request. The business will get back to you soon.",
    validationNameRequired: "Please enter your name.",
    validationPhoneRequired: "Please enter your phone number.",
    validationQuantityMin: "Quantity must be at least 1.",
    genericRequestError: "Could not send your request. Please try again.",

    orderSuccessTitle: "Order placed!",
    orderSuccessDescription:
      "Your order has been sent. The business will prepare it shortly.",
    continueShopping: "Continue Shopping",
  },
  kh: {
    allCategories: "ទាំងអស់",
    searchPlaceholder: "ស្វែងរកមុខម្ហូប…",
    noSearchResults: (q) => `មិនមានលទ្ធផលសម្រាប់ការស្វែងរក "${q}" ទេ។`,
    noCategoryItems: "មិនមានមុខម្ហូបនៅក្នុងប្រភេទនេះទេនាពេលនេះ។",
    cartTitle: "ការបញ្ជាទិញរបស់អ្នក",
    cartEmpty: "មិនទាន់មានទំនិញនៅឡើយទេ",
    cartEmptyHint: "ចុចសញ្ញា + លើមុខម្ហូប ដើម្បីបន្ថែមទៅក្នុងកន្ត្រក។",
    cartClearAll: "សម្អាតទាំងអស់",
    cartPlaceOrder: "កុម្ម៉ង់ឥឡូវនេះ",
    cartTotal: "សរុប",
    cartItem: "មុខម្ហូប",
    cartItems: "មុខម្ហូប",
    addToOrder: "បន្ថែមទៅក្នុងកន្ត្រក",
    soldOut: "អស់ស្តុក",
    allergens: "សារធាតុបង្កអាឡែស៊ី",

    sendRequest: "ផ្ញើសំណើ",
    back: "ត្រឡប់ក្រោយ",
    yourName: "ឈ្មោះរបស់អ្នក",
    phoneNumber: "លេខទូរស័ព្ទ",
    quantity: "បរិមាណ",
    itemNote: "ចំណាំបន្ថែមលើមុខម្ហូប (មិនបង្ខំ)",
    noteToBusiness: "ចំណាំផ្ញើជូនហាង (មិនបង្ខំ)",
    sending: "កំពុងផ្ញើ…",
    cancel: "បោះបង់",
    close: "បិទ",
    requestSentSuccessfully: "បានផ្ញើសំណើដោយជោគជ័យ។",
    requestSuccessDescription:
      "សូមអរគុណសម្រាប់ការផ្ញើសំណើ។ ខាងហាងនឹងទាក់ទងទៅអ្នកវិញក្នុងពេលឆាប់ៗ។",
    validationNameRequired: "សូមបញ្ចូលឈ្មោះរបស់អ្នក។",
    validationPhoneRequired: "សូមបញ្ចូលលេខទូរស័ព្ទរបស់អ្នក។",
    validationQuantityMin: "បរិមាណត្រូវមានយ៉ាងហោចណាស់ ១។",
    genericRequestError: "មិនអាចផ្ញើសំណើបានទេ។ សូមព្យាយាមម្ដងទៀត។",

    orderSuccessTitle: "បានបញ្ជាទិញដោយជោគជ័យ!",
    orderSuccessDescription:
      "ការបញ្ជាទិញរបស់អ្នកត្រូវបានផ្ញើរួចរាល់។ ខាងហាងនឹងរៀបចំក្នុងពេលឆាប់ៗ។",
    continueShopping: "បន្តមើលមុខម្ហូប",
  },
};
