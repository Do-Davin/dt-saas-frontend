// Owner session store — holds the validated OwnerProfile after /auth/me resolves.
//
// Deliberately separate from ownerAuth.ts (which owns the raw JWT token) so
// the two concerns don't grow together: ownerAuth = "do we have a token?",
// ownerSession = "who is the person behind that token?".
//
// loadOwner() is called once by OwnerShell on mount. It must NOT be called
// from RequireOwnerAuth — that guard is intentionally synchronous.
//
// 401 handling: ownerApiFetch (used inside getCurrentOwner) clears the token
// and redirects before the error reaches this store, so the catch branch here
// only fires for non-401 errors (network failure, unrecognized shape, etc.).

import { create } from "zustand";
import { getCurrentOwner } from "../_api/auth";
import type { OwnerProfile } from "../_api/auth";

interface OwnerSessionState {
  owner: OwnerProfile | null;
  isLoading: boolean;
  error: string | null;
  loadOwner: () => Promise<void>;
  clearOwner: () => void;
}

export const useOwnerSessionStore = create<OwnerSessionState>()((set, get) => ({
  owner: null,
  isLoading: false,
  error: null,

  loadOwner: async () => {
    if (get().isLoading || get().owner !== null) return;
    set({ isLoading: true, error: null });
    try {
      const owner = await getCurrentOwner();
      set({ owner, isLoading: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load owner profile.";
      set({ isLoading: false, error: message });
    }
  },

  clearOwner: () => set({ owner: null, isLoading: false, error: null }),
}));
