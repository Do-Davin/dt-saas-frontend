// Owner businesses store.
//
// Holds the loaded business list and the currently selected business ID.
//
// Persistence: selectedBusinessId is delegated to the existing temporary
// helper (currentBusiness.ts, key: dt.owner.currentBusinessId.v1) so no
// second localStorage key is created. Replace this delegation when that
// helper is retired in a later phase.
//
// Selection rules:
//   0 businesses  → selectedBusinessId = null
//   1 business    → auto-select; no selector UI needed
//   2+ businesses → keep existing selection if still valid; null otherwise
//                   (leave unselected until a selector UI lands)
//
// Safety: selectedBusinessId is always validated against the loaded list.
// A stale ID that no longer exists in the backend response is cleared, not
// silently kept.

import { create } from "zustand";
import {
  clearCurrentBusinessId,
  getCurrentBusinessId,
  setCurrentBusinessId,
} from "./currentBusiness";
import { listOwnerBusinesses } from "../_api/businesses";
import type { OwnerBusiness } from "../_api/businesses";

interface OwnerBusinessesState {
  businesses: OwnerBusiness[];
  selectedBusinessId: string | null;
  isLoading: boolean;
  error: string | null;
  loadBusinesses: () => Promise<void>;
  selectBusiness: (businessId: string) => void;
  clearBusinesses: () => void;
}

export const useOwnerBusinessesStore = create<OwnerBusinessesState>()(
  (set, get) => ({
    businesses: [],
    // Seed from the temporary helper so a reload restores the selection
    // without a round trip. Validated against the loaded list when
    // loadBusinesses() runs.
    selectedBusinessId: getCurrentBusinessId(),
    isLoading: false,
    error: null,

    loadBusinesses: async () => {
      if (get().isLoading || get().businesses.length > 0) return;
      set({ isLoading: true, error: null });
      try {
        const businesses = await listOwnerBusinesses();
        let selectedBusinessId: string | null = get().selectedBusinessId;

        if (businesses.length === 0) {
          selectedBusinessId = null;
          clearCurrentBusinessId();
        } else if (businesses.length === 1) {
          // Single business — auto-select without waiting for selector UI.
          selectedBusinessId = businesses[0].id;
          setCurrentBusinessId(selectedBusinessId);
        } else {
          // Multiple businesses — keep selection only if still present.
          const stillPresent = businesses.some(
            (b) => b.id === selectedBusinessId
          );
          if (!stillPresent) {
            selectedBusinessId = null;
            clearCurrentBusinessId();
          }
        }

        set({ businesses, selectedBusinessId, isLoading: false });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not load businesses.";
        set({ isLoading: false, error: message });
      }
    },

    // Only accepts an ID that exists in the already-loaded list.
    selectBusiness: (businessId) => {
      if (!get().businesses.some((b) => b.id === businessId)) return;
      setCurrentBusinessId(businessId);
      set({ selectedBusinessId: businessId });
    },

    clearBusinesses: () => {
      clearCurrentBusinessId();
      set({
        businesses: [],
        selectedBusinessId: null,
        isLoading: false,
        error: null,
      });
    },
  })
);
