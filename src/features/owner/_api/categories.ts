// Owner category API.
// Only fields confirmed in the Spring Boot contract are mapped;
// any additional backend fields are dropped by toCategory().

import { ApiError } from "@/lib/api/client";
import { ownerApiFetch } from "./ownerApiFetch";

export interface Category {
  id: string;
  businessId: string;
  branchId?: string | null;
  name: string;
  nameKm?: string | null;
  position: number;
  isActive: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CategoryInput {
  name: string;
  nameKm?: string;
  branchId?: string;
  isActive?: boolean;
}

interface CategoryRaw {
  id?: unknown;
  businessId?: unknown;
  branchId?: unknown;
  name?: unknown;
  nameKm?: unknown;
  position?: unknown;
  isActive?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
}

function isValidCategory(v: unknown): v is CategoryRaw {
  if (v === null || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  return typeof r.id === "string" && r.id.length > 0 &&
    typeof r.name === "string" && r.name.length > 0;
}

function toCategory(raw: CategoryRaw): Category {
  return {
    id: raw.id as string,
    businessId: typeof raw.businessId === "string" ? raw.businessId : "",
    branchId: typeof raw.branchId === "string" ? raw.branchId : null,
    name: raw.name as string,
    nameKm: typeof raw.nameKm === "string" ? raw.nameKm : null,
    position: typeof raw.position === "number" ? raw.position : 0,
    isActive: typeof raw.isActive === "boolean" ? raw.isActive : true,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : null,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : null,
  };
}

function normalizeListResponse(body: unknown): Category[] {
  if (Array.isArray(body)) {
    return body.filter(isValidCategory).map(toCategory);
  }
  if (body !== null && typeof body === "object") {
    const r = body as Record<string, unknown>;
    for (const key of ["content", "data", "items", "categories"] as const) {
      if (Array.isArray(r[key])) {
        return (r[key] as unknown[]).filter(isValidCategory).map(toCategory);
      }
    }
  }
  return [];
}

function normalizeDetailResponse(body: unknown): Category {
  if (body !== null && typeof body === "object") {
    const r = body as Record<string, unknown>;
    for (const key of ["data", "category"] as const) {
      if (isValidCategory(r[key])) return toCategory(r[key] as CategoryRaw);
    }
    if (isValidCategory(body)) return toCategory(body as CategoryRaw);
  }
  throw new ApiError(0, "Unexpected response shape from category endpoint.");
}

// Confirmed endpoint paths:
//   GET    /businesses/{businessId}/categories
//   GET    /businesses/{businessId}/categories/{categoryId}
//   POST   /businesses/{businessId}/categories
//   PATCH  /businesses/{businessId}/categories/{categoryId}
//   DELETE /businesses/{businessId}/categories/{categoryId}

export async function listCategories(businessId: string): Promise<Category[]> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/categories`,
  });
  return normalizeListResponse(body);
}

export async function getCategory(
  businessId: string,
  categoryId: string
): Promise<Category> {
  const body = await ownerApiFetch<unknown>({
    method: "GET",
    url: `/businesses/${encodeURIComponent(businessId)}/categories/${encodeURIComponent(categoryId)}`,
  });
  return normalizeDetailResponse(body);
}

export async function createCategory(
  businessId: string,
  input: CategoryInput
): Promise<Category> {
  const body = await ownerApiFetch<unknown>({
    method: "POST",
    url: `/businesses/${encodeURIComponent(businessId)}/categories`,
    data: input,
  });
  return normalizeDetailResponse(body);
}

export async function updateCategory(
  businessId: string,
  categoryId: string,
  input: CategoryInput
): Promise<Category> {
  const body = await ownerApiFetch<unknown>({
    method: "PATCH",
    url: `/businesses/${encodeURIComponent(businessId)}/categories/${encodeURIComponent(categoryId)}`,
    data: input,
  });
  return normalizeDetailResponse(body);
}

// DELETE may return 200 + body or 204 (no body); response is ignored.
export async function deleteCategory(
  businessId: string,
  categoryId: string
): Promise<void> {
  await ownerApiFetch<unknown>({
    method: "DELETE",
    url: `/businesses/${encodeURIComponent(businessId)}/categories/${encodeURIComponent(categoryId)}`,
  });
}
