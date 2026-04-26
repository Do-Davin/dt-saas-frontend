import type { StateCreator } from "zustand";
import type { Category, Product } from "../_types/digitalMenu.types";

export interface MenuSlice {
  categories: Category[];
  items: Product[];
  activeCategoryId: string | null;
  isLoading: boolean;
  setActiveCategory: (id: string | null) => void;
  setMenuData: (categories: Category[], items: Product[]) => void;
  setLoading: (loading: boolean) => void;
}

export const createMenuSlice: StateCreator<MenuSlice, [], [], MenuSlice> = (set) => ({
  categories: [],
  items: [],
  activeCategoryId: null,
  isLoading: false,
  setActiveCategory: (id) => set({ activeCategoryId: id }),
  setMenuData: (categories, items) => set({ categories, items }),
  setLoading: (loading) => set({ isLoading: loading }),
});
