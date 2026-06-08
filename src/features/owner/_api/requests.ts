// Owner-side Customer Request API.
// Public catalog code MUST NOT import from this file — the owner JWT must
// never be attached to public catalog calls (see docs/frontend-auth-api-foundation.md).
//
// Confirmed Spring Boot endpoint paths:
//   GET   /businesses/:id/requests
//   GET   /businesses/:id/requests/:requestId
//   PATCH /businesses/:id/requests/:requestId/status  — body: { status }
//
// PATCH /status may return 200 + body or 204 (no body). The empty-body
// fallback in updateOwnerRequestStatus handles both cases.

import { ApiError } from "@/lib/api/client";
import { ownerApiFetch } from "./ownerApiFetch";
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

// Accept bare array or { content | data | items } wrapper so a minor Spring
// Boot envelope change cannot crash the page.
function normalizeListResponse(data: unknown): CustomerRequestListItem[] {
  if (Array.isArray(data)) return data as CustomerRequestListItem[];
  if (isPlainObject(data)) {
    for (const key of ["content", "data", "items", "requests"] as const) {
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
  const data = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/requests`,
  });
  return normalizeListResponse(data);
}

// Accept bare object or { data | request } wrapper. Unexpected shape
// surfaces as a typed ApiError so callers keep their single error type.
function normalizeDetailResponse(data: unknown): CustomerRequestDetail {
  if (isPlainObject(data)) {
    for (const key of ["data", "request"] as const) {
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
  const data = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/requests/${encodeURIComponent(requestId)}`,
  });
  return normalizeDetailResponse(data);
}

// PATCH request status. Backend remains the source of truth for valid
// transitions — the frontend only mirrors allowed buttons for UX, and any
// disallowed transition the user sneaks through will be rejected server-side.
//
// Empty / 204 body: re-fetches the detail so callers always get an up-to-date
// CustomerRequestDetail regardless of whether Spring Boot returns 200 or 204.
export async function updateOwnerRequestStatus(
  businessId: string,
  requestId: string,
  status: RequestStatus
): Promise<CustomerRequestDetail> {
  const data = await ownerApiFetch<unknown>({
    method: "PATCH",
    url: `/businesses/${encodeURIComponent(businessId)}/requests/${encodeURIComponent(requestId)}/status`,
    data: { status },
  });
  if (!data) {
    return getOwnerRequest(businessId, requestId);
  }
  return normalizeDetailResponse(data);
}
