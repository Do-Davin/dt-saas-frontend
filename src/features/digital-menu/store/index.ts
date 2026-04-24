import { create } from "zustand";
import { createMenuSlice, type MenuSlice } from "./menuSlice";
import { createCartSlice, type CartSlice, type CartItem } from "./cartSlice";

type BoundStore = MenuSlice & CartSlice;

export type { CartItem };

export const useMenuStore = create<BoundStore>()((...args) => ({
  ...createMenuSlice(...args),
  ...createCartSlice(...args),
}));
