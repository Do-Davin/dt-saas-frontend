// Reactive owner auth store.
//
// Keeps token state in Zustand so consumers (e.g. RequireOwnerAuth) re-render
// automatically when the token is set or cleared, without polling localStorage.
//
// Storage delegation — does NOT use Zustand persist middleware:
//   ownerToken.ts owns the localStorage key (dt.owner.token.v1) and is also
//   called directly by ownerApiFetch on 401. A second storage path via
//   Zustand persist would diverge from that direct call. Instead, setToken
//   and clearToken delegate to the ownerToken.ts helpers and then sync the
//   in-memory state.
//
// Boot seeding: getOwnerToken() is called once at store creation time so that
// a page reload restores auth state without a login round trip.

import { create } from "zustand";
import {
  clearOwnerToken,
  getOwnerToken,
  setOwnerToken,
} from "../_auth/ownerToken";

interface OwnerAuthState {
  token: string | null;
  setToken: (token: string) => void;
  clearToken: () => void;
}

export const useOwnerAuthStore = create<OwnerAuthState>()((set) => ({
  token: getOwnerToken(),
  setToken: (token) => {
    setOwnerToken(token);
    set({ token });
  },
  clearToken: () => {
    clearOwnerToken();
    set({ token: null });
  },
}));
