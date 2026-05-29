// Owner auth token foundation (MVP).
//
// Storage decision — localStorage:
//   Chosen so the owner JWT survives page reloads during development and so
//   that no real login UI is required to exercise the dashboard against the
//   backend (paste a token in DevTools, refresh, you're in).
//
//   Tradeoff: localStorage is readable by any script that runs in the
//   dashboard origin, so it carries XSS risk. Acceptable for MVP because:
//     - the dashboard surface is not yet shipped to real owners,
//     - no third-party scripts are loaded into the dashboard origin,
//     - the backend has not yet issued real production credentials.
//
//   When the dashboard ships, revisit:
//     - prefer an httpOnly cookie issued by the backend, OR
//     - keep localStorage but enforce a strict CSP and audit all scripts.
//
// JWT decoding and refresh token are intentionally out of scope here.

const STORAGE_KEY = "dt.owner.token.v1";

function storage(): Storage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

export function getOwnerToken(): string | null {
  return storage()?.getItem(STORAGE_KEY) ?? null;
}

export function setOwnerToken(token: string): void {
  try {
    storage()?.setItem(STORAGE_KEY, token);
  } catch {
    // Storage may throw on quota exceeded or when blocked (e.g. Safari private
    // mode). Token will simply not persist — acceptable for MVP.
  }
}

export function clearOwnerToken(): void {
  storage()?.removeItem(STORAGE_KEY);
}

export function hasOwnerToken(): boolean {
  return getOwnerToken() !== null;
}

// Returns a plain header record usable directly with axios:
//   apiClient.get('/businesses/:id/requests', { headers: withOwnerAuthHeaders() })
// Owner JWT is attached ONLY when a token exists. Public catalog code MUST
// NOT call this helper — public requests must not be authenticated by default.
export function withOwnerAuthHeaders(
  headers?: Record<string, string>
): Record<string, string> {
  const out: Record<string, string> = { ...(headers ?? {}) };
  const token = getOwnerToken();
  if (token) out.Authorization = `Bearer ${token}`;
  return out;
}
