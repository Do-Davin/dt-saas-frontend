// Owner businesses API adapter.
// Public catalog code must not import this file.
//
// TODO(spring-boot): confirm the GET /businesses path after backend migration.
// Likely candidates: /businesses  /api/businesses  /owner/businesses
// Update the url in listOwnerBusinesses() once the path is pinned.
//
// TODO(spring-boot): confirm the response envelope. normalizeListResponse
// handles the six most common shapes — update if the backend wraps differently.

import { ownerApiFetch } from "./ownerApiFetch";

// Only the fields the frontend needs. Explicitly typed so the normalizer
// cannot forward unsafe or unknown backend fields.
export interface OwnerBusiness {
  id: string;
  name: string;
  slug?: string | null;
  businessType?: string | null;
  catalogMode?: string | null;
}

// Permissive raw type — all non-id/name fields optional and typed as unknown
// so TypeScript enforces the runtime extraction below rather than trusting
// the backend shape.
interface BusinessRaw {
  id?: unknown;
  name?: unknown;
  slug?: unknown;
  businessType?: unknown;
  catalogMode?: unknown;
}

interface BusinessesResponseRaw {
  data?:
    | BusinessRaw[]
    | { items?: BusinessRaw[]; businesses?: BusinessRaw[] };
  items?: BusinessRaw[];
  businesses?: BusinessRaw[];
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
    slug: typeof raw.slug === "string" ? raw.slug : null,
    businessType:
      typeof raw.businessType === "string" ? raw.businessType : null,
    catalogMode:
      typeof raw.catalogMode === "string" ? raw.catalogMode : null,
  };
}

// Tries each envelope location in order. Returns the first array whose
// elements pass the minimum-shape check.
function normalizeListResponse(
  body: unknown
): OwnerBusiness[] | null {
  // Bare array
  if (Array.isArray(body)) {
    return body.filter(isBusinessCandidate).map(toOwnerBusiness);
  }

  if (body === null || typeof body !== "object") return null;
  const r = body as BusinessesResponseRaw;

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
  if (
    r.data !== null &&
    typeof r.data === "object" &&
    !Array.isArray(r.data)
  ) {
    const nested = r.data as { items?: BusinessRaw[]; businesses?: BusinessRaw[] };
    if (Array.isArray(nested.items)) {
      return nested.items.filter(isBusinessCandidate).map(toOwnerBusiness);
    }
    // { data: { businesses: [] } }
    if (Array.isArray(nested.businesses)) {
      return nested.businesses.filter(isBusinessCandidate).map(toOwnerBusiness);
    }
  }

  return null;
}

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
