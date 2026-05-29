// Temporary current-business helper (MVP).
//
// A real business selector and an owner-belongs-to-businesses lookup are not
// yet built. To exercise the protected list endpoint during local development,
// the dev sets a business ID in localStorage under the key below; the request
// list page reads it on mount.
//
// Storage key: dt.owner.currentBusinessId.v1
//
// Do NOT hardcode a real business ID anywhere in source. When a real selector
// lands, retire this helper and migrate readers to the new store.

const STORAGE_KEY = "dt.owner.currentBusinessId.v1";

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function getCurrentBusinessId(): string | null {
  const raw = storage()?.getItem(STORAGE_KEY);
  return raw && raw.length > 0 ? raw : null;
}

export function setCurrentBusinessId(id: string): void {
  try {
    storage()?.setItem(STORAGE_KEY, id);
  } catch {
    // Storage may throw on quota exceeded or when blocked (e.g. Safari private
    // mode). The id simply won't persist — acceptable for MVP.
  }
}

export function clearCurrentBusinessId(): void {
  storage()?.removeItem(STORAGE_KEY);
}
