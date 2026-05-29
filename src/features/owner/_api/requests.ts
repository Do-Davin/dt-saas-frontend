// Owner-side Customer Request API.
// Public catalog code MUST NOT import from this file — the owner JWT must
// never be attached to public catalog calls (see docs/frontend-auth-api-foundation.md).

import { ApiError, apiFetch } from "@/lib/api/client";
import { withOwnerAuthHeaders } from "../_auth/ownerToken";
import type {
  CustomerRequestDetail,
  CustomerRequestListItem,
  RequestStatus,
} from "../_types/request.types";

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

// Backend may return the detail bare or under `data` / `request` / `item`.
// If the shape is anything else, surface a consistent ApiError so callers
// can keep their single-error-type catch.
function normalizeDetailResponse(data: unknown): CustomerRequestDetail {
  if (isPlainObject(data)) {
    for (const key of ["data", "request", "item"] as const) {
      const inner = data[key];
      if (isPlainObject(inner)) {
        return inner as unknown as CustomerRequestDetail;
      }
    }
    return data as unknown as CustomerRequestDetail;
  }
  throw new ApiError(0, "Unexpected response shape from request endpoint.");
}

export async function getOwnerRequest(
  businessId: string,
  requestId: string
): Promise<CustomerRequestDetail> {
  const data = await apiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/requests/${encodeURIComponent(requestId)}`,
    headers: withOwnerAuthHeaders(),
  });
  return normalizeDetailResponse(data);
}

// PATCH request status. Backend remains the source of truth for valid
// transitions — the frontend only mirrors allowed buttons for UX, and any
// disallowed transition the user sneaks through will be rejected server-side.
//
// If the backend responds with an empty body (e.g. 204), refetch the detail
// so callers always receive an up-to-date CustomerRequestDetail.
export async function updateOwnerRequestStatus(
  businessId: string,
  requestId: string,
  status: RequestStatus
): Promise<CustomerRequestDetail> {
  const data = await apiFetch<unknown>({
    method: "PATCH",
    url: `/businesses/${encodeURIComponent(businessId)}/requests/${encodeURIComponent(requestId)}/status`,
    headers: withOwnerAuthHeaders(),
    data: { status },
  });
  if (!data) {
    return getOwnerRequest(businessId, requestId);
  }
  return normalizeDetailResponse(data);
}
