// Owner businesses API adapter.
// Public catalog code must not import this file.

import { ApiError } from "@/lib/api/client";
import { ownerApiFetch } from "./ownerApiFetch";

// Only the fields the frontend needs. Explicitly typed so the normalizer
// cannot forward unsafe or unknown backend fields.
export interface OwnerBusiness {
  id: string;
  name: string;
  nameKm?: string | null;
  slug?: string | null;
  type?: string | null;
  catalogMode?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface BusinessInput {
  name: string;
  nameKm?: string;
  slug?: string;
  type?: string;
  catalogMode?: string;
}

// Permissive raw type — all non-id/name fields optional and typed as unknown
// so TypeScript enforces the runtime extraction below rather than trusting
// the backend shape.
interface BusinessRaw {
  id?: unknown;
  name?: unknown;
  nameKm?: unknown;
  slug?: unknown;
  type?: unknown;
  catalogMode?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

interface BusinessesResponseRaw {
  data?: BusinessRaw[] | { items?: BusinessRaw[] };
  items?: BusinessRaw[];
  businesses?: BusinessRaw[];
  content?: BusinessRaw[];
}

// Returns true only when the candidate has the minimum required fields.
function isBusinessCandidate(v: unknown): v is BusinessRaw {
  if (v === null || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    r.id.length > 0 &&
    typeof r.name === "string" &&
    r.name.length > 0
  );
}

// Picks only declared safe fields — unknown backend fields are dropped.
function toOwnerBusiness(raw: BusinessRaw): OwnerBusiness {
  return {
    id: raw.id as string,
    name: raw.name as string,
    nameKm: typeof raw.nameKm === "string" ? raw.nameKm : null,
    slug: typeof raw.slug === "string" ? raw.slug : null,
    type: typeof raw.type === "string" ? raw.type : null,
    catalogMode: typeof raw.catalogMode === "string" ? raw.catalogMode : null,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
}

function normalizeDetailResponse(body: unknown): OwnerBusiness {
  if (body !== null && typeof body === "object") {
    const r = body as Record<string, unknown>;
    for (const key of ["data", "business"] as const) {
      if (isBusinessCandidate(r[key])) return toOwnerBusiness(r[key] as BusinessRaw);
    }
    if (isBusinessCandidate(body)) return toOwnerBusiness(body as BusinessRaw);
  }
  throw new ApiError(0, "Unexpected response shape from business endpoint.");
}

// Tries each envelope location in order. Returns the first array whose
// elements pass the minimum-shape check.
function normalizeListResponse(body: unknown): OwnerBusiness[] | null {
  // Bare array
  if (Array.isArray(body)) {
    return body.filter(isBusinessCandidate).map(toOwnerBusiness);
  }

  if (body === null || typeof body !== "object") return null;
  const r = body as BusinessesResponseRaw;

  // Spring Boot Page<T> — { content: [] }
  if (Array.isArray(r.content)) {
    return r.content.filter(isBusinessCandidate).map(toOwnerBusiness);
  }

  // { data: [] }
  if (Array.isArray(r.data)) {
    return r.data.filter(isBusinessCandidate).map(toOwnerBusiness);
  }

  // { items: [] }
  if (Array.isArray(r.items)) {
    return r.items.filter(isBusinessCandidate).map(toOwnerBusiness);
  }

  // { businesses: [] }
  if (Array.isArray(r.businesses)) {
    return r.businesses.filter(isBusinessCandidate).map(toOwnerBusiness);
  }

  // { data: { items: [] } }
  if (r.data !== null && typeof r.data === "object" && !Array.isArray(r.data)) {
    const nested = r.data as { items?: BusinessRaw[] };
    if (Array.isArray(nested.items)) {
      return nested.items.filter(isBusinessCandidate).map(toOwnerBusiness);
    }
  }

  return null;
}

// Confirmed endpoint paths:
//   GET    /businesses
//   GET    /businesses/{businessId}
//   POST   /businesses
//   PATCH  /businesses/{businessId}
//   DELETE /businesses/{businessId}

// GET /businesses. Requires an owner token — uses ownerApiFetch so a 401
// triggers auto-logout before this function throws.
export async function listOwnerBusinesses(): Promise<OwnerBusiness[]> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: "/businesses",
  });
  const result = normalizeListResponse(body);
  if (result === null) {
    throw new Error("Owner businesses response shape is not supported yet.");
  }
  return result;
}

export async function getBusiness(businessId: string): Promise<OwnerBusiness> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}`,
  });
  return normalizeDetailResponse(body);
}

export async function createBusiness(
  input: BusinessInput
): Promise<OwnerBusiness> {
  const body = await ownerApiFetch<unknown>({
    method: "POST",
    url: "/businesses",
    data: input,
  });
  return normalizeDetailResponse(body);
}

export async function updateBusiness(
  businessId: string,
  input: BusinessInput
): Promise<OwnerBusiness> {
  const body = await ownerApiFetch<unknown>({
    method: "PATCH",
    url: `/businesses/${encodeURIComponent(businessId)}`,
    data: input,
  });
  return normalizeDetailResponse(body);
}

// DELETE may return 200 + body or 204 (no body); response is ignored.
export async function deleteBusiness(businessId: string): Promise<void> {
  await ownerApiFetch<unknown>({
    method: "DELETE",
    url: `/businesses/${encodeURIComponent(businessId)}`,
  });
}
