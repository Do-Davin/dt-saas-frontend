import { create } from "zustand";
import type { Product } from "../types/digitalMenu.types";

interface DigitalMenuUIState {
  // ── Category filter ───────────────────────────────────────────────────────
  selectedCategoryId: string | null;
  selectCategory: (id: string | null) => void;

  // ── Search ────────────────────────────────────────────────────────────────
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  // ── Product detail modal ──────────────────────────────────────────────────
  selectedProduct: Product | null;
  isProductModalOpen: boolean;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
}

export const useDigitalMenuUIStore = create<DigitalMenuUIState>()((set) => ({
  // ── Category filter ───────────────────────────────────────────────────────
  selectedCategoryId: null,
  selectCategory: (id) => set({ selectedCategoryId: id }),

  // ── Search ────────────────────────────────────────────────────────────────
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  clearSearch: () => set({ searchQuery: "" }),

  // ── Product detail modal ──────────────────────────────────────────────────
  selectedProduct: null,
  isProductModalOpen: false,
  openProductModal: (product) =>
    set({ selectedProduct: product, isProductModalOpen: true }),
  closeProductModal: () =>
    set({ isProductModalOpen: false, selectedProduct: null }),
}));
