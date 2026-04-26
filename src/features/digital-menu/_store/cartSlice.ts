import type { StateCreator } from "zustand";
import type { Product } from "../_types/digitalMenu.types";

export interface CartItem {
  item: Product;
  quantity: number;
  notes?: string;
}

export interface CartSlice {
  cart: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Product) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  cartTotal: () => number;
  cartCount: () => number;
}

export const createCartSlice: StateCreator<CartSlice, [], [], CartSlice> = (set, get) => ({
  cart: [],
  isCartOpen: false,

  addToCart: (item) =>
    set((state) => {
      const existing = state.cart.find((c) => c.item.id === item.id);
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
          ),
        };
      }
      return { cart: [...state.cart, { item, quantity: 1 }] };
    }),

  removeFromCart: (itemId) =>
    set((state) => ({ cart: state.cart.filter((c) => c.item.id !== itemId) })),

  updateQuantity: (itemId, quantity) =>
    set((state) => ({
      cart:
        quantity <= 0
          ? state.cart.filter((c) => c.item.id !== itemId)
          : state.cart.map((c) =>
              c.item.id === itemId ? { ...c, quantity } : c
            ),
    })),

  clearCart: () => set({ cart: [] }),

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  cartTotal: () =>
    get().cart.reduce((sum, c) => sum + c.item.price * c.quantity, 0),

  cartCount: () => get().cart.reduce((sum, c) => sum + c.quantity, 0),
});
