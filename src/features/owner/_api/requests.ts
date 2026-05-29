// Owner-side Customer Request API.
// Public catalog code MUST NOT import from this file — the owner JWT must
// never be attached to public catalog calls (see docs/frontend-auth-api-foundation.md).

import { apiFetch } from "@/lib/api/client";
import { withOwnerAuthHeaders } from "../_auth/ownerToken";
import type { CustomerRequestListItem } from "../_types/request.types";

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object") return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

// The backend's exact list-response shape is not yet confirmed. Accept the
// three most likely shapes — bare array, `{ data: [] }`, `{ items: [] }`,
// `{ requests: [] }` — and fall back to an empty list rather than throwing.
function normalizeListResponse(data: unknown): CustomerRequestListItem[] {
  if (Array.isArray(data)) return data as CustomerRequestListItem[];
  if (isPlainObject(data)) {
    for (const key of ["data", "items", "requests"] as const) {
      const candidate = data[key];
      if (Array.isArray(candidate)) {
        return candidate as CustomerRequestListItem[];
      }
    }
  }
  return [];
}

export async function listOwnerRequests(
  businessId: string
): Promise<CustomerRequestListItem[]> {
  const data = await apiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/requests`,
    headers: withOwnerAuthHeaders(),
  });
  return normalizeListResponse(data);
}
