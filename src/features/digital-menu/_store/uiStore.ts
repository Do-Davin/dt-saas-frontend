import { create } from "zustand";
import type { Product } from "../_types/digitalMenu.types";

interface DigitalMenuUIState {
  selectedCategoryId: string | null;
  selectCategory: (id: string | null) => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  selectedProduct: Product | null;
  isProductModalOpen: boolean;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
}

export const useDigitalMenuUIStore = create<DigitalMenuUIState>()((set) => ({
  selectedCategoryId: null,
  selectCategory: (id) => set({ selectedCategoryId: id }),

  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearch: () => set({ searchQuery: "" }),

  selectedProduct: null,
  isProductModalOpen: false,
  openProductModal: (product) =>
    set({ selectedProduct: product, isProductModalOpen: true }),
  closeProductModal: () =>
    set({ isProductModalOpen: false, selectedProduct: null }),
}));
