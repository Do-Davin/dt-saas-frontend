// Owner branch API.
// Only fields confirmed in the Spring Boot contract are mapped;
// any additional backend fields are dropped by toBranch().

import { ApiError } from "@/lib/api/client";
import { ownerApiFetch } from "./ownerApiFetch";

export interface Branch {
  id: string;
  businessId: string;
  name: string;
  nameKm?: string | null;
  slug?: string | null;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface BranchInput {
  name: string;
  nameKm?: string;
  slug: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

// Permissive raw type — all non-id/name fields unknown so the normalizer
// controls what gets forwarded rather than trusting the backend shape.
interface BranchRaw {
  id?: unknown;
  businessId?: unknown;
  name?: unknown;
  nameKm?: unknown;
  slug?: unknown;
  address?: unknown;
  phone?: unknown;
  isActive?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

function isValidBranch(v: unknown): v is BranchRaw {
  if (v === null || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return typeof r.id === "string" && r.id.length > 0 &&
    typeof r.name === "string" && r.name.length > 0;
}

function toBranch(raw: BranchRaw): Branch {
  return {
    id: raw.id as string,
    businessId: typeof raw.businessId === "string" ? raw.businessId : "",
    name: raw.name as string,
    nameKm: typeof raw.nameKm === "string" ? raw.nameKm : null,
    slug: typeof raw.slug === "string" ? raw.slug : null,
    address: typeof raw.address === "string" ? raw.address : null,
    phone: typeof raw.phone === "string" ? raw.phone : null,
    isActive: typeof raw.isActive === "boolean" ? raw.isActive : true,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
}

// Accepts bare array or common Spring Boot envelope shapes.
function normalizeListResponse(body: unknown): Branch[] {
  if (Array.isArray(body)) {
    return body.filter(isValidBranch).map(toBranch);
  }
  if (body !== null && typeof body === "object") {
    const r = body as Record<string, unknown>;
    for (const key of ["content", "data", "items", "branches"] as const) {
      if (Array.isArray(r[key])) {
        return (r[key] as unknown[]).filter(isValidBranch).map(toBranch);
      }
    }
  }
  return [];
}

// Accepts bare object or { data | branch } envelope.
function normalizeDetailResponse(body: unknown): Branch {
  if (body !== null && typeof body === "object") {
    const r = body as Record<string, unknown>;
    for (const key of ["data", "branch"] as const) {
      if (isValidBranch(r[key])) return toBranch(r[key] as BranchRaw);
    }
    if (isValidBranch(body)) return toBranch(body as BranchRaw);
  }
  throw new ApiError(0, "Unexpected response shape from branch endpoint.");
}

// Confirmed endpoint paths:
//   GET    /businesses/{businessId}/branches
//   GET    /businesses/{businessId}/branches/{branchId}
//   POST   /businesses/{businessId}/branches
//   PATCH  /businesses/{businessId}/branches/{branchId}
//   DELETE /businesses/{businessId}/branches/{branchId}

export async function listBranches(businessId: string): Promise<Branch[]> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/branches`,
  });
  return normalizeListResponse(body);
}

export async function getBranch(
  businessId: string,
  branchId: string
): Promise<Branch> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/branches/${encodeURIComponent(branchId)}`,
  });
  return normalizeDetailResponse(body);
}

export async function createBranch(
  businessId: string,
  input: BranchInput
): Promise<Branch> {
  const body = await ownerApiFetch<unknown>({
    method: "POST",
    url: `/businesses/${encodeURIComponent(businessId)}/branches`,
    data: input,
  });
  return normalizeDetailResponse(body);
}

export async function updateBranch(
  businessId: string,
  branchId: string,
  input: BranchInput
): Promise<Branch> {
  const body = await ownerApiFetch<unknown>({
    method: "PATCH",
    url: `/businesses/${encodeURIComponent(businessId)}/branches/${encodeURIComponent(branchId)}`,
    data: input,
  });
  return normalizeDetailResponse(body);
}

// DELETE may return 200 + body or 204 (no body); response is ignored.
export async function deleteBranch(
  businessId: string,
  branchId: string
): Promise<void> {
  await ownerApiFetch<unknown>({
    method: "DELETE",
    url: `/businesses/${encodeURIComponent(businessId)}/branches/${encodeURIComponent(branchId)}`,
  });
}
